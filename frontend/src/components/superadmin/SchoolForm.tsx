import React, { useState, useEffect } from 'react';
import { X, Save, User, Building, MapPin, Phone, Globe, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiService } from '../../services/api';

interface School {
  id?: string;
  name: string;
  establishedYear?: number;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  affiliation?: string;
  recognition?: string;
  adminDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
  };
  currentSession?: {
    name: string;
    startDate: string;
    endDate: string;
  };
  settings?: {
    maxStudentsPerSection: number;
    grades: number[];
    sections: string[];
    academicYearStart: number;
    academicYearEnd: number;
    timezone: string;
    language: string;
    currency: string;
  };
}

interface SchoolFormProps {
  school?: School | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (school: School) => void;
}

const SchoolForm: React.FC<SchoolFormProps> = ({
  school,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<School>({
    name: '',
    establishedYear: new Date().getFullYear(),
    address: {
      street: '',
      city: '',
      state: '',
      country: 'USA',
      postalCode: '',
    },
    contact: {
      phone: '',
      email: '',
      website: '',
    },
    affiliation: '',
    recognition: '',
    adminDetails: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      username: '',
      password: '',
    },
    currentSession: {
      name: '2024-25',
      startDate: '2024-04-01',
      endDate: '2025-03-31',
    },
    settings: {
      maxStudentsPerSection: 30,
      grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      sections: ['A', 'B', 'C'],
      academicYearStart: 4, // April
      academicYearEnd: 3, // March
      timezone: 'America/New_York',
      language: 'English',
      currency: 'USD',
    },
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (school) {
      setFormData(school);
    } else {
      // Reset form for new school
      setFormData({
        name: '',
        establishedYear: new Date().getFullYear(),
        address: {
          street: '',
          city: '',
          state: '',
          country: 'USA',
          postalCode: '',
        },
        contact: {
          phone: '',
          email: '',
          website: '',
        },
        affiliation: '',
        recognition: '',
        adminDetails: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          username: '',
          password: '',
        },
        currentSession: {
          name: '2024-25',
          startDate: '2024-04-01',
          endDate: '2025-03-31',
        },
        settings: {
          maxStudentsPerSection: 30,
          grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          sections: ['A', 'B', 'C'],
          academicYearStart: 4,
          academicYearEnd: 3,
          timezone: 'America/New_York',
          language: 'English',
          currency: 'USD',
        },
      });
    }
  }, [school, isOpen]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (section: string, field: string, value: string) => {
    const arrayValue = value.split(',').map(item => {
      const trimmed = item.trim();
      return field === 'grades' ? parseInt(trimmed) : trimmed;
    }).filter(item => item);

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: arrayValue,
      },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'School name is required';
    }

    if (!formData.address.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.address.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.address.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.contact.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.contact.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contact.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!school && formData.adminDetails) {
      if (!formData.adminDetails.firstName.trim()) {
        newErrors.adminFirstName = 'Admin first name is required';
      }
      if (!formData.adminDetails.lastName.trim()) {
        newErrors.adminLastName = 'Admin last name is required';
      }
      if (!formData.adminDetails.email.trim()) {
        newErrors.adminEmail = 'Admin email is required';
      }
      if (!formData.adminDetails.username.trim()) {
        newErrors.adminUsername = 'Admin username is required';
      }
      if (!formData.adminDetails.password.trim()) {
        newErrors.adminPassword = 'Admin password is required';
      }
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
      if (school?.id) {
        // Update existing school
        await apiService.superadmin.updateSchool(school.id, formData);
      } else {
        // Create new school
        await apiService.superadmin.createSchool(formData);
      }
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save school:', error);
      setErrors({ submit: 'Failed to save school. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {school ? 'Edit School' : 'Create New School'}
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter school name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Established Year
                  </label>
                  <Input
                    type="number"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, establishedYear: parseInt(e.target.value) }))}
                    placeholder="e.g., 1995"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Affiliation
                  </label>
                  <select
                    value={formData.affiliation}
                    onChange={(e) => setFormData(prev => ({ ...prev, affiliation: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select affiliation</option>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="IB">International Baccalaureate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recognition
                  </label>
                  <Input
                    value={formData.recognition}
                    onChange={(e) => setFormData(prev => ({ ...prev, recognition: e.target.value }))}
                    placeholder="Government recognition details"
                  />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <Input
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                  placeholder="Enter street address"
                  className={errors.street ? 'border-red-500' : ''}
                />
                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                    placeholder="City"
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <Input
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                    placeholder="State"
                    className={errors.state ? 'border-red-500' : ''}
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <Input
                    value={formData.address.postalCode}
                    onChange={(e) => handleInputChange('address', 'postalCode', e.target.value)}
                    placeholder="Postal Code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <Input
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address', 'country', e.target.value)}
                  placeholder="Country"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <Input
                    value={formData.contact.phone}
                    onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                    placeholder="+1-555-0123"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                    placeholder="admin@school.edu"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <Input
                  value={formData.contact.website}
                  onChange={(e) => handleInputChange('contact', 'website', e.target.value)}
                  placeholder="https://school.edu"
                />
              </div>
            </CardContent>
          </Card>

          {/* Admin Details (only for new schools) */}
          {!school && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Administrator Details
                </CardTitle>
                <CardDescription>
                  Create an admin account for this school
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <Input
                      value={formData.adminDetails?.firstName || ''}
                      onChange={(e) => handleInputChange('adminDetails', 'firstName', e.target.value)}
                      placeholder="First name"
                      className={errors.adminFirstName ? 'border-red-500' : ''}
                    />
                    {errors.adminFirstName && <p className="text-red-500 text-xs mt-1">{errors.adminFirstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <Input
                      value={formData.adminDetails?.lastName || ''}
                      onChange={(e) => handleInputChange('adminDetails', 'lastName', e.target.value)}
                      placeholder="Last name"
                      className={errors.adminLastName ? 'border-red-500' : ''}
                    />
                    {errors.adminLastName && <p className="text-red-500 text-xs mt-1">{errors.adminLastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.adminDetails?.email || ''}
                      onChange={(e) => handleInputChange('adminDetails', 'email', e.target.value)}
                      placeholder="admin@school.edu"
                      className={errors.adminEmail ? 'border-red-500' : ''}
                    />
                    {errors.adminEmail && <p className="text-red-500 text-xs mt-1">{errors.adminEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <Input
                      value={formData.adminDetails?.phone || ''}
                      onChange={(e) => handleInputChange('adminDetails', 'phone', e.target.value)}
                      placeholder="+1-555-0123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username *
                    </label>
                    <Input
                      value={formData.adminDetails?.username || ''}
                      onChange={(e) => handleInputChange('adminDetails', 'username', e.target.value)}
                      placeholder="admin_username"
                      className={errors.adminUsername ? 'border-red-500' : ''}
                    />
                    {errors.adminUsername && <p className="text-red-500 text-xs mt-1">{errors.adminUsername}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <Input
                      type="password"
                      value={formData.adminDetails?.password || ''}
                      onChange={(e) => handleInputChange('adminDetails', 'password', e.target.value)}
                      placeholder="Secure password"
                      className={errors.adminPassword ? 'border-red-500' : ''}
                    />
                    {errors.adminPassword && <p className="text-red-500 text-xs mt-1">{errors.adminPassword}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Academic Session */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Academic Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Name
                  </label>
                  <Input
                    value={formData.currentSession?.name || ''}
                    onChange={(e) => handleInputChange('currentSession', 'name', e.target.value)}
                    placeholder="2024-25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={formData.currentSession?.startDate || ''}
                    onChange={(e) => handleInputChange('currentSession', 'startDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={formData.currentSession?.endDate || ''}
                    onChange={(e) => handleInputChange('currentSession', 'endDate', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                School Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Students per Section
                  </label>
                  <Input
                    type="number"
                    value={formData.settings?.maxStudentsPerSection || 30}
                    onChange={(e) => handleInputChange('settings', 'maxStudentsPerSection', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={formData.settings?.timezone || 'America/New_York'}
                    onChange={(e) => handleInputChange('settings', 'timezone', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grades Offered (comma-separated)
                  </label>
                  <Input
                    value={formData.settings?.grades?.join(', ') || '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12'}
                    onChange={(e) => handleArrayChange('settings', 'grades', e.target.value)}
                    placeholder="1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sections (comma-separated)
                  </label>
                  <Input
                    value={formData.settings?.sections?.join(', ') || 'A, B, C'}
                    onChange={(e) => handleArrayChange('settings', 'sections', e.target.value)}
                    placeholder="A, B, C, D"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            {errors.submit && (
              <p className="text-red-500 text-sm mr-auto">{errors.submit}</p>
            )}
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Saving...' : (school ? 'Update School' : 'Create School')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchoolForm;