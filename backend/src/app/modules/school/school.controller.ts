import httpStatus from "http-status";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { catchAsync } from "../../utils/catchAsync";
import { schoolService } from "./school.service";
import { sendResponse } from "../../utils/sendResponse";
import { AuthenticatedRequest } from "../../middlewares/auth";

const createSchool = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Use the modern school creation method
    const result = await schoolService.createSchoolModern(
      req.body,
      new Types.ObjectId(req.user?.id)
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "School created successfully",
      data: {
        school: result.school,
        adminCredentials: result.credentials,
      },
    });
  }
);

const getAllSchools = catchAsync(async (req: Request, res: Response) => {
  const result = await schoolService.getAllSchools(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Schools retrieved successfully",
    data: result,
  });
});

const getSchool = catchAsync(async (req: Request, res: Response) => {
  const result = await schoolService.getSchoolById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "School retrieved successfully",
    data: result,
  });
});

const updateSchool = catchAsync(async (req: Request, res: Response) => {
  const result = await schoolService.updateSchool(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "School updated successfully",
    data: result,
  });
});

const deleteSchool = catchAsync(async (req: Request, res: Response) => {
  await schoolService.deleteSchool(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "School deleted successfully",
    data: null,
  });
});

const getSchoolStats = catchAsync(async (req: Request, res: Response) => {
  const result = await schoolService.getSchoolStats(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "School statistics retrieved successfully",
    data: result,
  });
});

const assignAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await schoolService.assignAdmin(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin assigned successfully",
    data: result,
  });
});

const updateSchoolStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await schoolService.updateSchoolStatus(
    req.params.id,
    req.body.status,
    req.body.updatedBy || new Types.ObjectId() // Temporary fallback
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "School status updated successfully",
    data: result,
  });
});

const regenerateApiKey = catchAsync(async (req: Request, res: Response) => {
  const result = await schoolService.regenerateApiKey(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "API key regenerated successfully",
    data: result,
  });
});

const getSystemStats = catchAsync(async (req: Request, res: Response) => {
  const result = await schoolService.getSystemStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "System statistics retrieved successfully",
    data: result,
  });
});

const getAdminCredentials = catchAsync(async (req: Request, res: Response) => {
  const result = await schoolService.getAdminCredentials(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin credentials retrieved successfully",
    data: result,
  });
});

const resetAdminPassword = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await schoolService.resetAdminPassword(
      req.params.id,
      req.body.newPassword,
      new Types.ObjectId(req.user?.id)
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin password reset successfully",
      data: result,
    });
  }
);

export {
  createSchool,
  getAllSchools,
  getSchool,
  updateSchool,
  deleteSchool,
  getSchoolStats,
  assignAdmin,
  updateSchoolStatus,
  regenerateApiKey,
  getSystemStats,
  getAdminCredentials,
  resetAdminPassword,
};
