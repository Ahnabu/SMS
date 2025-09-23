import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Eye, UserCheck, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTableFilter, FilterConfig } from "@/components/ui/DataTableFilter";
import StudentDetailsModal from "./StudentDetailsModal";
import ConfirmDialog from "../ui/ConfirmDialog";
import { showToast } from "@/utils/toast";
import { apiService } from "@/services";

interface Student {
  id: string;
  studentId: string;
  grade: number;
  section: string;
  rollNumber: number;
  bloodGroup?: string;
  dob?: string;
  admissionDate?: string;
  isActive: boolean;
  age?: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  school?: {
    id: string;
    name: string;
  };
  parent?: {
    id: string;
    userId?: string;
    fullName: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    occupation?: string;
    relationship?: string;
  };
  photos?: Array<{
    id: string;
    photoPath: string;
    photoNumber: number;
    filename: string;
    size: number;
    createdAt: string;
  }>;
  photoCount?: number;
  createdAt: string;
  updatedAt?: string;
}

interface StudentListProps {
  onCreateStudent: () => void;
  onEditStudent: (student: Student) => void;
  onStudentCreated?: (student: Student) => void;
  onStudentUpdated?: (student: Student) => void;
  onStudentDeleted?: (studentId: string) => void;
}

export interface StudentListRef {
  addStudentOptimistically: (student: Student) => void;
  updateStudentOptimistically: (student: Student) => void;
}

