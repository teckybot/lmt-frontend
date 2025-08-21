// src/components/DashboardLayout.jsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { FiLoader } from "react-icons/fi"; // Import the loader icon

const DashboardLayout = ({ children, activeTab, setActiveTab, isLoading = false }) => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`${darkMode ? "dark:bg-gray-900" : "bg-gray-100"} min-h-screen flex`}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Right section */}
      <div className="flex-1 flex flex-col">
        {/* Header (hidden on mobile) */}
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center">
                <FiLoader className="animate-spin text-3xl text-blue-500 mb-2" />
                <p className="text-gray-600">Loading pls wait...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;