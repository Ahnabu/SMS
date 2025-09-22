import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiService } from '@/services';

interface Teacher {
  id: string;
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
  createdAt: string;
}

interface TeacherListProps {
  onCreateTeacher: () => void;
  onEditTeacher: (teacher: Teacher) => void;
  onViewTeacher: (teacher: Teacher) => void;
  onTeacherCreated?: (teacher: Teacher) => void;
  onTeacherUpdated?: (teacher: Teacher) => void;
  onTeacherDeleted?: (teacherId: string) => void;
}

export interface TeacherListRef {
  addTeacherOptimistically: (teacher: Teacher) => void;
  updateTeacherOptimistically: (teacher: Teacher) => void;
}

const TeacherList = React.forwardRef<TeacherListRef, TeacherListProps>(({
  onCreateTeacher,
  onEditTeacher,
  onViewTeacher,
  onTeacherCreated,
  onTeacherUpdated,
  onTeacherDeleted,
}, ref) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Expose methods to parent component
  React.useImperativeHandle(ref, () => ({
    addTeacherOptimistically: (teacher: Teacher) => {
      setTeachers(prev => [teacher, ...prev]);
      onTeacherCreated?.(teacher);
    },
    updateTeacherOptimistically: (teacher: Teacher) => {
      setTeachers(prev => prev.map(t => t.id === teacher.id ? teacher : t));
      onTeacherUpdated?.(teacher);
    }
  }));

  useEffect(() => {
    loadTeachers();
  }, [currentPage, departmentFilter, statusFilter, searchTerm]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getTeachers({
        page: currentPage,
        limit: 10,
        // department: departmentFilter !== 'all' ? departmentFilter : undefined,
        // status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      });

      if (response.data.success) {
        const responseData = response.data.data;
        setTeachers(Array.isArray(responseData.teachers) ? responseData.teachers : []);
        setTotalPages(responseData.totalPages || 1);
      } else {
        setTeachers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to load teachers:', error);
      // Set demo data for testing
      setTeachers([
        {
          id: '1',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@school.edu',
          phone: '+1-555-0123',
          employeeId: 'EMP001',
          department: 'Mathematics',
          designation: 'Senior Teacher',
          dateOfJoining: '2022-01-15',
          qualifications: ['M.Sc Mathematics', 'B.Ed'],
          subjects: ['Algebra', 'Calculus', 'Geometry'],
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            postalCode: '10001',
          },
          salary: 50000,
          isActive: true,
          createdAt: '2022-01-15T10:00:00Z',
        },
        {
          id: '2',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.brown@school.edu',
          phone: '+1-555-0456',
          employeeId: 'EMP002',
          department: 'Science',
          designation: 'Head of Department',
          dateOfJoining: '2020-08-20',
          qualifications: ['Ph.D Physics', 'M.Sc Physics'],
          subjects: ['Physics', 'Advanced Physics'],
          isActive: true,
          createdAt: '2020-08-20T14:30:00Z',
        },
        {
          id: '3',
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.davis@school.edu',
          phone: '+1-555-0789',
          employeeId: 'EMP003',
          department: 'English',
          designation: 'Teacher',
          dateOfJoining: '2023-03-10',
          qualifications: ['MA English Literature', 'B.Ed'],
          subjects: ['English Literature', 'Creative Writing'],
          isActive: false,
          createdAt: '2023-03-10T09:15:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      return;
    }

    try {
      // Optimistic update - immediately remove from UI
      setTeachers(prev => prev.filter(teacher => teacher.id !== teacherId));
      onTeacherDeleted?.(teacherId);

      await apiService.admin.deleteTeacher(teacherId);
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      // Rollback on error - reload to restore original state
      loadTeachers();
    }
  };

  const handleStatusChange = async (teacherId: string, newStatus: boolean) => {
    try {
      // Optimistic update - immediately update status in UI
      setTeachers(prev => prev.map(teacher => 
        teacher.id === teacherId 
          ? { ...teacher, isActive: newStatus }
          : teacher
      ));

      // Call API to update status (assuming there's an endpoint for this)
      // await apiService.admin.updateTeacherStatus(teacherId, newStatus);
    } catch (error) {
      console.error('Failed to update teacher status:', error);
      // Rollback on error - reload to restore original state
      loadTeachers();
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? (
          <>
            <UserCheck className="w-3 h-3 mr-1" />
            Active
          </>
        ) : (
          <>
            <UserX className="w-3 h-3 mr-1" />
            Inactive
          </>
        )}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
          <p className="text-gray-600">Manage all teachers in your school</p>
        </div>
        <Button onClick={onCreateTeacher} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Teacher
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {/* <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select aria-label='Department'
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Languages">Languages</option>
                <option value="Arts">Arts</option>
                <option value="Physical Education">Physical Education</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Teachers List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading teachers...</p>
        </div>
      ) : teachers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all'
                ? 'No teachers match your search criteria.'
                : 'Get started by adding your first teacher.'}
            </p>
            {!searchTerm && departmentFilter === 'all' && statusFilter === 'all' && (
              <Button onClick={onCreateTeacher}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Teacher
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-lg font-medium text-white">
                          {teacher.firstName[0]}{teacher.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {teacher.firstName} {teacher.lastName}
                        </h3>
                        {getStatusBadge(teacher.isActive)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Employee ID:</span> {teacher.employeeId} • 
                        <span className="font-medium ml-2">Department:</span> {teacher.department}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Designation:</span> {teacher.designation} • 
                        <span className="font-medium ml-2">Joined:</span> {new Date(teacher.dateOfJoining).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Contact:</span> {teacher.email} {teacher.phone && `• ${teacher.phone}`}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Subjects:</span>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.map((subject, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewTeacher(teacher)}
                      className="p-2"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditTeacher(teacher)}
                      className="p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(teacher.id, !teacher.isActive)}
                      className={`p-2 ${teacher.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                    >
                      {teacher.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTeacher(teacher.id)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{currentPage}</span> of{' '}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

TeacherList.displayName = 'TeacherList';

export default TeacherList;