import { z } from 'zod';

const settingsValidationSchema = z.object({
  maxStudentsPerSection: z
    .number()
    .min(10, 'Maximum students per section must be at least 10')
    .max(60, 'Maximum students per section cannot exceed 60')
    .optional(),
  grades: z
    .array(z.number().min(1).max(12))
    .min(1, 'At least one grade must be specified')
    .optional(),
  sections: z
    .array(z.string().regex(/^[A-Z]$/, 'Sections must be uppercase letters'))
    .min(1, 'At least one section must be specified')
    .optional(),
  academicYearStart: z
    .number()
    .min(1, 'Academic year start month must be between 1 and 12')
    .max(12, 'Academic year start month must be between 1 and 12')
    .optional(),
  academicYearEnd: z
    .number()
    .min(1, 'Academic year end month must be between 1 and 12')
    .max(12, 'Academic year end month must be between 1 and 12')
    .optional(),
  attendanceGracePeriod: z
    .number()
    .min(0, 'Attendance grace period cannot be negative')
    .max(60, 'Attendance grace period cannot exceed 60 minutes')
    .optional(),
});

const createSchoolValidationSchema = z.object({
  body: z.object({
    orgId: z
      .string({
        required_error: 'Organization ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid organization ID format'),
    name: z
      .string({
        required_error: 'School name is required',
      })
      .min(2, 'School name must be at least 2 characters')
      .max(100, 'School name cannot exceed 100 characters')
      .trim(),
    address: z
      .string()
      .max(200, 'Address cannot exceed 200 characters')
      .trim()
      .optional(),
    phone: z
      .string()
      .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
      .optional(),
    email: z
      .string()
      .email('Invalid email format')
      .toLowerCase()
      .optional(),
    settings: settingsValidationSchema.optional(),
  }),
});

const updateSchoolValidationSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'School ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID format'),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'School name must be at least 2 characters')
      .max(100, 'School name cannot exceed 100 characters')
      .trim()
      .optional(),
    address: z
      .string()
      .max(200, 'Address cannot exceed 200 characters')
      .trim()
      .optional(),
    phone: z
      .string()
      .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
      .optional(),
    email: z
      .string()
      .email('Invalid email format')
      .toLowerCase()
      .optional(),
    status: z
      .enum(['active', 'inactive', 'suspended'], {
        errorMap: () => ({ message: 'Status must be active, inactive, or suspended' }),
      })
      .optional(),
    settings: settingsValidationSchema.optional(),
  }),
});

const getSchoolValidationSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'School ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID format'),
  }),
});

const deleteSchoolValidationSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'School ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID format'),
  }),
});

const getSchoolsValidationSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a positive number')
      .transform((val) => parseInt(val))
      .refine((val) => val > 0, 'Page must be greater than 0')
      .optional()
      .default('1'),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a positive number')
      .transform((val) => parseInt(val))
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .optional()
      .default('20'),
    orgId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid organization ID format')
      .optional(),
    status: z
      .enum(['active', 'inactive', 'suspended', 'all'], {
        errorMap: () => ({ message: 'Status must be active, inactive, suspended, or all' }),
      })
      .optional(),
    search: z
      .string()
      .min(1, 'Search term must be at least 1 character')
      .max(50, 'Search term cannot exceed 50 characters')
      .optional(),
    sortBy: z
      .enum(['name', 'createdAt', 'updatedAt'], {
        errorMap: () => ({ message: 'Sort by must be name, createdAt, or updatedAt' }),
      })
      .optional()
      .default('name'),
    sortOrder: z
      .enum(['asc', 'desc'], {
        errorMap: () => ({ message: 'Sort order must be asc or desc' }),
      })
      .optional()
      .default('asc'),
  }),
});

const resetAdminPasswordValidationSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'School ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID format'),
  }),
  body: z.object({
    newPassword: z
      .string({
        required_error: 'New password is required',
      })
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password cannot exceed 50 characters'),
  }),
});

export {
  createSchoolValidationSchema,
  updateSchoolValidationSchema,
  getSchoolValidationSchema,
  deleteSchoolValidationSchema,
  getSchoolsValidationSchema,
  resetAdminPasswordValidationSchema,
};