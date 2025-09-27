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

// Teacher Dashboard Controllers (for logged-in teachers)
const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const teacherUser = (req as any).user;
  
  if (!teacherUser || teacherUser.role !== 'teacher') {
    throw new AppError(httpStatus.UNAUTHORIZED, "Teacher access required");
  }

  // Get teacher data and dashboard statistics
  const dashboardData = await teacherService.getTeacherDashboard(teacherUser.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher dashboard data retrieved successfully",
    data: dashboardData,
  });
});

const getMySchedule = catchAsync(async (req: Request, res: Response) => {
  const teacherUser = (req as any).user;
  
  if (!teacherUser || teacherUser.role !== 'teacher') {
    throw new AppError(httpStatus.UNAUTHORIZED, "Teacher access required");
  }

  const schedule = await teacherService.getTeacherSchedule(teacherUser.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher schedule retrieved successfully",
    data: schedule,
  });
});

const getMyClasses = catchAsync(async (req: Request, res: Response) => {
  const teacherUser = (req as any).user;
  
  if (!teacherUser || teacherUser.role !== 'teacher') {
    throw new AppError(httpStatus.UNAUTHORIZED, "Teacher access required");
  }

  const classes = await teacherService.getTeacherClasses(teacherUser.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher classes retrieved successfully",
    data: classes,
  });
});

const getCurrentPeriods = catchAsync(async (req: Request, res: Response) => {
  const teacherUser = (req as any).user;
  
  if (!teacherUser || teacherUser.role !== 'teacher') {
    throw new AppError(httpStatus.UNAUTHORIZED, "Teacher access required");
  }

  const periods = await teacherService.getCurrentPeriods(teacherUser.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Current periods retrieved successfully",
    data: periods,
  });
});

const markAttendance = catchAsync(async (req: Request, res: Response) => {
  const teacherUser = (req as any).user;
  const attendanceData = req.body;
  
  if (!teacherUser || teacherUser.role !== 'teacher') {
    throw new AppError(httpStatus.UNAUTHORIZED, "Teacher access required");
  }

  const result = await teacherService.markAttendance(teacherUser.id, attendanceData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Attendance marked successfully",
    data: result,
  });
});

const getStudentsForAttendance = catchAsync(async (req: Request, res: Response) => {
  const teacherUser = (req as any).user;
  const { gradeId, sectionId, subjectId } = req.params;
  
  if (!teacherUser || teacherUser.role !== 'teacher') {
    throw new AppError(httpStatus.UNAUTHORIZED, "Teacher access required");
  }

  const students = await teacherService.getStudentsForAttendance(
    teacherUser.id,
    gradeId,
    sectionId,
    subjectId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Students retrieved successfully",
    data: students,
  });
});

const assignHomework = catchAsync(async (req: Request, res: Response) => {
  const teacherUser = (req as any).user;
  const homeworkData = req.body;
  
  if (!teacherUser || teacherUser.role !== 'teacher') {
    throw new AppError(httpStatus.UNAUTHORIZED, "Teacher access required");
  }

  const result = await teacherService.assignHomework(teacherUser.id, homeworkData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Homework assigned successfully",
    data: result,
  });
});

const getMyHomeworkAssignments = catchAsync(async (req: Request, res: Response) => {
  const teacherUser = (req as any).user;
  
  if (!teacherUser || teacherUser.role !== 'teacher') {
    throw new AppError(httpStatus.UNAUTHORIZED, "Teacher access required");
  }

  const assignments = await teacherService.getMyHomeworkAssignments(teacherUser.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Homework assignments retrieved successfully",
    data: assignments,
  });
});

const issueWarning = catchAsync(async (req: Request, res: Response) => {
  const teacherUser = (req as any).user;
  const warningData = req.body;
  
  if (!teacherUser || teacherUser.role !== 'teacher') {
    throw new AppError(httpStatus.UNAUTHORIZED, "Teacher access required");
  }

  const result = await teacherService.issueWarning(teacherUser.id, warningData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Warning issued successfully",
    data: result,
  });
});

const getMyGradingTasks = catchAsync(async (req: Request, res: Response) => {
  const teacherUser = (req as any).user;
  
  if (!teacherUser || teacherUser.role !== 'teacher') {
    throw new AppError(httpStatus.UNAUTHORIZED, "Teacher access required");
  }

  const gradingTasks = await teacherService.getMyGradingTasks(teacherUser.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Grading tasks retrieved successfully",
    data: gradingTasks,
  });
});

const submitGrades = catchAsync(async (req: Request, res: Response) => {
  const teacherUser = (req as any).user;
  const gradesData = req.body;
  
  if (!teacherUser || teacherUser.role !== 'teacher') {
    throw new AppError(httpStatus.UNAUTHORIZED, "Teacher access required");
  }

  const result = await teacherService.submitGrades(teacherUser.id, gradesData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Grades submitted successfully",
    data: result,
  });
});

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
  // Teacher Dashboard Methods
  getDashboard,
  getMySchedule,
  getMyClasses,
  getCurrentPeriods,
  markAttendance,
  getStudentsForAttendance,
  assignHomework,
  getMyHomeworkAssignments,
  issueWarning,
  getMyGradingTasks,
  submitGrades,
};
