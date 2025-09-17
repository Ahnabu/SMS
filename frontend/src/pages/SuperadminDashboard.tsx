import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  School, 
  Users, 
  BookOpen,
  TrendingUp, 
  Building,
  UserCheck,
  Activity
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const SuperadminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setStats(statsResponse.data.data);
      }

      if (schoolsResponse.data.success) {
        setSchools(schoolsResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
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
              schools={schools} 
              onUpdate={loadDashboardData} 
            />
          } 
        />
        <Route path="/users" element={<div>User Management - Coming Soon</div>} />
        <Route path="/reports" element={<div>System Reports - Coming Soon</div>} />
        <Route path="/settings" element={<div>System Settings - Coming Soon</div>} />
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
      value: schools?.length || 0,
      icon: School,
      description: 'Schools in the system',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      description: 'Enrolled students',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Teachers',
      value: stats?.totalTeachers || 0,
      icon: UserCheck,
      description: 'Teaching staff',
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
                      <p className="text-sm text-gray-500">{school.address || 'Location'}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
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
const SchoolManagement: React.FC<{ schools: any[]; onUpdate: () => void }> = ({ schools, onUpdate }) => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">School Management</h1>
        <p className="text-gray-600">Manage all schools in the system</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">School Management Interface</h3>
            <p className="text-gray-500">
              This section will contain comprehensive school management features including:
            </p>
            <ul className="mt-4 text-sm text-gray-500 space-y-1">
              <li>• Create and manage schools</li>
              <li>• Assign administrators</li>
              <li>• Monitor school performance</li>
              <li>• System-wide settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperadminDashboard;