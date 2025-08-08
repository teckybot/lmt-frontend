import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AdminDashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <div className="p-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p>Features: Manage employees, assign leads, view lead status.</p>
          {/* Add admin-specific components here */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;