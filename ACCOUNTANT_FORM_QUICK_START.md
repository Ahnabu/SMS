# Accountant Form - Quick Start Guide

## Overview
The AccountantForm component provides a complete interface for creating new accountants with automatic credential generation, photo upload to Cloudinary, and comprehensive validation.

## Key Features
- ✅ **Photo Upload**: 3-10 photos required (Cloudinary storage)
- ✅ **Form Validation**: Real-time validation with clear error messages
- ✅ **Error Handling**: User-friendly messages for all validation errors
- ✅ **Credential Generation**: Automatic username/password creation
- ✅ **Photo Preview**: Thumbnail grid with remove option

## Quick Implementation

### 1. Import the Component
```tsx
import AccountantForm from '@/components/admin/accountant/AccountantForm';
```

### 2. Use in Your Page
```tsx
function AccountantPage() {
  const navigate = useNavigate();

  return (
    <AccountantForm
      onBack={() => navigate('/admin/accountants')}
      onSuccess={() => {
        // Refresh list or navigate
        navigate('/admin/accountants');
      }}
    />
  );
}
```

## Photo Requirements

### Validation Rules
- **Minimum**: 3 photos required
- **Maximum**: 10 photos allowed
- **File Types**: JPG, PNG, GIF only
- **File Size**: Max 10MB per photo
- **Storage**: Cloudinary (secure cloud storage)

### Error Messages
```
"At least 3 photos are required"              // < 3 photos
"Maximum 10 photos allowed"                   // > 10 photos
"Each photo must be under 10MB"              // File too large
"Only image files (JPG, PNG, GIF) are allowed"  // Wrong file type
"{filename} exceeds 10MB limit"              // Specific file error
"{filename} is not an image file"            // Specific type error
```

## Form Fields

### Required Fields
- First Name
- Last Name
- Date of Birth (age 21-65)
- Designation (dropdown)
- Department (dropdown)
- Blood Group (dropdown)
- Address City
- Address State
- Address Zip Code
- At least 1 Qualification
- Emergency Contact Name
- Emergency Contact Relationship
- Emergency Contact Phone
- **Photos (3-10 required)**

### Optional Fields
- Email
- Phone
- Join Date
- Street Address
- Country (defaults to "Bangladesh")
- Emergency Contact Email
- Salary Information
- Work Experience Details

## Photo Upload Process

### Step 1: Select Photos
```tsx
<input
  type="file"
  accept="image/*"
  multiple
  onChange={handlePhotoUpload}
/>
```

### Step 2: Preview Photos
Photos appear in a grid with:
- Thumbnail preview
- Photo number indicator
- Remove button
- Counter display (X/10 photos)

### Step 3: Validation
- Automatic file type check
- Automatic size validation  
- Count validation (3-10)
- Error toasts for invalid files

### Step 4: Upload to Cloudinary
- Happens during form submission
- Automatic folder structure
- Secure URL generation
- Metadata storage in database

## Error Handling Examples

### Photo Errors
```tsx
// Not enough photos
if (photos.length < 3) {
  showToast.error("At least 3 photos are required");
}

// Too many photos
if (photos.length > 10) {
  showToast.error("Maximum 10 photos allowed");
}

// File too large
if (file.size > 10 * 1024 * 1024) {
  showToast.error(`${file.name} exceeds 10MB limit`);
}

// Wrong file type
if (!file.type.startsWith('image/')) {
  showToast.error(`${file.name} is not an image file`);
}
```

### Field Errors
```tsx
// Client-side validation
const errors = {};
if (!firstName.trim()) {
  errors.firstName = "First name is required";
}
if (!city.trim()) {
  errors["address.city"] = "City is required";
}
if (qualifications.length === 0) {
  errors.qualifications = "At least one qualification required";
}
```

## Credential Display

After successful creation, a modal shows:
```
┌─────────────────────────────────────┐
│  Accountant Credentials Generated   │
├─────────────────────────────────────┤
│  Accountant ID: SCH001-ACC-2025-001 │
│  Employee ID: SCH001-EMP-ACC-2025-001│
│  Username: sch001acc2025001         │
│  Temporary Password: Temp@Pass123   │
│  ⚠️  Must change on first login      │
└─────────────────────────────────────┘
```

## Integration with AdminDashboard

### Option 1: Direct Route
```tsx
<Route path="/admin/accountants/new" element={<AccountantForm />} />
```

### Option 2: With State Management
```tsx
function AccountantManagement() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [refresh, setRefresh] = useState(0);

  return (
    <>
      {view === 'list' && (
        <AccountantList
          key={refresh}
          onAddNew={() => setView('form')}
        />
      )}
      {view === 'form' && (
        <AccountantForm
          onBack={() => setView('list')}
          onSuccess={() => {
            setView('list');
            setRefresh(prev => prev + 1);
          }}
        />
      )}
    </>
  );
}
```

## API Request Format

