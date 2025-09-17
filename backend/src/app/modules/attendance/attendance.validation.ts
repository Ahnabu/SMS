import { z } from 'zod';

const createAttendanceValidationSchema = z.object({
  body: z.object({
    classId: z
      .string({
        required_error: 'Class ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID format'),
    subjectId: z
      .string({
        required_error: 'Subject ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID format'),
    date: z
      .string({
        required_error: 'Date is required',
      })
      .datetime('Invalid date format')
      .refine((date) => {
        const attendanceDate = new Date(date);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        return attendanceDate <= tomorrow;
      }, 'Cannot mark attendance for dates beyond tomorrow'),
    period: z
      .number({
        required_error: 'Period is required',
      })
      .int('Period must be an integer')
      .min(1, 'Period must be at least 1')
      .max(8, 'Period cannot exceed 8'),
    attendanceData: z
      .array(
        z.object({
          studentId: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID format'),
          status: z.enum(['present', 'absent', 'late', 'excused'], {
            errorMap: () => ({ message: 'Status must be present, absent, late, or excused' }),
          }),
        })
      )
      .min(1, 'At least one student attendance record is required')
      .max(60, 'Cannot mark attendance for more than 60 students at once'),
  }),
});

const updateAttendanceValidationSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'Attendance ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid attendance ID format'),
  }),
  body: z.object({
    status: z
      .enum(['present', 'absent', 'late', 'excused'], {
        errorMap: () => ({ message: 'Status must be present, absent, late, or excused' }),
      })
      .optional(),
    modificationReason: z
      .string()
      .max(200, 'Modification reason cannot exceed 200 characters')
      .optional(),
  }),
});

const getAttendanceValidationSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'Attendance ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid attendance ID format'),
  }),
});

const getClassAttendanceValidationSchema = z.object({
  query: z.object({
    classId: z
      .string({
        required_error: 'Class ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID format'),
    date: z
      .string({
        required_error: 'Date is required',
      })
      .datetime('Invalid date format'),
    period: z
      .string()
      .regex(/^\d+$/, 'Period must be a number')
      .transform((val) => parseInt(val))
      .refine((val) => val >= 1 && val <= 8, 'Period must be between 1 and 8')
      .optional(),
  }),
});

const getStudentAttendanceValidationSchema = z.object({
  params: z.object({
    studentId: z
      .string({
        required_error: 'Student ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID format'),
  }),
  query: z.object({
    startDate: z
      .string({
        required_error: 'Start date is required',
      })
      .datetime('Invalid start date format'),
    endDate: z
      .string({
        required_error: 'End date is required',
      })
      .datetime('Invalid end date format')
      .refine((endDate, ctx) => {
        const start = new Date(ctx.parent.startDate);
        const end = new Date(endDate);
        return end >= start;
      }, 'End date must be after start date'),
    subjectId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID format')
      .optional(),
  }),
});

const getAttendanceStatsValidationSchema = z.object({
  params: z.object({
    schoolId: z
      .string({
        required_error: 'School ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID format'),
  }),
  query: z.object({
    startDate: z
      .string({
        required_error: 'Start date is required',
      })
      .datetime('Invalid start date format'),
    endDate: z
      .string({
        required_error: 'End date is required',
      })
      .datetime('Invalid end date format')
      .refine((endDate, ctx) => {
        const start = new Date(ctx.parent.startDate);
        const end = new Date(endDate);
        const maxDays = 365;
        const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        return end >= start && daysDiff <= maxDays;
      }, 'Date range cannot exceed 365 days and end date must be after start date'),
    grade: z
      .string()
      .regex(/^\d+$/, 'Grade must be a number')
      .transform((val) => parseInt(val))
      .refine((val) => val >= 1 && val <= 12, 'Grade must be between 1 and 12')
      .optional(),
    section: z
      .string()
      .regex(/^[A-Z]$/, 'Section must be a single uppercase letter')
      .optional(),
  }),
});

const markBulkAttendanceValidationSchema = z.object({
  body: z.object({
    classId: z
      .string({
        required_error: 'Class ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID format'),
    subjectId: z
      .string({
        required_error: 'Subject ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID format'),
    date: z
      .string({
        required_error: 'Date is required',
      })
      .datetime('Invalid date format'),
    periods: z
      .array(
        z.object({
          period: z
            .number()
            .int('Period must be an integer')
            .min(1, 'Period must be at least 1')
            .max(8, 'Period cannot exceed 8'),
          attendanceData: z
            .array(
              z.object({
                studentId: z
                  .string()
                  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID format'),
                status: z.enum(['present', 'absent', 'late', 'excused']),
              })
            )
            .min(1, 'At least one student attendance record is required'),
        })
      )
      .min(1, 'At least one period is required')
      .max(8, 'Cannot mark attendance for more than 8 periods'),
  }),
});

const getAttendanceReportValidationSchema = z.object({
  params: z.object({
    schoolId: z
      .string({
        required_error: 'School ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID format'),
  }),
  query: z.object({
    startDate: z
      .string({
        required_error: 'Start date is required',
      })
      .datetime('Invalid start date format'),
    endDate: z
      .string({
        required_error: 'End date is required',
      })
      .datetime('Invalid end date format'),
    grade: z
      .string()
      .regex(/^\d+$/, 'Grade must be a number')
      .transform((val) => parseInt(val))
      .refine((val) => val >= 1 && val <= 12, 'Grade must be between 1 and 12')
      .optional(),
    section: z
      .string()
      .regex(/^[A-Z]$/, 'Section must be a single uppercase letter')
      .optional(),
    studentId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID format')
      .optional(),
    format: z
      .enum(['json', 'csv', 'pdf'], {
        errorMap: () => ({ message: 'Format must be json, csv, or pdf' }),
      })
      .optional()
      .default('json'),
    minAttendance: z
      .string()
      .regex(/^\d+$/, 'Minimum attendance must be a number')
      .transform((val) => parseInt(val))
      .refine((val) => val >= 0 && val <= 100, 'Minimum attendance must be between 0 and 100')
      .optional(),
  }),
});

export {
  createAttendanceValidationSchema,
  updateAttendanceValidationSchema,
  getAttendanceValidationSchema,
  getClassAttendanceValidationSchema,
  getStudentAttendanceValidationSchema,
  getAttendanceStatsValidationSchema,
  markBulkAttendanceValidationSchema,
  getAttendanceReportValidationSchema,
};