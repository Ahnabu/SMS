import httpStatus from 'http-status';
import { Types } from 'mongoose';
import path from 'path';
import config from '../../config';
import { AppError } from '../../errors/AppError';
import { FileUtils } from '../../utils/fileUtils';
import { School } from '../school/school.model';
import { User } from '../user/user.model';
import { Teacher, TeacherPhoto } from './teacher.model';
import {
  ICreateTeacherRequest,
  IUpdateTeacherRequest,
  ITeacherResponse,
  ITeacherPhotoResponse,
  ITeacherStats,
} from './teacher.interface';

class TeacherService {
  async createTeacher(teacherData: ICreateTeacherRequest): Promise<ITeacherResponse> {
    try {
      // Verify school exists and is active
      const school = await School.findById(teacherData.schoolId);
      if (!school) {
        throw new AppError(httpStatus.NOT_FOUND, 'School not found');
      }

      if (school.status !== 'active') {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Cannot create teacher for inactive school'
        );
      }

      // Check if teacher with same name exists in the same school
      const existingUser = await User.findOne({
        schoolId: teacherData.schoolId,
        firstName: { $regex: new RegExp(`^${teacherData.firstName}$`, 'i') },
        lastName: { $regex: new RegExp(`^${teacherData.lastName}$`, 'i') },
        role: 'teacher',
      });

      if (existingUser) {
        // Check if this user is already a teacher
        const existingTeacher = await Teacher.findOne({
          userId: existingUser._id,
        });

        if (existingTeacher) {
          throw new AppError(
            httpStatus.CONFLICT,
            `Teacher with name '${teacherData.firstName} ${teacherData.lastName}' already exists in this school`
          );
        }
      }

      // Generate teacher ID
      const teacherId = await Teacher.generateNextTeacherId(teacherData.schoolId);

      // Generate username from teacher ID
      const username = teacherId.replace(/-/g, '').toLowerCase();

      // Create user account for teacher
      const newUser = await User.create({
        schoolId: teacherData.schoolId,
        role: 'teacher',
        username,
        passwordHash: teacherId, // Temporary password, same as teacher ID
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        email: teacherData.email,
        phone: teacherData.phone,
      });

      // Process experience data
      const experienceData = {
        totalYears: teacherData.experience.totalYears,
        previousSchools: teacherData.experience.previousSchools?.map(school => ({
          ...school,
          fromDate: new Date(school.fromDate),
          toDate: new Date(school.toDate),
        })) || [],
      };

      // Create teacher record
      const newTeacher = await Teacher.create({
        userId: newUser._id,
        schoolId: teacherData.schoolId,
        teacherId,
        employeeId: teacherData.employeeId,
        subjects: teacherData.subjects,
        grades: teacherData.grades,
        sections: teacherData.sections,
        designation: teacherData.designation,
        bloodGroup: teacherData.bloodGroup,
        dob: new Date(teacherData.dob),
        joinDate: teacherData.joinDate ? new Date(teacherData.joinDate) : new Date(),
        qualifications: teacherData.qualifications,
        experience: experienceData,
        address: teacherData.address,
        emergencyContact: teacherData.emergencyContact,
        salary: teacherData.salary ? {
          ...teacherData.salary,
          netSalary: (teacherData.salary.basic || 0) + (teacherData.salary.allowances || 0) - (teacherData.salary.deductions || 0),
        } : undefined,
        isClassTeacher: teacherData.isClassTeacher || false,
        classTeacherFor: teacherData.classTeacherFor,
      });

      // Create photo folder structure
      const age = new Date().getFullYear() - new Date(teacherData.dob).getFullYear();
      const joinDate = new Date(teacherData.joinDate || Date.now()).toISOString().split('T')[0];

      try {
        await FileUtils.createTeacherPhotoFolder(school.name, {
          firstName: teacherData.firstName,
          age,
          bloodGroup: teacherData.bloodGroup,
          joinDate,
          teacherId,
        });
      } catch (error) {
        console.warn('Failed to create photo folder:', error);
        // Don't fail the teacher creation if folder creation fails
      }

      // Populate and return
      await newTeacher.populate([
        { path: 'userId', select: 'firstName lastName username email phone' },
        { path: 'schoolId', select: 'name' },
      ]);

      return this.formatTeacherResponse(newTeacher);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to create teacher: ${(error as Error).message}`
      );
    }
  }

  async getTeachers(queryParams: {
    page: number;
    limit: number;
    schoolId?: string;
    subject?: string;
    grade?: number;
    designation?: string;
    isActive?: string;
    isClassTeacher?: string;
    search?: string;
    sortBy: string;
    sortOrder: string;
  }): Promise<{
    teachers: ITeacherResponse[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    try {
      const { page, limit, schoolId, subject, grade, designation, isActive, isClassTeacher, search, sortBy, sortOrder } = queryParams;
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {};

      if (schoolId) {
        query.schoolId = schoolId;
      }

      if (subject) {
        query.subjects = subject;
      }

      if (grade) {
        query.grades = grade;
      }

      if (designation) {
        query.designation = designation;
      }

      if (isActive && isActive !== 'all') {
        query.isActive = isActive === 'true';
      }

      if (isClassTeacher) {
        query.isClassTeacher = isClassTeacher === 'true';
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

      // Handle teacher ID search separately
      if (search && !userQuery.$or) {
        query.$or = [
          { teacherId: { $regex: new RegExp(search, 'i') } },
          { employeeId: { $regex: new RegExp(search, 'i') } },
        ];
      }

      // Build sort
      const sort: any = {};
      if (sortBy === 'firstName' || sortBy === 'lastName') {
        // For user fields, we'll sort after population
        sort.designation = 1;
        sort.joinDate = -1;
      } else if (sortBy === 'experience.totalYears') {
        sort['experience.totalYears'] = sortOrder === 'desc' ? -1 : 1;
      } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      // Execute queries
      const [teachers, totalCount] = await Promise.all([
        Teacher.find(query)
          .populate('userId', 'firstName lastName username email phone')
          .populate('schoolId', 'name')
          .populate('photoCount')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Teacher.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        teachers: teachers.map(teacher => this.formatTeacherResponse(teacher)),
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch teachers: ${(error as Error).message}`
      );
    }
  }

  async getTeacherById(id: string): Promise<ITeacherResponse> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid teacher ID format');
      }

      const teacher = await Teacher.findById(id)
        .populate('userId', 'firstName lastName username email phone')
        .populate('schoolId', 'name')
        .populate('photos')
        .populate('photoCount')
        .lean();

      if (!teacher) {
        throw new AppError(httpStatus.NOT_FOUND, 'Teacher not found');
      }

      return this.formatTeacherResponse(teacher);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch teacher: ${(error as Error).message}`
      );
    }
  }

  async updateTeacher(id: string, updateData: IUpdateTeacherRequest): Promise<ITeacherResponse> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid teacher ID format');
      }

      const teacher = await Teacher.findById(id);
      if (!teacher) {
        throw new AppError(httpStatus.NOT_FOUND, 'Teacher not found');
      }

      // Process salary if provided
      if (updateData.salary) {
        const basic = updateData.salary.basic || 0;
        const allowances = updateData.salary.allowances || 0;
        const deductions = updateData.salary.deductions || 0;
        updateData.salary = {
          ...updateData.salary,
          netSalary: basic + allowances - deductions,
        };
      }

      const updatedTeacher = await Teacher.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('userId', 'firstName lastName username email phone')
        .populate('schoolId', 'name')
        .populate('photoCount')
        .lean();

      return this.formatTeacherResponse(updatedTeacher!);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to update teacher: ${(error as Error).message}`
      );
    }
  }

  async deleteTeacher(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid teacher ID format');
      }

      const teacher = await Teacher.findById(id)
        .populate('userId', 'firstName lastName')
        .populate('schoolId', 'name');

      if (!teacher) {
        throw new AppError(httpStatus.NOT_FOUND, 'Teacher not found');
      }

      // Delete associated user account
      if (teacher.userId) {
        await User.findByIdAndDelete(teacher.userId);
      }

      // Delete photo folder
      try {
        const age = new Date().getFullYear() - new Date(teacher.dob).getFullYear();
        const joinDate = teacher.joinDate.toISOString().split('T')[0];

        const folderPath = await FileUtils.createTeacherPhotoFolder(
          (teacher.schoolId as any).name,
          {
            firstName: (teacher.userId as any).firstName,
            age,
            bloodGroup: teacher.bloodGroup,
            joinDate,
            teacherId: teacher.teacherId,
          }
        );

        await FileUtils.deleteFolder(folderPath);
      } catch (error) {
        console.warn('Failed to delete photo folder:', error);
      }

      // The pre-delete middleware in the model will handle photo deletion
      await teacher.deleteOne();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to delete teacher: ${(error as Error).message}`
      );
    }
  }

  async uploadPhotos(
    teacherId: string,
    files: Express.Multer.File[]
  ): Promise<ITeacherPhotoResponse[]> {
    try {
      if (!Types.ObjectId.isValid(teacherId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid teacher ID format');
      }

      const teacher = await Teacher.findById(teacherId)
        .populate('userId', 'firstName lastName')
        .populate('schoolId', 'name');

      if (!teacher) {
        throw new AppError(httpStatus.NOT_FOUND, 'Teacher not found');
      }

      // Check current photo count
      const currentPhotoCount = await TeacherPhoto.countDocuments({ teacherId });
      const remainingSlots = config.max_photos_per_student - currentPhotoCount;

      if (files.length > remainingSlots) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Can only upload ${remainingSlots} more photos. Maximum ${config.max_photos_per_student} photos allowed per teacher.`
        );
      }

      // Validate all files first
      for (const file of files) {
        const validation = FileUtils.validateImageFile(file);
        if (!validation.isValid) {
          throw new AppError(httpStatus.BAD_REQUEST, validation.error!);
        }
      }

      // Get teacher folder path
      const age = new Date().getFullYear() - new Date(teacher.dob).getFullYear();
      const joinDate = teacher.joinDate.toISOString().split('T')[0];

      const folderPath = await FileUtils.createTeacherPhotoFolder(
        (teacher.schoolId as any).name,
        {
          firstName: (teacher.userId as any).firstName,
          age,
          bloodGroup: teacher.bloodGroup,
          joinDate,
          teacherId: teacher.teacherId,
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
      const uploadedPhotos: ITeacherPhotoResponse[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const photoNumber = availableNumbers[i];

        // Save file with numbered naming
        const fileInfo = await FileUtils.savePhotoWithNumber(file, folderPath, photoNumber);

        // Create photo record
        const photoRecord = await TeacherPhoto.create({
          teacherId,
          schoolId: teacher.schoolId,
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
          createdAt: photoRecord.createdAt!,
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

  async deletePhoto(teacherId: string, photoId: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(teacherId) || !Types.ObjectId.isValid(photoId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid ID format');
      }

      const photo = await TeacherPhoto.findOne({ _id: photoId, teacherId });
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

  async getTeachersBySubject(
    schoolId: string,
    subject: string
  ): Promise<ITeacherResponse[]> {
    try {
      if (!Types.ObjectId.isValid(schoolId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid school ID format');
      }

      const teachers = await Teacher.findBySubject(schoolId, subject);
      return teachers.map(teacher => this.formatTeacherResponse(teacher));
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch teachers by subject: ${(error as Error).message}`
      );
    }
  }

  async getTeacherStats(schoolId: string): Promise<ITeacherStats> {
    try {
      if (!Types.ObjectId.isValid(schoolId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid school ID format');
      }

      const [totalTeachers, activeTeachers, classTeachers, designationStats, subjectStats, experienceStats, recentJoining] = await Promise.all([
        Teacher.countDocuments({ schoolId }),
        Teacher.countDocuments({ schoolId, isActive: true }),
        Teacher.countDocuments({ schoolId, isClassTeacher: true }),
        Teacher.aggregate([
          { $match: { schoolId: new Types.ObjectId(schoolId) } },
          { $group: { _id: '$designation', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Teacher.aggregate([
          { $match: { schoolId: new Types.ObjectId(schoolId) } },
          { $unwind: '$subjects' },
          { $group: { _id: '$subjects', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Teacher.aggregate([
          { $match: { schoolId: new Types.ObjectId(schoolId) } },
          {
            $group: {
              _id: {
                $switch: {
                  branches: [
                    { case: { $lt: ['$experience.totalYears', 2] }, then: '0-2 years' },
                    { case: { $lt: ['$experience.totalYears', 5] }, then: '2-5 years' },
                    { case: { $lt: ['$experience.totalYears', 10] }, then: '5-10 years' },
                    { case: { $lt: ['$experience.totalYears', 20] }, then: '10-20 years' },
                  ],
                  default: '20+ years'
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } },
        ]),
        Teacher.countDocuments({
          schoolId,
          joinDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }),
      ]);

      return {
        totalTeachers,
        activeTeachers,
        classTeachers,
        byDesignation: designationStats.map(stat => ({ designation: stat._id, count: stat.count })),
        bySubject: subjectStats.map(stat => ({ subject: stat._id, count: stat.count })),
        byExperience: experienceStats.map(stat => ({ experienceRange: stat._id, count: stat.count })),
        recentJoining,
      };
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch teacher stats: ${(error as Error).message}`
      );
    }
  }

  async getTeacherPhotos(teacherId: string): Promise<ITeacherPhotoResponse[]> {
    try {
      if (!Types.ObjectId.isValid(teacherId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid teacher ID format');
      }

      const photos = await TeacherPhoto.find({ teacherId })
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
        `Failed to fetch teacher photos: ${(error as Error).message}`
      );
    }
  }

  async getAvailablePhotoSlots(teacherId: string): Promise<number[]> {
    try {
      if (!Types.ObjectId.isValid(teacherId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid teacher ID format');
      }

      const teacher = await Teacher.findById(teacherId)
        .populate('userId', 'firstName')
        .populate('schoolId', 'name');

      if (!teacher) {
        throw new AppError(httpStatus.NOT_FOUND, 'Teacher not found');
      }

      // Get teacher folder path
      const age = new Date().getFullYear() - new Date(teacher.dob).getFullYear();
      const joinDate = teacher.joinDate.toISOString().split('T')[0];

      const folderPath = await FileUtils.createTeacherPhotoFolder(
        (teacher.schoolId as any).name,
        {
          firstName: (teacher.userId as any).firstName,
          age,
          bloodGroup: teacher.bloodGroup,
          joinDate,
          teacherId: teacher.teacherId,
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

  private formatTeacherResponse(teacher: any): ITeacherResponse {
    const age = teacher.dob ? new Date().getFullYear() - new Date(teacher.dob).getFullYear() : 0;
    const totalExperience = teacher.experience?.totalYears || 0;

    return {
      id: teacher._id?.toString() || teacher.id,
      userId: teacher.userId?._id?.toString() || teacher.userId?.toString(),
      schoolId: teacher.schoolId?._id?.toString() || teacher.schoolId?.toString(),
      teacherId: teacher.teacherId,
      employeeId: teacher.employeeId,
      subjects: teacher.subjects || [],
      grades: teacher.grades || [],
      sections: teacher.sections || [],
      designation: teacher.designation,
      bloodGroup: teacher.bloodGroup,
      dob: teacher.dob,
      joinDate: teacher.joinDate,
      qualifications: teacher.qualifications || [],
      experience: {
        totalYears: teacher.experience?.totalYears || 0,
        previousSchools: teacher.experience?.previousSchools || [],
      },
      address: teacher.address,
      emergencyContact: teacher.emergencyContact,
      salary: teacher.salary,
      isClassTeacher: teacher.isClassTeacher || false,
      classTeacherFor: teacher.classTeacherFor,
      isActive: teacher.isActive !== false,
      age,
      totalExperience,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
      user: teacher.userId ? {
        id: teacher.userId._id?.toString() || teacher.userId.id,
        username: teacher.userId.username,
        firstName: teacher.userId.firstName,
        lastName: teacher.userId.lastName,
        fullName: `${teacher.userId.firstName} ${teacher.userId.lastName}`.trim(),
        email: teacher.userId.email,
        phone: teacher.userId.phone,
      } : undefined,
      school: teacher.schoolId?.name ? {
        id: teacher.schoolId._id?.toString() || teacher.schoolId.id,
        name: teacher.schoolId.name,
      } : undefined,
      photos: teacher.photos?.map((photo: any) => ({
        id: photo._id?.toString() || photo.id,
        photoPath: photo.photoPath,
        photoNumber: photo.photoNumber,
        filename: photo.filename,
        size: photo.size,
        createdAt: photo.createdAt,
      })) || [],
      photoCount: teacher.photoCount || 0,
    };
  }
}

export const teacherService = new TeacherService();