### FormData Structure
```typescript
const formData = new FormData();

// Basic fields
formData.append('schoolId', user.schoolId);
formData.append('firstName', 'John');
formData.append('lastName', 'Doe');
formData.append('designation', 'Accountant');
formData.append('department', 'Finance');
formData.append('bloodGroup', 'O+');
formData.append('dob', '1990-01-01');

// Complex objects as JSON
formData.append('qualifications', JSON.stringify([
  {
    degree: 'B.Com',
    institution: 'University',
    year: 2015,
    specialization: 'Finance'
  }
]));

formData.append('experience', JSON.stringify({
  totalYears: 5,
  previousCompanies: []
}));

formData.append('address', JSON.stringify({
  street: '123 Main St',
  city: 'Dhaka',
  state: 'Dhaka',
  zipCode: '1200',
  country: 'Bangladesh'
}));

formData.append('emergencyContact', JSON.stringify({
  name: 'Jane Doe',
  relationship: 'Spouse',
  phone: '+8801712345678',
  email: 'jane@example.com'
}));

// Photos (3-10 files)
photos.forEach(photo => {
  formData.append('photos', photo);
});
```

## Testing Checklist

### Photo Upload Tests
- [ ] Upload exactly 3 photos → Success
- [ ] Upload 10 photos → Success
- [ ] Try to upload 11 photos → Error: "Maximum 10 photos allowed"
- [ ] Try to upload 2 photos → Error: "At least 3 photos required"
- [ ] Upload 11MB file → Error: "{filename} exceeds 10MB limit"
- [ ] Upload .pdf file → Error: "{filename} is not an image file"
- [ ] Remove photo from preview → Count updates correctly

### Form Validation Tests
- [ ] Submit empty form → All required field errors shown
- [ ] Fill all required fields except photos → Photo error shown
- [ ] Enter invalid email → Email format error
- [ ] Select DOB with age < 21 → Age validation error
- [ ] Leave city empty → "City is required" error
- [ ] Remove all qualifications → Qualification error

### Success Flow Tests
- [ ] Submit valid form with 5 photos → Success
- [ ] Credentials modal appears → Shows all credentials
- [ ] Form resets after close → All fields cleared
- [ ] Photos upload to Cloudinary → Check database
- [ ] onSuccess callback fires → List refreshes

## Common Issues

### Issue: "At least 3 photos are required"
**Cause**: Trying to submit with < 3 photos
**Fix**: Upload at least 3 photos before submitting

### Issue: "{filename} exceeds 10MB limit"
**Cause**: Photo file size > 10MB
**Fix**: Compress or resize the photo before upload

### Issue: "Maximum 10 photos allowed"
**Cause**: Trying to upload > 10 photos
**Fix**: Remove some photos to stay within limit

### Issue: Form submits but photos don't upload
**Cause**: Backend Cloudinary configuration issue
**Fix**: Check CLOUDINARY_* environment variables

### Issue: Photos preview not showing
**Cause**: FileReader error or browser compatibility
**Fix**: Check browser console for errors

## Pro Tips

### 1. Photo Selection
```tsx
// Allow multiple photo selection at once
<input type="file" multiple accept="image/*" />
```

### 2. Photo Preview
```tsx
// Create URL for instant preview
const previewUrl = URL.createObjectURL(file);
// Remember to revoke when done
URL.revokeObjectURL(previewUrl);
```

### 3. Validation Feedback
```tsx
// Show count while uploading
<p className="text-blue-600">
  {photos.length}/10 photos uploaded
</p>
```

### 4. Error Recovery
```tsx
// Clear errors on input change
onChange={(e) => {
  handleChange('field', e.target.value);
  // Error automatically clears
}}
```

### 5. Loading State
```tsx
// Show progress during upload
{isSubmitting && (
  <div className="loading-overlay">
    <p>Creating accountant profile...</p>
    <p className="text-sm">Uploading photos to Cloudinary</p>
  </div>
)}
```

## Photo Guidelines Display

The form shows helpful guidelines:
```
Photo Guidelines:
• Upload 3-10 professional photos
• Use clear, well-lit images
• Each photo must be under 10MB
• Accepted formats: JPG, PNG, GIF
• Photos will be stored securely in Cloudinary
```

## Student & Teacher Form Improvements

The same photo error handling improvements automatically apply to:
- **StudentForm.tsx**: Now shows clear photo error messages
- **TeacherForm.tsx**: Now shows clear photo error messages

### Before
```
Error: ". is required"  ❌ Confusing!
```

### After
```
Error: "Please upload at least 3 photos (3-10 photos required)"  ✅ Clear!
```

## Keyboard Shortcuts

- **Tab**: Navigate between fields
- **Enter**: Submit form (when focus on submit button)
- **Escape**: Close credentials modal

## Accessibility Features

- ✅ Proper label-input associations
- ✅ ARIA labels for file inputs
- ✅ Error messages linked to fields
- ✅ Keyboard navigation support
- ✅ Screen reader friendly

## Next Steps

1. **Test the form** with various photo counts
2. **Verify Cloudinary upload** in your environment
3. **Check database** for photo metadata
4. **Test credential generation** and login
5. **Integrate with AdminDashboard** routing

## Support

For issues or questions:
1. Check the build output for TypeScript errors
2. Review browser console for runtime errors
3. Check network tab for API failures
4. Verify Cloudinary configuration
5. Check backend logs for upload errors

---

**Status**: ✅ Ready for Production
**Build**: ✅ No Errors
**Tests**: Ready for QA
**Documentation**: Complete
