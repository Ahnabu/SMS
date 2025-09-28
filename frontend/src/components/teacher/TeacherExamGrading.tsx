import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  GraduationCap,
  FileText,
  Users,
  Calendar,
  Clock,
  Save,
  CheckCircle,
  User,
  BookOpen,
  TrendingUp,
  Award,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { teacherApi } from "../../services/teacher.api";

interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: string;
  section: string;
  date: string;
  duration: string;
  totalMarks: number;
  passingMarks: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'graded';
  studentsCount: number;
  gradedCount: number;
  priority?: 'high' | 'medium' | 'low';
  deadline?: string;
  isFromCalendar?: boolean;
  calendarEventId?: string;
}

interface GradingTask {
  id: string;
  examId: string;
  title: string;
  subject: string;
  grade: string;
  section: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  studentsCount: number;
  gradedCount: number;
  isOverdue: boolean;
}

interface StudentGrade {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  obtainedMarks?: number;
  status: 'pending' | 'graded';
  grade?: string;
  percentage?: number;
  remarks?: string;
}

interface ExamGrading {
  examId: string;
  examTitle: string;
  subject: string;
  grade: string;
  section: string;
  totalMarks: number;
  passingMarks: number;
  students: StudentGrade[];
}

const TeacherExamGrading: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [gradingTasks, setGradingTasks] = useState<GradingTask[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamGrading | null>(null);
  const [activeTab, setActiveTab] = useState<'exams' | 'tasks'>('tasks');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishingGrades, setPublishingGrades] = useState(false);
  const [grades, setGrades] = useState<{ [studentId: string]: number }>({});
  const [remarks, setRemarks] = useState<{ [studentId: string]: string }>({});

  useEffect(() => {
    loadGradingTasks();
    loadAssignedExams();
  }, []);

  const loadGradingTasks = async () => {
    try {
      setLoading(true);
      const response = await teacherApi.getMyGradingTasks();
      if (response.data.success) {
        setGradingTasks(response.data.data.tasks || []);
      }
    } catch (error: any) {
      console.error("Failed to load grading tasks:", error);
      toast.error(error.response?.data?.message || "Failed to load grading tasks");
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedExams = async () => {
    try {
      setLoading(true);
      const response = await teacherApi.getAssignedExams();
      if (response.data.success) {
        setExams(response.data.data.exams || []);
      }
    } catch (error: any) {
      console.error("Failed to load assigned exams:", error);
      toast.error(error.response?.data?.message || "Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const loadExamGrading = async (examId: string) => {
    try {
      setLoading(true);
      const response = await teacherApi.getExamGradingDetails(examId);
      if (response.data.success) {
        const examGrading = response.data.data;
        setSelectedExam(examGrading);
        
        // Initialize grades and remarks
        const initialGrades: { [key: string]: number } = {};
        const initialRemarks: { [key: string]: string } = {};
        
        examGrading.students.forEach((student: StudentGrade) => {
          if (student.obtainedMarks !== undefined) {
            initialGrades[student.studentId] = student.obtainedMarks;
          }
          if (student.remarks) {
            initialRemarks[student.studentId] = student.remarks;
          }
        });
        
        setGrades(initialGrades);
        setRemarks(initialRemarks);
      }
    } catch (error: any) {
      console.error("Failed to load exam grading details:", error);
      toast.error(error.response?.data?.message || "Failed to load exam details");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId: string, marks: number) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: marks
    }));
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    setRemarks(prev => ({
      ...prev,
      [studentId]: remark
    }));
  };

  const calculateGrade = (obtainedMarks: number, totalMarks: number) => {
    const percentage = (obtainedMarks / totalMarks) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'F';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const isTaskOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-green-700 bg-green-100';
      case 'A': return 'text-green-600 bg-green-50';
      case 'B+': return 'text-blue-700 bg-blue-100';
      case 'B': return 'text-blue-600 bg-blue-50';
      case 'C+': return 'text-yellow-700 bg-yellow-100';
      case 'C': return 'text-yellow-600 bg-yellow-50';
      case 'F': return 'text-red-700 bg-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleSaveGrades = async (publishImmediately: boolean = false) => {
    if (!selectedExam) return;

    const gradesData = selectedExam.students.map(student => {
      const obtainedMarks = grades[student.studentId];
      const studentRemarks = remarks[student.studentId] || '';
      
      if (obtainedMarks === undefined) {
        return null; // Skip students without grades
      }

      const percentage = (obtainedMarks / selectedExam.totalMarks) * 100;
      const grade = calculateGrade(obtainedMarks, selectedExam.totalMarks);

      return {
        studentId: student.studentId,
        obtainedMarks,
        percentage,
        grade,
        remarks: studentRemarks,
      };
    }).filter(Boolean) as Array<{
      studentId: string;
      obtainedMarks: number;
      percentage: number;
      grade: string;
      remarks?: string;
    }>;

    if (gradesData.length === 0) {
      toast.error("Please enter grades for at least one student");
      return;
    }

    try {
      setSaving(true);
      const response = await teacherApi.submitGrades({
        examId: selectedExam.examId,
        grades: gradesData,
        publishImmediately
      });

      if (response.data.success) {
        const message = publishImmediately 
          ? `Grades submitted and published for ${gradesData.length} student(s)! Notifications sent to parents.`
          : `Grades saved for ${gradesData.length} student(s)! You can publish them later.`;
        
        toast.success(message);
        loadGradingTasks(); // Refresh tasks
        loadAssignedExams(); // Refresh exam list
        loadExamGrading(selectedExam.examId); // Refresh grading details
      }
    } catch (error: any) {
      console.error("Failed to submit grades:", error);
      toast.error(error.response?.data?.message || "Failed to submit grades");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishGrades = async () => {
    if (!selectedExam) return;

    try {
      setPublishingGrades(true);
      const response = await teacherApi.publishGrades(selectedExam.examId);

      if (response.data.success) {
        toast.success("Grades published successfully! Notifications sent to students and parents.");
        loadGradingTasks(); // Refresh tasks
        loadAssignedExams(); // Refresh exam list
        loadExamGrading(selectedExam.examId); // Refresh grading details
      }
    } catch (error: any) {
      console.error("Failed to publish grades:", error);
      toast.error(error.response?.data?.message || "Failed to publish grades");
    } finally {
      setPublishingGrades(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      case 'ongoing': return 'text-orange-600 bg-orange-50';
      case 'completed': return 'text-purple-600 bg-purple-50';
      case 'graded': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (selectedExam) {
    const totalStudents = selectedExam.students.length;
    const gradedStudents = Object.keys(grades).length;
    const averageMarks = gradedStudents > 0 
      ? Object.values(grades).reduce((sum, marks) => sum + marks, 0) / gradedStudents 
      : 0;
    const passedStudents = Object.values(grades).filter(marks => marks >= selectedExam.passingMarks).length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              onClick={() => setSelectedExam(null)}
              variant="outline"
              className="mb-2"
            >
              ← Back to Exams
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">{selectedExam.examTitle}</h2>
            <p className="text-gray-600">
              {selectedExam.subject} - Grade {selectedExam.grade} Section {selectedExam.section}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => handleSaveGrades(false)}
              disabled={saving || gradedStudents === 0}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              {saving ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft ({gradedStudents}/{totalStudents})
                </>
              )}
            </Button>
            <Button
              onClick={() => handleSaveGrades(true)}
              disabled={saving || gradedStudents === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save & Publish ({gradedStudents}/{totalStudents})
                </>
              )}
            </Button>
            {gradedStudents > 0 && (
              <Button
                onClick={handlePublishGrades}
                disabled={publishingGrades}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {publishingGrades ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish Grades
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Grading Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Graded</p>
                  <p className="text-2xl font-bold text-gray-900">{gradedStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Average</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {gradedStudents > 0 ? averageMarks.toFixed(1) : '-'}/{selectedExam.totalMarks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Passed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {passedStudents}/{gradedStudents || totalStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grading Form */}
        <Card>
          <CardHeader>
            <CardTitle>Student Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedExam.students.map((student) => {
                const obtainedMarks = grades[student.studentId];
                const grade = obtainedMarks !== undefined ? calculateGrade(obtainedMarks, selectedExam.totalMarks) : '';
                const percentage = obtainedMarks !== undefined ? ((obtainedMarks / selectedExam.totalMarks) * 100) : 0;

                return (
                  <div key={student.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="grid gap-4 md:grid-cols-12 items-center">
                      <div className="md:col-span-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.studentName}</p>
                            <p className="text-sm text-gray-600">Roll: {student.rollNumber}</p>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Marks (out of {selectedExam.totalMarks})
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max={selectedExam.totalMarks}
                          value={obtainedMarks || ''}
                          onChange={(e) => handleGradeChange(student.studentId, parseFloat(e.target.value) || 0)}
                          placeholder="Enter marks"
                        />
                      </div>

                      <div className="md:col-span-2">
                        {obtainedMarks !== undefined && (
                          <div className="text-center">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(grade)}`}>
                              {grade}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {percentage.toFixed(1)}%
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Remarks (Optional)
                        </label>
                        <Input
                          value={remarks[student.studentId] || ''}
                          onChange={(e) => handleRemarkChange(student.studentId, e.target.value)}
                          placeholder="Add remarks..."
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Exam Grading</h2>
          <p className="text-sm sm:text-base text-gray-600">Grade exams assigned to your subjects</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setActiveTab('tasks')}
            variant={activeTab === 'tasks' ? 'default' : 'outline'}
            className={`${activeTab === 'tasks' ? 'bg-blue-600 text-white' : ''} text-sm`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Tasks
          </Button>
          <Button
            onClick={() => setActiveTab('exams')}
            variant={activeTab === 'exams' ? 'default' : 'outline'}
            className={`${activeTab === 'exams' ? 'bg-blue-600 text-white' : ''} text-sm`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Exams
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-500">
                  {activeTab === 'tasks' ? 'Total Tasks' : 'Total Exams'}
                </p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {activeTab === 'tasks' ? gradingTasks.length : exams.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">
                  {activeTab === 'tasks' ? 'Pending Tasks' : 'Pending Grading'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeTab === 'tasks' 
                    ? gradingTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
                    : exams.filter(e => e.status === 'completed').length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeTab === 'tasks' 
                    ? gradingTasks.filter(t => t.isOverdue && t.status !== 'completed').length
                    : exams.filter(e => e.deadline && isTaskOverdue(e.deadline) && e.status !== 'graded').length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeTab === 'tasks' 
                    ? gradingTasks.filter(t => t.status === 'completed').length
                    : exams.filter(e => e.status === 'graded').length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grading Tasks from Academic Calendar */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Grading Tasks from Academic Calendar</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                High Priority
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                Medium Priority
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Low Priority
              </div>
            </div>
          </div>

          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Clock className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading grading tasks...</p>
                </div>
              </CardContent>
            </Card>
          ) : gradingTasks.length > 0 ? (
            <div className="space-y-3">
              {gradingTasks
                .sort((a, b) => {
                  // Sort by priority (high > medium > low) and then by deadline
                  const priorityOrder = { high: 3, medium: 2, low: 1 };
                  if (a.priority !== b.priority) {
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                  }
                  return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                })
                .map((task) => (
                  <Card 
                    key={task.id} 
                    className={`hover:shadow-md transition-shadow ${
                      task.isOverdue && task.status !== 'completed' ? 'border-red-300 bg-red-50' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {task.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {task.priority.toUpperCase()} PRIORITY
                            </span>
                            {task.isOverdue && task.status !== 'completed' && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                OVERDUE
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-1" />
                              {task.subject}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              Grade {task.grade} - Section {task.section}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Due: {formatDate(task.deadline)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days left
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-sm">
                              <span className="text-gray-600">Progress: </span>
                              <span className="font-medium">
                                {task.gradedCount}/{task.studentsCount} graded
                              </span>
                            </div>
                            <div className="flex-1 max-w-xs">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    task.status === 'completed' ? 'bg-green-600' : 
                                    task.isOverdue ? 'bg-red-600' : 'bg-blue-600'
                                  }`}
                                  style={{
                                    width: `${(task.gradedCount / task.studentsCount) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <Button
                            onClick={() => loadExamGrading(task.examId)}
                            className={`${
                              task.priority === 'high' ? 'bg-red-600 hover:bg-red-700' :
                              task.priority === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
                              'bg-green-600 hover:bg-green-700'
                            } text-white`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {task.status === 'completed' ? 'Review Grades' : 'Start Grading'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Grading Tasks</h3>
                  <p className="text-gray-600">
                    You don't have any grading tasks from the academic calendar at the moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Regular Exams List */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Clock className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading exams...</p>
                </div>
              </CardContent>
            </Card>
          ) : exams.length > 0 ? (
            <div className="space-y-4">
              {exams.map((exam) => (
                <Card key={exam.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {exam.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                            {exam.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {exam.subject}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            Grade {exam.grade} - Section {exam.section}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(exam.date)}
                          </div>
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-1" />
                            {exam.totalMarks} marks
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="text-gray-600">Progress: </span>
                            <span className="font-medium">
                              {exam.gradedCount}/{exam.studentsCount} graded
                            </span>
                          </div>
                          <div className="flex-1 max-w-xs">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${(exam.gradedCount / exam.studentsCount) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        {exam.status === 'completed' || exam.status === 'graded' ? (
                          <Button
                            onClick={() => loadExamGrading(exam.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {exam.status === 'completed' ? 'Start Grading' : 'Continue Grading'}
                          </Button>
                        ) : (
                          <Button disabled variant="outline">
                            <Clock className="h-4 w-4 mr-2" />
                            {exam.status === 'upcoming' ? 'Upcoming' : 'Ongoing'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Assigned</h3>
                  <p className="text-gray-600">
                    You don't have any exams assigned for grading at the moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherExamGrading;