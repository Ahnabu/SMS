import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  BookOpen,
  GraduationCap,
  Clock,
  Plus,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../services/admin.api";

interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  grades: number[];
  isCore: boolean;
  credits?: number;
  teachers: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const SubjectManagement: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    description: string;
    grades: number[];
    isCore: boolean;
    credits: number;
  }>({
    name: "",
    code: "",
    description: "",
    grades: [],
    isCore: true,
    credits: 1,
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSubjects();
      setSubjects(response.data.data || []);
    } catch (error) {
      toast.error("Error fetching subjects");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingSubject) {
        if (!editingSubject._id) {
          toast.error("Error: Subject ID not found");
          setLoading(false);
          return;
        }
        await adminApi.updateSubject(editingSubject._id, formData);
        toast.success("Subject updated successfully");
      } else {
        await adminApi.createSubject(formData);
        toast.success("Subject created successfully");
      }

      setIsFormOpen(false);
      setEditingSubject(null);
      resetForm();
      fetchSubjects();
    } catch (error) {
      toast.error("Error saving subject");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subjectId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this subject? This action cannot be undone."
      )
    )
      return;

    setLoading(true);
    try {
      await adminApi.deleteSubject(subjectId);
      toast.success("Subject deleted successfully");
      fetchSubjects();
    } catch (error) {
      toast.error("Error deleting subject");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      grades: [],
      isCore: true,
      credits: 1,
    });
  };

  const openEditForm = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || "",
      grades: subject.grades,
      isCore: subject.isCore,
      credits: subject.credits || 1,
    });
    setIsFormOpen(true);
  };

  const getCategoryColor = (isCore: boolean) => {
    return isCore
      ? "bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
      : "bg-green-100 text-green-800 px-2 py-1 rounded text-xs";
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade =
      filterGrade === "" || subject.grades.includes(parseInt(filterGrade));
    const matchesCore =
      filterCategory === "" ||
      (filterCategory === "core" ? subject.isCore : !subject.isCore);

    return matchesSearch && matchesGrade && matchesCore;
  });

  const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
    // Group by primary grade (first grade in the array)
    const primaryGrade = subject.grades[0]?.toString() || "No Grade";
    if (!acc[primaryGrade]) {
      acc[primaryGrade] = [];
    }
    acc[primaryGrade].push(subject);
    return acc;
  }, {} as { [key: string]: Subject[] });

  const uniqueGrades = [...new Set(subjects.flatMap((s) => s.grades))].sort(
    (a, b) => a - b
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subject Management</h1>
          <p className="text-gray-600">
            Manage academic subjects and curriculum
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Advanced Filters */}
      <Card className="border-0 shadow-lg bg-gradient-to-br p-4 from-blue-50 to-indigo-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Search className="w-3 h-3" />
              Search Subjects
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Subject name or code..."
                className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              Grade Level
            </label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              aria-label="Filter by grade level"
              title="Filter subjects by grade level"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Grades</option>
              {uniqueGrades.map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Subject Type
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              aria-label="Filter by subject type"
              title="Filter subjects by core or elective type"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="core">Core Subjects</option>
              <option value="elective">Elective Subjects</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 opacity-0">
              Actions
            </label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setFilterGrade("");
                  setFilterCategory("");
                }}
                className="flex-1 bg-white hover:bg-gray-50"
              >
                Clear
              </Button>
              <div className="text-xs text-gray-500 flex items-center bg-white px-2 py-1 rounded border">
                {filteredSubjects.length} found
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      {subjects.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Quick Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {subjects.length}
                </div>
                <div className="text-sm text-blue-700 font-medium">
                  Total Subjects
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {uniqueGrades.length}
                </div>
                <div className="text-sm text-green-700 font-medium">
                  Grade Levels
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {subjects.filter((s) => s.isCore).length}
                </div>
                <div className="text-sm text-purple-700 font-medium">
                  Core Subjects
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {subjects.filter((s) => !s.isCore).length}
                </div>
                <div className="text-sm text-orange-700 font-medium">
                  Electives
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {subjects.reduce((sum, s) => sum + (s.credits || 1), 0)}
                </div>
                <div className="text-sm text-red-700 font-medium">
                  Total Credits
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Subject Name *
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Advanced Mathematics"
                      required
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="code"
                      className="text-sm font-medium text-gray-700"
                    >
                      Subject Code *
                    </label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="e.g., MATH101"
                      required
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Provide a brief description of this subject..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Grade Levels * (Select all applicable grades)
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                      <div
                        key={grade}
                        className={`relative cursor-pointer p-3 rounded-md border-2 transition-all duration-200 ${
                          formData.grades.includes(grade)
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          const newGrades = formData.grades.includes(grade)
                            ? formData.grades.filter((g) => g !== grade)
                            : [...formData.grades, grade].sort((a, b) => a - b);
                          setFormData({ ...formData, grades: newGrades });
                        }}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium">Grade</div>
                          <div className="text-lg font-bold">{grade}</div>
                        </div>
                        {formData.grades.includes(grade) && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            ✓
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {formData.grades.length === 0 && (
                    <p className="text-sm text-red-600">
                      Please select at least one grade level
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="credits"
                      className="text-sm font-medium text-gray-700"
                    >
                      Credit Points *
                    </label>
                    <Input
                      id="credits"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.credits}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          credits: parseInt(e.target.value) || 1,
                        })
                      }
                      required
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Subject Type *
                    </label>
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isCore"
                          checked={formData.isCore}
                          onChange={() =>
                            setFormData({ ...formData, isCore: true })
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm">Core Subject</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isCore"
                          checked={!formData.isCore}
                          onChange={() =>
                            setFormData({ ...formData, isCore: false })
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm">Elective Subject</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingSubject(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || formData.grades.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : editingSubject ? (
                      "Update Subject"
                    ) : (
                      "Create Subject"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subjects Display */}
      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center">Loading subjects...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedSubjects).length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-500">
                  No subjects found.{" "}
                  {searchTerm || filterGrade || filterCategory
                    ? "Try adjusting your filters."
                    : "Add your first subject!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedSubjects).map(([grade, gradeSubjects]) => (
              <Card key={grade} className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className="text-xl font-semibold text-gray-800">
                        Grade {grade} Subjects
                      </span>
                    </div>
                    <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                      {gradeSubjects.length} subject
                      {gradeSubjects.length !== 1 ? "s" : ""}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gradeSubjects.map((subject) => (
                      <div
                        key={subject._id}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                              </div>
                              <h3 className="font-semibold text-lg text-gray-800">
                                {subject.name}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                              {subject.code}
                            </p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditForm(subject)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(subject._id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={getCategoryColor(subject.isCore)}>
                              {subject.isCore ? "Core" : "Elective"}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="w-3 h-3" />
                              <span>{subject.credits || 1} credits</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-wrap">
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Grades:
                            </span>
                            {subject.grades.map((grade) => (
                              <span
                                key={grade}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {grade}
                              </span>
                            ))}
                          </div>

                          {subject.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {subject.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                            <span>
                              {subject.grades.length} grade
                              {subject.grades.length !== 1 ? "s" : ""}
                            </span>
                            <span>
                              {subject.isActive ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  Active
                                </span>
                              ) : (
                                <span className="text-red-600 flex items-center gap-1">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  Inactive
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
