import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../modules/user/user.model';
import { AppError } from '../errors/AppError';
import { catchAsync } from '../utils/catchAsync';
import config from '../config';

// Extended Request interface to include user data
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email?: string;
    role: string;
    schoolId?: string;
    isActive: boolean;
  };
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user data to request
 */
export const authenticate = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // 1) Get token from headers
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    try {
      // 2) Verify token
      const decoded = jwt.verify(token, config.jwt_secret as string) as jwt.JwtPayload;

      if (!decoded || !decoded.id) {
        return next(new AppError('Invalid token structure', 401));
      }

      // 3) Check if user still exists
      const user = await User.findById(decoded.id).select('+isActive');
      
      if (!user) {
        return next(new AppError('The user belonging to this token no longer exists', 401));
      }

      // 4) Check if user is active
      if (!user.isActive) {
        return next(new AppError('Your account has been deactivated. Please contact support.', 401));
      }

      // 5) Check if password was changed after token was issued
      if (user.isPasswordChangedAfter && user.isPasswordChangedAfter(decoded.iat)) {
        return next(new AppError('Password was recently changed. Please login again.', 401));
      }

      // 6) Attach user to request object
      req.user = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId?.toString(),
        isActive: user.isActive,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError('Invalid token', 401));
      }
      if (error instanceof jwt.TokenExpiredError) {
        return next(new AppError('Token expired. Please login again.', 401));
      }
      return next(new AppError('Authentication failed', 401));
    }
  }
);

/**
 * Optional Authentication Middleware
 * Like authenticate but doesn't fail if no token provided
 */
export const optionalAuth = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(); // Continue without authentication
    }

    try {
      const decoded = jwt.verify(token, config.jwt_secret as string) as jwt.JwtPayload;

      if (decoded && decoded.id) {
        const user = await User.findById(decoded.id).select('+isActive');
        
        if (user && user.isActive) {
          req.user = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId?.toString(),
            isActive: user.isActive,
          };
        }
      }
    } catch (error) {
      // Silently continue without authentication if token is invalid
    }

    next();
  }
);

/**
 * Role-based Authorization Middleware
 * Restricts access based on user roles
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required to access this resource', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Access denied. Insufficient permissions.', 403));
    }

    next();
  };
};

/**
 * School Isolation Middleware
 * Ensures users can only access data from their own school
 */
export const enforceSchoolIsolation = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Superadmin can access all schools
    if (req.user.role === 'superadmin') {
      return next();
    }

    // All other users must have a schoolId
    if (!req.user.schoolId) {
      return next(new AppError('No school association found for this user', 403));
    }

    // Add schoolId to request for queries to use
    req.body.schoolId = req.user.schoolId;
    req.query.schoolId = req.user.schoolId;

    next();
  }
);

/**
 * Rate Limiting Middleware (Simple implementation)
 */
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export const rateLimitLogin = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = new Date();

    const attempts = loginAttempts.get(clientId);

    if (attempts) {
      // Reset counter if window has passed
      if (now.getTime() - attempts.lastAttempt.getTime() > windowMs) {
        loginAttempts.delete(clientId);
      } else if (attempts.count >= maxAttempts) {
        return next(new AppError(
          `Too many login attempts. Please try again in ${Math.ceil(windowMs / 60000)} minutes.`,
          429
        ));
      }
    }

    next();
  };
};

/**
 * Update login attempts counter
 */
export const updateLoginAttempts = (req: Request, success: boolean) => {
  const clientId = req.ip || req.connection.remoteAddress || 'unknown';
  const now = new Date();

  if (success) {
    // Clear attempts on successful login
    loginAttempts.delete(clientId);
  } else {
    // Increment failed attempts
    const attempts = loginAttempts.get(clientId);
    if (attempts) {
      attempts.count += 1;
      attempts.lastAttempt = now;
    } else {
      loginAttempts.set(clientId, { count: 1, lastAttempt: now });
    }
  }
};

/**
 * School Admin Authorization
 * Ensures only school admins can access admin resources
 */
export const requireSchoolAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return next(new AppError('Admin access required', 403));
  }

  next();
};

/**
 * Teacher Authorization
 * Ensures only teachers can access teacher resources
 */
export const requireTeacher = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const allowedRoles = ['teacher', 'admin', 'superadmin'];
  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError('Teacher access required', 403));
  }

  next();
};

/**
 * Student Authorization
 * Ensures only students (or their parents/teachers) can access student resources
 */
export const requireStudentAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const allowedRoles = ['student', 'parent', 'teacher', 'admin', 'superadmin'];
  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError('Student access required', 403));
  }

  next();
};

/**
 * Parent Authorization
 * Ensures only parents can access parent resources
 */
export const requireParent = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const allowedRoles = ['parent', 'admin', 'superadmin'];
  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError('Parent access required', 403));
  }

  next();
};

/**
 * Superadmin Authorization
 * Ensures only superadmins can access superadmin resources
 */
export const requireSuperadmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (req.user.role !== 'superadmin') {
    return next(new AppError('Superadmin access required', 403));
  }

  next();
};

/**
 * Validate User Ownership
 * Ensures users can only access their own data (except admins/superadmins)
 */
export const validateOwnership = (userIdField: string = 'userId') => {
  return catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      // Admins and superadmins can access any data
      if (['admin', 'superadmin'].includes(req.user.role)) {
        return next();
      }

      const resourceUserId = req.params[userIdField] || req.body[userIdField];

      if (!resourceUserId) {
        return next(new AppError(`${userIdField} is required`, 400));
      }

      if (resourceUserId !== req.user.id) {
        return next(new AppError('Access denied. You can only access your own data.', 403));
      }

      next();
    }
  );
};

/**
 * API Key Authentication (for external integrations)
 */
export const authenticateApiKey = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return next(new AppError('API key required', 401));
    }

    // In a real application, you'd validate this against a database
    // For now, using a simple environment variable
    if (apiKey !== config.api_key) {
      return next(new AppError('Invalid API key', 401));
    }

    next();
  }
);

// Export all middleware functions
export default {
  authenticate,
  optionalAuth,
  authorize,
  enforceSchoolIsolation,
  rateLimitLogin,
  updateLoginAttempts,
  requireSchoolAdmin,
  requireTeacher,
  requireStudentAccess,
  requireParent,
  requireSuperadmin,
  validateOwnership,
  authenticateApiKey,
};