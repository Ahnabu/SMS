import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiService } from '../../services/api';

interface Student {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  studentId: string;
  class: string;
  section: string;
  rollNumber: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  parent: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
  isActive: boolean;
  admissionDate: string;
}

interface StudentFormProps {
  student?: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
}

const StudentForm: React.FC<StudentFormProps> = ({
  student,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Student>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    studentId: '',
    class: '',
    section: '',
    rollNumber: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    parent: {
      name: '',
      email: '',
      phone: '',
    },
    isActive: true,
    admissionDate: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        dateOfBirth: student.dateOfBirth?.split('T')[0] || '',
        admissionDate: student.admissionDate?.split('T')[0] || '',
        address: student.address || {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
        },
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        studentId: '',
        class: '',
        section: '',
        rollNumber: '',
        dateOfBirth: '',
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
        },
        parent: {
          name: '',
          email: '',
          phone: '',
        },
        isActive: true,
        admissionDate: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [student, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!formData.class.trim()) newErrors.class = 'Class is required';
    if (!formData.section.trim()) newErrors.section = 'Section is required';
    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!formData.admissionDate) newErrors.admissionDate = 'Admission date is required';
    
    // Parent validation
    if (!formData.parent.name.trim()) newErrors.parentName = 'Parent name is required';
    if (!formData.parent.email.trim()) newErrors.parentEmail = 'Parent email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parent.email)) {
      newErrors.parentEmail = 'Invalid parent email format';
    }
    if (!formData.parent.phone.trim()) newErrors.parentPhone = 'Parent phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      console.log('Sending student data:', JSON.stringify(formData, null, 2));

      if (student?.id) {
        // Update existing student
        const response = await apiService.admin.updateStudent(student.id, formData);
        if (response.data.success) {
          onSave({ ...formData, id: student.id, ...response.data.data });
        }
      } else {
        // Create new student - only call onSave after successful API response
        const response = await apiService.admin.createStudent(formData);
        if (response.data.success) {
          onSave({ ...formData, ...response.data.data });
        }
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to save student:', error);
      console.error('Error response data:', error.response?.data);
      
      let errorMessage = 'Failed to save student. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.replace('address.', '');
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value
        }
      }));
    } else if (field.startsWith('parent.')) {
      const parentField = field.replace('parent.', '');
      setFormData(prev => ({
        ...prev,
        parent: {
          ...prev.parent,
          [parentField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {student ? 'Edit Student' : 'Add New Student'}
          </h2>
          <Button variant="outline" onClick={onClose} className="p-2">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    placeholder="STU001"
                    className={errors.studentId ? 'border-red-500' : ''}
                  />
                  {errors.studentId && <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.class}
                    onChange={(e) => handleInputChange('class', e.target.value)}
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.class ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Class</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                  {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.section}
                    onChange={(e) => handleInputChange('section', e.target.value)}
                    placeholder="A"
                    className={errors.section ? 'border-red-500' : ''}
                  />
                  {errors.section && <p className="text-red-500 text-sm mt-1">{errors.section}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.rollNumber}
                    onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                    placeholder="001"
                    className={errors.rollNumber ? 'border-red-500' : ''}
                  />
                  {errors.rollNumber && <p className="text-red-500 text-sm mt-1">{errors.rollNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admission Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                    className={errors.admissionDate ? 'border-red-500' : ''}
                  />
                  {errors.admissionDate && <p className="text-red-500 text-sm mt-1">{errors.admissionDate}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Parent/Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.parent.name}
                    onChange={(e) => handleInputChange('parent.name', e.target.value)}
                    placeholder="Enter parent/guardian name"
                    className={errors.parentName ? 'border-red-500' : ''}
                  />
                  {errors.parentName && <p className="text-red-500 text-sm mt-1">{errors.parentName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.parent.email}
                    onChange={(e) => handleInputChange('parent.email', e.target.value)}
                    placeholder="Enter parent email"
                    className={errors.parentEmail ? 'border-red-500' : ''}
                  />
                  {errors.parentEmail && <p className="text-red-500 text-sm mt-1">{errors.parentEmail}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Phone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.parent.phone}
                    onChange={(e) => handleInputChange('parent.phone', e.target.value)}
                    placeholder="Enter parent phone"
                    className={errors.parentPhone ? 'border-red-500' : ''}
                  />
                  {errors.parentPhone && <p className="text-red-500 text-sm mt-1">{errors.parentPhone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <Input
                  value={formData.address?.street || ''}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  placeholder="Enter street address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <Input
                    value={formData.address?.city || ''}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <Input
                    value={formData.address?.state || ''}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <Input
                    value={formData.address?.country || ''}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    placeholder="Enter country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <Input
                    value={formData.address?.postalCode || ''}
                    onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {student ? 'Update Student' : 'Add Student'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;