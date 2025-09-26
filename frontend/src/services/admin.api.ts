import { api, ApiResponse } from "./api-base";

// Admin API service
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get<ApiResponse>("/admin/dashboard"),
  getSchool: (id: string) => api.get<ApiResponse>(`/admin/school/${id}`),

  // Subject management (matches backend schema)
  createSubject: (data: {
    name: string;
    code: string;
    description?: string;
    grades: number[];
    isCore: boolean;
    credits?: number;
  }) => api.post<ApiResponse>("/subjects", data),

  getSubjects: (params?: {
    grade?: string;
    isCore?: boolean;
    search?: string;
  }) => api.get<ApiResponse>("/subjects", { params }),

  updateSubject: (
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      grades?: number[];
      isCore?: boolean;
      credits?: number;
    }
  ) => api.put<ApiResponse>(`/subjects/${id}`, data),

  deleteSubject: (id: string) => api.delete<ApiResponse>(`/subjects/${id}`),

  getSubjectsByGrade: (schoolId: string, grade: string) =>
    api.get<ApiResponse>(`/subjects/school/${schoolId}/grade/${grade}`),

  // Schedule management (matches backend validation schema)
  createSchedule: (data: {
    schoolId: string;
    dayOfWeek: string;
    grade: number;
    section: string;
    academicYear: string;
    periods: Array<{
      periodNumber: number;
      subjectId?: string;
      teacherId?: string;
      roomNumber?: string;
      startTime: string;
      endTime: string;
      isBreak?: boolean;
      breakType?: "short" | "lunch" | "long";
      breakDuration?: number;
    }>;
  }) => api.post<ApiResponse>("/schedules", data),

  getSchedules: (params?: {
    dayOfWeek?: string;
    grade?: string;
    section?: string;
    academicYear?: string;
  }) => api.get<ApiResponse>("/schedules", { params }),

  updateSchedule: (
    id: string,
    data: {
      schoolId?: string;
      dayOfWeek?: string;
      grade?: number;
      section?: string;
      academicYear?: string;
      periods?: Array<{
        periodNumber: number;
        subjectId?: string;
        teacherId?: string;
        roomNumber?: string;
        startTime: string;
        endTime: string;
        isBreak?: boolean;
        breakType?: "short" | "lunch" | "long";
        breakDuration?: number;
      }>;
    }
  ) => api.put<ApiResponse>(`/schedules/${id}`, data),

  deleteSchedule: (id: string) => api.delete<ApiResponse>(`/schedules/${id}`),

  // Academic Calendar management (matches backend routes)
  createCalendarEvent: (data: {
    title: string;
    description?: string;
    type: "exam" | "holiday" | "event" | "meeting" | "activity";
    startDate: string;
    endDate: string;
    isAllDay: boolean;
    startTime?: string;
    endTime?: string;
    venue?: string;
    targetAudience: "all" | "specific";
    priority: "low" | "medium" | "high";
    color: string;
  }) => api.post<ApiResponse>("/calendar", data),

  getCalendarEvents: (params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    targetAudience?: string;
  }) => api.get<ApiResponse>("/calendar", { params }),

  updateCalendarEvent: (
    id: string,
    data: {
      title?: string;
      description?: string;
      type?: "exam" | "holiday" | "event" | "meeting" | "activity";
      startDate?: string;
      endDate?: string;
      isAllDay?: boolean;
      startTime?: string;
      endTime?: string;
      venue?: string;
      targetAudience?: "all" | "specific";
      priority?: "low" | "medium" | "high";
      color?: string;
    }
  ) => api.put<ApiResponse>(`/calendar/${id}`, data),

  deleteCalendarEvent: (id: string) =>
    api.delete<ApiResponse>(`/calendar/${id}`),

  // Teacher management (needed by schedule component)
  getTeachers: (params?: {
    grade?: string;
    subject?: string;
    search?: string;
    isActive?: boolean;
  }) => api.get<ApiResponse>("/teachers", { params }),

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
