import axios from 'axios';

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API service methods
export const apiService = {
  // Authentication
  login: (username: string, password: string) =>
    api.post<ApiResponse>('/auth/login', { username, password }),

  logout: () =>
    api.post<ApiResponse>('/auth/logout'),

  verify: () =>
    api.get<ApiResponse>('/auth/verify'),

  // Superadmin routes
  superadmin: {
    getStats: () => api.get<ApiResponse>('/superadmin/stats'),
    getSystemStats: () => api.get<ApiResponse>('/superadmin/system/stats'),
    
    // School management
    createSchool: (data: any) => api.post<ApiResponse>('/superadmin/schools', data),
    getSchools: (params?: any) => api.get<ApiResponse>('/superadmin/schools', { params }),
    getSchool: (id: string) => api.get<ApiResponse>(`/superadmin/schools/${id}`),
    updateSchool: (id: string, data: any) => api.put<ApiResponse>(`/superadmin/schools/${id}`, data),
    deleteSchool: (id: string) => api.delete<ApiResponse>(`/superadmin/schools/${id}`),
    updateSchoolStatus: (id: string, status: string) => api.put<ApiResponse>(`/superadmin/schools/${id}/status`, { status }),
    
    // School statistics and monitoring
    getSchoolStats: (id: string) => api.get<ApiResponse>(`/superadmin/schools/${id}/stats`),
    
    // Admin management
    assignAdmin: (schoolId: string, adminData: any) => api.post<ApiResponse>(`/superadmin/schools/${schoolId}/admin`, adminData),
    resetPassword: (id: string, data: any) => api.put<ApiResponse>(`/superadmin/schools/${id}/reset-password`, data),
    
    // API management
    regenerateApiKey: (schoolId: string) => api.post<ApiResponse>(`/superadmin/schools/${schoolId}/regenerate-api-key`),
    
    // System settings
    getSystemSettings: () => api.get<ApiResponse>('/superadmin/system/settings'),
    updateSystemSettings: (settings: any) => api.put<ApiResponse>('/superadmin/system/settings', settings),
    
    // Additional methods for better compatibility
    getAllSchools: (params?: any) => api.get<ApiResponse>('/superadmin/schools', { params }),
    assignSchoolAdmin: (schoolId: string, adminData: any) => api.post<ApiResponse>(`/superadmin/schools/${schoolId}/admin`, adminData),
  },

  // Admin routes
  admin: {
    getDashboard: () => api.get<ApiResponse>('/admin/dashboard'),
    createStudent: (data: any) => api.post<ApiResponse>('/admin/students', data),
    getStudents: (params?: any) => api.get<ApiResponse>('/admin/students', { params }),
    updateStudent: (id: string, data: any) => api.put<ApiResponse>(`/admin/students/${id}`, data),
    deleteStudent: (id: string) => api.delete<ApiResponse>(`/admin/students/${id}`),
    createTeacher: (data: any) => api.post<ApiResponse>('/admin/teachers', data),
    getTeachers: (params?: any) => api.get<ApiResponse>('/admin/teachers', { params }),
    updateTeacher: (id: string, data: any) => api.put<ApiResponse>(`/admin/teachers/${id}`, data),
    deleteTeacher: (id: string) => api.delete<ApiResponse>(`/admin/teachers/${id}`),
    createSubject: (data: any) => api.post<ApiResponse>('/admin/subjects', data),
    getSubjects: () => api.get<ApiResponse>('/admin/subjects'),
    updateSubject: (id: string, data: any) => api.put<ApiResponse>(`/admin/subjects/${id}`, data),
    deleteSubject: (id: string) => api.delete<ApiResponse>(`/admin/subjects/${id}`),
    createSchedule: (data: any) => api.post<ApiResponse>('/admin/schedules', data),
    getSchedules: () => api.get<ApiResponse>('/admin/schedules'),
    updateSchedule: (id: string, data: any) => api.put<ApiResponse>(`/admin/schedules/${id}`, data),
    deleteSchedule: (id: string) => api.delete<ApiResponse>(`/admin/schedules/${id}`),
    createCalendarEvent: (data: any) => api.post<ApiResponse>('/admin/calendar', data),
    getCalendarEvents: () => api.get<ApiResponse>('/admin/calendar'),
    updateCalendarEvent: (id: string, data: any) => api.put<ApiResponse>(`/admin/calendar/${id}`, data),
    deleteCalendarEvent: (id: string) => api.delete<ApiResponse>(`/admin/calendar/${id}`),
  },

  // Teacher routes
  teacher: {
    getDashboard: () => api.get<ApiResponse>('/teacher/dashboard'),
    getClasses: () => api.get<ApiResponse>('/teacher/classes'),
    getAttendance: (classId: string) => api.get<ApiResponse>(`/teacher/attendance/class/${classId}`),
    markAttendance: (data: any) => api.post<ApiResponse>('/teacher/attendance', data),
    updateAttendance: (id: string, data: any) => api.put<ApiResponse>(`/teacher/attendance/${id}`, data),
    getSchedule: () => api.get<ApiResponse>('/teacher/schedule'),
    createHomework: (data: any) => api.post<ApiResponse>('/teacher/homework', data),
    getHomework: () => api.get<ApiResponse>('/teacher/homework'),
    createGrade: (data: any) => api.post<ApiResponse>('/teacher/grades', data),
    getGrades: () => api.get<ApiResponse>('/teacher/grades'),
  },

  // Student routes
  student: {
    getDashboard: () => api.get<ApiResponse>('/student/dashboard'),
    getAttendance: () => api.get<ApiResponse>('/student/attendance'),
    getGrades: () => api.get<ApiResponse>('/student/grades'),
    getHomework: () => api.get<ApiResponse>('/student/homework'),
    getSchedule: () => api.get<ApiResponse>('/student/schedule'),
    getCalendar: () => api.get<ApiResponse>('/student/calendar'),
  },

  // Parent routes
  parent: {
    getDashboard: () => api.get<ApiResponse>('/parent/dashboard'),
    getChildren: () => api.get<ApiResponse>('/parent/children'),
    getChildAttendance: (id: string) => api.get<ApiResponse>(`/parent/child/${id}/attendance`),
    getChildGrades: (id: string) => api.get<ApiResponse>(`/parent/child/${id}/grades`),
    getChildHomework: (id: string) => api.get<ApiResponse>(`/parent/child/${id}/homework`),
    getChildNotices: (id: string) => api.get<ApiResponse>(`/parent/child/${id}/notices`),
  },

  // Accountant routes
  accountant: {
    getDashboard: () => api.get<ApiResponse>('/accountant/dashboard'),
    getTransactions: () => api.get<ApiResponse>('/accountant/transactions'),
    recordFee: (data: any) => api.post<ApiResponse>('/accountant/fees', data),
    getDefaulters: () => api.get<ApiResponse>('/accountant/defaulters'),
    addFine: (data: any) => api.post<ApiResponse>('/accountant/fine', data),
  },
};

export default api;