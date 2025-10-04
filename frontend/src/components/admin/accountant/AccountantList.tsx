import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { adminApi } from "@/services/admin.api";

export interface Accountant {
  id: string;
  userId: string;
  schoolId: string;
  accountantId: string;
  employeeId?: string;
  department: string;
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
    previousOrganizations?: {
      organizationName: string;
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
  responsibilities: string[];
  certifications?: string[];
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
  photoCount: number;
}

interface AccountantListProps {
  onCreateAccountant: () => void;
  onEditAccountant: (accountant: Accountant) => void;
  onViewAccountant: (accountant: Accountant) => void;
}

export const AccountantList: React.FC<AccountantListProps> = ({
  onCreateAccountant,
  onEditAccountant,
  onViewAccountant,
}) => {
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    designation: "",
    isActive: true as boolean | undefined,
    page: 1,
    limit: 20,
  });

  const fetchAccountants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAccountants(filters);
      
      if (response.data.success) {
        setAccountants(response.data.data || []);
      } else {
        setError("Failed to fetch accountants");
      }
    } catch (err: any) {
      console.error("Error fetching accountants:", err);
      setError(err.response?.data?.message || "Failed to fetch accountants");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAccountants();
  }, [fetchAccountants]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this accountant?")) {
      return;
    }

    try {
      const response = await adminApi.deleteAccountant(id);
      if (response.data.success) {
        setAccountants(accountants.filter((a) => a.id !== id));
      }
    } catch (err: any) {
      console.error("Error deleting accountant:", err);
      alert(err.response?.data?.message || "Failed to delete accountant");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accountants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <Button onClick={fetchAccountants} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Accountant Management</h2>
        <Button onClick={onCreateAccountant} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Accountant
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by ID or name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Departments</option>
              <option value="Finance">Finance</option>
              <option value="Payroll">Payroll</option>
              <option value="Accounts Payable">Accounts Payable</option>
              <option value="Accounts Receivable">Accounts Receivable</option>
              <option value="Budget Management">Budget Management</option>
              <option value="Financial Reporting">Financial Reporting</option>
              <option value="Audit">Audit</option>
              <option value="Tax">Tax</option>
              <option value="General Accounting">General Accounting</option>
            </select>

            <select
              value={filters.designation}
              onChange={(e) => setFilters({ ...filters, designation: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Designations</option>
              <option value="Chief Financial Officer">Chief Financial Officer</option>
              <option value="Finance Manager">Finance Manager</option>
              <option value="Chief Accountant">Chief Accountant</option>
              <option value="Senior Accountant">Senior Accountant</option>
              <option value="Accountant">Accountant</option>
              <option value="Junior Accountant">Junior Accountant</option>
              <option value="Accounts Assistant">Accounts Assistant</option>
              <option value="Payroll Officer">Payroll Officer</option>
              <option value="Financial Analyst">Financial Analyst</option>
              <option value="Auditor">Auditor</option>
            </select>

            <select
              value={filters.isActive === undefined ? "" : String(filters.isActive)}
              onChange={(e) => setFilters({ 
                ...filters, 
                isActive: e.target.value === "" ? undefined : e.target.value === "true"
              })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Accountants List */}
      {accountants.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 text-lg">No accountants found</p>
            <Button onClick={onCreateAccountant} className="mt-4">
              Add Your First Accountant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accountants.map((accountant) => (
            <Card key={accountant.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {accountant.user?.fullName || "N/A"}
                    </h3>
                    <p className="text-sm text-gray-500">{accountant.accountantId}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      accountant.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {accountant.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Designation:</span>
                    <span className="font-medium">{accountant.designation}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{accountant.department}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">{accountant.totalExperience} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-xs">{accountant.user?.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{accountant.user?.phone || "N/A"}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewAccountant(accountant)}
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAccountant(accountant)}
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(accountant.id)}
                    className="flex items-center justify-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountantList;
