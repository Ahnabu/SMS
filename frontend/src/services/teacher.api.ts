import { api, ApiResponse } from "./api-base";

// Teacher API service
export const teacherApi = {
  // Admin endpoints for teacher management
  create: (data: {
    schoolId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    employeeId?: string;
    subjects: string[];
    grades: number[];
    sections: string[];
    designation: string;
    bloodGroup: string;
    dob: string;
    joinDate?: string;
    qualifications: Array<{
      degree: string;
      institution: string;
      year: number;
      specialization?: string;
    }>;
    experience: {
      totalYears: number;
      previousSchools?: Array<{
        schoolName: string;
        position: string;
        duration: string;
        fromDate: string;
        toDate: string;
      }>;
    };
    address: {
      street?: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
    };
    salary?: {
      basic: number;
      allowances?: number;
      deductions?: number;
    };
    isClassTeacher?: boolean;
    classTeacherFor?: {
      grade: number;
      section: string;
    };
    photos?: File[];
  }) => {
    const formData = new FormData();

    // Add all teacher data fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === "photos" && value) {
        // Handle photo files
        (value as File[]).forEach((file) => {
          formData.append("photos", file);
        });
      } else if (typeof value === "object" && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    return api.post<ApiResponse>("/admin/teachers", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

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

  // Photo management
  uploadPhotos: (teacherId: string, photos: File[]) => {
    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append("photos", photo);
    });
    return api.post<ApiResponse>(
      `/admin/teachers/${teacherId}/photos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  getPhotos: (teacherId: string) =>
    api.get<ApiResponse>(`/admin/teachers/${teacherId}/photos`),

  deletePhoto: (teacherId: string, photoId: string) =>
    api.delete<ApiResponse>(`/admin/teachers/${teacherId}/photos/${photoId}`),

  getAvailablePhotoSlots: (teacherId: string) =>
    api.get<ApiResponse>(`/admin/teachers/${teacherId}/photos/available-slots`),
};
