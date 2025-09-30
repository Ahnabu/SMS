import { api, ApiResponse } from "./api-base";

// Parent API service
export const parentApi = {
  // Dashboard
  getDashboard: () => api.get<ApiResponse>("/parent/dashboard"),

  // Children management
  getChildren: () => api.get<ApiResponse>("/parent/children"),

  getChildProfile: (childId: string) =>
    api.get<ApiResponse>(`/parent/children/${childId}`),

  // Child attendance
  getChildAttendance: (
    childId: string,
    params?: {
      month?: number;
      year?: number;
      startDate?: string;
      endDate?: string;
    }
  ) =>
    api.get<ApiResponse>(`/parent/children/${childId}/attendance`, { params }),

  // Child grades
  getChildGrades: (
    childId: string,
    params?: {
      subject?: string;
      examType?: string;
      term?: string;
    }
  ) => api.get<ApiResponse>(`/parent/children/${childId}/grades`, { params }),

  // Child homework
  getChildHomework: (
    childId: string,
    params?: {
      status?: "pending" | "completed" | "overdue";
      subject?: string;
      dueDate?: string;
    }
  ) => api.get<ApiResponse>(`/parent/children/${childId}/homework`, { params }),

  // Child schedule
  getChildSchedule: (
    childId: string,
    params?: {
      dayOfWeek?: number;
      date?: string;
    }
  ) => api.get<ApiResponse>(`/parent/children/${childId}/schedule`, { params }),

  // Child disciplinary actions (red warrants only)
  getChildDisciplinaryActions: () => api.get<ApiResponse>("/parents/disciplinary/actions"),

  // Notices and announcements
  getChildNotices: (
    childId: string,
    params?: {
      type?: "announcement" | "notice" | "alert";
      status?: "read" | "unread";
    }
  ) => api.get<ApiResponse>(`/parent/children/${childId}/notices`, { params }),

  markNoticeAsRead: (noticeId: string) =>
    api.put<ApiResponse>(`/parent/notices/${noticeId}/read`),

  // Fees and payments
  getChildFees: (
    childId: string,
    params?: {
      term?: string;
      status?: "paid" | "pending" | "overdue";
    }
  ) => api.get<ApiResponse>(`/parent/children/${childId}/fees`, { params }),

  // Communication
  sendMessage: (data: {
    recipientType: "teacher" | "admin" | "principal";
    recipientId?: string;
    subject: string;
    message: string;
    childId?: string;
  }) => api.post<ApiResponse>("/parent/messages", data),

  getMessages: (params?: {
    type?: "sent" | "received";
    status?: "read" | "unread";
  }) => api.get<ApiResponse>("/parent/messages", { params }),

  markMessageAsRead: (messageId: string) =>
    api.put<ApiResponse>(`/parent/messages/${messageId}/read`),

  // Parent meetings
  getParentMeetings: (params?: {
    status?: "scheduled" | "completed" | "cancelled";
    childId?: string;
  }) => api.get<ApiResponse>("/parent/meetings", { params }),

  requestMeeting: (data: {
    teacherId: string;
    childId: string;
    preferredDate: string;
    preferredTime: string;
    purpose: string;
    message?: string;
  }) => api.post<ApiResponse>("/parent/meetings/request", data),

  // Emergency contacts
  updateEmergencyContacts: (data: {
    primary: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
    };
    secondary?: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
    };
  }) => api.put<ApiResponse>("/parent/emergency-contacts", data),

  // Profile management
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    occupation?: string;
  }) => api.put<ApiResponse>("/parent/profile", data),

  // Reports
  getChildProgressReport: (
    childId: string,
    params?: {
      term?: string;
      year?: number;
    }
  ) =>
    api.get<ApiResponse>(`/parent/children/${childId}/progress-report`, {
      params,
    }),

  downloadChildReportCard: (childId: string, termId: string) =>
    api.get(`/parent/children/${childId}/report-card/${termId}`, {
      responseType: "blob",
    }),
};
