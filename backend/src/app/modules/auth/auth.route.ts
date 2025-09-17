import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  loginValidationSchema,
} from '../user/user.validation';
import {
  login,
  logout,
} from '../user/user.controller';

const router = express.Router();

// Authentication routes
router.post(
  '/login',
  validateRequest(loginValidationSchema),
  login
);

router.post(
  '/logout',
  logout
);

export const authRoutes = router;