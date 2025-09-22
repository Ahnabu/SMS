import React, { useState, useEffect } from "react";
import { X, User, MapPin, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { studentApi } from "../../services/student.api";
import { adminApi } from "../../services/admin.api";
import { useAuth } from "../../context/AuthContext";
import { showApiError, showToast } from "../../utils/toast";

interface Student {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  studentId: string;
  grade: number;
  section: string;
  rollNumber: number;
  dob?: string;
  bloodGroup?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  parent: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
  isActive: boolean;
  admissionDate: string;
  schoolId: string;
}

interface StudentFormProps {
  student?: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
}

const StudentForm: React.FC<StudentFormProps> = ({
  student,
  isOpen,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Student>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    studentId: "",
    grade: 9, // Changed from class to grade with number
    section: "",
    rollNumber: 1, // Changed to number
    dob: "", // Changed from dateOfBirth
    bloodGroup: "", // Added blood group
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    parent: {
      name: "",
      email: "",
      phone: "",
    },
    isActive: true,
    admissionDate: new Date().toISOString().split("T")[0],
    schoolId: user?.schoolId || "", // Added schoolId from auth
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [schoolData, setSchoolData] = useState<any>(null);
  const [loadingSchool, setLoadingSchool] = useState(false);

  // Load school data to get grade configuration
  useEffect(() => {
    const loadSchoolData = async () => {
      if (!user?.schoolId) return;

      setLoadingSchool(true);
      try {
        const response = await adminApi.getSchool(user.schoolId);
        console.log(response.data);
        if (response.data.success && response.data) {
          setSchoolData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load school data:", error);
      } finally {
        setLoadingSchool(false);
      }
    };

    loadSchoolData();
  }, [user?.schoolId]);
  console.log("schoolData:", schoolData);
  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        dob: student.dob?.split("T")[0] || "", // Changed from dateOfBirth
        admissionDate: student.admissionDate?.split("T")[0] || "",
        address: student.address || {
          street: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
        },
        schoolId: student.schoolId || user?.schoolId || "", // Ensure schoolId is set
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        studentId: "",
        grade: 9,
        section: "",
        rollNumber: 1,
        dob: "",
        bloodGroup: "",
        address: {
          street: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
        },
        parent: {
          name: "",
          email: "",
          phone: "",
        },
        isActive: true,
        admissionDate: new Date().toISOString().split("T")[0],
        schoolId: user?.schoolId || "",
      });
    }
    setErrors({});
  }, [student, isOpen, user?.schoolId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.studentId.trim())
      newErrors.studentId = "Student ID is required";
    if (!formData.grade || formData.grade < 1 || formData.grade > 12)
      newErrors.grade = "Valid grade is required";
    if (!formData.section.trim()) newErrors.section = "Section is required";
    if (!formData.rollNumber || formData.rollNumber < 1)
      newErrors.rollNumber = "Valid roll number is required";
    if (!formData.admissionDate)
      newErrors.admissionDate = "Admission date is required";
    if (!formData.schoolId) newErrors.schoolId = "School ID is required";

    // Parent validation
    if (!formData.parent.name.trim())
      newErrors.parentName = "Parent name is required";
    if (!formData.parent.email.trim())
      newErrors.parentEmail = "Parent email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parent.email)) {
      newErrors.parentEmail = "Invalid parent email format";
    }
    if (!formData.parent.phone.trim())
      newErrors.parentPhone = "Parent phone is required";

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
      console.log("Sending student data:", JSON.stringify(formData, null, 2));

      // Transform form data to match backend expectations
      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        grade: formData.grade, // Already a number
        section: formData.section,
        rollNumber: formData.rollNumber, // Already a number
        dob: formData.dob || new Date().toISOString().split("T")[0], // Ensure dob is not undefined
        bloodGroup: formData.bloodGroup || "A+", // Provide default if empty
        admissionDate: formData.admissionDate,
        schoolId: formData.schoolId,
        parentInfo: {
          firstName: formData.parent.name.split(" ")[0] || formData.parent.name,
          lastName: formData.parent.name.split(" ").slice(1).join(" ") || "",
          email: formData.parent.email,
          phone: formData.parent.phone,
        },
      };

      if (student?.id) {
        // Update existing student
        const response = await studentApi.update(student.id, studentData);
        if (response.data.success) {
          showToast.success("Student updated successfully!");
          onSave({ ...formData, id: student.id, ...response.data.data });
        }
      } else {
        // Create new student
        const response = await studentApi.create(studentData);
        if (response.data.success) {
          showToast.success("Student created successfully!");
          onSave({ ...formData, ...response.data.data });
        }
      }

      onClose();
    } catch (error: any) {
      console.error("Failed to save student:", error);
      console.error("Error response data:", error.response?.data);

      showApiError(error, "Failed to save student");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("address.")) {
      const addressField = field.replace("address.", "");
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value,
        },
      }));
    } else if (field.startsWith("parent.")) {
      const parentField = field.replace("parent.", "");
      setFormData((prev) => ({
        ...prev,
        parent: {
          ...prev.parent,
          [parentField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {student ? "Edit Student" : "Add New Student"}
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
                Student Information
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
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="Enter first name"
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Enter last name"
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
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
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.studentId}
                    onChange={(e) =>
                      handleInputChange("studentId", e.target.value)
                    }
                    placeholder="STU001"
                    className={errors.studentId ? "border-red-500" : ""}
                  />
                  {errors.studentId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.studentId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.grade.toString()}
                    onValueChange={(value) =>
                      handleInputChange("grade", parseInt(value))
                    }
                  >
                    <SelectTrigger
                      className={`w-full ${
                        errors.grade ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingSchool ? (
                        <SelectItem value="" disabled>
                          Loading grades...
                        </SelectItem>
                      ) : schoolData?.settings?.grades &&
                        schoolData.settings.grades.length > 0 ? (
                        schoolData.settings.grades.map((grade: number) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ))
                      ) : (
                        // Fallback to default grades if school data not available
                        <>
                          <SelectItem value="9">Grade 9</SelectItem>
                          <SelectItem value="10">Grade 10</SelectItem>
                          <SelectItem value="11">Grade 11</SelectItem>
                          <SelectItem value="12">Grade 12</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.grade && (
                    <p className="text-red-500 text-sm mt-1">{errors.grade}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.section}
                    onChange={(e) =>
                      handleInputChange("section", e.target.value)
                    }
                    placeholder="A"
                    className={errors.section ? "border-red-500" : ""}
                  />
                  {errors.section && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.section}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.rollNumber}
                    onChange={(e) =>
                      handleInputChange(
                        "rollNumber",
                        parseInt(e.target.value) || 1
                      )
                    }
                    placeholder="001"
                    className={errors.rollNumber ? "border-red-500" : ""}
                  />
                  {errors.rollNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.rollNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <DatePicker
                    value={formData.dob || ""}
                    onChange={(date) => handleInputChange("dob", date)}
                    placeholder="Select date of birth"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group
                  </label>
                  <Select
                    value={formData.bloodGroup || ""}
                    onValueChange={(value) =>
                      handleInputChange("bloodGroup", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Blood Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admission Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    value={formData.admissionDate}
                    onChange={(date) =>
                      handleInputChange("admissionDate", date)
                    }
                    placeholder="Select admission date"
                    error={!!errors.admissionDate}
                  />
                  {errors.admissionDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.admissionDate}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Parent/Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.parent.name}
                    onChange={(e) =>
                      handleInputChange("parent.name", e.target.value)
                    }
                    placeholder="Enter parent/guardian name"
                    className={errors.parentName ? "border-red-500" : ""}
                  />
                  {errors.parentName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.parentName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.parent.email}
                    onChange={(e) =>
                      handleInputChange("parent.email", e.target.value)
                    }
                    placeholder="Enter parent email"
                    className={errors.parentEmail ? "border-red-500" : ""}
                  />
                  {errors.parentEmail && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.parentEmail}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Phone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.parent.phone}
                    onChange={(e) =>
                      handleInputChange("parent.phone", e.target.value)
                    }
                    placeholder="Enter parent phone"
                    className={errors.parentPhone ? "border-red-500" : ""}
                  />
                  {errors.parentPhone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.parentPhone}
                    </p>
                  )}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <Input
                  value={formData.address?.street || ""}
                  onChange={(e) =>
                    handleInputChange("address.street", e.target.value)
                  }
                  placeholder="Enter street address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    value={formData.address?.city || ""}
                    onChange={(e) =>
                      handleInputChange("address.city", e.target.value)
                    }
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <Input
                    value={formData.address?.state || ""}
                    onChange={(e) =>
                      handleInputChange("address.state", e.target.value)
                    }
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <Input
                    value={formData.address?.country || ""}
                    onChange={(e) =>
                      handleInputChange("address.country", e.target.value)
                    }
                    placeholder="Enter country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <Input
                    value={formData.address?.postalCode || ""}
                    onChange={(e) =>
                      handleInputChange("address.postalCode", e.target.value)
                    }
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
                  {student ? "Update Student" : "Add Student"}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
