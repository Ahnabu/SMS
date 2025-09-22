import { api, ApiResponse } from "./api-base";

// Admin API service
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get<ApiResponse>("/admin/dashboard"),
  getSchool: (id: string) => api.get<ApiResponse>(`/admin/school/${id}`),

  // Subject management
  createSubject: (data: {
    name: string;
    code: string;
    description?: string;
    credits?: number;
    grades: number[];
  }) => api.post<ApiResponse>("/admin/subjects", data),

  getSubjects: (params?: { grade?: number; search?: string }) =>
    api.get<ApiResponse>("/admin/subjects", { params }),

  updateSubject: (
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      credits?: number;
      grades?: number[];
    }
  ) => api.put<ApiResponse>(`/admin/subjects/${id}`, data),

  deleteSubject: (id: string) =>
    api.delete<ApiResponse>(`/admin/subjects/${id}`),

  // Schedule management
  createSchedule: (data: {
    classId: string;
    subjectId: string;
    teacherId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room?: string;
  }) => api.post<ApiResponse>("/admin/schedules", data),

  getSchedules: (params?: {
    classId?: string;
    teacherId?: string;
    dayOfWeek?: number;
  }) => api.get<ApiResponse>("/admin/schedules", { params }),

  updateSchedule: (
    id: string,
    data: {
      subjectId?: string;
      teacherId?: string;
      dayOfWeek?: number;
      startTime?: string;
      endTime?: string;
      room?: string;
    }
  ) => api.put<ApiResponse>(`/admin/schedules/${id}`, data),

  deleteSchedule: (id: string) =>
    api.delete<ApiResponse>(`/admin/schedules/${id}`),

  // Calendar management
  createCalendarEvent: (data: {
    title: string;
    description?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    type: "exam" | "holiday" | "event" | "meeting";
    targetAudience: "all" | "students" | "teachers" | "parents";
  }) => api.post<ApiResponse>("/admin/calendar", data),

  getCalendarEvents: (params?: {
    month?: number;
    year?: number;
    type?: string;
  }) => api.get<ApiResponse>("/admin/calendar", { params }),

  updateCalendarEvent: (
    id: string,
    data: {
      title?: string;
      description?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      type?: string;
      targetAudience?: string;
    }
  ) => api.put<ApiResponse>(`/admin/calendar/${id}`, data),

  deleteCalendarEvent: (id: string) =>
    api.delete<ApiResponse>(`/admin/calendar/${id}`),

  // Class management
  createClass: (data: {
    grade: number;
    section: string;
    classTeacherId?: string;
    maxStudents?: number;
  }) => api.post<ApiResponse>("/admin/classes", data),

  getClasses: () => api.get<ApiResponse>("/admin/classes"),

  updateClass: (
    id: string,
    data: {
      classTeacherId?: string;
      maxStudents?: number;
      isActive?: boolean;
    }
  ) => api.put<ApiResponse>(`/admin/classes/${id}`, data),

  deleteClass: (id: string) => api.delete<ApiResponse>(`/admin/classes/${id}`),

  // Reports and analytics
  getStudentStats: () => api.get<ApiResponse>("/admin/stats/students"),
  getTeacherStats: () => api.get<ApiResponse>("/admin/stats/teachers"),
  getAttendanceReport: (params?: {
    classId?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get<ApiResponse>("/admin/reports/attendance", { params }),

  getGradeReport: (params?: {
    classId?: string;
    subjectId?: string;
    examType?: string;
  }) => api.get<ApiResponse>("/admin/reports/grades", { params }),
};
