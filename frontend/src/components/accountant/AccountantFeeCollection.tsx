import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiService } from "@/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  DollarSign,
  AlertCircle,
  Check,
  X,
  Users,
} from "lucide-react";

interface StudentWithFee {
  _id: string;
  studentId: string;
  name: string;
  grade: number;
  section: string;
  rollNumber: number;
  parentContact: string;
  feeStatus: {
    totalFeeAmount: number;
    totalPaidAmount: number;
    totalDueAmount: number;
    status: string;
    pendingMonths: number;
  } | null;
}

interface FeeStatus {
  student: {
    _id: string;
    studentId: string;
    name: string;
    grade: number;
    rollNumber: number;
  };
  feeRecord: any;
  upcomingDue?: {
    month: number;
    amount: number;
    dueDate: Date;
  };
  recentTransactions: any[];
}

const AccountantFeeCollection: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId');

  const [allStudents, setAllStudents] = useState<StudentWithFee[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithFee[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number | "">("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const [selectedStudent, setSelectedStudent] = useState<StudentWithFee | null>(null);
  const [feeStatus, setFeeStatus] = useState<FeeStatus | null>(null);
  const [loadingFeeStatus, setLoadingFeeStatus] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [remarks, setRemarks] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cheque", label: "Cheque" },
    { value: "online", label: "Online" },
  ];

  useEffect(() => {
    console.log("Component mounted, loading students...");
    loadAllStudents();
  }, []);

  useEffect(() => {
    if (preselectedStudentId && allStudents.length > 0) {
      const student = allStudents.find(s => s.studentId === preselectedStudentId);
      if (student) {
        handleSelectStudent(student);
      }
    }
  }, [preselectedStudentId, allStudents]);

  useEffect(() => {
    let filtered = [...allStudents];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.studentId.toLowerCase().includes(query) ||
          student.rollNumber.toString().includes(query)
      );
    }

    if (selectedGrade) {
      filtered = filtered.filter((student) => student.grade === selectedGrade);
    }

    if (selectedSection) {
      filtered = filtered.filter((student) => student.section === selectedSection);
    }

    if (selectedStatus) {
      filtered = filtered.filter(
        (student) => student.feeStatus?.status === selectedStatus
      );
    }

    setFilteredStudents(filtered);
  }, [searchQuery, selectedGrade, selectedSection, selectedStatus, allStudents]);

  const loadAllStudents = async () => {
    try {
      setStudentsLoading(true);
      console.log("Fetching all students...");
      const response = await apiService.accountant.getStudentsByGradeSection({});
      console.log("Students response:", response);
      if (response.success) {
        console.log("Students loaded:", response.data.length, "students");
        setAllStudents(response.data);
        setFilteredStudents(response.data);
      } else {
        console.error("Failed to load students - response not successful:", response);
        setError("Failed to load students. Please refresh the page.");
      }
    } catch (err: any) {
      console.error("Failed to load students - error:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Failed to load students. Please refresh the page.");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleSelectStudent = async (student: StudentWithFee) => {
    setSelectedStudent(student);
    setError(null);
    setSuccess(null);
    setWarnings([]);

    try {
      setLoadingFeeStatus(true);
      const response = await apiService.accountant.getStudentFeeStatus(
        student._id
      );
      
      if (response.success) {
        setFeeStatus(response.data);

        if (response.data.upcomingDue) {
          setAmount(response.data.upcomingDue.amount);
          setSelectedMonth(response.data.upcomingDue.month);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load fee status");
    } finally {
      setLoadingFeeStatus(false);
    }
  };

  const handleValidate = async () => {
    if (!selectedStudent) return;

    try {
      setLoading(true);
      setError(null);
      setWarnings([]);

      const response = await apiService.accountant.validateFeeCollection({
        studentId: selectedStudent._id,
        month: selectedMonth,
        amount: amount,
      });

      if (response.success) {
        setWarnings(response.data.warnings || []);

        if (response.data.valid) {
          setSuccess("Validation successful! You can proceed with collection.");
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError("Cannot proceed: " + (response.data.errors?.join(", ") || "Validation failed"));
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Validation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCollectFee = async () => {
    if (!selectedStudent) return;

    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (window.confirm(`Confirm fee collection of ₹${formatCurrency(amount)} for ${selectedStudent.name}?`)) {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.accountant.collectFee({
          studentId: selectedStudent._id,
          month: selectedMonth,
          amount: amount,
          paymentMethod: paymentMethod,
          remarks: remarks,
        });

        if (response.success) {
          setSuccess(`Fee collected successfully! Transaction ID: ${response.data.transaction?.transactionId || 'N/A'}`);

          const statusResponse = await apiService.accountant.getStudentFeeStatus(
            selectedStudent._id
          );
          if (statusResponse.success) {
            setFeeStatus(statusResponse.data);
          }

          loadAllStudents();

          setAmount(0);
          setRemarks("");
          setWarnings([]);
          setPaymentMethod("cash");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to collect fee");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedStudent(null);
    setFeeStatus(null);
    setAmount(0);
    setRemarks("");
    setWarnings([]);
    setError(null);
    setSuccess(null);
  };

  const formatCurrency = (amt: number | undefined) => {
    if (amt === undefined || amt === null || isNaN(amt)) return "0";
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amt);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fee Collection</h1>
        <p className="text-gray-600 mt-1">Search and collect fees from students</p>
      </div>

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <ul className="list-disc pl-4">
              {warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                All Students ({filteredStudents.length})
              </CardTitle>
              <CardDescription>Search or select a student to collect fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, student ID, or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value ? Number(e.target.value) : "")}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Grades</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>

                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Sections</option>
                    {["A", "B", "C", "D", "E"].map((section) => (
                      <option key={section} value={section}>Section {section}</option>
                    ))}
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              {studentsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading students...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => handleSelectStudent(student)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          selectedStudent?._id === student._id
                            ? "bg-orange-50 border-orange-500 shadow-md"
                            : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-semibold text-gray-900">{student.name}</p>
                              {student.feeStatus && (
                                <span className={`text-xs px-2 py-1 rounded-md ${
                                  student.feeStatus.status === "paid"
                                    ? "bg-green-100 text-green-700"
                                    : student.feeStatus.status === "overdue"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}>
                                  {student.feeStatus.status}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span>{student.studentId}</span>
                              <span>•</span>
                              <span>Grade {student.grade} {student.section}</span>
                              <span>•</span>
                              <span>Roll #{student.rollNumber}</span>
                            </div>
                            {student.feeStatus && (
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                <span className="text-green-600">Paid: ₹{formatCurrency(student.feeStatus.totalPaidAmount)}</span>
                                <span className="text-orange-600">Due: ₹{formatCurrency(student.feeStatus.totalDueAmount)}</span>
                                <span className="text-red-600">Pending: {student.feeStatus.pendingMonths} months</span>
                              </div>
                            )}
                          </div>
                          {selectedStudent?._id === student._id && (
                            <Check className="w-5 h-5 text-orange-600" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No students found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Fee Collection
                </span>
                {selectedStudent && (
                  <button onClick={handleClearSelection} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </CardTitle>
              <CardDescription>
                {selectedStudent ? `Collecting fee for ${selectedStudent.name}` : "Select a student to collect fee"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedStudent ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No student selected</p>
                  <p className="text-sm text-gray-400 mt-1">Click on a student from the list</p>
                </div>
              ) : loadingFeeStatus ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading fee details...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900">{selectedStudent.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedStudent.studentId} • Grade {selectedStudent.grade} {selectedStudent.section}
                    </p>
                  </div>

                  {feeStatus && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Fee:</span>
                        <span className="font-semibold">₹{formatCurrency(feeStatus.feeRecord?.totalFeeAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-semibold text-green-600">₹{formatCurrency(feeStatus.feeRecord?.totalPaidAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Due:</span>
                        <span className="font-semibold text-orange-600">₹{formatCurrency(feeStatus.feeRecord?.totalDueAmount)}</span>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {months.map((month, idx) => (
                          <option key={idx + 1} value={idx + 1}>{month}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter amount"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {paymentMethods.map((method) => (
                          <option key={method.value} value={method.value}>{method.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows={3}
                        placeholder="Add any remarks..."
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <Button
                        onClick={handleValidate}
                        disabled={loading || !amount}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Validate
                      </Button>
                      <Button
                        onClick={handleCollectFee}
                        disabled={loading || !amount}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        {loading ? "Processing..." : "Collect Fee"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountantFeeCollection;
