# School Management System (SMS)

A comprehensive School Management System built with **MERN Stack** (MongoDB, Express, React, Node.js) featuring role-based dashboards, fee management, attendance tracking, homework management, and more.

## 🚀 Features

### 📊 Multi-Role System
- **Admin Dashboard**: School administration, user management, fee structure configuration
- **Teacher Dashboard**: Class management, attendance marking, homework assignment
- **Parent Dashboard**: Monitor children's progress, fees, attendance, and homework
- **Student Dashboard**: View homework, attendance, grades, and fee status
- **Accountant Dashboard**: Fee collection, payment tracking, financial reports

### 💰 Comprehensive Fee Management System
- **Fee Structure Management**
  - Create fee structures by grade and academic year
  - Support for monthly fees and one-time fees (admission, books, etc.)
  - Automatic calculation of yearly totals
  - Late fee configuration (percentage-based)
  - Due date settings for monthly payments

- **Fee Collection (Accountant)**
  - Search students by ID for quick access
  - Real-time fee status display (paid, due, overdue)
  - Automatic one-time fee collection with first payment
  - Payment validation and receipt generation
  - Multiple payment methods (cash, UPI, card, check)
  - Transaction history and audit trail

- **Auto-Sync Technology**
  - Automatically updates student fee records when admin creates new structures
  - Preserves all paid amounts and transaction history
  - Recalculates dues based on latest fee structure
  - No manual intervention required

- **Parent & Student Fee Visibility**
  - View total fees, paid amounts, and dues
  - See pending month breakdowns
  - Admission fee status tracking
  - Next payment due date alerts
  - Recent transaction history

### 📚 Attendance & Academic Management
- Mark attendance for entire classes or individual students
- Homework assignment and submission tracking
- Grade and performance monitoring
- Schedule and timetable management

### 📅 Calendar & Events
- School-wide event calendar
- Parent-teacher meeting scheduling
- Holiday and important date tracking

### 🔔 Notifications & Communication
- School notices and announcements
- Parent-teacher communication
- Homework and attendance alerts

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **TypeScript** - Type-safe development
- **JWT** - Authentication and authorization
- **Zod** - Schema validation
- **bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client

## 📁 Project Structure

```
SMS/
├── backend/                    # Node.js + Express backend
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/       # Feature modules
│   │   │   │   ├── fee/       # Fee management (structures, collection, transactions)
│   │   │   │   ├── user/      # User management
│   │   │   │   ├── student/   # Student management
│   │   │   │   ├── attendance/# Attendance tracking
│   │   │   │   ├── homework/  # Homework management
│   │   │   │   └── ...
│   │   │   ├── middlewares/   # Auth, validation, error handling
│   │   │   └── errors/        # Custom error classes
│   │   ├── config/            # Database, environment configs
│   │   └── server.ts          # Express server setup
│   ├── scripts/               # Database seeding and utility scripts
│   └── package.json
│
├── frontend/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── admin/         # Admin-specific components
│   │   │   ├── accountant/    # Accountant fee collection UI
│   │   │   ├── teacher/       # Teacher components
│   │   │   ├── parent/        # Parent components
│   │   │   └── ui/            # shadcn/ui components
│   │   ├── pages/             # Page components (dashboards)
│   │   ├── services/          # API service layer
│   │   ├── context/           # React context (auth, etc.)
│   │   └── App.tsx
│   └── package.json
│
└── README.md                   # This file
```

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) - Running locally or MongoDB Atlas
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SMS
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

   Create `.env` file in `backend/` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # Database
   DATABASE_URL=mongodb://localhost:27017/school-management
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   # CORS
   CLIENT_URL=http://localhost:3000
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

   Create `.env` file in `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start Backend Server** (from `backend/` directory)
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

2. **Start Frontend** (from `frontend/` directory)
   ```bash
   npm run dev
   ```
   Application runs on `http://localhost:3000`

## 👥 User Roles & Credentials

After initial setup, you'll need to create users with appropriate roles:

### Admin
- Full system access
- Create schools, teachers, students, and accountants
- Configure fee structures
- Manage academic years and grades

### Accountant
- Search students and view fee status
- Collect fees and generate receipts
- View transaction history
- Cannot modify fee structures

### Teacher
- Mark attendance
- Assign and grade homework
- View class schedules
- Communicate with parents

### Parent
- View children's attendance and grades
- Check fee status and payment history
- Review homework assignments
- Receive school notices

### Student
- View attendance and grades
- Submit homework
- Check fee status
- Access class schedule

## 💡 Key Features Explained

### Fee Management System

#### 1. **Creating Fee Structures (Admin)**
- Navigate to Admin Dashboard → Fee Management
- Click "Create Fee Structure"
- Select grade and academic year
- Add fee components:
  - **Monthly Fees**: Regular monthly payments (tuition, transport, etc.)
  - **One-Time Fees**: One-off charges (admission, books, uniform, etc.)
