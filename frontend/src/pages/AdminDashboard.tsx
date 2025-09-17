import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getDashboard();

      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
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
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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

      {/* Navigation */}
      <nav className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a href="/admin" className="text-white px-3 py-4 text-sm font-medium hover:bg-blue-700">
              Dashboard
            </a>
            <a href="/admin/students" className="text-white px-3 py-4 text-sm font-medium hover:bg-blue-700">
              Students
            </a>
            <a href="/admin/teachers" className="text-white px-3 py-4 text-sm font-medium hover:bg-blue-700">
              Teachers
            </a>
            <a href="/admin/subjects" className="text-white px-3 py-4 text-sm font-medium hover:bg-blue-700">
              Subjects
            </a>
            <a href="/admin/schedules" className="text-white px-3 py-4 text-sm font-medium hover:bg-blue-700">
              Schedules
            </a>
            <a href="/admin/calendar" className="text-white px-3 py-4 text-sm font-medium hover:bg-blue-700">
              Calendar
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<AdminHome dashboardData={dashboardData} />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/teachers" element={<TeacherManagement />} />
          <Route path="/subjects" element={<SubjectManagement />} />
          <Route path="/schedules" element={<ScheduleManagement />} />
          <Route path="/calendar" element={<CalendarManagement />} />
        </Routes>
      </main>
    </div>
  );
};

// Admin Home Component
const AdminHome: React.FC<{ dashboardData: any }> = ({ dashboardData }) => {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">School Overview</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.totalStudents || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.totalTeachers || 0}</p>
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
                <p className="text-sm text-gray-500">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.totalSubjects || 0}</p>
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
                <p className="text-sm text-gray-500">Active Classes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.activeClasses || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-sm font-medium transition duration-200">
              Add Student
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-sm font-medium transition duration-200">
              Add Teacher
            </button>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-md text-sm font-medium transition duration-200">
              Create Schedule
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md text-sm font-medium transition duration-200">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other routes
const StudentManagement: React.FC = () => (
  <div className="px-4 py-6 sm:px-0">
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Management</h2>
      <p className="text-gray-500">Student management interface will be implemented here.</p>
    </div>
  </div>
);

const TeacherManagement: React.FC = () => (
  <div className="px-4 py-6 sm:px-0">
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Teacher Management</h2>
      <p className="text-gray-500">Teacher management interface will be implemented here.</p>
    </div>
  </div>
);

const SubjectManagement: React.FC = () => (
  <div className="px-4 py-6 sm:px-0">
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Subject Management</h2>
      <p className="text-gray-500">Subject management interface will be implemented here.</p>
    </div>
  </div>
);

const ScheduleManagement: React.FC = () => (
  <div className="px-4 py-6 sm:px-0">
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Management</h2>
      <p className="text-gray-500">Schedule management interface will be implemented here.</p>
    </div>
  </div>
);

const CalendarManagement: React.FC = () => (
  <div className="px-4 py-6 sm:px-0">
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Calendar Management</h2>
      <p className="text-gray-500">Calendar management interface will be implemented here.</p>
    </div>
  </div>
);

export default AdminDashboard;