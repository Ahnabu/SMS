import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AppError } from "../../errors/AppError";
import { parentService } from "./parent.service";

const getChildDisciplinaryActions = catchAsync(async (req: Request, res: Response) => {
  const parentUserId = (req as any).user?.id;
  if (!parentUserId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Parent user not found");
  }

  const disciplinaryData = await parentService.getChildDisciplinaryActions(parentUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Child disciplinary actions retrieved successfully",
    data: disciplinaryData,
  });
});

export const ParentController = {
  getChildDisciplinaryActions,
};