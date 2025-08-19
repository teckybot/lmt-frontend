import React, { useEffect, useState } from "react";
import Teckybot from "../Data/Teckybot.png";
import {
  FiHome, FiUsers, FiPlusCircle, FiUser, FiLogOut,
  FiMoon, FiSun, FiMenu, FiX, FiUserPlus
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [role, setRole] = useState(null);

  // Load theme and role
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setRole(parsedUser.role?.toLowerCase());
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
      }
    }
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 768 && isSidebarOpen) {
        const sidebar = document.querySelector(".sidebar");
        const hamburger = document.querySelector(".hamburger-button");
        if (sidebar && !sidebar.contains(event.target)) {
          if (!hamburger || !hamburger.contains(event.target)) {
            setIsSidebarOpen(false);
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Full menu list
  const allMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FiHome className="text-lg" /> },
    { id: "leads", label: "Leads", icon: <FiUsers className="text-lg" /> },
    { id: "CreateLead", label: "Create Lead", icon: <FiPlusCircle className="text-lg" /> },
    { id: "profile", label: "Profile", icon: <FiUser className="text-lg" /> },
    { id: "tasks", label: "Tasks", icon: <FiUsers className="text-lg" /> },
    { id: "AddUser", label: "Add User", icon: <FiUserPlus className="text-lg" />, role: "super admin" }
  ];

  // Role-based menu filtering
  let menuItems = [];
  if (role === "employee") {
    menuItems = allMenuItems.filter(item =>
      ["leads", "profile", "tasks"].includes(item.id.toLowerCase())
    );
  } else if (role === "admin") {
    // Admin can access everything EXCEPT super admin-only items
    menuItems = allMenuItems.filter(item => item.role !== "super admin");
  } else if (role === "super admin") {
    // Super admin sees everything
    menuItems = allMenuItems;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 shadow-sm h-20 flex items-center px-4">
        <button
          className="p-2 rounded-md hamburger-button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <div className="flex-1 flex justify-center">
          <img src={Teckybot} alt="logo" className="h-12" />
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar w-64 border-r border-gray-200 dark:border-gray-700 fixed top-0 left-0 bottom-0 shadow-sm z-20 bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} md:pt-0 pt-16`}
      >
        <div className="p-6 pb-4 hidden md:block">
          <img src={Teckybot} alt="logo" />
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-4 py-2 mb-2">
          <span className="text-sm ml-6 font-medium">Mode</span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  <span
                    className={`mr-3 ${activeTab === item.id ? "text-blue-500" : "text-gray-400"
                      }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiLogOut className="text-lg mr-3 text-gray-400 dark:text-gray-300" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-800 text-black dark:text-white transition-all duration-300 md:ml-64 pt-16 md:pt-0">
        {/* Router will render content here */}
      </div>
    </div>
  );
};

export default Sidebar;
