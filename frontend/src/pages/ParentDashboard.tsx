import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const ParentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, childrenResponse] = await Promise.all([
        apiService.parent.getDashboard(),
        apiService.parent.getChildren()
      ]);

      if (dashboardResponse.data.success) {
        setDashboardData(dashboardResponse.data.data);
      }

      if (childrenResponse.data.success) {
        setChildren(childrenResponse.data.data);
        if (childrenResponse.data.data.length > 0) {
          setSelectedChild(childrenResponse.data.data[0]);
        }
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
              <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
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

      <nav className="bg-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a href="/parent" className="text-white px-3 py-4 text-sm font-medium hover:bg-pink-700">
              Dashboard
            </a>
            <a href="/parent/attendance" className="text-white px-3 py-4 text-sm font-medium hover:bg-pink-700">
              Attendance
            </a>
            <a href="/parent/grades" className="text-white px-3 py-4 text-sm font-medium hover:bg-pink-700">
              Grades
            </a>
            <a href="/parent/homework" className="text-white px-3 py-4 text-sm font-medium hover:bg-pink-700">
              Homework
            </a>
            <a href="/parent/notices" className="text-white px-3 py-4 text-sm font-medium hover:bg-pink-700">
              Notices
            </a>
          </div>
        </div>
      </nav>

      {/* Child Selection */}
      {children.length > 1 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <label htmlFor="child-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Child:
            </label>
            <select
              id="child-select"
              value={selectedChild?.id || ''}
              onChange={(e) => {
                const child = children.find(c => c.id === e.target.value);
                setSelectedChild(child);
              }}
              className="block w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.firstName} {child.lastName} - Grade {child.grade}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<ParentHome dashboardData={dashboardData} selectedChild={selectedChild} />} />
          <Route path="/attendance" element={<ChildAttendanceView selectedChild={selectedChild} />} />
          <Route path="/grades" element={<ChildGradeView selectedChild={selectedChild} />} />
          <Route path="/homework" element={<ChildHomeworkView selectedChild={selectedChild} />} />
          <Route path="/notices" element={<NoticesView selectedChild={selectedChild} />} />
        </Routes>
      </main>
    </div>
  );
};

const ParentHome: React.FC<{ dashboardData: any; selectedChild: any }> = ({ dashboardData, selectedChild }) => {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        {selectedChild && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedChild.firstName} {selectedChild.lastName}'s Progress
            </h2>
            <p className="text-gray-600 mb-6">Grade {selectedChild.grade} - Section {selectedChild.section}</p>
          </>
        )}

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
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">New Notices</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.newNotices || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Performance</h3>
            <div className="space-y-3">
              {dashboardData?.recentGrades?.slice(0, 5).map((grade: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{grade.subject}</p>
                    <p className="text-xs text-gray-500">{grade.examType}</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{grade.grade}</span>
                </div>
              )) || (
                <p className="text-gray-500">No recent grades available.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Present Days</span>
                <span className="text-sm font-bold text-green-600">{dashboardData?.presentDays || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Absent Days</span>
                <span className="text-sm font-bold text-red-600">{dashboardData?.absentDays || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Late Arrivals</span>
                <span className="text-sm font-bold text-yellow-600">{dashboardData?.lateArrivals || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components
const ChildAttendanceView: React.FC<{ selectedChild: any }> = ({ selectedChild }) => (
  <div className="px-4 py-6 sm:px-0">
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {selectedChild ? `${selectedChild.firstName}'s Attendance` : 'Child Attendance'}
      </h2>
      <p className="text-gray-500">Child attendance view interface will be implemented here.</p>
    </div>
  </div>
);

const ChildGradeView: React.FC<{ selectedChild: any }> = ({ selectedChild }) => (
  <div className="px-4 py-6 sm:px-0">
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {selectedChild ? `${selectedChild.firstName}'s Grades` : 'Child Grades'}
      </h2>
      <p className="text-gray-500">Child grade view interface will be implemented here.</p>
    </div>
  </div>
);

const ChildHomeworkView: React.FC<{ selectedChild: any }> = ({ selectedChild }) => (
  <div className="px-4 py-6 sm:px-0">
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {selectedChild ? `${selectedChild.firstName}'s Homework` : 'Child Homework'}
      </h2>
      <p className="text-gray-500">Child homework view interface will be implemented here.</p>
    </div>
  </div>
);

const NoticesView: React.FC<{ selectedChild: any }> = ({ selectedChild }) => (
  <div className="px-4 py-6 sm:px-0">
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Notices & Announcements</h2>
      <p className="text-gray-500">Notices view interface will be implemented here.</p>
    </div>
  </div>
);

export default ParentDashboard;