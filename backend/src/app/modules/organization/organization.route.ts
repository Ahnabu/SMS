import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { requireSuperadmin } from '../../middlewares/auth';
import {
  createOrganizationValidationSchema,
  updateOrganizationValidationSchema,
  getOrganizationValidationSchema,
  deleteOrganizationValidationSchema,
  getOrganizationsValidationSchema,
} from './organization.validation';
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getActiveOrganizations,
  getOrganizationStats,
} from './organization.controller';

const router = express.Router();

// Public routes (no authentication required)
router.get(
  '/active',
  getActiveOrganizations
);

// Protected routes (require superadmin access)
router.post(
  '/',
  requireSuperadmin,
  validateRequest(createOrganizationValidationSchema),
  createOrganization
);

router.get(
  '/',
  requireSuperadmin,
  validateRequest(getOrganizationsValidationSchema),
  getOrganizations
);

router.get(
  '/:id',
  requireSuperadmin,
  validateRequest(getOrganizationValidationSchema),
  getOrganizationById
);

router.put(
  '/:id',
  requireSuperadmin,
  validateRequest(updateOrganizationValidationSchema),
  updateOrganization
);

router.delete(
  '/:id',
  requireSuperadmin,
  validateRequest(deleteOrganizationValidationSchema),
  deleteOrganization
);

router.get(
  '/:id/stats',
  requireSuperadmin,
  validateRequest(getOrganizationValidationSchema),
  getOrganizationStats
);

export const organizationRoutes = router;