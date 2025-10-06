# Frontend - School Management System

## 🎨 Overview

Modern, responsive React application for the School Management System with role-based dashboards built using **React 18**, **TypeScript**, **Vite**, and **TailwindCSS**.

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── admin/              # Admin-specific components
│   │   │   └── FeeStructureManagement.tsx  # Fee structure CRUD UI
│   │   ├── accountant/         # Accountant components
│   │   │   └── AccountantFeeCollection.tsx  # Fee collection interface
│   │   ├── teacher/            # Teacher components
│   │   ├── parent/             # Parent components
│   │   │   └── ParentHome.tsx  # Parent dashboard with fee cards
│   │   ├── student/            # Student components
│   │   ├── common/             # Shared components
│   │   ├── layout/             # Layout components
│   │   │   └── MobileNavigation.tsx  # Responsive navigation
│   │   └── ui/                 # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── ...
│   ├── pages/                  # Page components
│   │   ├── AdminDashboard.tsx
│   │   ├── AccountantDashboard.tsx
│   │   ├── TeacherDashboard.tsx
│   │   ├── ParentDashboard.tsx
│   │   ├── StudentDashboard.tsx
│   │   └── LoginPage.tsx
│   ├── services/               # API service layer
│   │   ├── api.ts              # Axios instance
│   │   ├── auth.api.ts         # Authentication APIs
│   │   ├── fee.api.ts          # Fee management APIs
│   │   ├── accountant.api.ts   # Accountant fee collection APIs
│   │   └── ...
│   ├── context/                # React Context
│   │   └── AuthContext.tsx     # Authentication context
│   ├── hooks/                  # Custom React hooks
│   │   └── useToast.ts         # Toast notifications
│   ├── types/                  # TypeScript types
│   │   └── index.ts
│   ├── utils/                  # Utility functions
│   │   └── formatters.ts
│   ├── App.tsx                 # Main app component
│   ├── App.css                 # Global styles
│   ├── index.tsx               # Entry point
│   └── index.css               # TailwindCSS imports
├── public/                     # Static assets
│   ├── favicon.ico
│   └── ...
├── components.json             # shadcn/ui configuration
├── tailwind.config.js          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── package.json                # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- Backend server running

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Application will run on `http://localhost:3000`

## 🎭 User Interfaces

### 1. Admin Dashboard
**Features:**
- School management
- User creation (students, teachers, accountants, parents)
- **Fee Structure Management**
  - Create/Edit/Delete fee structures
  - Add fee components with radio buttons:
    - 📅 **Monthly Fee** - Regular monthly charges
    - ⚡ **One-Time Fee** - Admission, books, uniform, etc.
  - Set due date and late fee percentage
  - View active and inactive structures
- Academic year management
- System settings

**Key Components:**
- `FeeStructureManagement.tsx` - Complete fee structure CRUD interface
- Color-coded badges (Blue for Monthly, Orange for One-Time)
- Mutually exclusive radio buttons for fee type selection

### 2. Accountant Dashboard
**Features:**
- **Fee Collection Interface** (`AccountantFeeCollection.tsx`)
  - Search student by Student ID
  - View complete fee status:
    - **Prominent Due Amount Display** (large, orange, highlighted card)
    - Total fees, paid amount, due amount
    - Pending months count
    - Monthly and one-time fee breakdowns
  - Validate payment amounts
  - Collect fees with multiple payment methods
  - **Automatic one-time fee inclusion** on first payment
  - Receipt generation
  - Transaction history

**UI Highlights:**
- Real-time fee status updates
- Color-coded status badges (green/yellow/red)
- Payment validation before collection
- Month selector for fee collection
- Payment method selection (Cash, UPI, Card, Cheque)

### 3. Teacher Dashboard
**Features:**
- Class management
- Attendance marking
- Homework assignment
- Grade entry
- Student performance tracking

### 4. Parent Dashboard
**Features:**
- Children overview with switcher
- **Comprehensive Fee Information** (`ParentHome.tsx` - `ChildrenFeeCards`)
  - Total fee summary across all children
  - Individual child fee cards showing:
    - Total fees, paid, **due amount** (prominently displayed)
    - Admission fee status with pending amount
    - Next payment due date
    - Pending months count
  - Color-coded fee status (paid/partial/overdue)
  - Gradient cards with visual hierarchy
- View children's:
  - Attendance records
  - Homework assignments
  - Grades and performance
  - Schedule
- School notices and announcements
- Event calendar

### 5. Student Dashboard
**Features:**
- Personal information
- **Fee Status Display** (`StudentDashboard.tsx`)
  - Total fees and paid amount
  - **Due amount prominently displayed**
  - Recent transactions (last 3)
  - Next payment information
- Attendance records
- Homework submissions
- Grades and results
- Class schedule
- School calendar

## 💰 Fee Management UI Features

### Admin - Fee Structure Form

#### Radio Button Implementation
```tsx
<div className="space-y-2">
  <Label>Fee Type</Label>
  <RadioGroup 
    name={`feeType-${index}`}
    value={comp.isOneTime ? "onetime" : "monthly"}
    onValueChange={(value) => 
      updateFeeComponent(index, "isOneTime", value === "onetime")
    }
  >
    {/* Monthly Option - Blue */}
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="monthly" id={`monthly-${index}`} />
      <Label className="flex items-center">
        📅 <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
          MONTHLY
        </span>
      </Label>
    </div>
    
    {/* One-Time Option - Orange */}
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="onetime" id={`onetime-${index}`} />
      <Label className="flex items-center">
        ⚡ <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
          ONE-TIME
        </span>
      </Label>
    </div>
  </RadioGroup>
</div>
```

