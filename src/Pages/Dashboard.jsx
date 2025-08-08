import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import DashboardHome from "../components/DashboardHome";
import Leads from "../components/Leads";
import Profile from "../components/Profile";
import CreateLead from "../components/CreateLead";
import AssignedLeadsPage from "../components/AssignedLeadsPage"; // Import the new component

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchLeads = useCallback(async () => {  
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(res.data);
      
      // Calculate stats
      const statsData = {
        total: res.data.length,
        new: res.data.filter((lead) => lead.status === "New").length,
        inProgress: res.data.filter((lead) => lead.status === "In Progress").length,
        closed: res.data.filter((lead) => lead.status === "Closed").length,
        totalValue: res.data.reduce((sum, lead) => sum + (parseFloat(lead.value) || 0), 0),
      };
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching leads", err);
      setError(err.response?.data?.message || "Failed to load leads");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const updateStatus = async (leadId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `https://lmt-backend.onrender.com/api/leads/${leadId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchLeads(); // Wait for refresh to complete
    } catch (err) {
      console.error("Error updating status", err);
      setError("Failed to update status. Please try again.");
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

const renderContent = () => {
  console.log("Active tab:", activeTab); // Debug log
  if (isLoading && activeTab !== "CreateLead") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && activeTab !== "CreateLead") {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex items-center">
          <div className="text-red-500 mr-2">⚠️</div>
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={fetchLeads}
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
      return <DashboardHome stats={stats} isLoading={isLoading} />;
    case "leads":
      return <Leads leads={leads} updateStatus={updateStatus} isLoading={isLoading} />;
    case "CreateLead":
      return <CreateLead onSuccess={fetchLeads} />;
    case "profile":
      return <Profile />;
    case "tasks":
      return <AssignedLeadsPage />; // Ensure this renders
    default:
      return <DashboardHome stats={stats} isLoading={isLoading} />;
  }
};
  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Dashboard;