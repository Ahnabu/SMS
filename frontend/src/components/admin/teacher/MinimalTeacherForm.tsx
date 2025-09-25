import React, { useState } from "react";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "../../../context/AuthContext";

interface MinimalTeacherFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  designation: string;
  bloodGroup: string;
  dob: string;
  joinDate?: string;
  subjects: string[];
  grades: number[];
  sections: string[];
  experience: {
    totalYears: number;
    previousSchools: any[];
  };
  qualifications: Array<{
    degree: string;
    institution: string;
    year: number;
    specialization?: string;
  }>;
  address: {
    street?: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  isClassTeacher: boolean;
  classTeacherFor?: {
    grade: number;
    section: string;
  };
}

const DESIGNATIONS = [
  'Principal', 'Vice Principal', 'Head Teacher', 'Senior Teacher', 'Teacher',
  'Assistant Teacher', 'Subject Coordinator', 'Sports Teacher', 'Music Teacher',
  'Art Teacher', 'Librarian', 'Lab Assistant'
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const COMMON_SUBJECTS = [
  'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Computer Science', 'Physical Education', 'Art', 'Music'
];

interface MinimalTeacherFormProps {
  onBack?: () => void;
  onSave?: (teacher: any) => void;
}

const MinimalTeacherForm: React.FC<MinimalTeacherFormProps> = ({ onBack, onSave }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<MinimalTeacherFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "Teacher",
    bloodGroup: "O+",
    dob: "",
    joinDate: "",
    subjects: ["Mathematics"],
    grades: [1],
    sections: ["A"],
    experience: {
      totalYears: 0,
      previousSchools: [],
    },
    qualifications: [{
      degree: "",
      institution: "",
      year: new Date().getFullYear(),
      specialization: "",
    }],
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Bangladesh",
    },
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
    },
    isClassTeacher: false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleNestedChange = (parent: keyof MinimalTeacherFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.address.city.trim()) newErrors['address.city'] = "City is required";
    if (!formData.address.state.trim()) newErrors['address.state'] = "State is required";
    if (!formData.address.zipCode.trim()) newErrors['address.zipCode'] = "Zip code is required";
    if (!formData.qualifications[0].degree.trim()) newErrors['qualification.degree'] = "Degree is required";
    if (!formData.qualifications[0].institution.trim()) newErrors['qualification.institution'] = "Institution is required";
    if (!formData.emergencyContact.name.trim()) newErrors['emergency.name'] = "Emergency contact name is required";
    if (!formData.emergencyContact.relationship.trim()) newErrors['emergency.relationship'] = "Emergency contact relationship is required";
    if (!formData.emergencyContact.phone.trim()) newErrors['emergency.phone'] = "Emergency contact phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    if (!user?.schoolId) {
      toast.error("School ID not found. Please login again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      // Add schoolId from authenticated user
      submitData.append("schoolId", user.schoolId);
      
      // Basic fields
      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("designation", formData.designation);
      submitData.append("bloodGroup", formData.bloodGroup);
      submitData.append("dob", formData.dob);
      
      if (formData.email) submitData.append("email", formData.email);
      if (formData.phone) submitData.append("phone", formData.phone);
      if (formData.joinDate && formData.joinDate.trim()) {
        submitData.append("joinDate", formData.joinDate);
      }

      // Required arrays and objects
      submitData.append("subjects", JSON.stringify(formData.subjects));
      submitData.append("grades", JSON.stringify(formData.grades));
      submitData.append("sections", JSON.stringify(formData.sections));
      submitData.append("experience", JSON.stringify(formData.experience));
      submitData.append("qualifications", JSON.stringify(formData.qualifications));
      submitData.append("address", JSON.stringify(formData.address));
      submitData.append("emergencyContact", JSON.stringify(formData.emergencyContact));
      submitData.append("isClassTeacher", JSON.stringify(formData.isClassTeacher));

      const response = await fetch("/api/admin/teachers", {
        method: "POST",
        body: submitData,
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          console.error("Teacher creation error:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error("Failed to parse error response as JSON:", jsonError);
          // Use the HTTP status text as fallback
        }
        
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse success response as JSON:", jsonError);
        throw new Error("Server returned invalid JSON response");
      }

      if (result.success) {
        setCredentials(result.data.credentials);
        toast.success("Teacher created successfully!");
        
        if (onSave) {
          onSave(result.data);
        }
      } else {
        throw new Error(result.message || "Failed to create teacher");
      }
    } catch (error: any) {
      console.error("Failed to save teacher:", error);
      toast.error(error.message || "Failed to save teacher. Please check the console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If credentials are shown, display them
  if (credentials) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-6">Teacher Created Successfully!</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Login Credentials</h3>
            <div className="space-y-3">
              <p><strong>Teacher ID:</strong> {credentials.teacherId}</p>
              <p><strong>Employee ID:</strong> {credentials.employeeId}</p>
              <p><strong>Username:</strong> {credentials.username}</p>
              <p><strong>Password:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{credentials.password}</span></p>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Please save these credentials securely. The teacher will be required to change their password on first login.
            </p>
            <Button onClick={onBack} className="mt-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teachers List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Teacher</h1>
          <p className="text-gray-600">Fill out the required information to create a new teacher account</p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter last name"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
              <select
                value={formData.designation}
                onChange={(e) => handleChange("designation", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DESIGNATIONS.map((designation) => (
                  <option key={designation} value={designation}>{designation}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group *</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleChange("bloodGroup", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="teacher@school.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
              <input
                type="date"
                value={formData.joinDate || ""}
                onChange={(e) => handleChange("joinDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Teaching Details */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Teaching Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjects *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {COMMON_SUBJECTS.map((subject) => (
                  <label key={subject} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChange("subjects", [...formData.subjects, subject]);
                        } else {
                          handleChange("subjects", formData.subjects.filter(s => s !== subject));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Total Years) *</label>
              <input
                type="number"
                min="0"
                max="45"
                value={formData.experience.totalYears}
                onChange={(e) => handleNestedChange("experience", "totalYears", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Qualification */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Qualification</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Degree *</label>
              <input
                type="text"
                value={formData.qualifications[0].degree}
                onChange={(e) => {
                  const newQuals = [...formData.qualifications];
                  newQuals[0].degree = e.target.value;
                  handleChange("qualifications", newQuals);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Bachelor of Education"
              />
              {errors['qualification.degree'] && <p className="text-red-500 text-sm mt-1">{errors['qualification.degree']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Institution *</label>
              <input
                type="text"
                value={formData.qualifications[0].institution}
                onChange={(e) => {
                  const newQuals = [...formData.qualifications];
                  newQuals[0].institution = e.target.value;
                  handleChange("qualifications", newQuals);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., University of Dhaka"
              />
              {errors['qualification.institution'] && <p className="text-red-500 text-sm mt-1">{errors['qualification.institution']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input
                type="number"
                min="1980"
                max={new Date().getFullYear()}
                value={formData.qualifications[0].year}
                onChange={(e) => {
                  const newQuals = [...formData.qualifications];
                  newQuals[0].year = parseInt(e.target.value) || new Date().getFullYear();
                  handleChange("qualifications", newQuals);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleNestedChange("address", "city", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter city"
              />
              {errors['address.city'] && <p className="text-red-500 text-sm mt-1">{errors['address.city']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => handleNestedChange("address", "state", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter state/province"
              />
              {errors['address.state'] && <p className="text-red-500 text-sm mt-1">{errors['address.state']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code *</label>
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => handleNestedChange("address", "zipCode", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter zip code"
              />
              {errors['address.zipCode'] && <p className="text-red-500 text-sm mt-1">{errors['address.zipCode']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
              <input
                type="text"
                value={formData.address.street || ""}
                onChange={(e) => handleNestedChange("address", "street", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter street address"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.emergencyContact.name}
                onChange={(e) => handleNestedChange("emergencyContact", "name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Emergency contact name"
              />
              {errors['emergency.name'] && <p className="text-red-500 text-sm mt-1">{errors['emergency.name']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Relationship *</label>
              <input
                type="text"
                value={formData.emergencyContact.relationship}
                onChange={(e) => handleNestedChange("emergencyContact", "relationship", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Spouse, Parent, Sibling"
              />
              {errors['emergency.relationship'] && <p className="text-red-500 text-sm mt-1">{errors['emergency.relationship']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <input
                type="tel"
                value={formData.emergencyContact.phone}
                onChange={(e) => handleNestedChange("emergencyContact", "phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Emergency contact phone"
              />
              {errors['emergency.phone'] && <p className="text-red-500 text-sm mt-1">{errors['emergency.phone']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.emergencyContact.email || ""}
                onChange={(e) => handleNestedChange("emergencyContact", "email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Emergency contact email"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Creating Teacher..." : "Create Teacher"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MinimalTeacherForm;