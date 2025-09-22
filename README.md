# School Management System (SMS)

## 🏫 Overview

A comprehensive School Management System built with modern web technologies. This full-stack application provides role-based access control and complete academic management capabilities for multiple schools.

## 🚀 Current Status

### ✅ Completed Features

#### **Phase 1 - Core Infrastructure**
- **Multi-School Architecture**: Support for multiple schools with isolated data
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Complete CRUD operations for all user types
- **School Administration**: Superadmin can create and manage schools
- **Admin Dashboard**: School-specific admin panels with statistics
- **Student Management**: Add, edit, view, and manage student records
- **Teacher Management**: Complete teacher lifecycle management
- **Subject Management**: Academic subject creation and management
- **Schedule Management**: Class timetable and schedule management
- **Academic Calendar**: Event and calendar management
- **Attendance System**: Student attendance tracking and reporting

#### **Phase 2 - Academic Features**
- **Class Management System**: 
  - Auto-section creation (A, B, C...) when capacity is reached
  - Intelligent student count tracking and overflow handling
  - Complete CRUD operations for class management
  - Grade-wise organization and teacher assignment
- **Homework & Assignment System**:
  - Teacher workflow for creating and managing assignments
  - Student submission system with file attachments
  - Grading and feedback system
  - Analytics and progress tracking
  - Late submission handling with penalty calculations
- **Exam & Grade Integration**:
  - Academic calendar integrated exam scheduling
  - Comprehensive result management and publication
  - Statistics and performance analytics
  - Multi-format exam support and grading schemes

### 🔧 Technical Implementation

#### **Backend Technologies**
- **Node.js** with **Express.js** framework
- **TypeScript** for type safety
- **MongoDB** with **Mongoose ODM**
- **JWT** authentication
- **Zod** validation
- **Multer** file uploads
- **Rate limiting** and security middleware

#### **Frontend Technologies**
- **React 18** with **TypeScript**
- **Vite** build tool
- **Tailwind CSS** for styling
- **Lucide React** icons
- **Context API** for state management
- **Axios** for API communication

#### **Database Models**
- Users (Superadmin, Admin, Teacher, Student, Parent, Accountant)
- Schools with multi-tenant architecture
- Students with detailed profiles and academic records
- Teachers with employment and subject information
- Classes with capacity management and auto-section creation
- Subjects and academic schedules
- Homework with submission and grading system
- Exams with result management
- Attendance tracking
- Academic calendar events

### 🌐 API Endpoints

#### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Token verification
- `POST /api/auth/force-password-change` - Force password change

#### **Superadmin Routes**
- `GET /api/superadmin/schools` - List all schools
- `POST /api/superadmin/schools` - Create new school
- `GET /api/superadmin/schools/:id` - Get school details
- `PUT /api/superadmin/schools/:id` - Update school
- `DELETE /api/superadmin/schools/:id` - Delete school
- `PUT /api/superadmin/schools/:id/reset-password` - Reset admin password
- `GET /api/superadmin/stats` - System statistics

#### **School Management**
- `GET /api/schools` - List schools
- `POST /api/schools` - Create school
- `GET /api/schools/:id` - Get school details
- `PUT /api/schools/:id` - Update school information

