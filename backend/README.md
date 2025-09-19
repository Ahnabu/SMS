# School Management System - Backend

A comprehensive school management system backend built with Node.js, Express.js, TypeScript, and MongoDB. This system supports multi-school management with role-based access control and face recognition integration capabilities.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Authentication & Authorization](#-authentication--authorization)
- [Database Models](#-database-models)
- [API Endpoints](#-api-endpoints)
- [Error Handling](#-error-handling)
- [Validation](#-validation)
- [File Upload](#-file-upload)
- [Face Recognition Integration](#-face-recognition-integration)
- [Development Guidelines](#-development-guidelines)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## 🚀 Features

### Core Functionality
- **Multi-school Management**: Support for multiple schools in a single system
- **Role-based Access Control**: Superadmin, Admin, Teacher, Student, Parent, Accountant roles
- **Student Management**: Comprehensive student profiles, enrollment, academic records
- **Teacher Management**: Teacher profiles, subjects assignment, schedules
- **Attendance System**: Real-time attendance tracking with multiple status options
- **Academic Calendar**: Events, holidays, exam schedules
- **Grade Management**: Grade recording and reporting system
- **Subject & Schedule Management**: Subject creation and timetable management
- **Parent Portal**: Parent-student association and monitoring
- **Financial Management**: Fee collection, transactions, defaulter tracking

### Advanced Features
- **Face Recognition Integration**: API endpoints for external face recognition systems
- **Real-time Updates**: WebSocket support for live updates
- **File Management**: Support for documents, images, and media files
- **Reporting System**: Comprehensive reports and analytics
- **API Key Management**: Secure API access for external integrations
- **Audit Logging**: Complete activity tracking
- **Data Seeding**: Sample data generation for development

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **HTTP-only Cookies**: Secure token storage
- **Role-based Authorization**: Granular permission system
- **Input Validation**: Comprehensive request validation using Zod
- **Error Handling**: Structured error responses
- **Rate Limiting**: API endpoint protection
- **CORS Configuration**: Cross-origin request management

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod schema validation
- **File Upload**: Multer
- **Environment**: dotenv
- **Development**: ts-node, nodemon
- **Testing**: Jest (planned)
- **Documentation**: TypeDoc (planned)

## 📁 Project Structure

```
backend/
├── src/
│   ├── app/
│   │   ├── config/                 # Configuration files
│   │   │   └── index.ts           # Environment variables and app config
│   │   ├── DB/                    # Database connection
│   │   │   └── index.ts           # MongoDB connection setup
│   │   ├── errors/                # Error handling
│   │   │   ├── AppError.ts        # Custom error class
│   │   │   ├── handleCastError.ts # MongoDB cast error handler
│   │   │   ├── handleDuplicateError.ts # Duplicate key error handler
│   │   │   ├── handleValidationError.ts # Validation error handler
│   │   │   └── handleZodErrors.ts # Zod validation error handler
│   │   ├── interface/             # Global interfaces
│   │   │   └── error.ts           # Error response interfaces
│   │   ├── middlewares/           # Express middlewares
│   │   │   ├── auth.ts            # Authentication middleware
│   │   │   ├── errorHandler.ts    # Global error handling
│   │   │   ├── fileUpload.ts      # File upload handling
│   │   │   ├── globalErrorHandler.ts # Global error middleware
│   │   │   ├── notFound.ts        # 404 handler
│   │   │   └── validateRequest.ts # Request validation
│   │   ├── modules/               # Feature modules
│   │   │   ├── academic-calendar/ # Calendar management
│   │   │   ├── attendance/        # Attendance system
│   │   │   ├── auth/              # Authentication
│   │   │   ├── exam/              # Examination system
│   │   │   ├── grade/             # Grade management
│   │   │   ├── homework/          # Homework system
│   │   │   ├── organization/      # Organization management
│   │   │   ├── parent/            # Parent management
│   │   │   ├── schedule/          # Schedule management
│   │   │   ├── school/            # School management
│   │   │   ├── student/           # Student management
│   │   │   ├── subject/           # Subject management
│   │   │   ├── teacher/           # Teacher management
│   │   │   └── user/              # User management
│   │   ├── routes/                # API routes
│   │   │   └── index.ts           # Main route configuration
│   │   ├── scripts/               # Utility scripts
│   │   │   └── seeder-cli.ts      # Database seeding script
│   │   └── utils/                 # Utility functions
│   │       ├── catchAsync.ts      # Async error wrapper
│   │       ├── fileUtils.ts       # File handling utilities
│   │       ├── jwtUtils.ts        # JWT utilities
│   │       ├── seeder.ts          # Data seeding utilities
│   │       └── sendResponse.ts    # Response formatting
│   ├── app.ts                     # Express app configuration
│   └── server.ts                  # Server startup
├── docs/                          # Documentation
│   ├── PROGRESS_REPORT.md         # Development progress
│   └── SEEDING.md                 # Database seeding guide
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## 📦 Installation

### Prerequisites
- Node.js 18.0 or higher
- MongoDB 5.0 or higher
- npm or yarn package manager

### Step-by-step Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SMS/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod --dbpath /your/mongodb/data/path
   
   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

## ⚙️ Environment Configuration

Create a `.env` file in the backend root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/school_management
DB_NAME=school_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=8h

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=../storage
TEMP_UPLOAD_PATH=./temp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Default Superadmin
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=super123
SUPERADMIN_EMAIL=superadmin@schoolmanagement.com

# API Configuration
API_KEY=school-management-api-key-2025
ALLOWED_ORIGINS=http://localhost:3000

# Application Settings
MAX_PHOTOS_PER_TEACHER=20
MAX_PERIODS_PER_DAY=8
ATTENDANCE_LOCK_AFTER_DAYS=7
DEFAULT_TIMEZONE=Asia/Kolkata
```

## 🗄️ Database Setup

### MongoDB Connection

The application uses MongoDB with Mongoose ODM. The database connection is configured in `src/app/DB/index.ts`.

### Database Seeding

To populate your database with sample data for development:

```bash
# Seed all data
npm run seed

# Seed specific collections
npm run seed:schools
npm run seed:users
npm run seed:students
npm run seed:teachers
```

For detailed seeding information, see [SEEDING.md](docs/SEEDING.md).

### Collections Overview

The system creates the following main collections:
- `users` - All system users (superadmin, admin, teacher, student, parent, accountant)
- `schools` - School information and configuration
- `students` - Student profiles and academic data
- `teachers` - Teacher profiles and assignments
- `subjects` - Academic subjects
- `attendance` - Attendance records
- `grades` - Student grades and assessments
- `schedules` - Class schedules and timetables
- `academic-calendars` - Academic events and holidays

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with hot reloading using nodemon and ts-node.

### Production Mode
```bash
npm run build
npm start
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm run lint` - Run ESLint (if configured)
- `npm test` - Run tests (when implemented)

## 📚 API Documentation

### Base URL
```
Local Development: http://localhost:5000/api
```

### Response Format
All API responses follow a consistent format:

```typescript
{
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp: string;
}
```

### Error Response Format
```typescript
{
  success: false;
  message: string;
  errorSources: Array<{
    path: string | number;
    message: string;
  }>;
  stack?: string; // Only in development
}
```

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Login**: POST `/api/auth/login` with username/password
2. **JWT Token**: Stored in HTTP-only cookie for security
3. **Token Verification**: Automatic with middleware on protected routes
4. **Logout**: POST `/api/auth/logout` clears the cookie

### User Roles

1. **Superadmin**
   - System-wide management
   - School creation and management
   - User role assignments
   - System configuration

2. **Admin**
   - School-specific management
   - Student and teacher management
   - Academic calendar management
   - Report generation

3. **Teacher**
   - Class management
   - Attendance marking
   - Grade recording
   - Homework assignment

4. **Student**
   - View attendance and grades
   - Access assignments
   - View schedule

5. **Parent**
   - Monitor child's progress
   - View attendance and grades
   - Communication with school

6. **Accountant**
   - Fee management
   - Financial transactions
   - Payment tracking

### Protected Routes

All API routes except `/auth/login` require authentication. Role-based authorization is enforced using middleware:

```typescript
// Example middleware usage
router.use(authenticate); // Check JWT token
router.use(requireSuperadmin); // Check superadmin role
```

## 🗃️ Database Models

### User Model
```typescript
interface IUser {
  username: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'teacher' | 'student' | 'parent' | 'accountant';
  isActive: boolean;
  lastLogin?: Date;
  mustChangePassword: boolean;
  // Additional fields...
}
```

### School Model
```typescript
interface ISchool {
  name: string;
  slug: string;
  schoolId: string;
  establishedYear?: number;
  address: IAddress;
  contact: IContact;
  status: SchoolStatus;
  settings: ISchoolSettings;
  apiEndpoint: string; // For face recognition integration
  apiKey: string; // Unique API key for external systems
  // Additional fields...
}
```

### Student Model
```typescript
interface IStudent {
  userId: Types.ObjectId; // Reference to User
  schoolId: Types.ObjectId; // Reference to School
  studentId: string;
  rollNumber?: number;
  grade: number;
  section: string;
  admissionDate: Date;
  personalInfo: IPersonalInfo;
  parentId?: Types.ObjectId; // Reference to Parent
  // Additional fields...
}
```

### Teacher Model
```typescript
interface ITeacher {
  userId: Types.ObjectId; // Reference to User
  schoolId: Types.ObjectId; // Reference to School
  teacherId: string;
  employeeId?: string;
  subjects: Types.ObjectId[]; // References to Subjects
  qualification: string;
  experience: number;
  personalInfo: IPersonalInfo;
  salary?: ISalary;
  // Additional fields...
}
```

## 🛣️ API Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /login                 # User login
POST   /logout                # User logout
GET    /verify                # Verify JWT token
POST   /force-password-change # Change password (forced)
```

### Superadmin Routes (`/api/superadmin`)
```
# System Stats
GET    /stats                 # Get system statistics
GET    /system/stats          # Get detailed system stats

# School Management
GET    /schools               # Get all schools
POST   /schools               # Create new school
GET    /schools/:id           # Get specific school
PUT    /schools/:id           # Update school
DELETE /schools/:id           # Delete school
PUT    /schools/:id/status    # Update school status

# School Administration
POST   /schools/:id/assign-admin     # Assign admin to school
POST   /schools/:id/regenerate-api-key # Regenerate API key

# System Settings
GET    /system/settings       # Get system settings
PUT    /system/settings       # Update system settings
```

### Admin Routes (`/api/admin`)
```
# Dashboard
GET    /dashboard             # Get admin dashboard data

# Student Management
GET    /students              # Get all students
POST   /students              # Create new student
GET    /students/:id          # Get specific student
PUT    /students/:id          # Update student
DELETE /students/:id          # Delete student

# Teacher Management
GET    /teachers              # Get all teachers
POST   /teachers              # Create new teacher
GET    /teachers/:id          # Get specific teacher
PUT    /teachers/:id          # Update teacher
DELETE /teachers/:id          # Delete teacher

# Subject Management
GET    /subjects              # Get all subjects
POST   /subjects              # Create new subject
PUT    /subjects/:id          # Update subject
DELETE /subjects/:id          # Delete subject

# Schedule Management
GET    /schedules             # Get schedules
POST   /schedules             # Create schedule
PUT    /schedules/:id         # Update schedule
DELETE /schedules/:id         # Delete schedule

# Calendar Management
GET    /calendar              # Get calendar events
POST   /calendar              # Create calendar event
PUT    /calendar/:id          # Update calendar event
DELETE /calendar/:id          # Delete calendar event
```

### Teacher Routes (`/api/teacher`)
```
GET    /dashboard             # Teacher dashboard
GET    /classes               # Get assigned classes
GET    /schedule              # Get teaching schedule
GET    /attendance/class/:id  # Get class attendance
POST   /attendance            # Mark attendance
PUT    /attendance/:id        # Update attendance
POST   /homework              # Create homework
GET    /homework              # Get homework assignments
POST   /grades                # Record grades
GET    /grades                # Get recorded grades
```

### Student Routes (`/api/student`)
```
GET    /dashboard             # Student dashboard
GET    /attendance            # Get attendance records
GET    /grades                # Get grades
GET    /homework              # Get homework assignments
GET    /schedule              # Get class schedule
GET    /calendar              # Get academic calendar
```

### Parent Routes (`/api/parent`)
```
GET    /dashboard             # Parent dashboard
GET    /children              # Get children list
GET    /child/:id/attendance  # Get child attendance
GET    /child/:id/grades      # Get child grades
GET    /child/:id/homework    # Get child homework
GET    /child/:id/notices     # Get child notices
```

### Accountant Routes (`/api/accountant`)
```
GET    /dashboard             # Accountant dashboard
GET    /transactions          # Get financial transactions
POST   /fees                  # Record fee payment
GET    /defaulters            # Get fee defaulters
POST   /fine                  # Add fine to student
```

## 🚨 Error Handling

The application uses a comprehensive error handling system:

### Error Types

1. **AppError**: Custom application errors
2. **ValidationError**: MongoDB/Mongoose validation errors
3. **CastError**: MongoDB casting errors
4. **DuplicateKeyError**: MongoDB duplicate key errors
5. **ZodError**: Request validation errors
6. **JWTError**: JWT token errors

### Error Middleware

```typescript
// Global error handler
app.use(globalErrorHandler);

// 404 handler
app.use(notFoundHandler);

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
```

### Error Response Structure

```typescript
// Development
{
  success: false,
  message: "Error message",
  error: { /* full error object */ },
  stack: "Error stack trace",
  timestamp: "2025-01-XX..."
}

// Production
{
  success: false,
  message: "User-friendly error message",
  timestamp: "2025-01-XX..."
}
```

## ✅ Validation

Request validation is implemented using Zod schemas:

### Example Validation Schema

```typescript
const createStudentValidationSchema = z.object({
  body: z.object({
    firstName: z.string({
      required_error: 'First name is required',
    }).min(2, 'First name must be at least 2 characters'),
    lastName: z.string({
      required_error: 'Last name is required',
    }).min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    grade: z.number().int().min(1).max(12),
    section: z.string().regex(/^[A-Z]$/, 'Section must be a single uppercase letter'),
    // Additional validation rules...
  }),
});
```

### Validation Middleware Usage

```typescript
router.post('/students', 
  validateRequest(createStudentValidationSchema),
  createStudent
);
```

## 📁 File Upload

File upload functionality using Multer middleware:

### Supported File Types
- Images: JPG, JPEG, PNG
- Documents: PDF, DOC, DOCX

### Upload Limits
- Max file size: 5MB (configurable)
- Max photos per student: 20
- Max photos per teacher: 20

### Upload Endpoints
```typescript
// Student photo upload
POST /api/admin/students/:id/photos

// Teacher document upload
POST /api/admin/teachers/:id/documents

// School logo upload
POST /api/superadmin/schools/:id/logo
```

## 🎯 Face Recognition Integration

Each school gets unique API credentials for external system integration:

### API Configuration Fields
- `apiEndpoint`: Dynamic API endpoint URL for the school
- `apiKey`: Unique API key for authentication
- `regenerateApiKey()`: Method to regenerate API key

### Integration Flow
1. External face recognition app authenticates using school's API key
2. App sends attendance data to school's specific endpoint
3. System processes and stores attendance records
4. Real-time updates sent to relevant users

### API Key Management
```typescript
// Regenerate API key for a school
POST /api/superadmin/schools/:schoolId/regenerate-api-key

// Response
{
  success: true,
  data: {
    apiKey: "new-generated-api-key",
    apiEndpoint: "https://api.schoolsystem.com/schools/school-id"
  }
}
```

## 🔧 Development Guidelines

### Code Organization
- Each module follows the same structure: `model`, `interface`, `service`, `controller`, `validation`, `route`
- Services contain business logic
- Controllers handle HTTP requests/responses
- Validation schemas are separate files
- Interfaces define TypeScript types

### Naming Conventions
- Files: `kebab-case` (e.g., `student-management.ts`)
- Classes: `PascalCase` (e.g., `StudentService`)
- Functions: `camelCase` (e.g., `createStudent`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)

### Code Style
- Use TypeScript strict mode
- Implement proper error handling with try-catch
- Use async/await for asynchronous operations
- Add JSDoc comments for complex functions
- Follow REST API conventions

### Git Workflow
1. Create feature branch: `git checkout -b feature/description`
2. Make changes with descriptive commits
3. Test changes thoroughly
4. Create pull request with detailed description
5. Code review and merge

## 🧪 Testing

Testing framework setup (planned):

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### Test Coverage
```bash
npm run test:coverage
```

### Test Structure
```
tests/
├── unit/                  # Unit tests
├── integration/           # Integration tests
├── fixtures/              # Test data
└── helpers/               # Test utilities
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure production database
4. Set up proper CORS origins
5. Enable SSL/HTTPS
6. Configure reverse proxy (nginx)

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://production-db-url
JWT_SECRET=super-strong-production-secret
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

## 📝 API Usage Examples

### Authentication
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    username: 'admin@school.com',
    password: 'password123'
  })
});
```

### Creating a Student
```javascript
const student = await fetch('/api/admin/students', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    grade: 10,
    section: 'A',
    studentId: 'STU001'
  })
});
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass
- Write clear commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@schoolmanagement.com or create an issue in the repository.

---

**Last Updated**: September 19, 2025
**Version**: 1.0.0
**Node.js**: 18.0+
**MongoDB**: 5.0+