import express from 'express';
import { authenticate, requireSchoolAdmin, AuthenticatedRequest } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';

// Student imports
import { 
  createStudentValidationSchema,
  getStudentsValidationSchema,
  getStudentValidationSchema,
  updateStudentValidationSchema,
  deleteStudentValidationSchema
} from '../student/student.validation';
import { StudentController } from '../student/student.controller';

// Teacher imports
import {
  createTeacherValidationSchema,
  getTeachersValidationSchema,
  getTeacherValidationSchema,
  updateTeacherValidationSchema,
  deleteTeacherValidationSchema
} from '../teacher/teacher.validation';
import { TeacherController } from '../teacher/teacher.controller';

// Subject imports
import {
  createSubjectValidationSchema,
  getSubjectsValidationSchema,
  getSubjectValidationSchema,
  updateSubjectValidationSchema,
  deleteSubjectValidationSchema
} from '../subject/subject.validation';
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
} from '../subject/subject.controller';

// Schedule/Calendar imports (we'll create these)
import {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  createCalendarEvent,
  getAllCalendarEvents,
  getCalendarEventById,
  updateCalendarEvent,
  deleteCalendarEvent,
  getAdminDashboard
} from './admin.controller';
import { getSchool } from '../school/school.controller';

const router = express.Router();

// All admin routes require authentication and admin permissions
router.use(authenticate);
router.use(requireSchoolAdmin);

// Dashboard endpoint
router.get('/dashboard', getAdminDashboard);
router.get(
  "/school/:id",
  //validateRequest(getSchoolValidationSchema),
  getSchool
);
// Student management routes
router.post('/students', validateRequest(createStudentValidationSchema), StudentController.createStudent);
router.get('/students', validateRequest(getStudentsValidationSchema), StudentController.getAllStudents);
router.get('/students/:id', validateRequest(getStudentValidationSchema), StudentController.getStudentById);
router.put('/students/:id', validateRequest(updateStudentValidationSchema), StudentController.updateStudent);
router.delete('/students/:id', validateRequest(deleteStudentValidationSchema), StudentController.deleteStudent);

// Teacher management routes
router.post('/teachers', validateRequest(createTeacherValidationSchema), TeacherController.createTeacher);
router.get('/teachers', validateRequest(getTeachersValidationSchema), TeacherController.getAllTeachers);
router.get('/teachers/:id', validateRequest(getTeacherValidationSchema), TeacherController.getTeacherById);
router.put('/teachers/:id', validateRequest(updateTeacherValidationSchema), TeacherController.updateTeacher);
router.delete('/teachers/:id', validateRequest(deleteTeacherValidationSchema), TeacherController.deleteTeacher);

// Subject management routes
router.post('/subjects', validateRequest(createSubjectValidationSchema), createSubject);
router.get('/subjects', validateRequest(getSubjectsValidationSchema), getAllSubjects);
router.get('/subjects/:id', validateRequest(getSubjectValidationSchema), getSubjectById);
router.put('/subjects/:id', validateRequest(updateSubjectValidationSchema), updateSubject);
router.delete('/subjects/:id', validateRequest(deleteSubjectValidationSchema), deleteSubject);

// Schedule management routes
router.post('/schedules', createSchedule);
router.get('/schedules', getAllSchedules);
router.get('/schedules/:id', getScheduleById);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);

// Calendar management routes
router.post('/calendar', createCalendarEvent);
router.get('/calendar', getAllCalendarEvents);
router.get('/calendar/:id', getCalendarEventById);
router.put('/calendar/:id', updateCalendarEvent);
router.delete('/calendar/:id', deleteCalendarEvent);

export const adminRoutes = router;