import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { requireSuperadmin, requireSchoolAdmin } from '../../middlewares/auth';
import {
  createSchoolValidationSchema,
  updateSchoolValidationSchema,
  getSchoolValidationSchema,
  deleteSchoolValidationSchema,
  getSchoolsValidationSchema,
} from './school.validation';
import {
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
} from './school.controller';

const router = express.Router();

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
  getAllSchools
);

router.delete(
  '/:id',
  requireSuperadmin,
  validateRequest(deleteSchoolValidationSchema),
  deleteSchool
);

// Admin and Superadmin routes
router.get(
  '/:id',
  requireSchoolAdmin,
  validateRequest(getSchoolValidationSchema),
  getSchool
);

router.put(
  '/:id',
  requireSchoolAdmin,
  validateRequest(updateSchoolValidationSchema),
  updateSchool
);

// Additional superadmin routes
router.get(
  '/:id/stats',
  requireSuperadmin,
  getSchoolStats
);

router.post(
  '/:id/assign-admin',
  requireSuperadmin,
  assignAdmin
);

router.put(
  '/:id/status',
  requireSuperadmin,
  updateSchoolStatus
);

router.post(
  '/:id/regenerate-api-key',
  requireSuperadmin,
  regenerateApiKey
);

router.get(
  '/system/stats',
  requireSuperadmin,
  getSystemStats
);

export const schoolRoutes = router;