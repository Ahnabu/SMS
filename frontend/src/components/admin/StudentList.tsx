import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiService } from '@/services';

interface Student {
  id: string;
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
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  isActive: boolean;
  admissionDate: string;
  createdAt: string;
}

interface StudentListProps {
  onCreateStudent: () => void;
  onEditStudent: (student: Student) => void;
  onViewStudent: (student: Student) => void;
  onStudentCreated?: (student: Student) => void;
  onStudentUpdated?: (student: Student) => void;
  onStudentDeleted?: (studentId: string) => void;
}

export interface StudentListRef {
  addStudentOptimistically: (student: Student) => void;
  updateStudentOptimistically: (student: Student) => void;
}

const StudentList = React.forwardRef<StudentListRef, StudentListProps>(({
  onCreateStudent,
  onEditStudent,
  onViewStudent,
  onStudentCreated,
  onStudentUpdated,
  onStudentDeleted,
}, ref) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Expose methods to parent component
  React.useImperativeHandle(ref, () => ({
    addStudentOptimistically: (student: Student) => {
      setStudents(prev => [student, ...prev]);
      onStudentCreated?.(student);
    },
    updateStudentOptimistically: (student: Student) => {
      setStudents(prev => prev.map(s => s.id === student.id ? student : s));
      onStudentUpdated?.(student);
    }
  }));

  useEffect(() => {
    loadStudents();
  }, [currentPage, classFilter, statusFilter, searchTerm]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getStudents({
        page: currentPage,
        limit: 10,
        grade: classFilter !== 'all' ? parseInt(classFilter, 10) : undefined,
        // status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      });

      if (response.data.success) {
        const responseData = response.data.data;
        setStudents(responseData);
        setTotalPages(response.data.meta?.page as number);
      } else {
        setStudents([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
      // Set demo data for testing
     
    } finally {
      setLoading(false);
    }
  };
console.log(students)
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      // Optimistic update - immediately remove from UI
      setStudents(prev => prev.filter(student => student.id !== studentId));
      onStudentDeleted?.(studentId);

      await apiService.admin.deleteStudent(studentId);
    } catch (error) {
      console.error('Failed to delete student:', error);
      // Rollback on error - reload to restore original state
      loadStudents();
    }
  };

  const handleStatusChange = async (studentId: string, newStatus: boolean) => {
    try {
      // Optimistic update - immediately update status in UI
      setStudents(prev => prev.map(student => 
        student.id === studentId 
          ? { ...student, isActive: newStatus }
          : student
      ));

      // Call API to update status (assuming there's an endpoint for this)
      // await apiService.admin.updateStudentStatus(studentId, newStatus);
    } catch (error) {
      console.error('Failed to update student status:', error);
      // Rollback on error - reload to restore original state
      loadStudents();
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
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">Manage all students in your school</p>
        </div>
        <Button onClick={onCreateStudent} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Student
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
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select aria-label='Filter by class'
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Classes</option>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
              <select aria-label='Filter by status'
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading students...</p>
        </div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || classFilter !== 'all' || statusFilter !== 'all'
                ? 'No students match your search criteria.'
                : 'Get started by adding your first student.'}
            </p>
            {!searchTerm && classFilter === 'all' && statusFilter === 'all' && (
              <Button onClick={onCreateStudent}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Student
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {students.map((student) => (
              <li key={student.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {student.firstName[0]}{student.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {student.studentId} • Class {student.class}-{student.section} • Roll: {student.rollNumber}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {student.email} • Parent: {student.parent.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(student.isActive)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewStudent(student)}
                      className="p-2"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditStudent(student)}
                      className="p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(student.id, !student.isActive)}
                      className={`p-2 ${student.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                    >
                      {student.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
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

StudentList.displayName = 'StudentList';

export default StudentList;