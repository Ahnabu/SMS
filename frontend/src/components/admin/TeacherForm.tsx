import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiService } from '../../services/api';

interface Teacher {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeId: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  qualifications: string[];
  subjects: string[];
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  salary?: number;
  isActive: boolean;
}

interface TeacherFormProps {
  teacher?: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: Teacher) => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  teacher,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Teacher>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    designation: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    qualifications: [''],
    subjects: [''],
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    salary: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (teacher) {
      setFormData({
        ...teacher,
        dateOfJoining: teacher.dateOfJoining?.split('T')[0] || '',
        address: teacher.address || {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
        },
        qualifications: teacher.qualifications.length > 0 ? teacher.qualifications : [''],
        subjects: teacher.subjects.length > 0 ? teacher.subjects : [''],
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        employeeId: '',
        department: '',
        designation: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        qualifications: [''],
        subjects: [''],
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
        },
        salary: 0,
        isActive: true,
      });
    }
    setErrors({});
  }, [teacher, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.dateOfJoining) newErrors.dateOfJoining = 'Date of joining is required';
    
    // Check if at least one qualification is provided
    if (formData.qualifications.every(q => !q.trim())) {
      newErrors.qualifications = 'At least one qualification is required';
    }
    
    // Check if at least one subject is provided
    if (formData.subjects.every(s => !s.trim())) {
      newErrors.subjects = 'At least one subject is required';
    }

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
      // Clean up arrays by removing empty strings
      const cleanedFormData = {
        ...formData,
        qualifications: formData.qualifications.filter(q => q.trim()),
        subjects: formData.subjects.filter(s => s.trim()),
      };

      console.log('Sending teacher data:', JSON.stringify(cleanedFormData, null, 2));

      if (teacher?.id) {
        // Update existing teacher
        const response = await apiService.admin.updateTeacher(teacher.id, cleanedFormData);
        if (response.data.success) {
          onSave({ ...cleanedFormData, id: teacher.id, ...response.data.data });
        }
      } else {
        // Create new teacher - optimistic update first, then API call
        const tempId = `temp-${Date.now()}`;
        const optimisticTeacher = { 
          ...cleanedFormData, 
          id: tempId,
          createdAt: new Date().toISOString(),
        };
        
        // Call onSave immediately for optimistic update
        onSave(optimisticTeacher);
        
        const response = await apiService.admin.createTeacher(cleanedFormData);
        if (response.data.success) {
          // Update with real data from server
          onSave({ ...cleanedFormData, ...response.data.data });
        }
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to save teacher:', error);
      console.error('Error response data:', error.response?.data);
      
      let errorMessage = 'Failed to save teacher. Please try again.';
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
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayChange = (field: 'qualifications' | 'subjects', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'qualifications' | 'subjects') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'qualifications' | 'subjects', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {teacher ? 'Edit Teacher' : 'Add New Teacher'}
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
                Personal Information
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
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    placeholder="EMP001"
                    className={errors.employeeId ? 'border-red-500' : ''}
                  />
                  {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Joining <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
                    className={errors.dateOfJoining ? 'border-red-500' : ''}
                  />
                  {errors.dateOfJoining && <p className="text-red-500 text-sm mt-1">{errors.dateOfJoining}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.department ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Department</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Languages">Languages</option>
                    <option value="Arts">Arts</option>
                    <option value="Physical Education">Physical Education</option>
                  </select>
                  {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    placeholder="Senior Teacher, Head of Department, etc."
                    className={errors.designation ? 'border-red-500' : ''}
                  />
                  {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary (Optional)
                </label>
                <Input
                  type="number"
                  value={formData.salary || ''}
                  onChange={(e) => handleInputChange('salary', parseFloat(e.target.value) || 0)}
                  placeholder="Enter monthly salary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifications <span className="text-red-500">*</span>
                </label>
                {formData.qualifications.map((qualification, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input
                      value={qualification}
                      onChange={(e) => handleArrayChange('qualifications', index, e.target.value)}
                      placeholder="e.g., M.Sc Mathematics, B.Ed"
                      className={errors.qualifications ? 'border-red-500' : ''}
                    />
                    {formData.qualifications.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeArrayItem('qualifications', index)}
                        className="p-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('qualifications')}
                  className="mt-2"
                >
                  Add Another Qualification
                </Button>
                {errors.qualifications && <p className="text-red-500 text-sm mt-1">{errors.qualifications}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjects <span className="text-red-500">*</span>
                </label>
                {formData.subjects.map((subject, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input
                      value={subject}
                      onChange={(e) => handleArrayChange('subjects', index, e.target.value)}
                      placeholder="e.g., Algebra, Physics, English Literature"
                      className={errors.subjects ? 'border-red-500' : ''}
                    />
                    {formData.subjects.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeArrayItem('subjects', index)}
                        className="p-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('subjects')}
                  className="mt-2"
                >
                  Add Another Subject
                </Button>
                {errors.subjects && <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>}
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
                  {teacher ? 'Update Teacher' : 'Add Teacher'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;