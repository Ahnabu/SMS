import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Building,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "../modules/school";
import { apiService } from "../../services/api";

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
  status: "active" | "inactive" | "suspended" | "pending_approval";
  affiliation?: string;
  stats?: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
  };
  admin?: {
    id: string;
    username: string;
    fullName: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface SchoolListProps {
  onCreateSchool: () => void;
  onEditSchool: (school: School) => void;
  onViewSchool: (school: School) => void;
  refreshTrigger?: number; // Add this to trigger refresh from parent
}

const SchoolList: React.FC<SchoolListProps> = ({
  onCreateSchool,
  onEditSchool,
  onViewSchool,
  refreshTrigger,
}) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadSchools();
  }, [currentPage, statusFilter, searchTerm, refreshTrigger]); 

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await apiService.superadmin.getSchools({
        page: currentPage,
        limit: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm || undefined,
      });

      if (response.data.success) {
        const responseData = response.data.data;
        // Ensure schools is always an array
        setSchools(
          Array.isArray(responseData.schools) ? responseData.schools : []
        );
        setTotalPages(responseData.totalPages || 1);
      } else {
        // Handle unsuccessful response
        setSchools([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to load schools:", error);
      // Set demo data
      setSchools([
        {
          id: "1",
          name: "Green Valley High School",
          slug: "green-valley-high",
          schoolId: "SCH001",
          establishedYear: 1995,
          address: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            country: "USA",
            postalCode: "10001",
          },
          contact: {
            phone: "+1-555-0123",
            email: "admin@greenvalley.edu",
            website: "https://greenvalley.edu",
          },
          status: "active",
          affiliation: "CBSE",
          stats: {
            totalStudents: 850,
            totalTeachers: 45,
            totalClasses: 24,
          },
          admin: {
            id: "admin1",
            username: "gv_admin",
            fullName: "John Smith",
            email: "john.smith@greenvalley.edu",
          },
          isActive: true,
          createdAt: "2024-01-15T10:00:00Z",
        },
        {
          id: "2",
          name: "Sunshine Elementary",
          slug: "sunshine-elementary",
          schoolId: "SCH002",
          establishedYear: 2001,
          address: {
            street: "456 Oak Ave",
            city: "Los Angeles",
            state: "CA",
            country: "USA",
            postalCode: "90001",
          },
          contact: {
            phone: "+1-555-0456",
            email: "admin@sunshine.edu",
          },
          status: "pending_approval",
          affiliation: "State Board",
          stats: {
            totalStudents: 320,
            totalTeachers: 18,
            totalClasses: 12,
          },
          admin: {
            id: "admin2",
            username: "sun_admin",
            fullName: "Sarah Johnson",
            email: "sarah.johnson@sunshine.edu",
          },
          isActive: true,
          createdAt: "2024-02-20T14:30:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (schoolId: string, newStatus: string) => {
    try {
      await apiService.superadmin.updateSchoolStatus(schoolId, newStatus);
      loadSchools();
    } catch (error) {
      console.error("Failed to update school status:", error);
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this school? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await apiService.superadmin.deleteSchool(schoolId);
      loadSchools();
    } catch (error) {
      console.error("Failed to delete school:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            School Management
          </h1>
          <p className="text-gray-600">Manage all schools in the system</p>
        </div>
        <Button onClick={onCreateSchool} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New School
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-2">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors min-w-[120px]"
                aria-label="Filter schools by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending_approval">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </Card>
      {/* Schools Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading schools...</p>
        </div>
      ) : schools.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No schools found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "No schools match your search criteria."
                : "Get started by creating your first school."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button
                onClick={onCreateSchool}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add New School
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-2 px-3 font-medium text-gray-900 text-sm">
                    School Name
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900 text-sm">
                    School ID
                  </th>
                  <th className="text-center py-2 px-3 font-medium text-gray-900 text-sm">
                    Status
                  </th>
                  <th className="text-center py-2 px-3 font-medium text-gray-900 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr
                    key={school.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 px-3">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          {school.name}
                        </h3>
                        {school.affiliation && (
                          <p className="text-xs text-blue-600">
                            {school.affiliation}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-sm text-gray-600">
                        {school.schoolId}
                      </span>
                      {school.establishedYear && (
                        <p className="text-xs text-gray-400">
                          Est. {school.establishedYear}
                        </p>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex justify-center">
                        <StatusBadge status={school.status} />
                      </div>
                      {school.status === "pending_approval" && (
                        <div className="flex gap-1 mt-1 justify-center">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusChange(school.id, "active")
                            }
                            className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(school.id, "suspended")
                            }
                            className="h-6 px-2 text-xs text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewSchool(school)}
                          className="h-7 w-7 p-0"
                          title="View Details & Admin Credentials"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditSchool(school)}
                          className="h-7 w-7 p-0"
                          title="Edit School"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSchool(school.id)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete School"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default SchoolList;
