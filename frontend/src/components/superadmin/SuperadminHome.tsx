import React from "react";
import { School, Users, Activity, UserCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { SuperadminHomeProps } from "./types";

const SuperadminHome: React.FC<SuperadminHomeProps> = ({
  stats,
  schools,
  loading,
  user,
}) => {
  const statCards = [
    {
      title: "Total Schools",
      value: stats?.totalSchools || 0,
      icon: School,
      description: "Schools in the system",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      description: "Enrolled students",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers || 0,
      icon: UserCheck,
      description: "Teaching staff",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Active Schools",
      value: stats?.activeSchools || 0,
      icon: Activity,
      description: "Currently operational",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

  return (
    <div>
      {/* Welcome Header with Role Guidance */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 sm:p-8 text-white mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              System Control Center
            </h1>
            <p className="text-purple-100 text-sm sm:text-base mb-3">
              Welcome back, {user?.username || "Admin"}! Manage schools, organizations, and oversee the entire SMS platform
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-white/20 px-2 py-1 rounded-full">🏢 Manage Organizations</span>
              <span className="bg-white/20 px-2 py-1 rounded-full">🏫 Oversee Schools</span>
              <span className="bg-white/20 px-2 py-1 rounded-full">👥 Monitor Admins</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center text-sm">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.992-4.502a9 9 0 11-3.15 3.15l1.67-1.676zm0 0L13.5 7.5" />
              </svg>
              <span>System Administrator</span>
            </div>
          </div>
        </div>
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
                {loading
                  ? "..."
                  : typeof stat.value === "number"
                  ? stat.value.toLocaleString()
                  : stat.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Flow Visualization */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-8">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          System Setup Workflow
        </h3>
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          
          {/* Step 1: Organization */}
          <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border-2 border-purple-200 hover:border-purple-300 transition-colors">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Create Organization</h4>
              <p className="text-xs text-gray-600 mt-1">Educational institution setup</p>
              <div className="mt-2 text-xs text-purple-600 font-medium">Your First Step</div>
            </div>
          </div>

          <div className="text-gray-400">
            <svg className="w-6 h-6 rotate-90 lg:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Step 2: School */}
          <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Add School</h4>
              <p className="text-xs text-gray-600 mt-1">Under organization</p>
              <div className="mt-2 text-xs text-blue-600 font-medium">Physical Locations</div>
            </div>
          </div>

          <div className="text-gray-400">
            <svg className="w-6 h-6 rotate-90 lg:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Step 3: Admin */}
          <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border-2 border-green-200 hover:border-green-300 transition-colors">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Assign Admin</h4>
              <p className="text-xs text-gray-600 mt-1">School administrator</p>
              <div className="mt-2 text-xs text-green-600 font-medium">Local Management</div>
            </div>
          </div>

          <div className="text-gray-400">
            <svg className="w-6 h-6 rotate-90 lg:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Step 4: Management */}
          <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border-2 border-orange-200 hover:border-orange-300 transition-colors">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Admin Manages</h4>
              <p className="text-xs text-gray-600 mt-1">Teachers & Students</p>
              <div className="mt-2 text-xs text-orange-600 font-medium">Daily Operations</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <strong>Key:</strong> You create the foundation (Organizations & Schools), then Admins handle day-to-day operations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Schools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Recent Schools
            </CardTitle>
            <CardDescription>
              Recently added schools to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schools && schools.length > 0 ? (
              <div className="space-y-4">
                {schools.slice(0, 5).map((school, index) => (
                  <div
                    key={school.id || index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {school.name || "School Name"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {typeof school.address === 'string' 
                            ? school.address 
                            : school.address 
                              ? `${school.address.street}, ${school.address.city}` 
                              : "Location"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          school.status === "active"
                            ? "bg-green-100 text-green-800"
                            : school.status === "pending_approval"
                            ? "bg-yellow-100 text-yellow-800"
                            : school.status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {school.status || "Active"}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {school.createdAt
                          ? new Date(school.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                {loading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
                    <p className="text-gray-500">Loading schools...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-gray-500 mb-2">No schools registered yet.</p>
                    <p className="text-xs text-gray-400">Start by creating an organization first!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Health with Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              System Health & Quick Actions
            </CardTitle>
            <CardDescription>
              Overall system performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Server Status
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Database
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Active Schools
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.activeSchools || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Pending Schools
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.pendingSchools || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Total Parents
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.totalParents || 0}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-2 rounded-lg text-xs font-medium transition-all duration-200 shadow hover:shadow-md">
                  Add Organization
                </button>
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-lg text-xs font-medium transition-all duration-200 shadow hover:shadow-md">
                  Add School
                </button>
                <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-2 rounded-lg text-xs font-medium transition-all duration-200 shadow hover:shadow-md">
                  View Reports
                </button>
                <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-2 rounded-lg text-xs font-medium transition-all duration-200 shadow hover:shadow-md">
                  System Config
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperadminHome;
