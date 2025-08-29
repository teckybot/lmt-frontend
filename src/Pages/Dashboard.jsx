import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Analytics from "../components/Analytics";
import Leads from "../components/Leads";
import Profile from "../components/Profile";
import CreateLead from "../components/CreateLead";
import LeadTable from "../components/Assigns/LeadTable";
import UserManagement from "../components/Users";
import api from "../utils/axiosInstance";

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  const fetchLeadsAndProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both leads and user profile in parallel for efficiency
      const [leadsRes, userRes] = await Promise.all([
        api.get("/leads"),
        api.get("/users/profile"),
      ]);

      setLeads(leadsRes.data);
      setUserRole(userRes.data.role);

      // Calculate stats
      const statsData = {
        total: leadsRes.data.length,
        new: leadsRes.data.filter((lead) => lead.status === "New").length,
        inProgress: leadsRes.data.filter((lead) => lead.status === "In Progress").length,
        closed: leadsRes.data.filter((lead) => lead.status === "Closed").length,
        totalValue: leadsRes.data.reduce((sum, lead) => sum + (parseFloat(lead.value) || 0), 0),
      };
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching leads", err);
      setError(err.response?.data?.message || "Failed to load leads");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchLeadsAndProfile();
  }, [fetchLeadsAndProfile]);

  const updateStatus = async (leadId, newStatus) => {
    try {
      await api.patch(`/leads/${leadId}/status`, { status: newStatus });
      await fetchLeadsAndProfile();
    } catch (err) {
      console.error("Error updating status", err);
      setError("Failed to update status. Please try again.");
    }
  };

  const renderContent = () => {
    // Show loading animation only for tabs that need data fetching
    if (isLoading && ["dashboard", "leads", "assigns"].includes(activeTab)) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      );
    }

    if (error && ["dashboard", "leads", "assigns"].includes(activeTab)) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
          <div className="flex items-center">
            <div className="text-red-500 mr-2">⚠️</div>
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchLeadsAndProfile}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <Analytics stats={stats} isLoading={isLoading} />;
      case "leads":
        return <Leads leads={leads} updateStatus={updateStatus} isLoading={isLoading} />;
      case "CreateLead":
        return <CreateLead onSuccess={fetchLeadsAndProfile} />;
      case "profile":
        return <Profile />;
      case "assigns":
        return <LeadTable role={userRole} />;
      case "Users":
        return <UserManagement />;
      default:
        return <Analytics stats={stats} isLoading={isLoading} />;
    }
  };

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      isLoading={isLoading && ["dashboard", "leads", "assigns"].includes(activeTab)}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default Dashboard;