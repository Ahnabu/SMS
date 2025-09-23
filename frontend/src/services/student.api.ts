import { api, ApiResponse } from "./api-base";

// Student API service
export const studentApi = {
  create: (data: {
    schoolId?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    grade: number;
    section: string;
    bloodGroup: string;
    dob: string;
    admissionDate?: string;
    rollNumber?: number;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    parentInfo?: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      occupation?: string;
      relationship?: string;
    };
  }) => api.post<ApiResponse>("/admin/students", data),

  // Create student with photos (FormData)
  createWithPhotos: (formData: FormData) =>
    api.post<ApiResponse>("/admin/students", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getAll: (params?: {
    page?: number;
    limit?: number;
    grade?: number;
    section?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => api.get<ApiResponse>("/admin/students", { params }),

  getById: (id: string) => api.get<ApiResponse>(`/admin/students/${id}`),

  update: (
    id: string,
    data: {
      grade?: number;
      section?: string;
      bloodGroup?: string;
      dob?: string;
      rollNumber?: number;
      isActive?: boolean;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
      };
      parentInfo?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        occupation?: string;
        relationship?: string;
      };
    }
  ) => api.put<ApiResponse>(`/admin/students/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse>(`/admin/students/${id}`),

  // Student dashboard endpoints
  getDashboard: () => api.get<ApiResponse>("/student/dashboard"),
  getAttendance: () => api.get<ApiResponse>("/student/attendance"),
  getGrades: () => api.get<ApiResponse>("/student/grades"),
  getHomework: () => api.get<ApiResponse>("/student/homework"),
  getSchedule: () => api.get<ApiResponse>("/student/schedule"),
  getCalendar: () => api.get<ApiResponse>("/student/calendar"),

  // Photo management
  uploadPhotos: (studentId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("photos", file));
    return api.post<ApiResponse>(
      `/admin/students/${studentId}/photos`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },

  deletePhoto: (studentId: string, photoId: string) =>
    api.delete<ApiResponse>(`/admin/students/${studentId}/photos/${photoId}`),

  getPhotos: (studentId: string) =>
    api.get<ApiResponse>(`/admin/students/${studentId}/photos`),

  getStats: () => api.get<ApiResponse>("/admin/students/stats"),
};
