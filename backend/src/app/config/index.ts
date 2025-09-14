import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  // Server configuration
  node_env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database configuration
  mongodb_uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management',
  db_name: process.env.DB_NAME || 'school_management',

  // JWT configuration
  jwt_secret: process.env.JWT_SECRET || 'school-management-fallback-secret',
  jwt_expires_in: process.env.JWT_EXPIRES_IN || '8h',

  // File upload configuration
  max_file_size: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  upload_path: process.env.UPLOAD_PATH || '../storage',

  // Rate limiting configuration
  rate_limit_window_ms: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rate_limit_max_requests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),

  // Email configuration (optional)
  email_host: process.env.EMAIL_HOST,
  email_port: parseInt(process.env.EMAIL_PORT || '587'),
  email_user: process.env.EMAIL_USER,
  email_pass: process.env.EMAIL_PASS,

  // Cloudinary configuration (optional)
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,

  // Default superadmin credentials
  superadmin_username: 'superadmin',
  superadmin_password: 'super123',

  // Application constants
  default_page_size: 20,
  max_page_size: 100,
  min_password_length: 6,
  max_photos_per_student: 20,
  min_photos_per_student: 5,

  // File constraints
  allowed_image_formats: ['jpg', 'jpeg', 'png'],
  allowed_document_formats: ['pdf', 'doc', 'docx'],

  // School settings
  default_grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  default_sections: ['A', 'B', 'C', 'D'],
  max_students_per_section: 40,

  // Attendance settings
  attendance_grace_period_minutes: 15,
  max_attendance_edit_hours: 24,

  // Academic year settings
  academic_year_start_month: 4, // April
  academic_year_end_month: 3,   // March

  // Time zone
  default_timezone: 'Asia/Kolkata'
};