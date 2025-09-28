import { Router } from "express";
import multer from "multer";
import { authenticate, authorize } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserRole } from "../user/user.interface";
import { StudentController } from "./student.controller";
import {
  createStudentValidationSchema,
  updateStudentValidationSchema,
  getStudentValidationSchema,
  deleteStudentValidationSchema,
  getStudentsValidationSchema,
  uploadPhotosValidationSchema,
  deletePhotoValidationSchema,
  getStudentsByGradeAndSectionSchema,
  getStudentStatsValidationSchema,
} from "./student.validation";
import { parseBody } from "../../middlewares/parseFormData";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 20, // Maximum 20 files at once
    fieldSize: 2 * 1024 * 1024, // 2MB field size limit
    fieldNameSize: 100, // Field name size limit
    fields: 50, // Maximum number of non-file fields
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Student CRUD routes
router.post(
  "/",
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  (req, res, next) => {
    console.log("=== Before Multer ===");
    console.log("Content-Type:", req.headers["content-type"]);
    next();
  },
  upload.any(), // This should capture all fields and files
  (req, res, next) => {
    console.log("=== After Multer ===");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    console.log("Body keys:", Object.keys(req.body || {}));

    // Debug: Log all form fields received
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: any) => {
        if (file.fieldname !== "photos") {
          console.log(`Form field ${file.fieldname}:`, file.buffer?.toString());
        }
      });
    }

    next();
  },
  parseBody,
  (req, res, next) => {
    console.log("=== After ParseFormData ===");
    console.log("Final req.body:", req.body);
    next();
  },
  validateRequest(createStudentValidationSchema),
  StudentController.createStudent
);

router.get(
  "/",
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER),
  validateRequest(getStudentsValidationSchema),
  StudentController.getAllStudents
);

router.get(
  "/stats/:schoolId",
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  validateRequest(getStudentStatsValidationSchema),
  StudentController.getStudentStats
);

router.get(
  "/school/:schoolId/grade/:grade/section/:section",
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER),
  validateRequest(getStudentsByGradeAndSectionSchema),
  StudentController.getStudentsByGradeAndSection
);

router.get(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
    UserRole.PARENT
  ),
  validateRequest(getStudentValidationSchema),
  StudentController.getStudentById
);

router.patch(
  "/:id",
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  validateRequest(updateStudentValidationSchema),
  StudentController.updateStudent
);

router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  validateRequest(deleteStudentValidationSchema),
  StudentController.deleteStudent
);

// Photo management routes
router.post(
  "/:id/photos",
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  upload.array("photos"),
  validateRequest(uploadPhotosValidationSchema),
  StudentController.uploadStudentPhotos
);

router.get(
  "/:id/photos",
  authenticate,
  authorize(
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
    UserRole.PARENT
  ),
  validateRequest(getStudentValidationSchema),
  StudentController.getStudentPhotos
);

router.get(
  "/:id/photos/available-slots",
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  validateRequest(getStudentValidationSchema),
  StudentController.getAvailablePhotoSlots
);

router.get(
  "/:id/credentials",
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  validateRequest(getStudentValidationSchema),
  StudentController.getStudentCredentials
);

router.delete(
  "/:studentId/photos/:photoId",
  authenticate,
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN),
  validateRequest(deletePhotoValidationSchema),
  StudentController.deleteStudentPhoto
);

export const StudentRoutes = router;
