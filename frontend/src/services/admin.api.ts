import { api, ApiResponse } from "./api-base";

// Admin API service
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get<ApiResponse>("/admin/dashboard"),

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
  ) => api.patch<ApiResponse>(`/schedules/${id}`, data),

  deleteSchedule: (id: string) => api.delete<ApiResponse>(`/schedules/${id}`),

  // Event management (using new event system)
  createCalendarEvent: (data: {
    title: string;
    description?: string;
    type: "academic" | "extracurricular" | "administrative" | "holiday" | "exam" | "meeting" | "announcement" | "other";
    date: string;
    time?: string;
    location?: string;
    targetAudience: {
      roles: ("admin" | "teacher" | "student" | "parent")[];
      grades?: number[];
      sections?: string[];
    };
    isActive?: boolean;
  }) => api.post<ApiResponse>("/events", data),

  getCalendarEvents: (params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => api.get<ApiResponse>("/events", { params }),

  updateCalendarEvent: (
    id: string,
    data: {
      title?: string;
      description?: string;
      type?: "academic" | "extracurricular" | "administrative" | "holiday" | "exam" | "meeting" | "announcement" | "other";
      date?: string;
      time?: string;
      location?: string;
      targetAudience?: {
        roles?: ("admin" | "teacher" | "student" | "parent")[];
        grades?: number[];
        sections?: string[];
      };
      isActive?: boolean;
    }
  ) => api.put<ApiResponse>(`/events/${id}`, data),

  deleteCalendarEvent: (id: string) =>
    api.delete<ApiResponse>(`/events/${id}`),

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

  // Student management
  createStudent: (data: any) => api.post<ApiResponse>("/students", data),
  getStudents: (params?: {
    page?: number;
    limit?: number;
    grade?: number;
    section?: string;
    search?: string;
  }) => api.get<ApiResponse>("/students", { params }),
  updateStudent: (id: string, data: any) => api.put<ApiResponse>(`/students/${id}`, data),
  deleteStudent: (id: string) => api.delete<ApiResponse>(`/students/${id}`),

  // Teacher management - Enhanced
  createTeacher: (data: any) => api.post<ApiResponse>("/teachers", data),
  updateTeacher: (id: string, data: any) => api.put<ApiResponse>(`/teachers/${id}`, data),
  deleteTeacher: (id: string) => api.delete<ApiResponse>(`/teachers/${id}`),

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

  // Disciplinary Actions (admin-specific endpoints)
  getDisciplinaryActions: (filters?: {
    actionType?: string;
    severity?: string;
    status?: string;
    isRedWarrant?: boolean;
  }) => api.get<ApiResponse>("/admin/disciplinary/actions", { params: filters }),
  
  resolveDisciplinaryAction: (actionId: string, data: { resolutionNotes: string }) =>
    api.patch<ApiResponse>(`/admin/disciplinary/actions/resolve/${actionId}`, data),
  
  addDisciplinaryActionComment: (actionId: string, data: { comment: string }) =>
    api.post<ApiResponse>(`/admin/disciplinary/actions/comment/${actionId}`, data),

  // School Settings management
  getSchoolSettings: () => api.get<ApiResponse>("/admin/school/settings"),
  
  updateSchoolSettings: (data: {
    name?: string;
    establishedYear?: number;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    contact?: {
      phone?: string;
      email?: string;
      website?: string;
    };
    affiliation?: string;
    recognition?: string;
    settings?: {
      maxStudentsPerSection?: number;
      grades?: number[];
      sections?: string[];
      timezone?: string;
      language?: string;
      currency?: string;
      academicYearStart?: number;
      academicYearEnd?: number;
      attendanceGracePeriod?: number;
      maxPeriodsPerDay?: number;
      attendanceLockAfterDays?: number;
      maxAttendanceEditHours?: number;
      sectionCapacity?: {
        [key: string]: {
          maxStudents: number;
          currentStudents: number;
        };
      };
    };
  }) => api.put<ApiResponse>("/admin/school/settings", data),

  updateSectionCapacity: (data: {
    grade: number;
    section: string;
    maxStudents: number;
  }) => api.put<ApiResponse>("/admin/school/section-capacity", data),

  getSectionCapacityReport: () => api.get<ApiResponse>("/admin/school/capacity-report"),

  // Events
  getEvents: () => api.get<ApiResponse>("/admin/events"),
  createEvent: (data: any) => api.post<ApiResponse>("/admin/events", data),
  updateEvent: (id: string, data: any) => api.put<ApiResponse>(`/admin/events/${id}`, data),
  deleteEvent: (id: string) => api.delete<ApiResponse>(`/admin/events/${id}`),
};
