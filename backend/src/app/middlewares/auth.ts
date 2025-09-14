import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status';
import config from '../config';
import { AppError } from '../errors/AppError';
import { catchAsync } from '../utils/catchAsync';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        username: string;
        role: string;
        schoolId: string;
      };
    }
  }
}

interface TokenPayload extends JwtPayload {
  id: string;
  username: string;
  role: string;
  schoolId: string;
}

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '') ||
                  req.cookies.token ||
                  req.header('x-auth-token');

    // Check if token exists
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Access token is required!');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt_secret) as TokenPayload;

      // Check if user role is authorized
      if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `Access denied. Required roles: ${requiredRoles.join(', ')}`
        );
      }

      // Add user to request object
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        schoolId: decoded.schoolId
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
      } else {
        throw error;
      }
    }
  });
};

// School isolation middleware - ensures users can only access their school's data
const schoolIsolation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { schoolId } = req.user;

  // Superadmin can access all schools
  if (req.user.role === 'superadmin') {
    return next();
  }

  // Add schoolId to query parameters and request body for data isolation
  if (req.method === 'GET') {
    req.query.schoolId = schoolId;
  } else if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    req.body.schoolId = schoolId;
  }

  // For URL parameters, validate that schoolId matches
  if (req.params.schoolId && req.params.schoolId !== schoolId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Access denied. You can only access your school data.'
    );
  }

  next();
});

// Role-based middleware functions
const requireSuperadmin = auth('superadmin');
const requireAdmin = auth('admin', 'superadmin');
const requireTeacher = auth('teacher', 'admin', 'superadmin');
const requireStudent = auth('student', 'admin', 'superadmin');
const requireParent = auth('parent', 'admin', 'superadmin');
const requireAccountant = auth('accountant', 'admin', 'superadmin');

// Multiple role access
const requireStaff = auth('teacher', 'admin', 'accountant', 'superadmin');
const requireSchoolAccess = auth('student', 'parent', 'teacher', 'admin', 'accountant');

export {
  auth,
  schoolIsolation,
  requireSuperadmin,
  requireAdmin,
  requireTeacher,
  requireStudent,
  requireParent,
  requireAccountant,
  requireStaff,
  requireSchoolAccess
};