import { z } from 'zod';

export const createSubjectValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Subject name is required',
    }).min(2, 'Subject name must be at least 2 characters'),
    code: z.string({
      required_error: 'Subject code is required',
    }).min(2, 'Subject code must be at least 2 characters'),
    description: z.string().optional(),
    grade: z.string({
      required_error: 'Grade is required',
    }),
    isActive: z.boolean().optional().default(true),
  })
});

export const getSubjectsValidationSchema = z.object({
  query: z.object({
    grade: z.string().optional(),
    isActive: z.string().optional(),
    search: z.string().optional(),
  }).optional()
});

export const getSubjectValidationSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Subject ID is required',
    })
  })
});

export const updateSubjectValidationSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Subject ID is required',
    })
  }),
  body: z.object({
    name: z.string().min(2, 'Subject name must be at least 2 characters').optional(),
    code: z.string().min(2, 'Subject code must be at least 2 characters').optional(),
    description: z.string().optional(),
    grade: z.string().optional(),
    isActive: z.boolean().optional(),
  })
});

export const deleteSubjectValidationSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Subject ID is required',
    })
  })
});