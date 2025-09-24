import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import BasicInfo from "./BasicInfo";
import AddressInfo from "./AddressInfo";
import QualificationsInfo from "./QualificationsInfo";
import PhotoUpload from "./PhotoUpload";
import CredentialsDisplay from "./CredentialsDisplay";

interface TeacherFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  employeeId?: string;
  designation: string;
  bloodGroup: string;
  dob: string;
  joinDate?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  qualifications: Array<{
    degree: string;
    institution: string;
    year: string;
    grade?: string;
  }>;
  subjects: string[];
  photo?: File | null;
  photoPreview?: string;
}

interface Credentials {
  username: string;
  password: string;
  teacherId: string;
  employeeId: string;
}

interface TeacherFormProps {
  onBack?: () => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<TeacherFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeId: "",
    designation: "Teacher",
    bloodGroup: "O+",
    dob: "",
    joinDate: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Bangladesh",
    },
    qualifications: [],
    subjects: [],
    photo: null,
    photoPreview: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic info validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Qualifications validation
    formData.qualifications.forEach((qual, index) => {
      if (!qual.degree.trim()) {
        newErrors[`qualifications.${index}.degree`] = "Degree is required";
      }
      if (!qual.institution.trim()) {
        newErrors[`qualifications.${index}.institution`] =
          "Institution is required";
      }
      if (!qual.year.trim()) {
        newErrors[`qualifications.${index}.year`] = "Year is required";
      }
    });

    // Subjects validation
    formData.subjects.forEach((subject, index) => {
      if (!subject.trim()) {
        newErrors[`subjects.${index}`] = "Subject name is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Add basic fields
      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("designation", formData.designation);
      submitData.append("bloodGroup", formData.bloodGroup);
      submitData.append("dob", formData.dob);

      if (formData.email) submitData.append("email", formData.email);
      if (formData.phone) submitData.append("phone", formData.phone);
      if (formData.joinDate) submitData.append("joinDate", formData.joinDate);

      // Add address
      submitData.append("address", JSON.stringify(formData.address));

      // Add qualifications and subjects
      submitData.append(
        "qualifications",
        JSON.stringify(formData.qualifications)
      );
      submitData.append("subjects", JSON.stringify(formData.subjects));

      // Add photo if exists
      if (formData.photo) {
        submitData.append("photo", formData.photo);
      }

      // Make API call to create teacher
      const response = await fetch("/api/teachers", {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create teacher");
      }

      const result = await response.json();

      // Show success and credentials
      toast.success("Teacher created successfully!");
      setCredentials(result.credentials);

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        employeeId: "",
        designation: "Teacher",
        bloodGroup: "O+",
        dob: "",
        joinDate: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "Bangladesh",
        },
        qualifications: [],
        subjects: [],
        photo: null,
        photoPreview: "",
      });
    } catch (error) {
      console.error("Error creating teacher:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create teacher"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Teacher
              </h1>
              <p className="text-gray-600">
                Create a new teacher profile with credentials
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <BasicInfo
                formData={formData}
                errors={errors}
                onChange={handleChange}
              />

              <AddressInfo
                formData={formData}
                errors={errors}
                onChange={handleChange}
              />

              <QualificationsInfo
                formData={formData}
                errors={errors}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-6">
              <PhotoUpload
                formData={formData}
                errors={errors}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Creating Teacher..." : "Create Teacher"}
            </Button>
          </div>
        </form>

        {/* Progress Indicator */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p>Creating teacher profile...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Credentials Display Modal */}
      {credentials && (
        <CredentialsDisplay
          credentials={credentials}
          onClose={() => setCredentials(null)}
        />
      )}
    </>
  );
};

export default TeacherForm;
