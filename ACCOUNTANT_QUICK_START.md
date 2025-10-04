# Accountant Management - Quick Start Guide

## Overview
This guide provides step-by-step instructions for using the newly implemented accountant management system.

---

## For Backend Developers

### 1. Testing the API

#### Create an Accountant
```bash
curl -X POST http://localhost:5000/api/accountants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "schoolId": "YOUR_SCHOOL_ID",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@school.com",
    "phone": "+1234567890",
    "department": "Finance",
    "designation": "Senior Accountant",
    "bloodGroup": "O+",
    "dob": "1985-05-15",
    "joinDate": "2025-10-01",
    "qualifications": [{
      "degree": "MBA in Finance",
      "institution": "Business School",
      "year": 2010,
      "specialization": "Financial Management"
    }],
    "experience": {
      "totalYears": 12,
      "previousOrganizations": [{
        "organizationName": "ABC Corp",
        "position": "Accountant",
        "duration": "5 years",
        "fromDate": "2013-01-01",
        "toDate": "2018-01-01"
      }]
    },
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "+1234567891",
      "email": "jane.doe@email.com"
    },
    "salary": {
      "basic": 50000,
      "allowances": 10000,
      "deductions": 5000
    },
    "responsibilities": [
      "Monthly financial reporting",
      "Budget management",
      "Payroll processing"
    ],
    "certifications": [
      "CPA",
      "CMA"
    ],
    "isActive": true
  }'
```

#### Get All Accountants
```bash
curl -X GET "http://localhost:5000/api/accountants?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Get Accountant by ID
```bash
curl -X GET "http://localhost:5000/api/accountants/ACCOUNTANT_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Update Accountant
```bash
curl -X PATCH "http://localhost:5000/api/accountants/ACCOUNTANT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "designation": "Chief Accountant",
    "salary": {
      "basic": 60000,
      "allowances": 12000,
      "deductions": 6000
    }
  }'
```

#### Delete Accountant
```bash
curl -X DELETE "http://localhost:5000/api/accountants/ACCOUNTANT_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Get Accountant Credentials
```bash
curl -X GET "http://localhost:5000/api/accountants/SCH001-ACC-2025-001/credentials" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Reset Accountant Password
```bash
curl -X POST "http://localhost:5000/api/accountants/SCH001-ACC-2025-001/credentials/reset" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Get Accountant Statistics
```bash
curl -X GET "http://localhost:5000/api/accountants/stats/SCHOOL_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## For Frontend Developers

### 1. Import the AccountantList Component

```tsx
import { AccountantList } from "@/components/admin/accountant/AccountantList";
```

### 2. Use the Component

```tsx
const [selectedAccountant, setSelectedAccountant] = useState(null);
const [showForm, setShowForm] = useState(false);
const [viewMode, setViewMode] = useState<'list' | 'form' | 'detail'>('list');

<AccountantList
  onCreateAccountant={() => {
    setSelectedAccountant(null);
    setViewMode('form');
    setShowForm(true);
  }}
  onEditAccountant={(accountant) => {
    setSelectedAccountant(accountant);
    setViewMode('form');
    setShowForm(true);
  }}
  onViewAccountant={(accountant) => {
    setSelectedAccountant(accountant);
    setViewMode('detail');
  }}
/>
```

### 3. Using the Admin API

