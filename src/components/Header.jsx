import React, { useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";
import api from '../utils/axiosInstance'; 

const Header = () => {
  const [user, setUser] = useState(null);

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

      {/* User Info - Absolute positioned right */}
      <div className="absolute right-6 flex items-center space-x-3">
        <span className="font-medium text-sm text-gray-600 dark:text-gray-300">
          {user?.role ? user.role.toUpperCase() : "GUEST"}
        </span>

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
            transition-colors duration-200 cursor-pointer">
            <FiUser className="text-gray-500 dark:text-gray-300 text-xl" />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;