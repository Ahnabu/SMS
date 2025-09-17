import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { userService } from './user.service';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
});

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getUsers(req.query as any);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Users fetched successfully',
    data: result.users,
    pagination: {
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    },
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'User fetched successfully',
    data: user,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'User deleted successfully',
    data: null,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  await userService.changePassword(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Password changed successfully',
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await userService.resetPassword(req.params.id, req.body.newPassword);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Password reset successfully',
    data: null,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.login(req.body);

  // Set httpOnly cookie for authentication
  res.cookie('token', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: result.tokenExpires,
    path: '/',
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      token: result.accessToken, // Changed from accessToken to token
      tokenExpires: result.tokenExpires,
    },
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  // Clear authentication cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Logout successful',
    data: null,
  });
});

const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req?.user.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Current user fetched successfully',
    data: user,
  });
});

const getUsersBySchool = catchAsync(async (req: Request, res: Response) => {
  const users = await userService.getUsersBySchool(req.params.schoolId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'School users fetched successfully',
    data: users,
  });
});

const getUsersByRole = catchAsync(async (req: Request, res: Response) => {
  const users = await userService.getUsersByRole(req.params.role as any);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Users by role fetched successfully',
    data: users,
  });
});

export {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  resetPassword,
  login,
  logout,
  getCurrentUser,
  getUsersBySchool,
  getUsersByRole,
};