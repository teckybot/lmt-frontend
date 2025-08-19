// src/components/DashboardLayout.jsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
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
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
