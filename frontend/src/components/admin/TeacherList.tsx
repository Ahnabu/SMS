import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Eye, UserCheck, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTableFilter, FilterConfig } from "@/components/ui/DataTableFilter";
import { apiService } from "@/services";

interface Teacher {
  id: string;
  userId: string;
  schoolId: string;
  teacherId: string;
  employeeId?: string;
  subjects: string[];
  grades: number[];
  sections: string[];
  designation: string;
  bloodGroup: string;
  dob: string;
  joinDate: string;
  qualifications: {
    degree: string;
    institution: string;
    year: number;
    specialization?: string;
  }[];
  experience: {
    totalYears: number;
    previousSchools?: {
      schoolName: string;
      position: string;
      duration: string;
      fromDate: string;
      toDate: string;
    }[];
  };
  address: {
    street?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  salary?: {
    basic: number;
    allowances?: number;
    deductions?: number;
    netSalary: number;
  };
  isClassTeacher: boolean;
  classTeacherFor?: {
    grade: number;
    section: string;
  };
  isActive: boolean;
  age: number;
  totalExperience: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email?: string;
    phone?: string;
  };
  school?: {
    id: string;
    name: string;
  };
  photos?: any[];
  photoCount: number;
  // Legacy fields for backward compatibility
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfJoining?: string;
  department?: string;
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

const TeacherList = React.forwardRef<TeacherListRef, TeacherListProps>(
  (
    {
      onCreateTeacher,
      onEditTeacher,
      onViewTeacher,
      onTeacherCreated,
      onTeacherUpdated,
      onTeacherDeleted,
    },
    ref
  ) => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filter configuration
    const filterConfigs: FilterConfig[] = [
      {
        key: "department",
        label: "Department",
        placeholder: "All Departments",
        value: departmentFilter,
        onChange: setDepartmentFilter,
        options: [
          { label: "All Departments", value: "all" },
          { label: "Mathematics", value: "Mathematics" },
          { label: "Science", value: "Science" },
          { label: "English", value: "English" },
          { label: "Social Studies", value: "Social Studies" },
          { label: "Languages", value: "Languages" },
          { label: "Arts", value: "Arts" },
          { label: "Physical Education", value: "Physical Education" },
        ],
      },
      {
        key: "status",
        label: "Status",
        placeholder: "All Status",
        value: statusFilter,
        onChange: setStatusFilter,
        options: [
          { label: "All Status", value: "all" },
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
    ];

    // Expose methods to parent component
    React.useImperativeHandle(ref, () => ({
      addTeacherOptimistically: (teacher: Teacher) => {
        setTeachers((prev) => [teacher, ...prev]);
        onTeacherCreated?.(teacher);
      },
      updateTeacherOptimistically: (teacher: Teacher) => {
        setTeachers((prev) =>
          prev.map((t) => (t.id === teacher.id ? teacher : t))
        );
        onTeacherUpdated?.(teacher);
      },
    }));

    const loadTeachers = useCallback(async () => {
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
          setTeachers(
            Array.isArray(responseData.teachers) ? responseData.teachers : []
          );
          setTotalPages(responseData.totalPages || 1);
        } else {
          setTeachers([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Failed to load teachers:", error);
        // Set demo data for testing
        setTeachers([
          {
            id: "1",
            userId: "user1",
            schoolId: "school1",
            teacherId: "TCH-2025-001",
            employeeId: "EMP001",
            subjects: ["Algebra", "Calculus", "Geometry"],
            grades: [9, 10, 11],
            sections: ["A", "B"],
            designation: "Senior Teacher",
            bloodGroup: "A+",
            dob: "1985-05-15",
            joinDate: "2022-01-15",
            qualifications: [
              {
                degree: "M.Sc Mathematics",
                institution: "State University",
                year: 2008
              },
              {
                degree: "B.Ed",
                institution: "Education College",
                year: 2009
              }
            ],
            experience: {
              totalYears: 5,
              previousSchools: []
            },
            address: {
              street: "123 Main St",
              city: "New York",
              state: "NY",
              zipCode: "10001",
              country: "USA",
            },
            emergencyContact: {
              name: "John Johnson",
              relationship: "Spouse",
              phone: "+1-555-0199"
            },
            isClassTeacher: true,
            classTeacherFor: {
              grade: 10,
              section: "A"
            },
            isActive: true,
            age: 38,
            totalExperience: 5,
            createdAt: "2022-01-15T10:00:00Z",
            updatedAt: "2022-01-15T10:00:00Z",
            user: {
              id: "user1",
              username: "sarah.johnson",
              firstName: "Sarah",
              lastName: "Johnson",
              fullName: "Sarah Johnson",
              email: "sarah.johnson@school.edu",
              phone: "+1-555-0123"
            },
            school: {
              id: "school1",
              name: "Demo School"
            },
            photos: [],
            photoCount: 0,
            // Legacy fields for backward compatibility
            firstName: "Sarah",
            lastName: "Johnson",
            email: "sarah.johnson@school.edu",
            phone: "+1-555-0123",
            dateOfJoining: "2022-01-15",
            department: "Mathematics"
          },
          {
            id: "2",
            userId: "user2",
            schoolId: "school1",
            teacherId: "TCH-2025-002",
            employeeId: "EMP002",
            subjects: ["Physics", "Chemistry"],
            grades: [11, 12],
            sections: ["A", "B", "C"],
            designation: "Head of Science",
            bloodGroup: "O+",
            dob: "1980-12-10",
            joinDate: "2021-08-20",
            qualifications: [
              {
                degree: "Ph.D Physics",
                institution: "Technical University",
                year: 2005
              },
              {
                degree: "M.Sc Physics",
                institution: "Science College",
                year: 2002
              }
            ],
            experience: {
              totalYears: 8,
              previousSchools: []
            },
            address: {
              street: "456 Oak Ave",
              city: "New York",
              state: "NY",
              zipCode: "10002",
              country: "USA",
            },
            emergencyContact: {
              name: "Lisa Davis",
              relationship: "Spouse",
              phone: "+1-555-0198"
            },
            isClassTeacher: false,
            isActive: true,
            age: 43,
            totalExperience: 8,
            createdAt: "2021-08-20T14:30:00Z",
            updatedAt: "2021-08-20T14:30:00Z",
            user: {
              id: "user2",
              username: "michael.davis",
              firstName: "Michael",
              lastName: "Davis",
              fullName: "Michael Davis",
              email: "michael.davis@school.edu",
              phone: "+1-555-0124"
            },
            school: {
              id: "school1",
              name: "Demo School"
            },
            photos: [],
            photoCount: 0,
            // Legacy fields for backward compatibility
            firstName: "Michael",
            lastName: "Davis",
            email: "michael.davis@school.edu",
            phone: "+1-555-0124",
            dateOfJoining: "2021-08-20",
            department: "Science"
          },
        ]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }, [currentPage, searchTerm]);

    useEffect(() => {
      loadTeachers();
    }, [loadTeachers]);

    const handleDeleteTeacher = async (teacherId: string) => {
      if (
        !confirm(
          "Are you sure you want to delete this teacher? This action cannot be undone."
        )
      ) {
        return;
      }

      try {
        // Optimistic update - immediately remove from UI
        setTeachers((prev) =>
          prev.filter((teacher) => teacher.id !== teacherId)
        );
        onTeacherDeleted?.(teacherId);

        await apiService.admin.deleteTeacher(teacherId);
      } catch (error) {
        console.error("Failed to delete teacher:", error);
        // Rollback on error - reload to restore original state
        loadTeachers();
      }
    };

    const handleStatusChange = async (
      teacherId: string,
      newStatus: boolean
    ) => {
      try {
        // Optimistic update - immediately update status in UI
        setTeachers((prev) =>
          prev.map((teacher) =>
            teacher.id === teacherId
              ? { ...teacher, isActive: newStatus }
              : teacher
          )
        );

        // Call API to update status (assuming there's an endpoint for this)
        // await apiService.admin.updateTeacherStatus(teacherId, newStatus);
      } catch (error) {
        console.error("Failed to update teacher status:", error);
        // Rollback on error - reload to restore original state
        loadTeachers();
      }
    };

    const getStatusBadge = (isActive: boolean) => {
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
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
            <h1 className="text-2xl font-bold text-gray-900">
              Teacher Management
            </h1>
            <p className="text-gray-600">Manage all teachers in your school</p>
          </div>
          <Button onClick={onCreateTeacher} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Teacher
          </Button>
        </div>

        {/* Filters */}
        <DataTableFilter
          searchPlaceholder="Search teachers..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filterConfigs}
        />

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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No teachers found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ||
                departmentFilter !== "all" ||
                statusFilter !== "all"
                  ? "No teachers match your search criteria."
                  : "Get started by adding your first teacher."}
              </p>
              {!searchTerm &&
                departmentFilter === "all" &&
                statusFilter === "all" && (
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
                            {(teacher.user?.firstName || teacher.firstName)?.[0] || '?'}
                            {(teacher.user?.lastName || teacher.lastName)?.[0] || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {teacher.user?.firstName || teacher.firstName || 'Unknown'} {teacher.user?.lastName || teacher.lastName || 'Teacher'}
                          </h3>
                          {getStatusBadge(teacher.isActive ?? false)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Employee ID:</span>{" "}
                          {teacher.employeeId || 'N/A'} •
                          <span className="font-medium ml-2">Department:</span>{" "}
                          {teacher.department || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Designation:</span>{" "}
                          {teacher.designation || 'N/A'} •
                          <span className="font-medium ml-2">Joined:</span>{" "}
                          {(teacher.joinDate || teacher.dateOfJoining) ? new Date(teacher.joinDate || teacher.dateOfJoining!).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Contact:</span>{" "}
                          {teacher.user?.email || teacher.email || 'N/A'}{" "}
                          {(teacher.user?.phone || teacher.phone) && `• ${teacher.user?.phone || teacher.phone}`}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">
                            Subjects:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {(teacher.subjects || []).map((subject, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                              >
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
                        onClick={() =>
                          handleStatusChange(teacher.id, !(teacher.isActive ?? false))
                        }
                        className={`p-2 ${
                          teacher.isActive ?? false
                            ? "text-red-600 hover:text-red-700"
                            : "text-green-600 hover:text-green-700"
                        }`}
                      >
                        {(teacher.isActive ?? false) ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
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
                Showing page <span className="font-medium">{currentPage}</span>{" "}
                of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

TeacherList.displayName = "TeacherList";

export default TeacherList;
