import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const EmployeeDashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <div className="p-6">
          <h1 className="text-2xl font-bold">Employee Dashboard</h1>
          <p>Features: View and update your own leads.</p>
          {/* Add employee-specific components here */}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;