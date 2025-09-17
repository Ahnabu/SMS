import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Settings,
  Key,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiService } from '../../services/api';

interface School {
  id: string;
  name: string;
  slug: string;
  schoolId: string;
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
  status: 'active' | 'inactive' | 'suspended' | 'pending_approval';
  affiliation?: string;
  recognition?: string;
  currentSession?: {
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  settings?: {
    maxStudentsPerSection: number;
    grades: number[];
    sections: string[];
    timezone: string;
    language: string;
    currency: string;
  };
  stats?: {
    totalStudents: number;
    totalTeachers: number;
    totalParents: number;
    totalClasses: number;
    totalSubjects: number;
    attendanceRate: number;
    lastUpdated: string;
  };
  admin?: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    phone: string;
  };
  apiEndpoint?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SchoolDetailsProps {
  schoolId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (school: School) => void;
}

const SchoolDetails: React.FC<SchoolDetailsProps> = ({
  schoolId,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (schoolId && isOpen) {
      loadSchoolDetails();
    }
  }, [schoolId, isOpen]);

  const loadSchoolDetails = async () => {
    try {
      setLoading(true);
      const schoolResponse = await apiService.superadmin.getSchool(schoolId!);

      if (schoolResponse.data.success) {
        setSchool(schoolResponse.data.data);
      }

      // Stats would be loaded here if needed
    } catch (error) {
      console.error('Failed to load school details:', error);
      // Set demo data
      setSchool({
        id: '1',
        name: 'Green Valley High School',
        slug: 'green-valley-high',
        schoolId: 'SCH001',
        establishedYear: 1995,
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001',
        },
        contact: {
          phone: '+1-555-0123',
          email: 'admin@greenvalley.edu',
          website: 'https://greenvalley.edu',
        },
        status: 'active',
        affiliation: 'CBSE',
        recognition: 'Government Recognized',
        currentSession: {
          name: '2024-25',
          startDate: '2024-04-01',
          endDate: '2025-03-31',
          isActive: true,
        },
        settings: {
          maxStudentsPerSection: 30,
          grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          sections: ['A', 'B', 'C'],
          timezone: 'America/New_York',
          language: 'English',
          currency: 'USD',
        },
        stats: {
          totalStudents: 850,
          totalTeachers: 45,
          totalParents: 680,
          totalClasses: 24,
          totalSubjects: 15,
          attendanceRate: 92.5,
          lastUpdated: new Date().toISOString(),
        },
        admin: {
          id: 'admin1',
          username: 'gv_admin',
          fullName: 'John Smith',
          email: 'john.smith@greenvalley.edu',
          phone: '+1-555-0124',
        },
        apiEndpoint: 'https://api.sms.com/schools/green-valley-high',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-09-15T14:30:00Z',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'Inactive' },
      suspended: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, text: 'Suspended' },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending Approval' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-2" />
        {config.text}
      </span>
    );
  };

  const handleRegenerateApiKey = async () => {
    try {
      await apiService.superadmin.regenerateApiKey(schoolId!);
      loadSchoolDetails(); // Reload to get the new API key
    } catch (error) {
      console.error('Failed to regenerate API key:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await apiService.superadmin.updateSchoolStatus(schoolId!, newStatus);
      loadSchoolDetails(); // Reload to get updated status
    } catch (error) {
      console.error('Failed to update school status:', error);
    }
  };

  if (!isOpen || !school) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">School Details</h2>
            {getStatusBadge(school.status)}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(school)}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading school details...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">School Name</p>
                        <p className="text-lg font-semibold text-gray-900">{school.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">School ID</p>
                        <p className="text-gray-900">{school.schoolId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Established Year</p>
                        <p className="text-gray-900">{school.establishedYear || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Affiliation</p>
                        <p className="text-gray-900">{school.affiliation || 'Not specified'}</p>
                      </div>
                    </div>
                    {school.recognition && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Recognition</p>
                        <p className="text-gray-900">{school.recognition}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Students</span>
                        <span className="font-semibold text-blue-600">{school.stats?.totalStudents || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Teachers</span>
                        <span className="font-semibold text-green-600">{school.stats?.totalTeachers || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Classes</span>
                        <span className="font-semibold text-purple-600">{school.stats?.totalClasses || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Attendance Rate</span>
                        <span className="font-semibold text-orange-600">{school.stats?.attendanceRate || 0}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Address and Contact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-900">{school.address.street}</p>
                    <p className="text-gray-900">
                      {school.address.city}, {school.address.state} {school.address.postalCode}
                    </p>
                    <p className="text-gray-900">{school.address.country}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{school.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{school.contact.email}</span>
                  </div>
                  {school.contact.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a
                        href={school.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {school.contact.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Administrator Information */}
            {school.admin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Administrator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-gray-900">{school.admin.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Username</p>
                      <p className="text-gray-900">{school.admin.username}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900">{school.admin.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-900">{school.admin.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Academic Session */}
            {school.currentSession && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Current Academic Session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Session Name</p>
                      <p className="text-gray-900">{school.currentSession.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Start Date</p>
                      <p className="text-gray-900">
                        {new Date(school.currentSession.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">End Date</p>
                      <p className="text-gray-900">
                        {new Date(school.currentSession.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* School Settings */}
            {school.settings && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    School Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Max Students per Section</p>
                      <p className="text-gray-900">{school.settings.maxStudentsPerSection}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Timezone</p>
                      <p className="text-gray-900">{school.settings.timezone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Language</p>
                      <p className="text-gray-900">{school.settings.language}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Currency</p>
                      <p className="text-gray-900">{school.settings.currency}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Grades Offered</p>
                      <p className="text-gray-900">{school.settings.grades.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Sections</p>
                      <p className="text-gray-900">{school.settings.sections.join(', ')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Configuration
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateApiKey}
                    className="text-xs"
                  >
                    Regenerate Key
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">API Endpoint</p>
                  <p className="text-gray-900 font-mono text-sm bg-gray-100 px-3 py-2 rounded">
                    {school.apiEndpoint}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">API Key</p>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-mono text-sm bg-gray-100 px-3 py-2 rounded flex-1">
                      {showApiKey ? '****-****-****-abcd' : '****-****-****-****'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle>Status Management</CardTitle>
                <CardDescription>
                  Change the status of this school
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  {getStatusBadge(school.status)}
                  <div className="ml-4 flex gap-2">
                    {school.status !== 'active' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange('active')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Activate
                      </Button>
                    )}
                    {school.status !== 'suspended' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange('suspended')}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Suspend
                      </Button>
                    )}
                    {school.status !== 'inactive' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange('inactive')}
                        className="text-gray-600 hover:bg-gray-50"
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-gray-900">
                      {new Date(school.createdAt).toLocaleDateString()} at{' '}
                      {new Date(school.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-gray-900">
                      {new Date(school.updatedAt).toLocaleDateString()} at{' '}
                      {new Date(school.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolDetails;