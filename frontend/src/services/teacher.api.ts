import { api, ApiResponse } from "./api-base";

// Teacher API service
export const teacherApi = {
  // Admin endpoints for teacher management
  create: (data: {
    schoolId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    qualifications?: string[];
    subjects?: string[];
    experience?: number;
    salary?: number;
    joiningDate?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  }) => api.post<ApiResponse>("/admin/teachers", data),

  getAll: (params?: {
    page?: number;
    limit?: number;
    subject?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => api.get<ApiResponse>("/admin/teachers", { params }),

  getById: (id: string) => api.get<ApiResponse>(`/admin/teachers/${id}`),

  update: (
    id: string,
    data: {
      qualifications?: string[];
      subjects?: string[];
      experience?: number;
      salary?: number;
      isActive?: boolean;
    }
  ) => api.put<ApiResponse>(`/admin/teachers/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse>(`/admin/teachers/${id}`),

  // Teacher dashboard endpoints
  getDashboard: () => api.get<ApiResponse>("/teacher/dashboard"),
  getClasses: () => api.get<ApiResponse>("/teacher/classes"),

  // Attendance management
  getAttendance: (classId: string) =>
    api.get<ApiResponse>(`/teacher/attendance/class/${classId}`),
  markAttendance: (data: {
    classId: string;
    date: string;
    students: Array<{
      studentId: string;
      status: "present" | "absent" | "late";
    }>;
  }) => api.post<ApiResponse>("/teacher/attendance", data),
  updateAttendance: (id: string, data: any) =>
    api.put<ApiResponse>(`/teacher/attendance/${id}`, data),

  // Schedule management
  getSchedule: () => api.get<ApiResponse>("/teacher/schedule"),

  // Homework management
  createHomework: (data: {
    classId: string;
    subjectId: string;
    title: string;
    description: string;
    dueDate: string;
    attachments?: File[];
  }) => api.post<ApiResponse>("/teacher/homework", data),
  getHomework: () => api.get<ApiResponse>("/teacher/homework"),

  // Grade management
  createGrade: (data: {
    studentId: string;
    subjectId: string;
    examType: string;
    marks: number;
    totalMarks: number;
    grade: string;
  }) => api.post<ApiResponse>("/teacher/grades", data),
  getGrades: () => api.get<ApiResponse>("/teacher/grades"),

  getStats: () => api.get<ApiResponse>("/admin/teachers/stats"),
};
