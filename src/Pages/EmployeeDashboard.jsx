import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Leads from "../components/Leads";
import Profile from "../components/Profile";
import LeadTable from "../components/Assigns/LeadTable";
import api from "../utils/axiosInstance";

const EmployeeDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("leads"); // default for employees
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get("/leads/my-leads");
      setLeads(res.data);
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

  const updateStatus = async (leadId, newStatus) => {
    try {
      await api.put(`/leads/${leadId}/status`, { status: newStatus });
      await fetchLeads();
    } catch (err) {
      console.error("Error updating status", err);
      setError("Failed to update status. Please try again.");
    }
  };

  useEffect(() => {
    if (activeTab === "leads") {
      fetchLeads();
    }
  }, [fetchLeads, activeTab]);

  const renderContent = () => {
    if (isLoading && activeTab === "leads") {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error && activeTab === "leads") {
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
      case "leads":
        return <Leads leads={leads} updateStatus={updateStatus} isLoading={isLoading} />;
      case "profile":
        return <Profile />;
      case "assigns":
        return <LeadTable role={"employee"} />;
      default:
        return <Leads leads={leads} updateStatus={updateStatus} isLoading={isLoading} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
