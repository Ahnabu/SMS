import httpStatus from "http-status";
import mongoose, { Types } from "mongoose";
import path from "path";
import { AppError } from "../../errors/AppError";
import { School } from "../school/school.model";
import { User } from "../user/user.model";
import { Parent } from "../parent/parent.model";
import { Student, StudentPhoto } from "./student.model";
import { UserCredentials } from "../user/userCredentials.model";
import { FileUtils } from "../../utils/fileUtils";
import { CredentialGenerator } from "../../utils/credentialGenerator";
import {
  generateCloudinaryFolderPath,
  uploadPhotosToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryUtils";

import config from "../../config";
import {
  ICreateStudentRequest,
  IUpdateStudentRequest,
  IStudentResponse,
  IStudentStats,
  IStudentPhotoResponse,
} from "./student.interface";

class StudentService {
  async createStudent(
    studentData: ICreateStudentRequest,
    photos?: Express.Multer.File[],
    adminUserId?: string
  ): Promise<IStudentResponse> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Verify school exists and is active
      const school = await School.findById(studentData.schoolId).session(
        session
      );
      if (!school) {
        throw new AppError(httpStatus.NOT_FOUND, "School not found");
      }

      if (school.status !== "active") {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Cannot create student for inactive school"
        );
      }

      // Check if student with same name exists in the same grade/section
      const existingUser = await User.findOne({
        schoolId: studentData.schoolId,
        firstName: { $regex: new RegExp(`^${studentData.firstName}$`, "i") },
        lastName: { $regex: new RegExp(`^${studentData.lastName}$`, "i") },
        role: "student",
      });

      if (existingUser) {
        // Check if this user is already a student in the same grade/section
        const existingStudent = await Student.findOne({
          userId: existingUser._id,
          grade: studentData.grade,
          section: studentData.section,
        });

        if (existingStudent) {
          throw new AppError(
            httpStatus.CONFLICT,
            `Student with name '${studentData.firstName} ${studentData.lastName}' already exists in Grade ${studentData.grade} Section ${studentData.section}`
          );
        }
      }

      const admissionDate =
        studentData.admissionDate || new Date().toISOString().split("T")[0];
      const admissionYear = new Date(admissionDate).getFullYear();

      // Generate student ID and credentials using CredentialGenerator
      let studentId: string | undefined = undefined;
      let rollNumber: number | undefined = undefined;
      let credentials:
        | {
            student: any;
            parent: any;
          }
        | undefined = undefined;
      let userCreationAttempts = 0;
      const maxUserCreationAttempts = 3;
      let newUser;

      while (userCreationAttempts < maxUserCreationAttempts) {
        try {
          userCreationAttempts++;

          // Generate fresh credentials for each attempt
          const registration =
            await CredentialGenerator.generateStudentRegistration(
              admissionYear,
              studentData.grade.toString(),
              studentData.schoolId
            );

          studentId = registration.studentId;
          rollNumber = registration.rollNumber;
          credentials = registration.credentials;

          // Create user account for student
          newUser = await User.create(
            [
              {
                schoolId: studentData.schoolId,
                role: "student",
                username: credentials.student.username,
                passwordHash: credentials.student.hashedPassword,
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                email: studentData.email,
                phone: studentData.phone,
              },
            ],
            { session }
          );

          break; // Success, exit retry loop
        } catch (error: any) {
          if (
            error.code === 11000 &&
            userCreationAttempts < maxUserCreationAttempts
          ) {
            // Duplicate key error, retry with new credentials
            console.log(
              `Duplicate username detected, retrying... (Attempt ${userCreationAttempts}/${maxUserCreationAttempts})`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, Math.random() * 200 + 100)
            );
            continue;
          } else {
            // Re-throw if not a duplicate key error or if we've exhausted retries
            throw error;
          }
        }
      }

      if (!newUser) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          `Failed to create student user after ${maxUserCreationAttempts} attempts. Please try again.`
        );
      }

      if (!studentId || !credentials || rollNumber === undefined) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Failed to generate student credentials. Please try again."
        );
      }

      // Create student record
      const newStudent = await Student.create(
        [
          {
            userId: newUser[0]._id,
            schoolId: studentData.schoolId,
            studentId,
            grade: studentData.grade,
            section: studentData.section,
            bloodGroup: studentData.bloodGroup,
            dob: new Date(studentData.dob),
            admissionDate: studentData.admissionDate
              ? new Date(studentData.admissionDate)
              : new Date(),
            admissionYear,
            rollNumber: rollNumber,
            address: studentData.address || {},
          },
        ],
        { session }
      );

      // Initialize parentUser variable
      let parentUser: any[] = [];

      // Create parent if parent info is provided
      if (studentData.parentInfo) {
        const { parentInfo } = studentData;

        // First check if a parent with similar details already exists to avoid duplicates
        let existingParent = null;
        if (parentInfo.email) {
          const existingUser = await User.findOne({
            email: parentInfo.email,
            role: "parent",
            schoolId: studentData.schoolId,
          }).session(session);

          if (existingUser) {
            existingParent = await Parent.findOne({
              userId: existingUser._id,
              schoolId: studentData.schoolId,
            }).session(session);
          }
        }

        if (existingParent) {
          // Use existing parent and add this student to their children
          if (!existingParent.children.includes(newStudent[0]._id)) {
            existingParent.children.push(newStudent[0]._id);
            await existingParent.save({ session });
          }

          // Update student with existing parent reference
          newStudent[0].parentId = existingParent._id;
          await newStudent[0].save({ session });

          console.log(
            `Reused existing parent ${existingParent.parentId} for student ${newStudent[0].studentId}`
          );
        } else {
          // Ensure credentials are available
          if (!credentials) {
            throw new AppError(
              httpStatus.INTERNAL_SERVER_ERROR,
              "Failed to generate credentials"
            );
          }

          // Create new parent user account with generated credentials
          parentUser = await User.create(
            [
              {
                schoolId: studentData.schoolId,
                role: "parent",
                username: credentials.parent.username,
                passwordHash: credentials.parent.hashedPassword,
                firstName: parentInfo.name.split(" ")[0] || parentInfo.name,
                lastName:
                  parentInfo.name.split(" ").slice(1).join(" ") || "Guardian", // Default lastName if not provided
                phone: parentInfo.phone,
                email: parentInfo.email, // Make sure to save the email
              },
            ],
            { session }
          );

          // Generate parent ID for the Parent model - with retry logic for duplicates
          let parentId: string = "";
          let attempts = 0;
          const maxAttempts = 5;

          do {
            try {
              parentId = await Parent.generateNextParentId(
                studentData.schoolId,
                undefined, // use current year
                session // pass the session for transaction consistency
              );

              // Verify this ID is not already taken
              const existingParentCheck = await Parent.findOne({
                parentId,
              }).session(session);
              if (!existingParentCheck) {
                break; // We found a unique ID
              }

              attempts++;
              if (attempts >= maxAttempts) {
                // Use timestamp-based fallback for absolute uniqueness
                parentId = `PAR-${new Date().getFullYear()}-${Date.now()
                  .toString()
                  .slice(-6)}`;
                break;
              }

              // Add small delay to reduce race conditions
              await new Promise((resolve) => setTimeout(resolve, 10));
            } catch (error) {
              attempts++;
              if (attempts >= maxAttempts) {
                throw new AppError(
                  httpStatus.INTERNAL_SERVER_ERROR,
                  "Failed to generate unique parent ID after multiple attempts"
                );
              }
            }
          } while (attempts < maxAttempts);

          // Create basic parent record with required fields
          let newParent;
          try {
            newParent = await Parent.create(
              [
                {
                  userId: parentUser[0]._id,
                  schoolId: studentData.schoolId,
                  parentId: parentId,
                  children: [newStudent[0]._id], // Link to the student
                  relationship: parentInfo.relationship || "Guardian", // Use provided relationship or default
                  address: {
                    street: parentInfo.address || "",
                    city: "", // Optional field now
                    state: "", // Optional field now
                    zipCode: "", // Optional field now
                    country: "", // Optional field now
                  },
                  preferences: {
                    communicationMethod: "All",
                    receiveNewsletters: true,
                    receiveAttendanceAlerts: true,
                    receiveExamResults: true,
                    receiveEventNotifications: true,
                  },
                  occupation: parentInfo.occupation || "",
                },
              ],
              { session }
            );
          } catch (parentError: any) {
            // If we get a duplicate key error even after our checks, try one more time with timestamp
            if (
              parentError.code === 11000 &&
              parentError.keyPattern?.parentId
            ) {
              console.warn(
                "Duplicate parent ID detected, retrying with timestamp-based ID"
              );
              parentId = `PAR-${new Date().getFullYear()}-${Date.now()
                .toString()
                .slice(-6)}`;

              newParent = await Parent.create(
                [
                  {
                    userId: parentUser[0]._id,
                    schoolId: studentData.schoolId,
                    parentId: parentId,
                    children: [newStudent[0]._id],
                    relationship: parentInfo.relationship || "Guardian",
                    address: {
                      street: parentInfo.address || "",
                      city: "",
                      state: "",
                      zipCode: "",
                      country: "",
                    },
                    preferences: {
                      communicationMethod: "All",
                      receiveNewsletters: true,
                      receiveAttendanceAlerts: true,
                      receiveExamResults: true,
                      receiveEventNotifications: true,
                    },
                    occupation: parentInfo.occupation || "",
                  },
                ],
                { session }
              );
            } else {
              throw parentError;
            }
          }

          // Update student with parent reference
          newStudent[0].parentId = newParent[0]._id;
          await newStudent[0].save({ session });

          console.log(
            `Created new parent ${parentId} for student ${newStudent[0].studentId}`
          );
        }
      }

      // Process photos - MANDATORY for student creation
      let uploadedPhotos: any[] = [];
      if (!photos || photos.length === 0) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Photos are required for student registration. Please upload at least 3 photos."
        );
      }

      // Validate photos before upload
      if (photos.length < 3) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Minimum 3 photos required for student registration"
        );
      }

      if (photos.length > 8) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Maximum 8 photos allowed per student"
        );
      }

      // Validate each photo file
      for (const photo of photos) {
        if (!photo.mimetype || !photo.originalname) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Invalid photo file. Each photo must have mimetype and original filename."
          );
        }

        if (!photo.mimetype.startsWith("image/")) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Only image files are allowed for student photos"
          );
        }
      }

      // Generate Cloudinary folder path for student photos
      const cloudinaryFolderPath = generateCloudinaryFolderPath(
        school.name,
        "student",
        studentData.firstName,
        new Date(studentData.dob),
        studentData.bloodGroup,
        new Date(studentData.admissionDate || Date.now()),
        studentData.grade,
        studentData.section,
        studentId!
      );

      console.log(
        `Uploading photos to Cloudinary folder: ${cloudinaryFolderPath}`
      );

      // Upload photos to Cloudinary
      const cloudinaryResults = await uploadPhotosToCloudinary(
        photos,
        cloudinaryFolderPath,
        studentId!
      );

      console.log(
        `Successfully uploaded ${cloudinaryResults.length} photos to Cloudinary`
      );

      // Create photo records with Cloudinary data
      const photoPromises = cloudinaryResults.map((result) =>
        StudentPhoto.create(
          [
            {
              studentId: newStudent[0]._id,
              schoolId: studentData.schoolId,
              photoNumber: result.photoNumber,
              photoPath: result.secure_url, // Cloudinary URL
              filename: result.public_id, // Cloudinary public_id
              originalName: result.originalName,
              mimetype: "image/jpeg", // Cloudinary converts to JPEG
              size: result.size || 0,
            },
          ],
          { session }
        )
      );

      const photoResults = await Promise.all(photoPromises);
      uploadedPhotos = photoResults.flat();

      console.log(
        `Successfully created ${uploadedPhotos.length} photo records for student ${studentId}`
      );

      // Create photo folder structure for future uploads
      const age =
        new Date().getFullYear() - new Date(studentData.dob).getFullYear();
      const admitDate = new Date(studentData.admissionDate || Date.now())
        .toISOString()
        .split("T")[0];

      try {
        if (!studentId) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Student ID is required for folder creation"
          );
        }

        await FileUtils.createStudentPhotoFolder(school.name, {
          firstName: studentData.firstName,
          age,
          grade: studentData.grade,
          section: studentData.section as string,
          bloodGroup: studentData.bloodGroup,
          admitDate,
          studentId,
        });
      } catch (error) {
        console.warn("Failed to create photo folder:", error);
        // Don't fail the student creation if folder creation fails
      }

      // Store credentials in database if adminUserId is provided
      if (adminUserId) {
        if (!credentials) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Credentials are required for storage"
          );
        }

        const credentialsToStore: any[] = [
          {
            userId: newUser[0]._id,
            schoolId: studentData.schoolId,
            initialUsername: credentials.student.username,
            initialPassword: credentials.student.password, // Store plain password for initial access
            hasChangedPassword: false,
            role: "student",
            issuedBy: new Types.ObjectId(adminUserId),
          },
        ];

        // Add parent credentials if parent was created
        if (parentUser && parentUser.length > 0) {
          credentialsToStore.push({
            userId: parentUser[0]._id,
            schoolId: studentData.schoolId,
            initialUsername: credentials.parent.username,
            initialPassword: credentials.parent.password,
            hasChangedPassword: false,
            role: "parent",
            associatedStudentId: newStudent[0]._id,
            issuedBy: new Types.ObjectId(adminUserId),
          });
        }

        await UserCredentials.insertMany(credentialsToStore, { session });
      }

      // Commit transaction
      await session.commitTransaction();

      // Populate and return (after transaction is committed)
      await newStudent[0].populate([
        { path: "userId", select: "firstName lastName username email phone" },
        { path: "schoolId", select: "name" },
        { path: "parentId" },
      ]);

      const response = this.formatStudentResponse(newStudent[0]);

      // Add photo information to response
      if (uploadedPhotos.length > 0) {
        response.photos = uploadedPhotos.map((photo) => ({
          id: photo._id.toString(),
          photoPath: photo.photoPath,
          photoNumber: photo.photoNumber,
          filename: photo.filename,
          size: photo.size,
          createdAt: photo.createdAt,
        }));
        response.photoCount = uploadedPhotos.length;
      }

      // Add generated credentials to response
      if (credentials) {
        response.credentials = {
          student: {
            username: credentials.student.username,
            password: credentials.student.password,
          },
          parent: {
            username: credentials.parent.username,
            password: credentials.parent.password,
          },
        };
      }

      return response;
    } catch (error: unknown) {
      // Only abort if transaction is still active
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to create student: ${(error as Error).message}`
      );
    } finally {
      session.endSession();
    }
  }

  async getStudents(queryParams: {
    page: number;
    limit: number;
    schoolId?: string;
    grade?: number;
    section?: string;
    isActive?: string;
    search?: string;
    sortBy: string;
    sortOrder: string;
  }): Promise<{
    students: IStudentResponse[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    try {
      const {
        page,
        limit,
        schoolId,
        grade,
        section,
        isActive,
        search,
        sortBy,
        sortOrder,
      } = queryParams;
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {};

      if (schoolId) {
        query.schoolId = schoolId;
      }

      if (grade) {
        query.grade = grade;
      }

      if (section) {
        query.section = section;
      }

      if (isActive && isActive !== "all") {
        query.isActive = isActive === "true";
      }

      // Build search query for user fields
      let userQuery: any = {};
      if (search) {
        userQuery.$or = [
          { firstName: { $regex: new RegExp(search, "i") } },
          { lastName: { $regex: new RegExp(search, "i") } },
          { username: { $regex: new RegExp(search, "i") } },
        ];
      }

      // If we have user search criteria, find matching users first
      let userIds: Types.ObjectId[] = [];
      if (Object.keys(userQuery).length > 0) {
        const matchingUsers = await User.find(userQuery).select("_id");
        userIds = matchingUsers.map((user) => user._id);
        query.userId = { $in: userIds };
      }

      // Handle student ID search separately
      if (search && !userQuery.$or) {
        query.$or = [{ studentId: { $regex: new RegExp(search, "i") } }];
      }

      // Build sort
      const sort: any = {};
      if (sortBy === "firstName" || sortBy === "lastName") {
        // For user fields, we'll sort after population
        sort.grade = 1;
        sort.section = 1;
        sort.rollNumber = 1;
      } else {
        sort[sortBy] = sortOrder === "desc" ? -1 : 1;
      }

      // Execute queries
      const [students, totalCount] = await Promise.all([
        Student.find(query)
          .populate("userId", "firstName lastName username email phone")
          .populate("schoolId", "_id name")
          .populate({
            path: "parentId",
            select: "_id userId occupation address relationship",
            populate: {
              path: "userId",
              select: "_id firstName lastName username email phone",
            },
          })
          .populate("photos")
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Student.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        students: students.map((student) =>
          this.formatStudentResponse(student)
        ),
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch students: ${(error as Error).message}`
      );
    }
  }

  async getStudentById(id: string): Promise<IStudentResponse> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid student ID format");
      }

      const student = await Student.findById(id)
        .populate("userId", "firstName lastName username email phone")
        .populate("schoolId", "_id name")
        .populate({
          path: "parentId",
          select: "_id userId occupation address relationship",
          populate: {
            path: "userId",
            select: "_id firstName lastName username email phone",
          },
        })
        .populate("photos")
        .populate("photoCount")
        .lean();

      if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, "Student not found");
      }

      return this.formatStudentResponse(student);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch student: ${(error as Error).message}`
      );
    }
  }

  async updateStudent(
    id: string,
    updateData: IUpdateStudentRequest
  ): Promise<IStudentResponse> {
    const session = await mongoose.startSession();

    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid student ID format");
      }

      session.startTransaction();

      const student = await Student.findById(id).session(session);
      if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, "Student not found");
      }

      // Update student record
      const studentUpdateData: any = {};
      if (updateData.grade !== undefined)
        studentUpdateData.grade = updateData.grade;
      if (updateData.section !== undefined)
        studentUpdateData.section = updateData.section;
      if (updateData.bloodGroup !== undefined)
        studentUpdateData.bloodGroup = updateData.bloodGroup;
      if (updateData.dob !== undefined)
        studentUpdateData.dob = new Date(updateData.dob);
      if (updateData.rollNumber !== undefined)
        studentUpdateData.rollNumber = updateData.rollNumber;
      if (updateData.isActive !== undefined)
        studentUpdateData.isActive = updateData.isActive;
      if (updateData.address !== undefined)
        studentUpdateData.address = updateData.address;

      // Update student if there are any changes
      if (Object.keys(studentUpdateData).length > 0) {
        await Student.findByIdAndUpdate(
          id,
          { $set: studentUpdateData },
          { new: true, runValidators: true, session }
        );
      }

      // Update parent information if provided
      if (updateData.parentInfo && student.parentId) {
        const parentUpdateData: any = {};

        // Update parent record
        if (updateData.parentInfo.name) {
          // Split parent name into first and last name
          const nameParts = updateData.parentInfo.name.trim().split(/\s+/);
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          // Update parent user information
          await User.findOneAndUpdate(
            {
              _id: {
                $in: await Parent.findById(student.parentId).then(
                  (p) => p?.userId
                ),
              },
            },
            {
              $set: {
                firstName,
                lastName,
                ...(updateData.parentInfo.email && {
                  email: updateData.parentInfo.email,
                }),
                ...(updateData.parentInfo.phone && {
                  phone: updateData.parentInfo.phone,
                }),
              },
            },
            { session }
          );
        }

        // Update parent-specific information
        if (updateData.parentInfo.address || updateData.parentInfo.occupation) {
          await Parent.findByIdAndUpdate(
            student.parentId,
            {
              $set: {
                ...(updateData.parentInfo.address && {
                  address: updateData.parentInfo.address,
                }),
                ...(updateData.parentInfo.occupation && {
                  occupation: updateData.parentInfo.occupation,
                }),
              },
            },
            { session }
          );
        }
      }

      await session.commitTransaction();

      // Fetch the updated student with populated fields
      const updatedStudent = await Student.findById(id)
        .populate("userId", "firstName lastName username email phone")
        .populate("schoolId", "_id name")
        .populate({
          path: "parentId",
          select: "_id userId occupation address relationship",
          populate: {
            path: "userId",
            select: "_id firstName lastName username email phone",
          },
        })
        .lean();

      if (!updatedStudent) {
        throw new AppError(httpStatus.NOT_FOUND, "Updated student not found");
      }

      return this.formatStudentResponse(updatedStudent);
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to update student: ${(error as Error).message}`
      );
    } finally {
      session.endSession();
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid student ID format");
      }

      const student = await Student.findById(id)
        .populate("userId", "firstName lastName")
        .populate("schoolId", "_id name");

      if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, "Student not found");
      }

      // Delete associated user account
      if (student.userId) {
        await User.findByIdAndDelete(student.userId);
      }

      // Delete photo folder
      try {
        const age =
          new Date().getFullYear() - new Date(student.dob).getFullYear();
        const admitDate = student.admissionDate.toISOString().split("T")[0];

        const folderPath = await FileUtils.createStudentPhotoFolder(
          (student.schoolId as any).name,
          {
            firstName: (student.userId as any).firstName,
            age,
            grade: student.grade,
            section: student.section,
            bloodGroup: student.bloodGroup,
            admitDate,
            studentId: student.studentId,
          }
        );

        await FileUtils.deleteFolder(folderPath);
      } catch (error) {
        console.warn("Failed to delete photo folder:", error);
      }

      // The pre-delete middleware in the model will handle photo deletion
      await student.deleteOne();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to delete student: ${(error as Error).message}`
      );
    }
  }

  async uploadPhotos(
    studentId: string,
    files: Express.Multer.File[]
  ): Promise<IStudentPhotoResponse[]> {
    try {
      if (!Types.ObjectId.isValid(studentId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid student ID format");
      }

      const student = await Student.findById(studentId)
        .populate("userId", "firstName lastName")
        .populate("schoolId", "_id name");

      if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, "Student not found");
      }

      // Check current photo count
      const currentPhotoCount = await StudentPhoto.countDocuments({
        studentId,
      });
      const remainingSlots = config.max_photos_per_student - currentPhotoCount;

      if (files.length > remainingSlots) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Can only upload ${remainingSlots} more photos. Maximum ${config.max_photos_per_student} photos allowed per student.`
        );
      }

      // Validate all files first
      for (const file of files) {
        const validation = FileUtils.validateImageFile(file);
        if (!validation.isValid) {
          throw new AppError(httpStatus.BAD_REQUEST, validation.error!);
        }
      }

      // Generate Cloudinary folder path for student photos
      const cloudinaryFolderPath = generateCloudinaryFolderPath(
        (student.schoolId as any).name,
        "student",
        (student.userId as any).firstName,
        new Date(student.dob),
        student.bloodGroup,
        new Date(student.admissionDate),
        student.grade,
        student.section,
        student.studentId
      );

      console.log(
        `Uploading additional photos to Cloudinary folder: ${cloudinaryFolderPath}`
      );

      // Upload photos to Cloudinary
      const cloudinaryResults = await uploadPhotosToCloudinary(
        files,
        cloudinaryFolderPath,
        student.studentId
      );

      console.log(
        `Successfully uploaded ${cloudinaryResults.length} additional photos to Cloudinary`
      );

      // Create photo records with Cloudinary data
      const uploadedPhotos: IStudentPhotoResponse[] = [];

      for (const result of cloudinaryResults) {
        const photoRecord = await StudentPhoto.create({
          studentId,
          schoolId: student.schoolId,
          photoPath: result.secure_url, // Cloudinary URL
          photoNumber: result.photoNumber,
          filename: result.public_id, // Cloudinary public_id
          originalName: result.originalName,
          mimetype: "image/jpeg", // Cloudinary converts to JPEG
          size: result.size || 0,
        });

        uploadedPhotos.push({
          id: photoRecord._id.toString(),
          photoPath: photoRecord.photoPath,
          photoNumber: photoRecord.photoNumber,
          filename: photoRecord.filename,
          size: photoRecord.size,
          createdAt: photoRecord.createdAt as Date,
        });
      }

      return uploadedPhotos;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to upload photos: ${(error as Error).message}`
      );
    }
  }

  async deletePhoto(studentId: string, photoId: string): Promise<void> {
    try {
      if (
        !Types.ObjectId.isValid(studentId) ||
        !Types.ObjectId.isValid(photoId)
      ) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid ID format");
      }

      const photo = await StudentPhoto.findOne({ _id: photoId, studentId });
      if (!photo) {
        throw new AppError(httpStatus.NOT_FOUND, "Photo not found");
      }

      // Delete from Cloudinary using the public_id (filename field stores Cloudinary public_id)
      await deleteFromCloudinary(photo.filename);

      // Delete database record
      await photo.deleteOne();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to delete photo: ${(error as Error).message}`
      );
    }
  }

  async getStudentsByGradeAndSection(
    schoolId: string,
    grade: number,
    section: string
  ): Promise<IStudentResponse[]> {
    try {
      if (!Types.ObjectId.isValid(schoolId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid school ID format");
      }

      const students = await Student.findByGradeAndSection(
        schoolId,
        grade,
        section
      );
      return students.map((student) => this.formatStudentResponse(student));
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch students by grade and section: ${
          (error as Error).message
        }`
      );
    }
  }

  async getStudentStats(schoolId: string): Promise<IStudentStats> {
    try {
      if (!Types.ObjectId.isValid(schoolId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid school ID format");
      }

      const [
        totalStudents,
        activeStudents,
        gradeStats,
        sectionStats,
        recentAdmissions,
      ] = await Promise.all([
        Student.countDocuments({ schoolId }),
        Student.countDocuments({ schoolId, isActive: true }),
        Student.aggregate([
          { $match: { schoolId: new Types.ObjectId(schoolId) } },
          { $group: { _id: "$grade", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Student.aggregate([
          { $match: { schoolId: new Types.ObjectId(schoolId) } },
          { $group: { _id: "$section", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Student.countDocuments({
          schoolId,
          admissionDate: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

      return {
        totalStudents,
        activeStudents,
        byGrade: gradeStats.map((stat) => ({
          grade: stat._id,
          count: stat.count,
        })),
        bySection: sectionStats.map((stat) => ({
          section: stat._id,
          count: stat.count,
        })),
        recentAdmissions,
      };
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch student stats: ${(error as Error).message}`
      );
    }
  }

  async getStudentPhotos(studentId: string): Promise<IStudentPhotoResponse[]> {
    try {
      if (!Types.ObjectId.isValid(studentId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid student ID format");
      }

      const photos = await StudentPhoto.find({ studentId })
        .sort({ photoNumber: 1 })
        .lean();

      return photos.map((photo) => ({
        id: photo._id.toString(),
        photoPath: photo.photoPath,
        photoNumber: photo.photoNumber,
        filename: photo.filename,
        size: photo.size,
        createdAt: photo.createdAt!,
      }));
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch student photos: ${(error as Error).message}`
      );
    }
  }

  async getStudentCredentials(studentId: string): Promise<{
    student: {
      id: string;
      username: string;
      password: string;
      email?: string;
      phone?: string;
    };
    parent: {
      id: string;
      username: string;
      password: string;
      email?: string;
      phone?: string;
    };
  } | null> {
    try {
      if (!Types.ObjectId.isValid(studentId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid student ID format");
      }

      // Get student with populated data
      const student = await Student.findById(studentId)
        .populate("userId", "firstName lastName username email phone")
        .populate({
          path: "parentId",
          populate: {
            path: "userId",
            select: "firstName lastName username email phone",
          },
        })
        .lean();

      if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, "Student not found");
      }

      // Get stored credentials for student and parent
      const [studentCredentials, parentCredentials] = await Promise.all([
        UserCredentials.findOne({
          userId: student.userId,
          role: "student",
        }).lean(),
        student.parentId
          ? UserCredentials.findOne({
              userId: (student.parentId as any).userId,
              role: "parent",
            }).lean()
          : null,
      ]);

      if (!studentCredentials) {
        return null; // No credentials found
      }

      const result = {
        student: {
          id: student.studentId,
          username: studentCredentials.initialUsername,
          password: studentCredentials.initialPassword,
          email: (student.userId as any).email,
          phone: (student.userId as any).phone,
        },
        parent: {
          id: student.parentId
            ? (student.parentId as any).parentId || "N/A"
            : "N/A",
          username: parentCredentials?.initialUsername || "N/A",
          password: parentCredentials?.initialPassword || "N/A",
          email: student.parentId
            ? (student.parentId as any).userId?.email
            : undefined,
          phone: student.parentId
            ? (student.parentId as any).userId?.phone
            : undefined,
        },
      };

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to retrieve student credentials: ${(error as Error).message}`
      );
    }
  }

  async getAvailablePhotoSlots(studentId: string): Promise<number[]> {
    try {
      if (!Types.ObjectId.isValid(studentId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid student ID format");
      }

      const student = await Student.findById(studentId)
        .populate("userId", "firstName")
        .populate("schoolId", "_id name");

      if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, "Student not found");
      }

      // Get student folder path
      const age =
        new Date().getFullYear() - new Date(student.dob).getFullYear();
      const admitDate = student.admissionDate.toISOString().split("T")[0];

      const folderPath = await FileUtils.createStudentPhotoFolder(
        (student.schoolId as any).name,
        {
          firstName: (student.userId as any).firstName,
          age,
          grade: student.grade,
          section: student.section,
          bloodGroup: student.bloodGroup,
          admitDate,
          studentId: student.studentId,
        }
      );

      return await FileUtils.getAvailablePhotoNumbers(folderPath);
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to get available photo slots: ${(error as Error).message}`
      );
    }
  }

  private formatStudentResponse(student: any): IStudentResponse {
    const age = student.dob
      ? new Date().getFullYear() - new Date(student.dob).getFullYear()
      : 0;
    const admissionYear = student.admissionDate
      ? new Date(student.admissionDate).getFullYear()
      : new Date().getFullYear();

    // Helper function to safely extract ID
    const extractId = (obj: any): string => {
      if (!obj) return "";
      if (typeof obj === "string") return obj;
      if (obj._id) return obj._id.toString();
      if (obj.id) return obj.id.toString();
      return obj.toString();
    };

    // Handle user data - check both userId and user properties (similar to teacher fix)
    const userData = student.userId || student.user;

    return {
      id: extractId(student._id || student.id),
      userId: extractId(student.userId),
      schoolId: extractId(student.schoolId),
      studentId: student.studentId,
      grade: student.grade,
      section: student.section,
      bloodGroup: student.bloodGroup,
      dob: student.dob ? student.dob.toISOString().split("T")[0] : undefined,
      admissionDate: student.admissionDate
        ? student.admissionDate.toISOString().split("T")[0]
        : undefined,
      admissionYear,
      parentId: extractId(student.parentId),
      rollNumber: student.rollNumber,
      isActive: student.isActive !== undefined ? student.isActive : true,
      age,
      address: student.address || undefined,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      user: userData
        ? {
            id: extractId(userData),
            username: userData.username || "",
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            fullName:
              `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
              "Unknown User",
            email: userData.email,
            phone: userData.phone,
          }
        : undefined,
      school: student.schoolId
        ? {
            id: extractId(student.schoolId),
            name: student.schoolId.name || "Unknown School",
          }
        : undefined,
      parent: student.parentId
        ? {
            id: extractId(student.parentId),
            userId: student.parentId.userId
              ? extractId(student.parentId.userId)
              : undefined,
            fullName: student.parentId.userId
              ? `${student.parentId.userId.firstName || ""} ${
                  student.parentId.userId.lastName || ""
                }`.trim()
              : "Unknown Parent",
            name: student.parentId.userId
              ? `${student.parentId.userId.firstName || ""} ${
                  student.parentId.userId.lastName || ""
                }`.trim()
              : "Unknown Parent",
            email: student.parentId.userId?.email || undefined,
            phone: student.parentId.userId?.phone || undefined,
            address: student.parentId.address
              ? `${student.parentId.address.street || ""} ${
                  student.parentId.address.city || ""
                } ${student.parentId.address.state || ""} ${
                  student.parentId.address.country || ""
                }`.trim()
              : undefined,
            occupation: student.parentId.occupation || undefined,
            relationship: student.parentId.relationship || undefined,
          }
        : undefined,
      photos:
        student.photos?.map((photo: any) => ({
          id: extractId(photo),
          photoPath: photo.photoPath,
          photoNumber: photo.photoNumber,
          filename: photo.filename,
          size: photo.size,
          createdAt: photo.createdAt,
        })) || [],
      photoCount: student.photos?.length || 0,
    };
  }
}

export const studentService = new StudentService();