**Features:**
- Mutually exclusive selection (only one can be selected)
- Color-coded visual feedback
- Clear labels with emojis
- Immutable state updates with React hooks

### Accountant - Fee Collection Interface

#### Prominent Due Amount Display
```tsx
{detailedFeeStatus && detailedFeeStatus.totalDueAmount > 0 && (
  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-4">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-orange-600 font-medium mb-1">
          TOTAL DUE AMOUNT
        </p>
        <p className="text-3xl font-bold text-orange-700">
          ₹{formatCurrency(detailedFeeStatus.totalDueAmount)}
        </p>
        <p className="text-xs text-orange-600 mt-1">
          {detailedFeeStatus.pendingMonths || 0} month(s) pending
        </p>
      </div>
      <AlertCircle className="h-12 w-12 text-orange-400" />
    </div>
  </div>
)}
```

**Features:**
- Large, prominent display (3xl font)
- Orange/red gradient background
- Alert icon for visibility
- Shows pending months count
- Only appears when dues exist

### Parent - Fee Summary Cards

#### Children Fee Status
```tsx
<div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-lg font-semibold">{child.name}</h4>
      <p className="text-sm">Grade {child.grade}</p>
    </div>
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
      child.feeStatus === "paid" ? "bg-green-100 text-green-800" :
      child.feeStatus === "partial" ? "bg-yellow-100 text-yellow-800" :
      "bg-red-100 text-red-800"
    }`}>
      {child.feeStatus}
    </span>
  </div>
</div>
```

**Features:**
- Gradient card headers
- Color-coded status badges
- Grid layout for fee breakdown
- Admission fee alerts (if pending)
- Next due payment display

## 🎨 Styling

### TailwindCSS
- Utility-first CSS framework
- Custom color palette:
  - Admin: Orange (`orange-500`, `orange-600`)
  - Accountant: Purple (`purple-500`, `purple-600`)
  - Teacher: Blue (`blue-500`, `blue-600`)
  - Parent: Pink (`pink-500`, `pink-600`)
  - Student: Indigo (`indigo-500`, `indigo-600`)

### shadcn/ui Components
- Pre-built accessible components
- Customizable with TailwindCSS
- Components used:
  - Button, Card, Input, Select
  - Dialog, Alert, Badge
  - RadioGroup, Tabs, Table

### Responsive Design
- Mobile-first approach
- Breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
- Responsive navigation
- Touch-friendly UI elements

## 🔌 API Integration

### Service Layer Architecture
```typescript
// services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Fee API Service
```typescript
// services/fee.api.ts
export const feeApi = {
  // Admin endpoints
  createFeeStructure: (data) => api.post('/fee-structures', data),
  getFeeStructures: (params) => api.get('/fee-structures', { params }),
  updateFeeStructure: (id, data) => api.put(`/fee-structures/${id}`, data),
  
  // Accountant endpoints
  searchStudent: (studentId) => 
    api.post('/accountant-fees/search-student', { studentId }),
  getStudentFeeStatus: (studentId, academicYear?) => 
    api.get(`/accountant-fees/students/${studentId}/fee-status`, 
      { params: { academicYear } }),
  validateFeeCollection: (data) => 
    api.post('/accountant-fees/validate', data),
  collectFee: (data) => 
    api.post('/accountant-fees/collect', data),
  
  // Parent/Student endpoints
  getParentChildrenFees: () => api.get('/parents/children-fees'),
  getStudentFeeStatus: (studentId) => 
    api.get(`/students/${studentId}/fee-status`),
};
```

## 🔐 Authentication

### AuthContext
```typescript
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Protected Routes
```typescript
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};
```

## 🛠️ Development

### Build for Production
```bash
npm run build
```

Output in `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

## 🐛 Common Issues

### API Connection Failed
- Check `VITE_API_URL` in `.env`
- Verify backend server is running
- Check CORS configuration on backend

### Authentication Not Working
- Clear localStorage: `localStorage.clear()`
- Check JWT token expiration
- Verify API endpoint URLs

### UI Components Not Styled
- Check TailwindCSS is properly configured
- Verify `@/` path alias in `vite.config.ts`
- Run `npm install` to ensure all dependencies installed

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npm run type-check`

## 🚀 Deployment

### Build
```bash
npm run build
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Set `VITE_API_URL` to your production backend URL.

## 📱 Mobile Responsiveness

- Touch-optimized UI
- Responsive navigation (hamburger menu on mobile)
- Adaptive layouts (grid to column on small screens)
- Mobile-friendly forms
- Swipe gestures support
- Optimized for iOS and Android browsers

## ♿ Accessibility

- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader compatible
- Color contrast compliance (WCAG AA)

## 🎯 Performance

- Code splitting with React.lazy
- Lazy loading of routes
- Image optimization
- Minification and tree-shaking
- Gzip compression
- CDN-ready static assets

---

**Frontend Team** - SMS Project
