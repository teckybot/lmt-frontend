import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser } from 'react-icons/fi';

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <h1 className="text-3xl text-blue-900 font-bold flex items-center">
          <span className="bg-blue-600 text-black rounded-lg px-2 py-1 mr-[110px]">LM</span>
          LEAD MANAGEMENT TOOL
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="User" 
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FiUser className="text-blue-600" />
                </div>
              )}
              <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-green-400"></span>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-800">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors group"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-red-50 transition-colors">
              <FiLogOut className="text-lg" />
            </div>
            <span className="hidden md:inline text-sm">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;