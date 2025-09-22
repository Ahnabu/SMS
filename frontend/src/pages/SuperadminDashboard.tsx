import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SuperadminHome from "@/components/superadmin/SuperadminHome";
import SchoolManagement from "@/components/superadmin/SchoolManagement";
import SystemSettings from "@/components/superadmin/SystemSettings";
import { useAuth } from "../context/AuthContext";
import type {
  SuperadminStats,
  SchoolSummary,
} from "@/components/superadmin/types";
import { apiService } from "@/services";

const SuperadminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SuperadminStats | null>(null);
  const [schools, setSchools] = useState<SchoolSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, schoolsResponse] = await Promise.all([
        apiService.superadmin.getStats(),
        apiService.superadmin.getSchools(),
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      if (schoolsResponse.data.success) {
        setSchools(schoolsResponse.data.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      // Don't set any fallback dummy data - let components handle empty states
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
            <SchoolManagement schools={schools} onUpdate={loadDashboardData} />
          }
        />
        <Route
          path="/users"
          element={<div>User Management - Coming Soon</div>}
        />
        <Route
          path="/reports"
          element={<div>System Reports - Coming Soon</div>}
        />
        <Route
          path="/settings"
          element={<SystemSettings onUpdate={loadDashboardData} />}
        />
      </Routes>
    </DashboardLayout>
  );
};

export default SuperadminDashboard;
