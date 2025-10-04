import { Router } from "express";

const router = Router();

// Import route modules (will be added as we create them)
import { organizationRoutes } from "../modules/organization/organization.route";
import { schoolRoutes } from "../modules/school/school.route";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { StudentRoutes } from "../modules/student/student.route";
import { TeacherRoutes } from "../modules/teacher/teacher.route";
import { superadminRoutes } from "../modules/superadmin/superadmin.route";
import { classRoutes } from "../modules/class/class.route";
import { homeworkRoutes } from "../modules/homework/homework.route";
import { examRoutes } from "../modules/exam/exam.route";
import { adminRoutes } from "../modules/admin/admin.route";
import { parentRoutes } from "../modules/parent/parent.route";
import { SubjectRoutes } from "../modules/subject/subject.route";
import { AcademicCalendarRoutes } from "../modules/academic-calendar/academic-calendar.route";
import { ScheduleRoutes } from "../modules/schedule/schedule.route";
import { EventRoutes } from "../modules/event/event.route";
import { AccountantRoutes } from "../modules/accountant/accountant.route";

// Define module routes (will be uncommented as we create them)
const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/superadmin",
    route: superadminRoutes,
  },
  {
    path: "/admin",
    route: adminRoutes,
  },
  {
    path: "/organizations",
    route: organizationRoutes,
  },
  {
    path: "/schools",
    route: schoolRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/students",
    route: StudentRoutes,
  },
  {
    path: "/teachers",
    route: TeacherRoutes,
  },
  {
    path: "/parents",
    route: parentRoutes,
  },
  {
    path: "/classes",
    route: classRoutes,
  },
  {
    path: "/homework",
    route: homeworkRoutes,
  },
  {
    path: "/exams",
    route: examRoutes,
  },
  {
    path: "/subjects",
    route: SubjectRoutes,
  },
  {
    path: "/calendar",
    route: AcademicCalendarRoutes,
  },
  {
    path: "/schedules",
    route: ScheduleRoutes,
  },
  {
    path: "/events",
    route: EventRoutes,
  },
  {
    path: "/accountants",
    route: AccountantRoutes,
  },
];

// Apply routes
moduleRoutes.forEach((route) => router.use(route.path, route.route));

// Basic test route
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "School Management System API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

export default router;
