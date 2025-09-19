# School Management System - Frontend# Getting Started with Create React App



A modern, responsive React-based frontend for the School Management System built with TypeScript, Tailwind CSS, and Vite. This application provides comprehensive school management capabilities with role-based dashboards and real-time updates.



## 📋 Table of Contents## Available Scripts



- [Features](#-features)In the project directory, you can run:

- [Tech Stack](#-tech-stack)

- [Project Structure](#-project-structure)### `npm start`

- [Installation](#-installation)

- [Environment Configuration](#-environment-configuration)Runs the app in the development mode.\

- [Running the Application](#-running-the-application)Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

- [User Roles & Dashboards](#-user-roles--dashboards)

- [Components Overview](#-components-overview)The page will reload if you make edits.\

- [Authentication Flow](#-authentication-flow)You will also see any lint errors in the console.

- [API Integration](#-api-integration)

- [Styling & UI](#-styling--ui)### `npm test`

- [State Management](#-state-management)

- [Routing](#-routing)Launches the test runner in the interactive watch mode.\

- [Error Handling](#-error-handling)See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

- [Performance Optimizations](#-performance-optimizations)

- [Development Guidelines](#-development-guidelines)### `npm run build`

- [Testing](#-testing)

- [Build & Deployment](#-build--deployment)Builds the app for production to the `build` folder.\

- [Contributing](#-contributing)It correctly bundles React in production mode and optimizes the build for the best performance.



## 🚀 FeaturesThe build is minified and the filenames include the hashes.\

Your app is ready to be deployed!

### Core Functionality

- **Multi-role Dashboard System**: Tailored interfaces for each user roleSee the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

- **School Management**: Complete school administration for superadmins

- **Student Management**: Registration, profiles, academic tracking### `npm run eject`

- **Teacher Management**: Teacher profiles, subject assignments, schedules

- **Attendance System**: Real-time attendance tracking with multiple status options**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

- **Grade Management**: Grade recording and academic progress tracking

- **Parent Portal**: Child monitoring and communication featuresIf you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

- **Financial Management**: Fee tracking and payment management

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

### User Experience

- **Responsive Design**: Mobile-first approach with responsive layoutsYou don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

- **Real-time Updates**: Live data updates without page refresh

- **Intuitive Navigation**: Role-based navigation menus## Learn More

- **Form Validation**: Client-side validation with user-friendly error messages

- **Loading States**: Proper loading indicators and skeleton screensYou can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

- **Error Handling**: Graceful error handling with user feedback

- **Accessibility**: WCAG compliant components and navigationTo learn React, check out the [React documentation](https://reactjs.org/).


### Technical Features
- **TypeScript**: Full type safety and better development experience
- **Component Library**: Reusable UI components with consistent design
- **HTTP-only Cookies**: Secure authentication token storage
- **File Upload**: Support for documents and images
- **PDF Generation**: Report and document generation capabilities
- **Export Functionality**: Data export in various formats
- **Print Support**: Print-friendly layouts for reports

## 🛠 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **State Management**: React Context API + useState/useReducer
- **Form Handling**: Custom form components with validation
- **Development**: ESLint, TypeScript compiler
- **Testing**: React Testing Library, Jest (planned)

## 📁 Project Structure

```
frontend/
├── public/                        # Static assets
│   ├── favicon.ico               # App favicon
│   ├── logo192.png              # App logo (192x192)
│   ├── logo512.png              # App logo (512x512)
│   ├── manifest.json            # PWA manifest
│   └── robots.txt               # SEO robots file
├── src/
│   ├── components/              # Reusable components
│   │   ├── admin/               # Admin-specific components
│   │   │   ├── StudentForm.tsx  # Student creation/editing form
│   │   │   ├── StudentList.tsx  # Student listing and management
│   │   │   ├── TeacherForm.tsx  # Teacher creation/editing form
│   │   │   └── TeacherList.tsx  # Teacher listing and management
│   │   ├── layout/              # Layout components
│   │   │   └── DashboardLayout.tsx # Main dashboard layout
│   │   ├── superadmin/          # Superadmin-specific components
│   │   │   ├── SchoolForm.tsx   # School creation/editing form
│   │   │   ├── SchoolList.tsx   # School listing and management
│   │   │   └── SchoolDetails.tsx # School details view
│   │   └── ui/                  # Base UI components
│   │       ├── Button.tsx       # Reusable button component
│   │       ├── Card.tsx         # Card component with variants
│   │       └── Input.tsx        # Input component with validation
│   ├── context/                 # React Context providers
│   │   └── AuthContext.tsx      # Authentication context and provider
│   ├── lib/                     # Utility libraries
│   │   └── utils.ts             # General utility functions
│   ├── pages/                   # Main application pages
│   │   ├── AccountantDashboard.tsx # Accountant dashboard
│   │   ├── AdminDashboard.tsx      # Admin dashboard
│   │   ├── LoginPage.tsx           # Login page
│   │   ├── ParentDashboard.tsx     # Parent dashboard
│   │   ├── StudentDashboard.tsx    # Student dashboard
│   │   ├── SuperadminDashboard.tsx # Superadmin dashboard
│   │   └── TeacherDashboard.tsx    # Teacher dashboard
│   ├── services/                # API services
│   │   └── api.ts               # Axios configuration and API methods
│   ├── types/                   # TypeScript type definitions
│   │   └── auth.types.ts        # Authentication-related types
│   ├── utils/                   # Utility functions
│   │   └── cn.ts                # Tailwind class name utilities
│   ├── App.css                  # Global styles
│   ├── App.test.tsx             # App component tests
│   ├── App.tsx                  # Main App component
│   ├── index.css                # Tailwind CSS imports
│   ├── index.tsx                # React entry point
│   ├── logo.svg                 # React logo
│   ├── reportWebVitals.ts       # Performance monitoring
│   ├── setupTests.ts            # Test setup
│   └── vite-env.d.ts            # Vite environment types
├── .gitignore                   # Git ignore rules
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.node.json           # TypeScript config for Node.js
├── vite.config.ts               # Vite configuration
└── README.md                    # This file
```

## 📦 Installation

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager
- Running backend API server

### Step-by-step Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SMS/frontend
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

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## ⚙️ Environment Configuration

Create a `.env` file in the frontend root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=School Management System
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_DEV_TOOLS=true
VITE_ENABLE_LOGGING=true

# External Services (Optional)
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### Environment Variables Reference

- `VITE_API_URL`: Backend API base URL
- `VITE_APP_NAME`: Application display name
- `VITE_APP_VERSION`: Current application version
- `VITE_ENABLE_DEV_TOOLS`: Enable development tools in production
- `VITE_ENABLE_LOGGING`: Enable console logging
- `VITE_ANALYTICS_ID`: Google Analytics tracking ID
- `VITE_SENTRY_DSN`: Sentry error tracking DSN

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Starts the development server with hot module replacement at `http://localhost:3000`.

### Production Preview
```bash
npm run build
npm run preview
```
Builds the application and serves it locally for production preview.

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check
- `npm test` - Run tests (when implemented)

## 👥 User Roles & Dashboards

### Superadmin Dashboard
**Access Level**: System-wide management

#### Key Features:
- **School Management**: Create, edit, delete, and monitor schools
- **System Statistics**: Overview of all schools, students, teachers  
- **API Configuration**: Manage school API keys for external integrations
- **System Settings**: Global configuration and preferences
- **User Management**: Assign roles and manage system users

#### API Configuration Purpose:
The API configurations in school management are designed for **Face Recognition Integration**. Each school receives:
- **Unique API Key**: Secure authentication token for external face recognition systems
- **API Endpoint**: Custom endpoint URL for the school's specific API access
- **Integration Purpose**: Allows external attendance systems (like face recognition apps) to automatically sync attendance data with the school management system

This enables schools to use third-party face recognition devices or mobile apps that can directly update attendance records in real-time.

### Admin Dashboard
**Access Level**: School-specific management

#### Key Features:
- **Student Management**: Register, edit, and manage students (with proper loading states)
- **Teacher Management**: Hire, assign, and manage teaching staff
- **Academic Management**: Subjects, schedules, calendars
- **Reports**: Generate academic and administrative reports
- **School Settings**: Configure school-specific settings

#### Recent Fixes:
- ✅ **Auto-reload Issue Fixed**: Removed double `onSave` calls in StudentForm that were causing page refreshes
- ✅ **Loading States**: Proper loading indicators during CRUD operations
- ✅ **Error Handling**: Improved error messages and user feedback

### Teacher Dashboard
**Access Level**: Class and subject management
- **Class Management**: View assigned classes and students
- **Attendance**: Mark and update student attendance
- **Grades**: Record and update student grades
- **Assignments**: Create and manage homework assignments
- **Schedule**: View teaching schedule and timetable

### Student Dashboard
**Access Level**: Personal academic information
- **Academic Records**: View grades, attendance, and progress
- **Assignments**: View homework and submission status
- **Schedule**: Personal class timetable
- **Announcements**: School and class notifications
- **Profile**: Personal information and academic history

### Parent Dashboard
**Access Level**: Child monitoring and communication
- **Children Overview**: Monitor multiple children
- **Academic Progress**: View child's grades and attendance
- **Communication**: Messages with teachers and school
- **Events**: School events and important dates
- **Fees**: Payment history and pending dues

### Accountant Dashboard
**Access Level**: Financial management
- **Fee Collection**: Track and manage fee payments
- **Transactions**: View all financial transactions
- **Defaulters**: Identify and manage fee defaulters
- **Reports**: Generate financial reports
- **Fine Management**: Levy and track fines

## 🧩 Components Overview

### Layout Components

#### DashboardLayout.tsx
Main layout wrapper providing:
- Navigation sidebar with role-based menu items
- Header with user information and logout
- Main content area with responsive design
- Mobile-friendly hamburger menu

### UI Components

#### Button.tsx
Reusable button component with:
- Multiple variants (primary, secondary, danger, etc.)
- Size options (sm, md, lg)
- Loading state support
- Disabled state styling
- Icon support

#### Card.tsx
Flexible card component featuring:
- Header, content, and footer sections
- Shadow and border variants
- Responsive design
- Hover effects

#### Input.tsx
Enhanced input component with:
- Built-in validation display
- Error message support
- Label and helper text
- Various input types (text, email, password, etc.)
- Icon support

### Feature Components

#### SchoolForm.tsx
Comprehensive school creation/editing form:
- Multi-step form with validation
- Address and contact information sections
- API configuration for external integrations
- Admin assignment functionality
- File upload for school logo

#### StudentForm.tsx *(Recently Fixed)*
Student management form featuring:
- ✅ **Fixed Auto-reload**: No longer calls `onSave` twice on creation
- ✅ **Proper API Flow**: Only updates UI after successful server response
- Personal information collection
- Academic details (grade, section, roll number)
- Parent information and association
- File upload for student photos
- Validation with user-friendly error messages

#### TeacherForm.tsx
Teacher registration and management:
- Personal and professional information
- Subject and qualification details
- Salary and employment information
- Document upload capabilities
- Teaching assignment interface

## 🔐 Authentication Flow

### Login Process
1. **User Access**: User navigates to login page
2. **Credential Input**: Username/email and password entry
3. **API Request**: Credentials sent to `/api/auth/login`
4. **Token Storage**: JWT stored in HTTP-only cookie
5. **Role Redirect**: User redirected to appropriate dashboard
6. **Session Persistence**: User remains logged in across browser sessions

### Authentication Context
```typescript
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}
```

## 🔌 API Integration

### API Service Configuration
```typescript
// Base configuration
const api = axios.create({
  baseURL: `${VITE_API_URL}/api`,
  timeout: 30000,
  withCredentials: true, // Include cookies for authentication
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Key API Features:
- **HTTP-only Cookies**: Secure authentication without localStorage
- **Automatic Retry**: Failed requests retry with exponential backoff
- **Request Interceptors**: Automatic authentication handling
- **Response Interceptors**: Global error handling and token refresh

## 🎨 Styling & UI

### Tailwind CSS Configuration
The application uses Tailwind CSS with custom configuration for:
- **Consistent Design System**: Predefined color palette and spacing
- **Responsive Design**: Mobile-first approach with breakpoint-specific styling
- **Component Variants**: Utility classes for different component states
- **Custom Themes**: Dark/light mode support (planned)

### Design Principles:
- **Accessibility First**: WCAG compliant color contrast and navigation
- **Mobile Responsive**: Optimized for all device sizes
- **Consistent Spacing**: 8px base grid system
- **Loading States**: Skeleton screens and loading indicators
- **Error States**: User-friendly error messages and recovery options

## 🚨 Error Handling

### Recent Improvements:
- ✅ **StudentForm Fix**: Removed optimistic updates causing double saves
- ✅ **Global Error Boundary**: Catches and displays React errors gracefully  
- ✅ **API Error Handling**: Automatic retry and user-friendly error messages
- ✅ **Validation Feedback**: Real-time form validation with clear error states

## 🔧 Development Guidelines

### Recent Bug Fixes Applied:

1. **School Count Display Issue**: 
   - Issue: School count not showing correctly in SuperAdmin dashboard
   - Root Cause: API response handling or loading states
   - Status: Investigated - using `schools.length` which should be correct

2. **Auto-reload Problem**: ✅ **FIXED**
   - Issue: Admin dashboard auto-reloaded when adding students
   - Root Cause: `StudentForm` was calling `onSave` twice (optimistic + API response)
   - Solution: Removed optimistic updates, only call `onSave` after successful API response

3. **API Configuration Documentation**: ✅ **DOCUMENTED**
   - Purpose: Face recognition integration for each school
   - Fields: `apiEndpoint` (unique URL) and `apiKey` (authentication token)
   - Use Case: External attendance systems can sync data automatically

### Development Best Practices:
- **TypeScript First**: All components use proper TypeScript interfaces
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Proper loading indicators for all async operations
- **Accessibility**: WCAG compliant components and navigation
- **Code Splitting**: Lazy loading for improved performance
- **Testing**: Component tests with React Testing Library (planned)

## 📊 Current Status & Known Issues

### ✅ Recently Resolved:
- Auto-reload issue in admin dashboard student management
- API configuration documentation completed
- Comprehensive README files created for both frontend and backend

### 🔍 Current Investigations:
- School count display accuracy in SuperAdmin dashboard
- Performance optimization for large datasets
- Real-time notification system implementation

### 🚀 Upcoming Features:
- Real-time notifications via WebSocket
- Advanced reporting and analytics dashboard
- Mobile app companion
- Offline functionality with service workers
- Multi-language internationalization support

## 📝 Changelog

### Version 1.0.0 (Current) - September 19, 2025
- ✅ Initial release with core functionality
- ✅ Multi-role dashboard system
- ✅ School management for superadmins with API integration
- ✅ Student and teacher management with proper loading states
- ✅ Authentication and authorization with HTTP-only cookies
- ✅ Responsive design implementation
- ✅ **Fixed**: Auto-reload issue in student management
- ✅ **Documented**: API configuration purpose and usage

## 📞 Support

- **Email**: support@schoolmanagement.com
- **Documentation**: Comprehensive READMEs for frontend and backend
- **Issues**: Create GitHub issues for bug reports
- **Feature Requests**: Use GitHub discussions for feature proposals

---

**Last Updated**: September 19, 2025  
**Version**: 1.0.0  
**React**: 18.0+  
**Node.js**: 18.0+ (for development)  
**Status**: Production Ready with Recent Bug Fixes