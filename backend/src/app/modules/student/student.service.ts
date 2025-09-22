import httpStatus from 'http-status';
import { Types } from 'mongoose';
import path from 'path';
import { AppError } from '../../errors/AppError';
import { School } from '../school/school.model';
import { User } from '../user/user.model';
import { Student, StudentPhoto } from './student.model';
import { FileUtils } from '../../utils/fileUtils';
import config from '../../config';
import {
  ICreateStudentRequest,
  IUpdateStudentRequest,
  IStudentResponse,
  IStudentDocument,
  IStudentStats,
  IPhotoUploadRequest,
  IStudentPhotoResponse,
} from './student.interface';

class StudentService {
  async createStudent(studentData: ICreateStudentRequest): Promise<IStudentResponse> {
    try {
      // Verify school exists and is active
      const school = await School.findById(studentData.schoolId);
      if (!school) {
        throw new AppError(httpStatus.NOT_FOUND, 'School not found');
      }

      if (school.status !== 'active') {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Cannot create student for inactive school'
        );
      }

      // Check if student with same name exists in the same grade/section
      const existingUser = await User.findOne({
        schoolId: studentData.schoolId,
        firstName: { $regex: new RegExp(`^${studentData.firstName}$`, 'i') },
        lastName: { $regex: new RegExp(`^${studentData.lastName}$`, 'i') },
        role: 'student',
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

      // Generate student ID
      const studentId = await Student.generateNextStudentId(
        studentData.schoolId,
        studentData.grade
      );

      // Generate username from student ID
      const username = studentId.replace(/-/g, '').toLowerCase();

      // Create user account for student
      const newUser = await User.create({
        schoolId: studentData.schoolId,
        role: 'student',
        username,
        passwordHash: studentId, // Temporary password, same as student ID
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        phone: studentData.phone,
      });

      // Create student record
      const newStudent = await Student.create({
        userId: newUser._id,
        schoolId: studentData.schoolId,
        studentId,
        grade: studentData.grade,
        section: studentData.section,
        bloodGroup: studentData.bloodGroup,
        dob: new Date(studentData.dob),
        admissionDate: studentData.admissionDate ? new Date(studentData.admissionDate) : new Date(),
        rollNumber: studentData.rollNumber,
      });

      // Create parent if parent info is provided
      if (studentData.parentInfo) {
        const { parentInfo } = studentData;

        // Generate parent username
        const parentUsername = `${username}_parent`;

        // Create parent user account
        const parentUser = await User.create({
          schoolId: studentData.schoolId,
          role: 'parent',
          username: parentUsername,
          passwordHash: studentId, // Same temporary password
          firstName: parentInfo.firstName,
          lastName: parentInfo.lastName,
          email: parentInfo.email,
          phone: parentInfo.phone,
        });

        // Create parent record (Parent model will be created later)
        // For now, just update the student with parent reference
        newStudent.parentId = parentUser._id;
        await newStudent.save();
      }

      // Create photo folder structure
      const age = new Date().getFullYear() - new Date(studentData.dob).getFullYear();
      const admitDate = new Date(studentData.admissionDate || Date.now()).toISOString().split('T')[0];

      try {
        await FileUtils.createStudentPhotoFolder(school.name, {
          firstName: studentData.firstName,
          age,
          grade: studentData.grade,
          section: studentData.section,
          bloodGroup: studentData.bloodGroup,
          admitDate,
          studentId,
        });
      } catch (error) {
        console.warn('Failed to create photo folder:', error);
        // Don't fail the student creation if folder creation fails
      }

      // Populate and return
      await newStudent.populate([
        { path: 'userId', select: 'firstName lastName username email phone' },
        { path: 'schoolId', select: 'name' },
        { path: 'parentId' },
      ]);

      return this.formatStudentResponse(newStudent);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to create student: ${(error as Error).message}`
      );
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
      const { page, limit, schoolId, grade, section, isActive, search, sortBy, sortOrder } = queryParams;
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

      if (isActive && isActive !== 'all') {
        query.isActive = isActive === 'true';
      }

      // Build search query for user fields
      let userQuery: any = {};
      if (search) {
        userQuery.$or = [
          { firstName: { $regex: new RegExp(search, 'i') } },
          { lastName: { $regex: new RegExp(search, 'i') } },
          { username: { $regex: new RegExp(search, 'i') } },
        ];
      }

      // If we have user search criteria, find matching users first
      let userIds: Types.ObjectId[] = [];
      if (Object.keys(userQuery).length > 0) {
        const matchingUsers = await User.find(userQuery).select('_id');
        userIds = matchingUsers.map(user => user._id);
        query.userId = { $in: userIds };
      }

      // Handle student ID search separately
      if (search && !userQuery.$or) {
        query.$or = [
          { studentId: { $regex: new RegExp(search, 'i') } },
        ];
      }

      // Build sort
      const sort: any = {};
      if (sortBy === 'firstName' || sortBy === 'lastName') {
        // For user fields, we'll sort after population
        sort.grade = 1;
        sort.section = 1;
        sort.rollNumber = 1;
      } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      // Execute queries
      const [students, totalCount] = await Promise.all([
        Student.find(query)
          .populate('userId', 'firstName lastName username email phone')
          .populate('schoolId', 'name')
          .populate('parentId')
          .populate('photoCount')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Student.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        students: students.map(student => this.formatStudentResponse(student)),
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
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid student ID format');
      }

      const student = await Student.findById(id)
        .populate('userId', 'firstName lastName username email phone')
        .populate('schoolId', 'name')
        .populate('parentId')
        .populate('photos')
        .populate('photoCount')
        .lean();

      if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
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

  async updateStudent(id: string, updateData: IUpdateStudentRequest): Promise<IStudentResponse> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid student ID format');
      }

      const student = await Student.findById(id);
      if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('userId', 'firstName lastName username email phone')
        .populate('schoolId', 'name')
        .populate('parentId')
        .populate('photoCount')
        .lean();

      return this.formatStudentResponse(updatedStudent!);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to update student: ${(error as Error).message}`
      );
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid student ID format');
      }

      const student = await Student.findById(id)
        .populate('userId', 'firstName lastName')
        .populate('schoolId', 'name');

      if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
      }

