import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AppError } from "../../errors/AppError";
import { studentService } from "./student.service";
import {
  ICreateStudentRequest,
  IUpdateStudentRequest,
} from "./student.interface";

const createStudent = catchAsync(async (req: Request, res: Response) => {
  const studentData: ICreateStudentRequest = req.body;

  // Get admin user from auth middleware
  const adminUserId = (req as any).user?.id;
  if (!adminUserId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Admin user not found");
  }

  // Handle files from multer fields (FoundX pattern)
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const photos = files?.photos || [];

  const result = await studentService.createStudent(
    studentData,
    photos,
    adminUserId
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Student created successfully with auto-generated credentials",
    data: {
      student: result,
      credentials: result.credentials
        ? {
            student: {
              id: result.studentId,
              username: result.credentials.student.username,
              password: result.credentials.student.password,
              email: result.user?.email,
              phone: result.user?.phone,
            },
            parent: {
              id: result.parent?.id || "",
              username: result.credentials.parent.username,
              password: result.credentials.parent.password,
              email: result.parent?.userId ? undefined : undefined, // Will need parent email from service
              phone: undefined, // Will need parent phone from service
            },
          }
        : undefined,
    },
  });
});

const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query as any;
  
  // Get admin user from auth middleware
  const adminUser = (req as any).user;
  if (!adminUser?.schoolId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Admin user or school ID not found");
  }
  
  // Use schoolId from authenticated user and set defaults
  const filtersWithSchoolId = {
    page: Number(filters.page) || 1,
    limit: Number(filters.limit) || 20,
    sortBy: filters.sortBy || 'createdAt',
    sortOrder: filters.sortOrder || 'desc',
    ...filters,
    schoolId: adminUser.schoolId, // This ensures students are filtered by the admin's school
  };
  
  const result = await studentService.getStudents(filtersWithSchoolId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Students retrieved successfully",
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
    message: "Student retrieved successfully",
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
    message: "Student updated successfully",
    data: result,
  });
});

const deleteStudent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await studentService.deleteStudent(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student deleted successfully",
    data: null,
  });
});

const getStudentsByGradeAndSection = catchAsync(
  async (req: Request, res: Response) => {
    const { schoolId, grade, section } = req.params;
    const result = await studentService.getStudentsByGradeAndSection(
      schoolId,
      parseInt(grade),
      section
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Students retrieved successfully",
      data: result,
    });
  }
);

const getStudentStats = catchAsync(async (req: Request, res: Response) => {
  const { schoolId } = req.params;
  const result = await studentService.getStudentStats(schoolId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student statistics retrieved successfully",
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
      message: "No photos provided",
      data: null,
    });
  }

  const result = await studentService.uploadPhotos(id, files);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student photos uploaded successfully",
    data: result,
  });
});

const deleteStudentPhoto = catchAsync(async (req: Request, res: Response) => {
  const { studentId, photoId } = req.params;
  await studentService.deletePhoto(studentId, photoId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student photo deleted successfully",
    data: null,
  });
});

const getStudentPhotos = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await studentService.getStudentPhotos(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student photos retrieved successfully",
    data: result,
  });
});

const getAvailablePhotoSlots = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await studentService.getAvailablePhotoSlots(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Available photo slots retrieved successfully",
      data: result,
    });
  }
);

const getStudentCredentials = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await studentService.getStudentCredentials(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Student credentials retrieved successfully",
      data: result,
    });
  }
);

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
  getStudentCredentials,
};
