import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { UserRole } from '../user/user.interface';
import { TeacherController } from './teacher.controller';
import {
  createTeacherValidationSchema,
  updateTeacherValidationSchema,
  getTeacherValidationSchema,
  deleteTeacherValidationSchema,
  getTeachersValidationSchema,
  uploadPhotosValidationSchema,
  deletePhotoValidationSchema,
  getTeachersBySubjectSchema,
  getTeachersStatsValidationSchema,
} from './teacher.validation';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 20, // Maximum 20 files at once
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Teacher CRUD routes
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  validateRequest(createTeacherValidationSchema),
  TeacherController.createTeacher
);

router.get(
  '/',
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER),
  validateRequest(getTeachersValidationSchema),
  TeacherController.getAllTeachers
);

router.get(
  '/stats/:schoolId',
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  validateRequest(getTeachersStatsValidationSchema),
  TeacherController.getTeacherStats
);

router.get(
  '/school/:schoolId/subject/:subject',
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER),
  validateRequest(getTeachersBySubjectSchema),
  TeacherController.getTeachersBySubject
);

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER),
  validateRequest(getTeacherValidationSchema),
  TeacherController.getTeacherById
);

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  validateRequest(updateTeacherValidationSchema),
  TeacherController.updateTeacher
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  validateRequest(deleteTeacherValidationSchema),
  TeacherController.deleteTeacher
);

// Photo management routes
router.post(
  '/:id/photos',
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  upload.array('photos'),
  validateRequest(uploadPhotosValidationSchema),
  TeacherController.uploadTeacherPhotos
);

router.get(
  '/:id/photos',
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER),
  validateRequest(getTeacherValidationSchema),
  TeacherController.getTeacherPhotos
);

router.get(
  '/:id/photos/available-slots',
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  validateRequest(getTeacherValidationSchema),
  TeacherController.getAvailablePhotoSlots
);

router.delete(
  '/:teacherId/photos/:photoId',
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  validateRequest(deletePhotoValidationSchema),
  TeacherController.deleteTeacherPhoto
);

export const TeacherRoutes = router;