const StudentList = React.forwardRef<StudentListRef, StudentListProps>(
  (
    {
      onCreateStudent,
      onEditStudent,
      onStudentCreated,
      onStudentUpdated,
      onStudentDeleted,
    },
    ref
  ) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [classFilter, setClassFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal state
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(
      null
    );
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Confirmation dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<{
      id: string;
      name: string;
    } | null>(null);

    // Filter configuration
    const filterConfigs: FilterConfig[] = [
      {
        key: "class",
        label: "Class",
        placeholder: "All Classes",
        value: classFilter,
        onChange: setClassFilter,
        options: [
          { label: "All Classes", value: "all" },
          { label: "Class 9", value: "9" },
          { label: "Class 10", value: "10" },
          { label: "Class 11", value: "11" },
          { label: "Class 12", value: "12" },
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
      addStudentOptimistically: (student: Student) => {
        setStudents((prev) => [student, ...prev]);
        onStudentCreated?.(student);
      },
      updateStudentOptimistically: (student: Student) => {
        setStudents((prev) =>
          prev.map((s) => (s.id === student.id ? student : s))
        );
        onStudentUpdated?.(student);
      },
    }));

    const loadStudents = useCallback(async () => {
      try {
        setLoading(true);
        const response = await apiService.admin.getStudents({
          page: currentPage,
          limit: 10,
          grade: classFilter !== "all" ? parseInt(classFilter, 10) : undefined,
          // status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchTerm || undefined,
        });

        if (response.data.success) {
          const responseData = response.data.data;
          console.log("API Response:", responseData);

          // Check if responseData has students array or is itself the array
          if (Array.isArray(responseData)) {
            setStudents(responseData);
          } else if (
            responseData.students &&
            Array.isArray(responseData.students)
          ) {
            setStudents(responseData.students);
            setTotalPages(
              responseData.totalPages || Math.ceil(responseData.totalCount / 10)
            );
          } else {
            console.warn("Unexpected response format:", responseData);
            setStudents([]);
          }

          // Handle pagination meta
          if (response.data.meta) {
            setTotalPages(
              response.data.meta.total
                ? Math.ceil(response.data.meta.total / 10)
                : 1
            );
          }
        } else {
          setStudents([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Failed to load students:", error);
        // Set demo data for testing
      } finally {
        setLoading(false);
      }
    }, [currentPage, classFilter, searchTerm]);

    useEffect(() => {
      loadStudents();
    }, [loadStudents]);
    console.log(students);

    // Handle view student details
    const handleViewStudent = (student: Student) => {
      setSelectedStudent(student);
      setIsDetailsModalOpen(true);
    };

    // Handle close modal
    const handleCloseModal = () => {
      setIsDetailsModalOpen(false);
      setSelectedStudent(null);
    };

    const handleDeleteStudent = async (studentId: string) => {
      const student = students.find((s) => s.id === studentId);
      const studentName = student?.user?.fullName || "this student";

      // Show confirmation dialog
      setStudentToDelete({ id: studentId, name: studentName });
      setIsDeleteDialogOpen(true);
    };

    // Handle confirm delete
    const handleConfirmDelete = async () => {
      if (!studentToDelete) return;

      setIsDeleteDialogOpen(false);
      const loadingToast = showToast.loading(
        `Deleting ${studentToDelete.name}...`
      );

      try {
        // Optimistic update - immediately remove from UI
        setStudents((prev) =>
          prev.filter((student) => student.id !== studentToDelete.id)
        );
        onStudentDeleted?.(studentToDelete.id);

        await apiService.admin.deleteStudent(studentToDelete.id);

        showToast.dismiss(loadingToast);
        showToast.success(
          `${studentToDelete.name} has been deleted successfully`
        );
      } catch (error) {
        console.error("Failed to delete student:", error);
        showToast.dismiss(loadingToast);
        showToast.error(
          "Failed to delete student",
          error instanceof Error ? error.message : "Please try again"
        );
        // Rollback on error - reload to restore original state
        loadStudents();
      } finally {
        setStudentToDelete(null);
      }
    };

    // Handle cancel delete
    const handleCancelDelete = () => {
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
    };

    const handleStatusChange = async (
      studentId: string,
      newStatus: boolean
    ) => {
      const student = students.find((s) => s.id === studentId);
      const studentName = student?.user?.fullName || "Student";
      const statusText = newStatus ? "activated" : "deactivated";

      const loadingToast = showToast.loading(`Updating ${studentName}...`);

      try {
        // Optimistic update - immediately update status in UI
        setStudents((prev) =>
          prev.map((student) =>
            student.id === studentId
              ? { ...student, isActive: newStatus }
              : student
          )
        );

        // Call API to update status (assuming there's an endpoint for this)
        // await apiService.admin.updateStudentStatus(studentId, newStatus);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        showToast.dismiss(loadingToast);
        showToast.success(`${studentName} has been ${statusText} successfully`);
      } catch (error) {
        console.error("Failed to update student status:", error);
        showToast.dismiss(loadingToast);
        showToast.error(
          "Failed to update student status",
          error instanceof Error ? error.message : "Please try again"
        );
        // Rollback on error - reload to restore original state
        loadStudents();
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
              Student Management
            </h1>
            <p className="text-gray-600">Manage all students in your school</p>
          </div>
          <Button onClick={onCreateStudent} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Student
          </Button>
        </div>

        {/* Filters */}
        <DataTableFilter
          searchPlaceholder="Search students..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filterConfigs}
        />

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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No students found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || classFilter !== "all" || statusFilter !== "all"
                  ? "No students match your search criteria."
                  : "Get started by adding your first student."}
              </p>
              {!searchTerm &&
                classFilter === "all" &&
                statusFilter === "all" && (
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
                            {student.user?.firstName?.[0] || "S"}
                            {student.user?.lastName?.[0] || "T"}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {student.user?.firstName || "N/A"}{" "}
                          {student.user?.lastName || ""}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {student.studentId} • Grade {student.grade}-
                          {student.section} • Roll: {student.rollNumber}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {student.user?.email || "N/A"} • Parent:{" "}
                          {student.parent?.fullName || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(student.isActive)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStudent(student)}
                        className="p-2"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditStudent(student)}
                        className="p-2"
                        title="Edit Student"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(student.id, !student.isActive)
                        }
                        className={`p-2 ${
                          student.isActive
                            ? "text-red-600 hover:text-red-700"
                            : "text-green-600 hover:text-green-700"
                        }`}
                        title={
                          student.isActive
                            ? "Deactivate Student"
                            : "Activate Student"
                        }
                      >
                        {student.isActive ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-2 text-red-600 hover:text-red-700"
                        title="Delete Student"
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

        {/* Student Details Modal */}
        <StudentDetailsModal
          student={selectedStudent}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseModal}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          title="Delete Student"
          message={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </div>
    );
  }
);

StudentList.displayName = "StudentList";

export default StudentList;