      // Delete associated user account
      if (student.userId) {
        await User.findByIdAndDelete(student.userId);
      }

      // Delete photo folder
      try {
        const age = new Date().getFullYear() - new Date(student.dob).getFullYear();
        const admitDate = student.admissionDate.toISOString().split('T')[0];

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
        console.warn('Failed to delete photo folder:', error);
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
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid student ID format');
      }

      const student = await Student.findById(studentId)
        .populate('userId', 'firstName lastName')
        .populate('schoolId', 'name');

      if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
      }

      // Check current photo count
      const currentPhotoCount = await StudentPhoto.countDocuments({ studentId });
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

      // Get student folder path
      const age = new Date().getFullYear() - new Date(student.dob).getFullYear();
      const admitDate = student.admissionDate.toISOString().split('T')[0];

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

      // Get available photo numbers
      const availableNumbers = await FileUtils.getAvailablePhotoNumbers(folderPath);

      if (files.length > availableNumbers.length) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Only ${availableNumbers.length} photo slots available`
        );
      }

      // Upload files and create records
      const uploadedPhotos: IStudentPhotoResponse[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const photoNumber = availableNumbers[i];

        // Save file with numbered naming
        const fileInfo = await FileUtils.savePhotoWithNumber(file, folderPath, photoNumber);

        // Create photo record
        const photoRecord = await StudentPhoto.create({
          studentId,
          schoolId: student.schoolId,
          photoPath: fileInfo.relativePath,
          photoNumber,
          filename: fileInfo.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
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
      if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(photoId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid ID format');
      }

      const photo = await StudentPhoto.findOne({ _id: photoId, studentId });
      if (!photo) {
        throw new AppError(httpStatus.NOT_FOUND, 'Photo not found');
      }

      // Delete physical file
      const fullPath = path.resolve(config.upload_path, photo.photoPath);
      await FileUtils.deleteFile(fullPath);

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
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid school ID format');
      }

      const students = await Student.findByGradeAndSection(schoolId, grade, section);
      return students.map(student => this.formatStudentResponse(student));
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch students by grade and section: ${(error as Error).message}`
      );
    }
  }

  async getStudentStats(schoolId: string): Promise<IStudentStats> {
    try {
      if (!Types.ObjectId.isValid(schoolId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid school ID format');
      }

      const [totalStudents, activeStudents, gradeStats, sectionStats, recentAdmissions] = await Promise.all([
        Student.countDocuments({ schoolId }),
        Student.countDocuments({ schoolId, isActive: true }),
        Student.aggregate([
          { $match: { schoolId: new Types.ObjectId(schoolId) } },
          { $group: { _id: '$grade', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Student.aggregate([
          { $match: { schoolId: new Types.ObjectId(schoolId) } },
          { $group: { _id: '$section', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Student.countDocuments({
          schoolId,
          admissionDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }),
      ]);

      return {
        totalStudents,
        activeStudents,
        byGrade: gradeStats.map(stat => ({ grade: stat._id, count: stat.count })),
        bySection: sectionStats.map(stat => ({ section: stat._id, count: stat.count })),
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
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid student ID format');
      }

      const photos = await StudentPhoto.find({ studentId })
        .sort({ photoNumber: 1 })
        .lean();

      return photos.map(photo => ({
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

  async getAvailablePhotoSlots(studentId: string): Promise<number[]> {
    try {
      if (!Types.ObjectId.isValid(studentId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid student ID format');
      }

      const student = await Student.findById(studentId)
        .populate('userId', 'firstName')
        .populate('schoolId', 'name');

      if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
      }

      // Get student folder path
      const age = new Date().getFullYear() - new Date(student.dob).getFullYear();
      const admitDate = student.admissionDate.toISOString().split('T')[0];

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
    const age = student.dob ? new Date().getFullYear() - new Date(student.dob).getFullYear() : 0;

    return {
      id: student._id?.toString() || student.id,
      userId: student.userId?._id?.toString() || student.userId?.toString(),
      schoolId: student.schoolId?._id?.toString() || student.schoolId?.toString(),
      studentId: student.studentId,
      grade: student.grade,
      section: student.section,
      bloodGroup: student.bloodGroup,
      dob: student.dob,
      admissionDate: student.admissionDate,
      parentId: student.parentId?._id?.toString() || student.parentId?.toString(),
      rollNumber: student.rollNumber,
      isActive: student.isActive,
      age,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      user: student.userId ? {
        id: student.userId._id?.toString() || student.userId.id,
        username: student.userId.username,
        firstName: student.userId.firstName,
        lastName: student.userId.lastName,
        fullName: `${student.userId.firstName} ${student.userId.lastName}`.trim(),
        email: student.userId.email,
        phone: student.userId.phone,
      } : undefined,
      school: student.schoolId?.name ? {
        id: student.schoolId._id?.toString() || student.schoolId.id,
        name: student.schoolId.name,
      } : undefined,
      parent: student.parentId ? {
        id: student.parentId._id?.toString() || student.parentId.id,
        userId: student.parentId.userId?.toString(),
        fullName: student.parentId.userId ?
          `${student.parentId.userId.firstName} ${student.parentId.userId.lastName}`.trim() : '',
      } : undefined,
      photos: student.photos?.map((photo: any) => ({
        id: photo._id?.toString() || photo.id,
        photoPath: photo.photoPath,
        photoNumber: photo.photoNumber,
        filename: photo.filename,
        size: photo.size,
        createdAt: photo.createdAt,
      })) || [],
      photoCount: student.photoCount || 0,
    };
  }
}

export const studentService = new StudentService();