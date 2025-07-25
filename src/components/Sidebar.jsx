import React, { useEffect, useState } from 'react';
import Teckybot from '../Data/Teckybot.png';
import { 
  FiHome, FiUsers, FiPlusCircle, FiUser, FiLogOut, FiMoon, FiSun 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  // Toggle handler
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome className="text-lg" /> },
    { id: 'leads', label: 'Leads', icon: <FiUsers className="text-lg" /> },
    { id: 'CreateLead', label: 'Create Lead', icon: <FiPlusCircle className="text-lg" /> },
    { id: 'profile', label: 'Profile', icon: <FiUser className="text-lg" /> }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 fixed top-0 left-0 bottom-0 shadow-sm z-10 bg-white dark:bg-gray-900">
        <div className="p-6 pb-4">
          <img src={Teckybot} alt="logo" />
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-4 py-2 mb-2">
          <span className="text-sm font-medium">Dark Mode</span>
          <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className={`mr-3 ${activeTab === item.id ? 'text-blue-500' : 'text-gray-400'}`}>
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

      <div className="flex-1 ml-64 overflow-auto bg-gray-50 dark:bg-gray-800 text-black dark:text-white transition-all duration-300">
        {/* Content */}
      </div>
    </div>
  );
};

export default Sidebar;
