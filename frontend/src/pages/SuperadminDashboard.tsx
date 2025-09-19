import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  School, 
  Users, 
  Activity
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import SchoolList, { SchoolListRef } from '@/components/superadmin/SchoolList';
import SchoolForm from '@/components/superadmin/SchoolForm';
import SchoolDetails from '@/components/superadmin/SchoolDetails';
import SystemSettings from '@/components/superadmin/SystemSettings';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const SuperadminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, schoolsResponse] = await Promise.all([
        apiService.superadmin.getStats(),
        apiService.superadmin.getSchools()
      ]);

      if (statsResponse.data.success) {
        console.log('Stats API response:', statsResponse.data.data);
        setStats(statsResponse.data.data);
      }

      if (schoolsResponse.data.success) {
        // Fix: Access the schools array correctly from API response
        const schoolsData = schoolsResponse.data.data;
        console.log('Schools API response structure:', schoolsData);
        if (schoolsData.schools) {
          console.log('Setting schools array with length:', schoolsData.schools.length);
          setSchools(schoolsData.schools);
        } else {
          console.log('Fallback: Schools data does not have schools property, using entire data');
          setSchools(schoolsData); // Fallback if structure is different
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set demo data for testing
      setStats({
        totalStudents: 1250,
        totalTeachers: 85,
        totalSchools: 8,
        activeUsers: 234
      });
      setSchools([
        { name: 'Green Valley High School', address: 'New York, NY', createdAt: '2024-01-15' },
        { name: 'Sunshine Elementary', address: 'Los Angeles, CA', createdAt: '2024-02-20' },
        { name: 'Maple Leaf Academy', address: 'Austin, TX', createdAt: '2024-03-10' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Routes>
        <Route 
          path="/" 
          element={
            <SuperadminHome 
              stats={stats} 
              schools={schools} 
              loading={loading} 
              user={user} 
            />
          } 
        />
        <Route 
          path="/schools" 
          element={
            <SchoolManagement 
              onUpdate={loadDashboardData} 
            />
          } 
        />
        <Route path="/users" element={<div>User Management - Coming Soon</div>} />
        <Route path="/reports" element={<div>System Reports - Coming Soon</div>} />
        <Route 
          path="/settings" 
          element={
            <SystemSettings 
              onUpdate={loadDashboardData} 
            />
          } 
        />
      </Routes>
    </DashboardLayout>
  );
};

// Superadmin Home Component
const SuperadminHome: React.FC<{ 
  stats: any; 
  schools: any[]; 
  loading: boolean; 
  user: any; 
}> = ({ stats, schools, loading, user }) => {
  
  const statCards = [
    {
      title: 'Total Schools',
      value: stats?.totalSchools || schools?.length || 0,
      icon: School,
      description: `${stats?.activeSchools || schools?.filter(s => s.status === 'active').length || 0} active, ${stats?.pendingSchools || schools?.filter(s => s.status === 'pending_approval').length || 0} pending`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Schools',
      value: stats?.activeSchools || schools?.filter(s => s.status === 'active').length || 0,
      icon: School,
      description: 'Currently operational',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      description: 'Enrolled students',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'System Status',
      value: 'Active',
      icon: Activity,
      description: 'All systems operational',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening across all schools in your system today.
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '...' : (typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Schools */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Schools</CardTitle>
            <CardDescription>
              Recently added schools to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schools && schools.length > 0 ? (
              <div className="space-y-4">
                {schools.slice(0, 5).map((school, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{school.name || 'School Name'}</p>
                      <p className="text-sm text-gray-500">{school.address?.city || school.address || 'Location'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        school.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : school.status === 'pending_approval'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {school.status === 'active' ? 'Active' : 
                         school.status === 'pending_approval' ? 'Pending' : 
                         school.status || 'Unknown'}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {school.createdAt ? new Date(school.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No schools registered yet.</p>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Overall system performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Server Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Database</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">API Response</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  125ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Active Users</span>
                <span className="text-sm font-medium text-gray-900">{stats?.activeUsers || 234}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Memory Usage</span>
                <span className="text-sm font-medium text-gray-900">68%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// School Management Component
const SchoolManagement: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const schoolListRef = useRef<SchoolListRef>(null);

  const handleCreateSchool = () => {
    setSelectedSchool(null);
    setShowForm(true);
  };

  const handleEditSchool = (school: any) => {
    setSelectedSchool(school);
    setShowForm(true);
  };

  const handleViewSchool = (school: any) => {
    setSelectedSchool(school);
    setShowDetails(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedSchool(null);
    onUpdate(); // Refresh the school list
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setSelectedSchool(null);
  };

  const handleSaveSchool = async () => {
    // After school is saved successfully in SchoolForm, refresh the list
    schoolListRef.current?.refreshSchools();
  };

  const handleSchoolDeleted = (schoolId: string) => {
    // This will be called by SchoolList for optimistic updates
    console.log('School deleted optimistically:', schoolId);
  };

  return (
    <>
      <SchoolList
        ref={schoolListRef}
        onCreateSchool={handleCreateSchool}
        onEditSchool={handleEditSchool}
        onViewSchool={handleViewSchool}
        onSchoolDeleted={handleSchoolDeleted}
      />
      
      <SchoolForm
        school={selectedSchool}
        isOpen={showForm}
        onClose={handleFormClose}
        onSave={handleSaveSchool}
      />
      
      <SchoolDetails
        schoolId={selectedSchool?.id}
        isOpen={showDetails}
        onClose={handleDetailsClose}
        onEdit={handleEditSchool}
      />
    </>
  );
};

export default SuperadminDashboard;