```tsx
import { adminApi } from "@/services/admin.api";

// Create accountant
const createAccountant = async (data) => {
  try {
    const response = await adminApi.createAccountant(data);
    if (response.data.success) {
      console.log("Accountant created:", response.data.data);
      // Save credentials for admin
      console.log("Credentials:", response.data.data.credentials);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Get accountants with filters
const getAccountants = async () => {
  try {
    const response = await adminApi.getAccountants({
      page: 1,
      limit: 20,
      department: "Finance",
      isActive: true,
      search: "john"
    });
    if (response.data.success) {
      console.log("Accountants:", response.data.data);
      console.log("Total:", response.data.meta.total);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Update accountant
const updateAccountant = async (id, data) => {
  try {
    const response = await adminApi.updateAccountant(id, data);
    if (response.data.success) {
      console.log("Updated:", response.data.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Delete accountant
const deleteAccountant = async (id) => {
  try {
    const response = await adminApi.deleteAccountant(id);
    if (response.data.success) {
      console.log("Deleted successfully");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Get statistics
const getStats = async (schoolId) => {
  try {
    const response = await adminApi.getAccountantStats(schoolId);
    if (response.data.success) {
      console.log("Stats:", response.data.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

---

## Data Models

### Accountant Interface (TypeScript)

```typescript
interface Accountant {
  id: string;
  userId: string;
  schoolId: string;
  accountantId: string;  // Auto-generated: SCH001-ACC-2025-001
  employeeId?: string;   // Auto-generated: SCH001-EMP-ACC-2025-001
  department: 'Finance' | 'Payroll' | 'Accounts Payable' | 'Accounts Receivable' | 
              'Budget Management' | 'Financial Reporting' | 'Audit' | 'Tax' | 
              'General Accounting';
  designation: 'Chief Financial Officer' | 'Finance Manager' | 'Chief Accountant' | 
               'Senior Accountant' | 'Accountant' | 'Junior Accountant' | 
               'Accounts Assistant' | 'Payroll Officer' | 'Financial Analyst' | 'Auditor';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  dob: Date;
  joinDate: Date;
  qualifications: Qualification[];
  experience: Experience;
  address: Address;
  emergencyContact: EmergencyContact;
  salary?: Salary;
  responsibilities: string[];
  certifications?: string[];
  isActive: boolean;
  age: number;  // Calculated
  totalExperience: number;  // Calculated
  createdAt: Date;
  updatedAt: Date;
  user?: UserInfo;
  school?: SchoolInfo;
  photoCount: number;
}
```

### Response Format

#### Success Response
```json
{
  "success": true,
  "message": "Accountant created successfully",
  "data": {
    "id": "67012345abc",
    "accountantId": "SCH001-ACC-2025-001",
    "employeeId": "SCH001-EMP-ACC-2025-001",
    "user": {
      "id": "67012345xyz",
      "username": "sch001acc2025001",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "email": "john.doe@school.com",
      "phone": "+1234567890"
    },
    "department": "Finance",
    "designation": "Senior Accountant",
    "isActive": true,
    "age": 40,
    "totalExperience": 12,
    "credentials": {
      "username": "sch001acc2025001",
      "password": "SCH001-ACC-2025-001-A3F9",
      "accountantId": "SCH001-ACC-2025-001",
      "message": "Please save these credentials. Default password should be changed on first login."
    }
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error message here",
  "errorMessages": [{
    "path": "field_name",
    "message": "Specific error"
  }],
  "stack": "Error stack (in development mode)"
}
```

---

## Common Scenarios

### Scenario 1: Creating a New Accountant
1. Admin logs in
2. Navigates to Accountants section
3. Clicks "Add Accountant"
4. Fills in the form
5. Optionally uploads photos
6. Submits the form
7. System generates unique accountant ID
8. System creates user account
9. System generates credentials
10. Admin receives and saves credentials
11. Accountant can log in with provided credentials

### Scenario 2: Searching for an Accountant
1. Admin navigates to Accountants list
2. Uses filters (department, designation, status)
3. Or uses search box (by ID or name)
4. Results update in real-time
5. Can view details, edit, or delete

### Scenario 3: Resetting Accountant Password
1. Admin navigates to accountant details
2. Clicks "Reset Password"
3. System generates new temporary password
4. Admin receives new credentials
5. Admin provides credentials to accountant
6. Accountant must change password on first login

### Scenario 4: Viewing Department Statistics
1. Admin navigates to Accountants dashboard
2. Views statistics card showing:
   - Total accountants
   - Active vs inactive
   - By department breakdown
   - By designation breakdown
   - By experience range
   - Recent joinings

---

## Validation Rules

### Required Fields
- `firstName` (1-50 characters)
- `lastName` (1-50 characters)
- `department` (from enum)
- `designation` (from enum)
- `bloodGroup` (from enum)
- `dob` (age must be 21-65)
- `qualifications` (at least 1)
- `experience.totalYears` (0-45)
- `address.city`
- `address.state`
- `address.zipCode` (5-6 digits)
- `address.country`
- `emergencyContact.name`
- `emergencyContact.relationship`
- `emergencyContact.phone`

### Optional Fields
- `email` (must be valid email format)
- `phone` (must be valid phone format)
- `employeeId`
- `joinDate` (defaults to today)
- `salary` (all fields must be non-negative)
- `responsibilities`
- `certifications`
- `photos` (up to 20)

---

## File Upload

### Photo Upload
- **Supported formats**: JPEG, JPG, PNG
- **Maximum size**: 10MB per file
- **Maximum count**: 20 photos per accountant
- **Folder structure**: `storage/{SchoolName}/Accountants/accountant@{firstName}@{age}@{bloodGroup}@{joinDate}@{accountantId}`

Example: `storage/Springfield High School/Accountants/accountant@john@40@O+@2025-10-01@SCH001-ACC-2025-001`

---

## Troubleshooting

### Issue: "Accountant ID already exists"
**Solution**: This should never happen due to sequential generation. Check for race conditions or contact support.

### Issue: "Username already exists"
**Solution**: The system appends numbers to usernames if conflicts occur. Contact support if this persists.

### Issue: "School not found"
**Solution**: Ensure the schoolId is valid and the school is active.

### Issue: "Photo upload failed"
**Solution**: 
- Check file size (max 10MB)
- Check file format (JPEG, JPG, PNG only)
- Check photo count (max 20)
- Verify storage folder permissions

### Issue: "Age validation failed"
**Solution**: Accountant age must be between 21 and 65 years. Check date of birth.

---

## Security Notes

1. **Authentication Required**: All endpoints require valid JWT token
2. **Authorization**: Only Admin and Superadmin roles can manage accountants
3. **School Scoping**: Users can only access accountants from their own school
4. **Password Security**: 
   - Passwords are hashed with bcrypt (12 rounds)
   - Temporary passwords expire on first login
   - Password reset generates new random suffix
5. **Data Validation**: All inputs are validated before processing
6. **Transaction Safety**: Create/Update/Delete operations use MongoDB transactions

---

## Performance Tips

1. Use pagination for large lists (`?page=1&limit=20`)
2. Use specific filters to reduce result sets
3. Search is case-insensitive and partial match
4. Indexes are optimized for common queries
5. Photo uploads are processed asynchronously

---

## Need Help?

- Check the main documentation: `ACCOUNTANT_IMPLEMENTATION_SUMMARY.md`
- Review the API endpoints in the backend route files
- Check the validation schemas for field requirements
- Review the interfaces for TypeScript type definitions
- Test endpoints using the provided curl examples

---

## Next Steps

After familiarizing yourself with the basic accountant management:

1. Implement AccountantForm.tsx for creating/editing
2. Implement AccountantDetailView.tsx for viewing details
3. Add photo upload functionality
4. Integrate with AdminDashboard
5. Add export functionality (CSV/Excel)
6. Implement bulk import
7. Add advanced analytics
8. Create reports
9. Add email notifications

---

**Last Updated**: October 4, 2025
**Version**: 1.0.0
**Status**: Backend Complete, Frontend Partial
