import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '@/services';
import MobileNavigation from '../components/layout/MobileNavigation';
import TeacherScheduleView from '../components/teacher/TeacherScheduleView';
import MyClassesView from '../components/teacher/MyClassesView';
import TeacherHomeworkView from '../components/teacher/TeacherHomeworkView';
import TeacherAttendanceView from '../components/teacher/TeacherAttendanceView';
import TeacherExamGrading from '../components/teacher/TeacherExamGrading';
import TeacherPunishmentSystem from '../components/teacher/TeacherPunishmentSystem';
import TeacherStudentView from '../components/teacher/TeacherStudentView';

const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { href: '/teacher', label: 'Dashboard' },
    { href: '/teacher/classes', label: 'Classes' },
    { href: '/teacher/attendance', label: 'Attendance' },
    { href: '/teacher/homework', label: 'Homework' },
    { href: '/teacher/grades', label: 'Grading' },
    { href: '/teacher/students', label: 'Students' },
    { href: '/teacher/discipline', label: 'Discipline' },
    { href: '/teacher/schedule', label: 'Schedule' },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.teacher.getDashboard();
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
      <MobileNavigation
        title="Teacher Dashboard"
        subtitle={`Welcome back, ${user?.fullName}`}
        navItems={navItems}
        onLogout={handleLogout}
        primaryColor="green"
      />

      <main className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<TeacherHome dashboardData={dashboardData} />} />
          <Route path="/classes" element={<MyClassesView />} />
          <Route path="/attendance" element={<TeacherAttendanceView />} />
          <Route path="/homework" element={<TeacherHomeworkView />} />
          <Route path="/grades" element={<TeacherExamGrading />} />
          <Route path="/students" element={<TeacherStudentView />} />
          <Route path="/discipline" element={<TeacherPunishmentSystem />} />
          <Route path="/schedule" element={<TeacherScheduleView />} />
        </Routes>
      </main>
    </div>
  );
};

const TeacherHome: React.FC<{ dashboardData: any }> = ({ dashboardData }) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Teaching Overview</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="p-2 sm:p-3 bg-green-200 rounded-lg mb-2 sm:mb-0 w-fit">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="sm:ml-3">
                <p className="text-xs sm:text-sm text-gray-600">Classes</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{dashboardData?.totalClasses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="p-2 sm:p-3 bg-blue-200 rounded-lg mb-2 sm:mb-0 w-fit">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="sm:ml-3">
                <p className="text-xs sm:text-sm text-gray-600">Students</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{dashboardData?.totalStudents || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="p-2 sm:p-3 bg-yellow-200 rounded-lg mb-2 sm:mb-0 w-fit">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="sm:ml-3">
                <p className="text-xs sm:text-sm text-gray-600">Homework</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{dashboardData?.pendingHomework || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="p-2 sm:p-3 bg-purple-200 rounded-lg mb-2 sm:mb-0 w-fit">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="sm:ml-3">
                <p className="text-xs sm:text-sm text-gray-600">Today</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{dashboardData?.todayClasses || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <a 
              href="/teacher/grades"
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white p-3 sm:p-4 rounded-lg text-center font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              <div className="text-sm sm:text-base">Grading</div>
            </a>
            <a 
              href="/teacher/students"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 sm:p-4 rounded-lg text-center font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              <div className="text-sm sm:text-base">Students</div>
            </a>
            <a 
              href="/teacher/discipline"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-3 sm:p-4 rounded-lg text-center font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              <div className="text-sm sm:text-base">Discipline</div>
            </a>
            <a 
              href="/teacher/schedule"
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-3 sm:p-4 rounded-lg text-center font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              <div className="text-sm sm:text-base">Schedule</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;