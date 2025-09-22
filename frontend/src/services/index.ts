// Centralized API service exports
import { authApi } from "./auth.api";
import { studentApi } from "./student.api";
import { teacherApi } from "./teacher.api";
import { adminApi } from "./admin.api";
import { superadminApi } from "./superadmin.api";
import { parentApi } from "./parent.api";
import { api } from "./api-base";

export {
  authApi,
  studentApi,
  teacherApi,
  adminApi,
  superadminApi,
  parentApi,
  api,
};
export type { ApiResponse } from "./api-base";

// Legacy compatibility - Re-export as apiService for existing components
export const apiService = {
  // Authentication
  login: authApi.login,
  logout: authApi.logout,
  verify: authApi.verify,
  forcePasswordChange: authApi.forcePasswordChange,

  // Superadmin routes
  superadmin: {
    getStats: superadminApi.getStats,
    getSystemStats: superadminApi.getSystemStats,
    createSchool: superadminApi.createSchool,
    getSchools: superadminApi.getSchools,
    getSchool: superadminApi.getSchool,
    updateSchool: superadminApi.updateSchool,
    deleteSchool: superadminApi.deleteSchool,
    updateSchoolStatus: superadminApi.updateSchoolStatus,
    getSchoolStats: superadminApi.getSchoolStats,
    getSchoolDetails: superadminApi.getSchoolDetails,
    assignAdmin: superadminApi.assignAdmin,
    getAdminCredentials: superadminApi.getAdminCredentials,
    resetAdminPassword: superadminApi.resetAdminPassword,
    resetPassword: superadminApi.resetAdminPassword, // Backward compatibility
    regenerateApiKey: superadminApi.regenerateApiKey,
    getSystemSettings: superadminApi.getSystemSettings,
    updateSystemSettings: superadminApi.updateSystemSettings,
    getAllSchools: superadminApi.getSchools, // Backward compatibility
    assignSchoolAdmin: superadminApi.assignAdmin, // Backward compatibility
  },

  // Admin routes
  admin: {
    getDashboard: adminApi.getDashboard,
    createStudent: studentApi.create,
    getStudents: studentApi.getAll,
    updateStudent: studentApi.update,
    deleteStudent: studentApi.delete,
    createTeacher: teacherApi.create,
    getTeachers: teacherApi.getAll,
    updateTeacher: teacherApi.update,
    deleteTeacher: teacherApi.delete,
    createSubject: adminApi.createSubject,
    getSubjects: adminApi.getSubjects,
    updateSubject: adminApi.updateSubject,
    deleteSubject: adminApi.deleteSubject,
    createSchedule: adminApi.createSchedule,
    getSchedules: adminApi.getSchedules,
    updateSchedule: adminApi.updateSchedule,
    deleteSchedule: adminApi.deleteSchedule,
    createCalendarEvent: adminApi.createCalendarEvent,
    getCalendarEvents: adminApi.getCalendarEvents,
    updateCalendarEvent: adminApi.updateCalendarEvent,
    deleteCalendarEvent: adminApi.deleteCalendarEvent,
  },

  // Teacher routes
  teacher: {
    getDashboard: teacherApi.getDashboard,
    getClasses: teacherApi.getClasses,
    getAttendance: teacherApi.getAttendance,
    markAttendance: teacherApi.markAttendance,
    updateAttendance: teacherApi.updateAttendance,
    getSchedule: teacherApi.getSchedule,
    createHomework: teacherApi.createHomework,
    getHomework: teacherApi.getHomework,
    createGrade: teacherApi.createGrade,
    getGrades: teacherApi.getGrades,
  },

  // Student routes
  student: {
    getDashboard: studentApi.getDashboard,
    getAttendance: studentApi.getAttendance,
    getGrades: studentApi.getGrades,
    getHomework: studentApi.getHomework,
    getSchedule: studentApi.getSchedule,
    getCalendar: studentApi.getCalendar,
  },

  // Parent routes
  parent: {
    getDashboard: parentApi.getDashboard,
    getChildren: parentApi.getChildren,
    getChildAttendance: parentApi.getChildAttendance,
    getChildGrades: parentApi.getChildGrades,
    getChildHomework: parentApi.getChildHomework,
    getChildNotices: parentApi.getChildNotices,
  },

  // Accountant routes (placeholder for future implementation)
  accountant: {
    getDashboard: () => Promise.reject(new Error("Not implemented")),
    getTransactions: () => Promise.reject(new Error("Not implemented")),
    recordFee: () => Promise.reject(new Error("Not implemented")),
    getDefaulters: () => Promise.reject(new Error("Not implemented")),
    addFine: () => Promise.reject(new Error("Not implemented")),
  },
};

export default api;
