import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.student.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a href="/student" className="text-white px-3 py-4 text-sm font-medium hover:bg-indigo-700">
              Dashboard
            </a>
            <a href="/student/attendance" className="text-white px-3 py-4 text-sm font-medium hover:bg-indigo-700">
              My Attendance
            </a>
            <a href="/student/grades" className="text-white px-3 py-4 text-sm font-medium hover:bg-indigo-700">
              My Grades
            </a>
            <a href="/student/homework" className="text-white px-3 py-4 text-sm font-medium hover:bg-indigo-700">
              Homework
            </a>
            <a href="/student/schedule" className="text-white px-3 py-4 text-sm font-medium hover:bg-indigo-700">
              Class Schedule
            </a>
            <a href="/student/calendar" className="text-white px-3 py-4 text-sm font-medium hover:bg-indigo-700">
              Calendar
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<StudentHome dashboardData={dashboardData} />} />
          <Route path="/attendance" element={<AttendanceView />} />
          <Route path="/grades" element={<GradeView />} />
          <Route path="/homework" element={<HomeworkView />} />
          <Route path="/schedule" element={<ScheduleView />} />
          <Route path="/calendar" element={<CalendarView />} />
        </Routes>
      </main>
    </div>
  );
};

const StudentHome: React.FC<{ dashboardData: any }> = ({ dashboardData }) => {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Academic Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.attendancePercentage || 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Overall Grade</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.overallGrade || 'A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pending Homework</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.pendingHomework || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 12v-4m0 0a7 7 0 01-7-7V8a1 1 0 011-1h12a1 1 0 011 1v1a7 7 0 01-7 7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Today's Classes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.todayClasses || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Grades</h3>
            <div className="space-y-3">
              {dashboardData?.recentGrades?.slice(0, 5).map((grade: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{grade.subject}</span>
                  <span className="text-sm font-bold text-blue-600">{grade.grade}</span>
                </div>
              )) || (
                <p className="text-gray-500">No recent grades available.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Assignments</h3>
            <div className="space-y-3">
              {dashboardData?.upcomingAssignments?.slice(0, 5).map((assignment: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                    <p className="text-xs text-gray-500">{assignment.subject}</p>
                  </div>
                  <span className="text-xs text-red-600">{assignment.dueDate}</span>
                </div>
              )) || (
                <p className="text-gray-500">No upcoming assignments.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components
const AttendanceView: React.FC = () => (
  <div className="px-4 py-6 sm:px-0">
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Attendance</h2>
      <p className="text-gray-500">Attendance view interface will be implemented here.</p>
    </div>
  </div>
);

const GradeView: React.FC = () => (
  <div className="px-4 py-6 sm:px-0">
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Grades</h2>
      <p className="text-gray-500">Grade view interface will be implemented here.</p>
    </div>
  </div>
);

const HomeworkView: React.FC = () => (
  <div className="px-4 py-6 sm:px-0">
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Homework</h2>
      <p className="text-gray-500">Homework view interface will be implemented here.</p>
    </div>
  </div>
);

const ScheduleView: React.FC = () => (
  <div className="px-4 py-6 sm:px-0">
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Class Schedule</h2>
      <p className="text-gray-500">Schedule view interface will be implemented here.</p>
    </div>
  </div>
);

const CalendarView: React.FC = () => (
  <div className="px-4 py-6 sm:px-0">
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Calendar</h2>
      <p className="text-gray-500">Calendar view interface will be implemented here.</p>
    </div>
  </div>
);

export default StudentDashboard;