import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  TrendingUp,
  BookOpen,
  Award,
  Target,
  Calendar,
  BarChart3,
} from "lucide-react";
import { apiService } from "@/services";

interface GradeRecord {
  examId: string;
  examName: string;
  examType: string;
  subject: string;
  subjectId: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  date: string;
  academicYear: string;
}

interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  examsCount: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  latestGrade: string;
}

interface GradeProgression {
  period: string;
  averagePercentage: number;
  examsCount: number;
}

interface GradeData {
  overallStats: {
    totalExams: number;
    averagePercentage: number;
    highestScore: number;
    lowestScore: number;
  };
  subjectPerformance: SubjectPerformance[];
  gradeProgression: GradeProgression[];
  recentGrades: GradeRecord[];
}

const GradeView: React.FC = () => {
  const [gradeData, setGradeData] = useState<GradeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGradeData();
  }, []);

  const loadGradeData = async () => {
    try {
      setLoading(true);
      const response = await apiService.student.getGrades();
      if (response.data.success) {
        setGradeData(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load grade data:", err);
      setError("Failed to load grade data");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeColors: { [key: string]: string } = {
      "A+": "bg-green-100 text-green-800",
      A: "bg-green-100 text-green-800",
      "B+": "bg-blue-100 text-blue-800",
      B: "bg-blue-100 text-blue-800",
      "C+": "bg-yellow-100 text-yellow-800",
      C: "bg-yellow-100 text-yellow-800",
      D: "bg-orange-100 text-orange-800",
      F: "bg-red-100 text-red-800",
    };
    return gradeColors[grade] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90)
      return { level: "Excellent", color: "text-green-600" };
    if (percentage >= 80) return { level: "Very Good", color: "text-blue-600" };
    if (percentage >= 70) return { level: "Good", color: "text-yellow-600" };
    if (percentage >= 60) return { level: "Average", color: "text-orange-600" };
    return { level: "Needs Improvement", color: "text-red-600" };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={loadGradeData}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gradeData) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500 text-center">No grade data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">
                  {gradeData.overallStats.totalExams}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average %</p>
                <p className="text-2xl font-bold text-green-600">
                  {gradeData.overallStats.averagePercentage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Highest Score
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {gradeData.overallStats.highestScore}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p
                  className={`text-lg font-bold ${
                    getPerformanceLevel(
                      gradeData.overallStats.averagePercentage
                    ).color
                  }`}
                >
                  {
                    getPerformanceLevel(
                      gradeData.overallStats.averagePercentage
                    ).level
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Subject-wise Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gradeData.subjectPerformance.map((subject, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {subject.subjectName}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(
                        subject.latestGrade
                      )}`}
                    >
                      {subject.latestGrade}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{subject.examsCount} exams</span>
                    <span>Avg: {subject.averagePercentage}%</span>
                    <span>High: {subject.highestScore}%</span>
                    <span>Low: {subject.lowestScore}%</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(subject.averagePercentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grade Progression Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Grade Progression Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gradeData.gradeProgression.map((progress, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="text-sm font-medium text-gray-900">
                  {progress.period}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    {progress.examsCount} exams
                  </div>
                  <div className="text-lg font-bold text-indigo-600">
                    {progress.averagePercentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Grades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Recent Exam Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gradeData.recentGrades.map((grade, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {grade.examName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {grade.subject} • {formatDate(grade.date)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {grade.marksObtained}/{grade.totalMarks}
                    </div>
                    <div className="text-lg font-bold text-indigo-600">
                      {grade.percentage}%
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(
                      grade.grade
                    )}`}
                  >
                    {grade.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {gradeData.recentGrades.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No recent grades found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeView;
