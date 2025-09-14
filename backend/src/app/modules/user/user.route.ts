import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  requireSuperadmin,
  requireAdmin,
  requireStaff,
  auth
} from '../../middlewares/auth';
import {
  createUserValidationSchema,
  updateUserValidationSchema,
  getUserValidationSchema,
  deleteUserValidationSchema,
  getUsersValidationSchema,
  changePasswordValidationSchema,
  resetPasswordValidationSchema,
  loginValidationSchema,
} from './user.validation';
import {
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
} from './user.controller';

const router = express.Router();

// Public authentication routes
router.post(
  '/auth/login',
  validateRequest(loginValidationSchema),
  login
);

router.post(
  '/auth/logout',
  logout
);

// Protected routes requiring authentication
router.get(
  '/me',
  auth(), // Any authenticated user can access their own profile
  getCurrentUser
);

router.put(
  '/:id/change-password',
  auth(), // Users can change their own password
  validateRequest(changePasswordValidationSchema),
  changePassword
);

// School-specific user routes
router.get(
  '/school/:schoolId',
  requireStaff,
  getUsersBySchool
);

router.get(
  '/role/:role',
  requireAdmin,
  getUsersByRole
);

// Admin and Superadmin routes
router.post(
  '/',
  requireAdmin,
  validateRequest(createUserValidationSchema),
  createUser
);

router.get(
  '/',
  requireAdmin,
  validateRequest(getUsersValidationSchema),
  getUsers
);

router.get(
  '/:id',
  requireStaff,
  validateRequest(getUserValidationSchema),
  getUserById
);

router.put(
  '/:id',
  requireAdmin,
  validateRequest(updateUserValidationSchema),
  updateUser
);

router.delete(
  '/:id',
  requireAdmin,
  validateRequest(deleteUserValidationSchema),
  deleteUser
);

// Password reset (admin only)
router.put(
  '/:id/reset-password',
  requireAdmin,
  validateRequest(resetPasswordValidationSchema),
  resetPassword
);

export const userRoutes = router;