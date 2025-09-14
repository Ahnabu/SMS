import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { requireSuperadmin, requireAdmin } from '../../middlewares/auth';
import {
  createSchoolValidationSchema,
  updateSchoolValidationSchema,
  getSchoolValidationSchema,
  deleteSchoolValidationSchema,
  getSchoolsValidationSchema,
  resetAdminPasswordValidationSchema,
} from './school.validation';
import {
  createSchool,
  getSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
  resetAdminPassword,
  getSchoolsByOrganization,
} from './school.controller';

const router = express.Router();

// Organization-specific routes
router.get(
  '/organization/:orgId',
  requireSuperadmin,
  getSchoolsByOrganization
);

// Superadmin-only routes
router.post(
  '/',
  requireSuperadmin,
  validateRequest(createSchoolValidationSchema),
  createSchool
);

router.get(
  '/',
  requireSuperadmin,
  validateRequest(getSchoolsValidationSchema),
  getSchools
);

router.delete(
  '/:id',
  requireSuperadmin,
  validateRequest(deleteSchoolValidationSchema),
  deleteSchool
);

router.put(
  '/:id/reset-password',
  requireSuperadmin,
  validateRequest(resetAdminPasswordValidationSchema),
  resetAdminPassword
);

// Admin and Superadmin routes
router.get(
  '/:id',
  requireAdmin,
  validateRequest(getSchoolValidationSchema),
  getSchoolById
);

router.put(
  '/:id',
  requireAdmin,
  validateRequest(updateSchoolValidationSchema),
  updateSchool
);

export const schoolRoutes = router;