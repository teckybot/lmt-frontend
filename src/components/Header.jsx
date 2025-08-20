import React, { useEffect, useState } from "react";
import { FiUser, FiSearch, FiBell, FiSettings, FiX } from "react-icons/fi";
import api from '../utils/axiosInstance'; 

const Header = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await api.get('/users/profile');
        const userData = userRes.data;
        setUser(userData);
       
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        console.error('Error fetching user data for header:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    };

    if (localStorage.getItem('token')) {
      fetchUserData();
    } else {
      setUser(null); 
    }

    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement search functionality here
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowProfileMenu(false);
    // Redirect to login page or refresh
    window.location.reload();
  };

  return (
    <header
      className="hidden md:flex items-center justify-center px-6 py-3 h-16 shadow-sm
      bg-white/95 dark:bg-gray-900 backdrop-blur-sm
    text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800
      transition-colors duration-300 relative"
    >
      {/* Brand - Centered */}
      <div className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-wide relative">
        LEADZO
        <span className="absolute -right-4 top-0 text-[0.6rem] text-blue-400 dark:text-blue-300">®</span>
      </div>

      {/* Search Bar - Appears when toggled */}
      {showSearch && (
        <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                  bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 
                  focus:border-transparent w-64 transition-all duration-200"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Info - Absolute positioned right */}
      <div className="absolute right-6 flex items-center space-x-4">
        {/* Action Icons */}
        <div className="flex items-center space-x-3">
          <button 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setShowSearch(!showSearch)}
          >
            <FiSearch className="text-xl text-gray-600 dark:text-gray-300" />
          </button>
          
          <button 
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FiBell className="text-xl text-gray-600 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <span className="font-medium text-sm text-gray-600 dark:text-gray-300">
            {user?.role ? user.role.toUpperCase() : "GUEST"}
          </span>

          <div className="relative">
            <div 
              className="cursor-pointer"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border-2 border-blue-500/30 dark:border-blue-400/30 object-cover"
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center rounded-full
                  bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                    border border-gray-200 dark:border-gray-700
                  transition-colors duration-200">
                  <FiUser className="text-gray-500 dark:text-gray-300 text-xl" />
                </div>
              )}
              {/* Online status indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            </div>

            {/* Profile dropdown menu */}
            {showProfileMenu && user && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {user.role ? user.role.toUpperCase() : "GUEST"}
                    </span>
                    <span className="ml-2 flex items-center">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="ml-1 text-xs text-green-600 dark:text-green-400">Online</span>
                    </span>
                  </div>
                </div>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Settings</a>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications dropdown */}
      {showNotifications && (
        <div className="absolute right-24 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <a href="#" className="block px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">New message received</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</p>
            </a>
            <a href="#" className="block px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Project update completed</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
            </a>
            <a href="#" className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">New user registered</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
            </a>
          </div>
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
            <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all notifications</a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;