- Set due date (day of month for monthly payments)
- Configure late fee percentage
- System automatically calculates yearly total: `(Monthly × 12) + One-Time Fees`

#### 2. **Fee Collection (Accountant)**
- Search student by Student ID
- View complete fee status:
  - Total fees for the year
  - Amount paid
  - **Due amount (prominently displayed)**
  - Pending months
  - Admission fee status
- Select month and enter amount
- System validates payment amount
- **First Payment Auto-Collection**: 
  - Automatically includes all one-time fees with first monthly payment
  - Creates separate transactions for clarity
  - Shows breakdown to accountant
- Choose payment method and complete transaction

#### 3. **Auto-Sync Technology**
- When admin creates a new fee structure for a grade:
  - System detects all students in that grade
  - **Automatically updates their fee records** to the latest structure
  - **Preserves all paid amounts** - no data loss
  - Recalculates totals and dues based on new structure
  - Updates monthly payment schedule
- Next time accountant loads that student's fee status, they see the latest structure
- **No manual intervention required!**

#### 4. **Parent & Student View**
- Real-time fee status on dashboard
- Color-coded status indicators (paid/partial/overdue)
- Detailed breakdown of fees:
  - Total annual fees
  - Paid amount (green)
  - Due amount (orange, bold, prominently displayed)
  - Pending months count
- Admission fee tracking (if applicable)
- Recent transaction history
- Next payment due date

### Attendance System
- Teacher marks attendance for entire class
- Real-time updates visible to parents and students
- Attendance percentage calculation
- Monthly and yearly reports

### Homework Management
- Teachers assign homework with due dates
- Students submit assignments online
- Parents monitor completion status
- Automatic notifications for pending homework

## 🔒 Security Features

- **JWT-based authentication**
- **Password hashing** with bcrypt
- **Role-based access control** (RBAC)
- **Input validation** with Zod schemas
- **CORS protection**
- **XSS prevention**
- **SQL injection prevention** (NoSQL database)

## 🧪 Development Scripts

### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run seed         # Run database seeding scripts
```

### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📊 Database Seeding

Utility scripts in `backend/scripts/` for database operations:

```bash
# Check database contents
npx ts-node scripts/listActualData.ts

# Seed fee structures
npx ts-node scripts/seedFeeStructures.ts

# Check student data
npx ts-node scripts/checkStudents.ts

# Diagnose specific student
npx ts-node scripts/diagnoseStudent.ts
```

## ✅ Recent Fixes (v1.0.0 - October 2025)

### 🎯 Critical Bug Fixes Completed

#### 1. One-Time Fees Calculation ✅
**Issue**: After payment collection, due amounts weren't including one-time fees.
**Root Cause**: Pre-save hook only calculated `totalPaidAmount` from monthly payments.
**Fix**: Modified hook to sum both monthly and one-time fees:
```typescript
totalPaidAmount = monthlyPaid + oneTimePaid
```
**Impact**: Now correctly reflects all payments in paid/due calculations.

#### 2. dueDate Validation Error ✅
**Issue**: "Path `dueDate` is required" when creating fee records with one-time fees.
**Root Cause**: One-time fees schema had `required: true` for dueDate.
**Fix**: Changed to `required: false` (one-time fees don't have specific due dates).
**Impact**: Fee records create successfully without validation errors.

#### 3. Financial Dashboard Crash ✅
**Issue**: "Cannot read properties of undefined (reading 'bySeverity')" error.
**Root Cause**: Missing null checks for nested defaulters data.
**Fix**: Added comprehensive null safety with optional chaining.
**Impact**: Dashboard loads gracefully even without complete data.

#### 4. Auto-Creation of Fee Records ✅
**Issue**: Students showing null fee status in accountant dashboard.
**Root Cause**: Fee records not created automatically for new students.
**Fix**: Auto-create records when loading student list (if fee structure exists).
**Impact**: All students show proper fee status or helpful message.

#### 5. Console Log Cleanup ✅
**Issue**: Excessive debug logging in production.
**Fix**: Removed all console.logs from frontend and backend.
**Impact**: Clean console output, kept only critical error logging.

### 📊 Testing Status
- ✅ All authentication flows working
- ✅ Fee structure management tested
- ✅ Payment collection verified (monthly + one-time)
- ✅ Auto-sync feature working
- ✅ All dashboards loading without errors
- ✅ Database operations validated

**See [TESTING_REPORT.md](./TESTING_REPORT.md) for comprehensive test results.**

**Status**: 🚀 **PRODUCTION READY**

---
## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📧 Contact

For questions or support, please contact the development team.

---

**Built with ❤️ by Abu Horaira(https://github.com/Ahnabu) & Habibur Rahman(https://github.com/habib-153)**