#### **User Management**
- `GET /api/users` - List users (Admin only)
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/reset-password` - Reset user password

#### **Student Management**
- `GET /api/students` - List students
- `POST /api/students` - Add new student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Remove student

#### **Teacher Management**
- `GET /api/teachers` - List teachers
- `POST /api/teachers` - Add new teacher
- `GET /api/teachers/:id` - Get teacher details
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Remove teacher

#### **Phase 2 - Academic Management**

##### **Class Management**
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create new class
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `GET /api/classes/grade/:grade` - Get classes by grade
- `GET /api/classes/statistics` - Class statistics
- `POST /api/classes/check-capacity` - Check class capacity

##### **Homework System**
- `POST /api/homework/create` - Create homework (Teacher)
- `GET /api/homework/teacher/my-homework` - Teacher's homework
- `GET /api/homework/student/my-homework` - Student's homework
- `POST /api/homework/submit` - Submit homework (Student)
- `POST /api/homework/grade` - Grade homework (Teacher)
- `GET /api/homework/:id/submissions` - View submissions
- `GET /api/homework/stats` - Homework statistics

##### **Exam Management**
- `POST /api/exams` - Create exam (Teacher)
- `GET /api/exams/teacher` - Teacher's exams
- `GET /api/exams/student` - Student's exams
- `POST /api/exams/:id/results` - Submit results
- `PUT /api/exams/:id/publish` - Publish results
- `GET /api/exams/stats` - Exam statistics

### 👥 User Roles & Permissions

#### **Superadmin**
- System-wide administration
- Create and manage multiple schools
- Manage school administrators
- Access system analytics and reports
- Reset admin passwords

#### **Admin (School Level)**
- School-specific administration
- Manage students, teachers, and staff
- Academic management and reporting
- User account management within school
- Access school analytics

#### **Teacher**
- Class and subject management
- Create and manage homework assignments
- Grade student submissions
- Conduct and manage exams
- Student progress tracking
- Attendance management

#### **Student**
- View assignments and submit homework
- Access exam schedules and results
- View personal academic progress
- Access class schedules and materials

#### **Parent**
- View child's academic progress
- Access homework and exam updates
- View attendance reports
- Communication with teachers

#### **Accountant**
- Financial management
- Fee collection and tracking
- Payment processing
- Financial reporting

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env file with your configurations

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

#### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=super123
SUPERADMIN_EMAIL=superadmin@schoolmanagement.com
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions per user role
- **CORS Protection**: Cross-origin request security
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Zod schema validation
- **Password Security**: Hashed passwords with bcrypt
- **XSS Protection**: Content security policies
- **CSRF Protection**: Cross-site request forgery prevention

## 📊 Current Data

### Schools in System: 5
- Test School Debug (Active)
- Test School (Active) 
- Test2 Schools (3 instances - various statuses)

### System Statistics
- **Total Schools**: 5
- **Active Schools**: 2
- **Pending Approval**: 3
- **Total Students**: 0 (Ready for data entry)
- **Total Teachers**: 0 (Ready for data entry)

## 🚦 Server Status

### Backend Server
- **Status**: ✅ Running
- **URL**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/docs
- **Health Check**: http://localhost:5000/health

### Frontend Server
- **Status**: ✅ Running
- **URL**: http://localhost:3001
- **Build Tool**: Vite
- **Hot Reload**: Enabled

## 🧪 Testing

### API Testing
- All authentication endpoints tested ✅
- School management endpoints tested ✅
- Phase 2 endpoints implemented ✅
- CORS configuration fixed ✅
- Security validations working ✅

### Demo Credentials
```
Superadmin:
Username: superadmin
Password: super123

Note: Other user accounts are created through the admin panel
```

## 🔄 Development Workflow

### Current Branch
- **Repository**: SMS
- **Owner**: Ahnabu
- **Branch**: main
- **Last Updated**: September 19, 2025

### Git Workflow
```bash
# Check current changes
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to remote
git push
```

## 📋 Known Issues & Limitations

### Fixed Issues ✅
- **CORS Policy**: Fixed to allow multiple origins
- **Authentication**: All endpoints properly secured
- **Password Reset Security**: Properly restricted to admins
- **TypeScript Errors**: All compilation errors resolved

### Current Limitations
- **Test Data**: System ready but needs sample data population
- **File Upload**: Basic implementation, needs enhancement
- **Email Integration**: Not yet implemented
- **Notification System**: Planned for future release
- **Mobile App**: Web-only currently

## 🔮 Future Roadmap

### Phase 3 - Advanced Features
- Real-time notifications
- Email/SMS integration
- Advanced reporting and analytics
- Mobile application
- Parent-teacher communication portal
- Fee management integration
- Library management
- Transport management

### Phase 4 - Enterprise Features
- Multi-language support
- Advanced role customization
- API rate limiting per school
- Data backup and recovery
- Advanced security features
- Integration with external systems

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: Use GitHub Discussions for questions
- **Email**: [Contact maintainer]

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by real-world school management needs
- Community-driven development approach

---

**Last Updated**: September 19, 2025  
**Version**: 2.0.0  
**Status**: Phase 2 Complete - Production Ready