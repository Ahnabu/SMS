import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { studentService } from './student.service';
import { ICreateStudentRequest, IUpdateStudentRequest } from './student.interface';

const createStudent = catchAsync(async (req: Request, res: Response) => {
  const studentData: ICreateStudentRequest = req.body;
  const result = await studentService.createStudent(studentData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Student created successfully with auto-generated credentials',
    data: {
      student: result.student,
      generatedCredentials: {
        student: {
          username: result.credentials.student.username,
          password: result.credentials.student.password,
          message: 'Student login credentials. Password must be changed on first login.',
        },
        parent: {
          username: result.credentials.parent.username,
          password: result.credentials.parent.password,
          message: 'Parent login credentials. Password must be changed on first login.',
        },
        instructions: [
          'Please save these credentials securely and provide them to the respective users.',
          'Both accounts will require password change upon first login for security.',
          'Student ID format: YYYYGGRRR (Year-Grade-Roll, e.g., 2025050001)',
        ],
      },
    },
  });
});

const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query as any;
  const result = await studentService.getStudents(filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Students retrieved successfully',
    meta: {
      page: result.currentPage,
      limit: Number(filters.limit) || 20,
      total: result.totalCount,
    },
    data: result.students,
  });
});

const getStudentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await studentService.getStudentById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student retrieved successfully',
    data: result,
  });
});

const updateStudent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: IUpdateStudentRequest = req.body;
  const result = await studentService.updateStudent(id, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student updated successfully',
    data: result,
  });
});

const deleteStudent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await studentService.deleteStudent(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student deleted successfully',
    data: null,
  });
});

const getStudentsByGradeAndSection = catchAsync(async (req: Request, res: Response) => {
  const { schoolId, grade, section } = req.params;
  const result = await studentService.getStudentsByGradeAndSection(
    schoolId,
    parseInt(grade),
    section
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Students retrieved successfully',
    data: result,
  });
});

const getStudentStats = catchAsync(async (req: Request, res: Response) => {
  const { schoolId } = req.params;
  const result = await studentService.getStudentStats(schoolId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student statistics retrieved successfully',
    data: result,
  });
});

const uploadStudentPhotos = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'No photos provided',
      data: null,
    });
  }

  const result = await studentService.uploadPhotos(id, files);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student photos uploaded successfully',
    data: result,
  });
});

const deleteStudentPhoto = catchAsync(async (req: Request, res: Response) => {
  const { studentId, photoId } = req.params;
  await studentService.deletePhoto(studentId, photoId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student photo deleted successfully',
    data: null,
  });
});

const getStudentPhotos = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await studentService.getStudentPhotos(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student photos retrieved successfully',
    data: result,
  });
});

const getAvailablePhotoSlots = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await studentService.getAvailablePhotoSlots(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Available photo slots retrieved successfully',
    data: result,
  });
});

export const StudentController = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentsByGradeAndSection,
  getStudentStats,
  uploadStudentPhotos,
  deleteStudentPhoto,
  getStudentPhotos,
  getAvailablePhotoSlots,
};