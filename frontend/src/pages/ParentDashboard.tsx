import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '@/services';
import MobileNavigation from '../components/layout/MobileNavigation';

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

  const navigationItems = [
    { label: 'Dashboard', href: '/parent' },
    { label: 'Attendance', href: '/parent/attendance' },
    { label: 'Grades', href: '/parent/grades' },
    { label: 'Homework', href: '/parent/homework' },
    { label: 'Notices', href: '/parent/notices' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <MobileNavigation
        title="Parent Dashboard"
        subtitle={`Welcome back, ${user?.username}`}
        navItems={navigationItems}
        onLogout={handleLogout}
        primaryColor="pink"
      />

      {/* Child Selection */}
      {children.length > 1 && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
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
              className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-sm"
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

      <main className="pt-4 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<ParentHome dashboardData={dashboardData} selectedChild={selectedChild} />} />
            <Route path="/attendance" element={<ChildAttendanceView selectedChild={selectedChild} />} />
            <Route path="/grades" element={<ChildGradeView selectedChild={selectedChild} />} />
            <Route path="/homework" element={<ChildHomeworkView selectedChild={selectedChild} />} />
            <Route path="/notices" element={<NoticesView selectedChild={selectedChild} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const ParentHome: React.FC<{ dashboardData: any; selectedChild: any }> = ({ dashboardData, selectedChild }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Header with Role Guidance */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl shadow-lg p-6 sm:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Parent Portal</h1>
            <p className="text-pink-100 text-sm sm:text-base mb-3">
              Monitor your child's academic progress, attendance, and school activities
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-white/20 px-2 py-1 rounded-full">📊 Track Progress</span>
              <span className="bg-white/20 px-2 py-1 rounded-full">📅 Monitor Attendance</span>
              <span className="bg-white/20 px-2 py-1 rounded-full">📚 Review Homework</span>
              <span className="bg-white/20 px-2 py-1 rounded-full">💬 Stay Informed</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center text-sm">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Parent</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        {selectedChild && (
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {selectedChild.firstName} {selectedChild.lastName}'s Progress
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">Grade {selectedChild.grade} - Section {selectedChild.section}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-sm p-4 sm:p-6 border border-green-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-200 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-green-700 font-medium">Attendance</p>
                <p className="text-lg sm:text-2xl font-bold text-green-900">{dashboardData?.attendancePercentage || 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm p-4 sm:p-6 border border-blue-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-200 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-blue-700 font-medium">Overall Grade</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-900">{dashboardData?.overallGrade || 'A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg shadow-sm p-4 sm:p-6 border border-yellow-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-200 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-yellow-700 font-medium">Pending Homework</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-900">{dashboardData?.pendingHomework || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg shadow-sm p-4 sm:p-6 border border-pink-200">
            <div className="flex items-center">
              <div className="p-2 bg-pink-200 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-pink-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-pink-700 font-medium">New Notices</p>
                <p className="text-lg sm:text-2xl font-bold text-pink-900">{dashboardData?.newNotices || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Parent Monitoring Guide */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
            </svg>
            Ways to Support Your Child
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-pink-200">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Check Attendance</h4>
                <p className="text-xs text-gray-600 mt-1">Monitor daily presence</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-pink-200">
              <div className="text-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Review Grades</h4>
                <p className="text-xs text-gray-600 mt-1">Track academic progress</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-pink-200">
              <div className="text-center">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Monitor Homework</h4>
                <p className="text-xs text-gray-600 mt-1">Support learning at home</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-pink-200">
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Read Notices</h4>
                <p className="text-xs text-gray-600 mt-1">Stay informed on updates</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
            <p className="text-sm text-pink-800 text-center">
              <strong>Parenting Tip:</strong> Regular monitoring and encouragement helps your child succeed academically!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Recent Performance
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {dashboardData?.recentGrades?.slice(0, 5).map((grade: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border hover:border-pink-200 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="mb-1 sm:mb-0 flex items-center">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{grade.subject}</p>
                        <p className="text-xs text-gray-500">{grade.examType}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-pink-600">{grade.grade}</span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No recent grades available.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Your child's grades will appear here once teachers start grading
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Attendance Summary
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100 hover:border-green-200 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Present Days</span>
                </div>
                <span className="text-sm font-bold text-green-700">{dashboardData?.presentDays || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100 hover:border-red-200 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Absent Days</span>
                </div>
                <span className="text-sm font-bold text-red-700">{dashboardData?.absentDays || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100 hover:border-yellow-200 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Late Arrivals</span>
                </div>
                <span className="text-sm font-bold text-yellow-700">{dashboardData?.lateArrivals || 0}</span>
              </div>
              
              {/* Attendance Percentage */}
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Overall Attendance</span>
                  <span className="text-lg font-bold text-blue-700">{dashboardData?.attendancePercentage || 0}%</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${dashboardData?.attendancePercentage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components with responsive design
const ChildAttendanceView: React.FC<{ selectedChild: any }> = ({ selectedChild }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        {selectedChild ? `${selectedChild.firstName}'s Attendance` : 'Child Attendance'}
      </h2>
      <p className="text-gray-500 text-sm sm:text-base">Child attendance view interface will be implemented here.</p>
    </div>
  </div>
);

const ChildGradeView: React.FC<{ selectedChild: any }> = ({ selectedChild }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        {selectedChild ? `${selectedChild.firstName}'s Grades` : 'Child Grades'}
      </h2>
      <p className="text-gray-500 text-sm sm:text-base">Child grade view interface will be implemented here.</p>
    </div>
  </div>
);

const ChildHomeworkView: React.FC<{ selectedChild: any }> = ({ selectedChild }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        {selectedChild ? `${selectedChild.firstName}'s Homework` : 'Child Homework'}
      </h2>
      <p className="text-gray-500 text-sm sm:text-base">Child homework view interface will be implemented here.</p>
    </div>
  </div>
);

const NoticesView: React.FC<{ selectedChild: any }> = ({ selectedChild: _selectedChild }) => {
  // _selectedChild will be used to filter notices in future implementation
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Notices & Announcements</h2>
        <p className="text-gray-500 text-sm sm:text-base">Notices view interface will be implemented here.</p>
      </div>
    </div>
  );
};

export default ParentDashboard;