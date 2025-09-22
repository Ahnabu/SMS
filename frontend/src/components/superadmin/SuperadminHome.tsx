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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.username || "Admin"}!
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
                  <div
                    key={school.id || index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
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
                  <p className="text-gray-500">Loading schools...</p>
                ) : (
                  <p className="text-gray-500">No schools registered yet.</p>
                )}
              </div>
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
                <span className="text-sm font-medium text-gray-900">
                  Server Status
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Database
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperadminHome;
