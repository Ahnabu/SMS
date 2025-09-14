import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { schoolService } from './school.service';

const createSchool = catchAsync(async (req: Request, res: Response) => {
  const result = await schoolService.createSchool(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'School created successfully',
    data: {
      school: result.school,
      adminCredentials: result.credentials,
    },
  });
});

const getSchools = catchAsync(async (req: Request, res: Response) => {
  const result = await schoolService.getSchools(req.query as any);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Schools fetched successfully',
    data: result.schools,
    pagination: {
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    },
  });
});

const getSchoolById = catchAsync(async (req: Request, res: Response) => {
  const school = await schoolService.getSchoolById(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'School fetched successfully',
    data: school,
  });
});

const updateSchool = catchAsync(async (req: Request, res: Response) => {
  const school = await schoolService.updateSchool(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'School updated successfully',
    data: school,
  });
});

const deleteSchool = catchAsync(async (req: Request, res: Response) => {
  await schoolService.deleteSchool(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'School deleted successfully',
    data: null,
  });
});

const resetAdminPassword = catchAsync(async (req: Request, res: Response) => {
  await schoolService.resetAdminPassword(req.params.id, req.body.newPassword);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Admin password reset successfully',
    data: null,
  });
});

const getSchoolsByOrganization = catchAsync(async (req: Request, res: Response) => {
  const schools = await schoolService.getSchoolsByOrganization(req.params.orgId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Organization schools fetched successfully',
    data: schools,
  });
});

export {
  createSchool,
  getSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
  resetAdminPassword,
  getSchoolsByOrganization,
};