import { Router } from 'express';

const router = Router();

// Import route modules (will be added as we create them)
import { organizationRoutes } from '../modules/organization/organization.route';
import { schoolRoutes } from '../modules/school/school.route';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';
import { StudentRoutes } from '../modules/student/student.route';
import { TeacherRoutes } from '../modules/teacher/teacher.route';

// Define module routes (will be uncommented as we create them)
const moduleRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/organizations',
    route: organizationRoutes,
  },
  {
    path: '/schools',
    route: schoolRoutes,
  },
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/students',
    route: StudentRoutes,
  },
  {
    path: '/teachers',
    route: TeacherRoutes,
  },
];

// Apply routes
moduleRoutes.forEach((route) => router.use(route.path, route.route));

// Basic test route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'School Management System API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;