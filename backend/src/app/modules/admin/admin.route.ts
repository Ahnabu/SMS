import express from "express";
import multer from "multer";
import {
  authenticate,
  requireSchoolAdmin,
  AuthenticatedRequest,
} from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { parseBody } from "../../middlewares/parseFormData";

// Student imports
import {
  createStudentValidationSchema,
  getStudentsValidationSchema,
  getStudentValidationSchema,
  updateStudentValidationSchema,
  deleteStudentValidationSchema,
} from "../student/student.validation";
import { StudentController } from "../student/student.controller";

// Teacher imports
import {
  createTeacherValidationSchema,
  getTeachersValidationSchema,
  getTeacherValidationSchema,
  updateTeacherValidationSchema,
  deleteTeacherValidationSchema,
} from "../teacher/teacher.validation";
import { TeacherController } from "../teacher/teacher.controller";

// Subject imports
import {
  createSubjectValidationSchema,
  getSubjectsValidationSchema,
  getSubjectValidationSchema,
  updateSubjectValidationSchema,
  deleteSubjectValidationSchema,
} from "../subject/subject.validation";
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from "../subject/subject.controller";

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
  getAdminDashboard,
} from "./admin.controller";
import { getSchool } from "../school/school.controller";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10, // Maximum 10 files
    fieldSize: 2 * 1024 * 1024, // 2MB field size
    fieldNameSize: 100,
    fields: 50, // Allow more fields
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Middleware to parse FormData with nested objects
const parseFormData = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    console.log("=== Admin ParseFormData Middleware Debug ===");
    console.log("req.body before parsing:", req.body);
    console.log("req.files:", req.files);

    // If no body, skip parsing
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("No req.body found, skipping parsing");
      return next();
    }

    const parsedBody: any = {};

    // Handle case where multer puts single values in arrays
    Object.keys(req.body).forEach((key) => {
      let value = req.body[key];

      // If multer wrapped single values in arrays, unwrap them
      if (Array.isArray(value) && value.length === 1) {
        value = value[0];
      }

      if (key.includes("[") && key.includes("]")) {
        // Handle nested objects like parentInfo[firstName]
        const match = key.match(/^(\w+)\[(\w+)\]$/);
        if (match) {
          const [, objectKey, propertyKey] = match;

          if (!parsedBody[objectKey]) {
            parsedBody[objectKey] = {};
          }

          parsedBody[objectKey][propertyKey] = value;
        }
      } else {
        // Handle regular fields
        parsedBody[key] = value;
      }
    });

    console.log("parsedBody after processing:", parsedBody);

    // Replace req.body with parsed version
    req.body = parsedBody;

    console.log("=== End Admin ParseFormData Debug ===");
    next();
  } catch (error) {
    console.error("Error in admin parseFormData middleware:", error);
    next(error);
  }
};

// All admin routes require authentication and admin permissions
router.use(authenticate);
router.use(requireSchoolAdmin);

// Dashboard endpoint
router.get("/dashboard", getAdminDashboard);
router.get(
  "/school/:id",
  //validateRequest(getSchoolValidationSchema),
  getSchool
);

// Student management routes
router.post(
  "/students",
  (req, res, next) => {
    console.log("=== Admin Student Creation - Before Multer ===");
    console.log("Content-Type:", req.headers["content-type"]);
    next();
  },
  upload.any(), // Handle all files and form fields
  (req, res, next) => {
    console.log("=== Admin Student Creation - After Multer ===");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    console.log("Body keys:", Object.keys(req.body || {}));
    next();
  },
  parseFormData, // Parse nested FormData objects
  (req, res, next) => {
    console.log("=== Admin Student Creation - After ParseFormData ===");
    console.log("Final req.body:", req.body);
    next();
  },
   validateRequest(createStudentValidationSchema),
  StudentController.createStudent
);

router.get(
  "/students",
  validateRequest(getStudentsValidationSchema),
  StudentController.getAllStudents
);
router.get(
  "/students/:id",
  validateRequest(getStudentValidationSchema),
  StudentController.getStudentById
);
router.put(
  "/students/:id",
  validateRequest(updateStudentValidationSchema),
  StudentController.updateStudent
);
router.delete(
  "/students/:id",
  validateRequest(deleteStudentValidationSchema),
  StudentController.deleteStudent
);

// Teacher management routes
router.post(
  "/teachers",
  validateRequest(createTeacherValidationSchema),
  TeacherController.createTeacher
);
router.get(
  "/teachers",
  validateRequest(getTeachersValidationSchema),
  TeacherController.getAllTeachers
);
router.get(
  "/teachers/:id",
  validateRequest(getTeacherValidationSchema),
  TeacherController.getTeacherById
);
router.put(
  "/teachers/:id",
  validateRequest(updateTeacherValidationSchema),
  TeacherController.updateTeacher
);
router.delete(
  "/teachers/:id",
  validateRequest(deleteTeacherValidationSchema),
  TeacherController.deleteTeacher
);

// Subject management routes
router.post(
  "/subjects",
  validateRequest(createSubjectValidationSchema),
  createSubject
);
router.get(
  "/subjects",
  validateRequest(getSubjectsValidationSchema),
  getAllSubjects
);
router.get(
  "/subjects/:id",
  validateRequest(getSubjectValidationSchema),
  getSubjectById
);
router.put(
  "/subjects/:id",
  validateRequest(updateSubjectValidationSchema),
  updateSubject
);
router.delete(
  "/subjects/:id",
  validateRequest(deleteSubjectValidationSchema),
  deleteSubject
);

// Schedule management routes
router.post("/schedules", createSchedule);
router.get("/schedules", getAllSchedules);
router.get("/schedules/:id", getScheduleById);
router.put("/schedules/:id", updateSchedule);
router.delete("/schedules/:id", deleteSchedule);

// Calendar management routes
router.post("/calendar", createCalendarEvent);
router.get("/calendar", getAllCalendarEvents);
router.get("/calendar/:id", getCalendarEventById);
router.put("/calendar/:id", updateCalendarEvent);
router.delete("/calendar/:id", deleteCalendarEvent);

export const adminRoutes = router;
