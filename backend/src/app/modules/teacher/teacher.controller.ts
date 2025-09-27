import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AppError } from "../../errors/AppError";
import { teacherService } from "./teacher.service";
import {
  ICreateTeacherRequest,
  IUpdateTeacherRequest,
} from "./teacher.interface";
import { TeacherCredentialsService } from "./teacher.credentials.service";

const createTeacher = catchAsync(async (req: Request, res: Response) => {
  const teacherData: ICreateTeacherRequest = req.body;
  
  // Get admin user from auth middleware
  const adminUser = (req as any).user;
  if (!adminUser?.id) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Admin user not found");
  }
  
  // Use MongoDB ObjectId for schoolId filtering
  const teacherDataWithSchoolId = {
    ...teacherData,
    schoolId: adminUser.schoolId, // This is already a MongoDB ObjectId
  };
  
  const files = req.files as Express.Multer.File[];

  const result = await teacherService.createTeacher(teacherDataWithSchoolId, files);
  
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Teacher created successfully",
    data: result,
  });
});

const getAllTeachers = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query as any;
  
  // Get admin user from auth middleware
  const adminUser = (req as any).user;
  if (!adminUser?.schoolId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Admin user or school ID not found");
  }
  
  // Use MongoDB ObjectId for schoolId filtering and set defaults
  const filtersWithSchoolId = {
    page: Number(filters.page) || 1,
    limit: Number(filters.limit) || 20,
    sortBy: filters.sortBy || 'createdAt',
    sortOrder: filters.sortOrder || 'desc',
    ...filters,
    schoolId: adminUser.schoolId, // This is already a MongoDB ObjectId
  };
  
  const result = await teacherService.getTeachers(filtersWithSchoolId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teachers retrieved successfully",
    meta: {
      page: result.currentPage,
      limit: Number(filters.limit) || 20,
      total: result.totalCount,
    },
    data: result.teachers,
  });
});

const getTeacherById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await teacherService.getTeacherById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher retrieved successfully",
    data: result,
  });
});

const updateTeacher = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: IUpdateTeacherRequest = req.body;
  const result = await teacherService.updateTeacher(id, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher updated successfully",
    data: result,
  });
});

const deleteTeacher = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await teacherService.deleteTeacher(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher deleted successfully",
    data: null,
  });
});

const getTeachersBySubject = catchAsync(async (req: Request, res: Response) => {
  const { schoolId, subject } = req.params;
  const result = await teacherService.getTeachersBySubject(schoolId, subject);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teachers retrieved successfully",
    data: result,
  });
});

const getTeacherStats = catchAsync(async (req: Request, res: Response) => {
  const { schoolId } = req.params;
  const result = await teacherService.getTeacherStats(schoolId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher statistics retrieved successfully",
    data: result,
  });
});

const uploadTeacherPhotos = catchAsync(async (req: Request, res: Response) => {
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

  const result = await teacherService.uploadPhotos(id, files);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher photos uploaded successfully",
    data: result,
  });
});

const deleteTeacherPhoto = catchAsync(async (req: Request, res: Response) => {
  const { teacherId, photoId } = req.params;
  await teacherService.deletePhoto(teacherId, photoId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher photo deleted successfully",
    data: null,
  });
});

const getTeacherPhotos = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await teacherService.getTeacherPhotos(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher photos retrieved successfully",
    data: result,
  });
});

const getAvailablePhotoSlots = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await teacherService.getAvailablePhotoSlots(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Available photo slots retrieved successfully",
      data: result,
    });
  }
);

const getTeacherCredentials = catchAsync(
  async (req: Request, res: Response) => {
    const { teacherId } = req.params;
    const adminUser = (req as any).user;

    // Verify admin permissions
    if (!adminUser || !["admin", "superadmin"].includes(adminUser.role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Only admin and superadmin can view teacher credentials"
      );
    }

    const result = await TeacherCredentialsService.getTeacherCredentials(teacherId);
    
    if (!result) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Teacher credentials not found"
      );
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Teacher credentials retrieved successfully",
      data: result,
    });
  }
);

const resetTeacherPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { teacherId } = req.params;
    const adminUser = (req as any).user;

    // Verify admin permissions
    if (!adminUser || !["admin", "superadmin"].includes(adminUser.role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Only admin and superadmin can reset teacher passwords"
      );
    }

    const result = await TeacherCredentialsService.resetTeacherPassword(teacherId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Teacher password reset successfully",
      data: result,
    });
  }
);

export const TeacherController = {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getTeachersBySubject,
  getTeacherStats,
  uploadTeacherPhotos,
  deleteTeacherPhoto,
  getTeacherPhotos,
  getAvailablePhotoSlots,
  getTeacherCredentials,
  resetTeacherPassword,
};
