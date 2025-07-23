import React from 'react';
import { 
  FiHome,
  FiUsers,
  FiPlusCircle,
  FiUser,
  FiLogOut
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome className="text-lg" /> },
    { id: 'leads', label: 'Leads', icon: <FiUsers className="text-lg" /> },
    { id: 'CreateLead', label: 'Create Lead', icon: <FiPlusCircle className="text-lg" /> },
    { id: 'profile', label: 'Profile', icon: <FiUser className="text-lg" /> }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/"); // redirect to login page
  };

  return (
    <div className="flex h-screen">
      {/* Fixed Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 fixed top-0 left-0 bottom-0 shadow-sm z-10">
        <div className="p-6 pb-4">
          <h1 className="text-4xl text-left font-bold text-gray-800">LMT</h1>
          <p className="text-xs text-left text-gray-500 mt-1">Manage Your Organization Leads and Projects</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`mr-3 ${activeTab === item.id ? 'text-blue-500' : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                  {activeTab === item.id && (
                    <span className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <FiLogOut className="text-lg mr-3 text-gray-400" />
            Logout
          </button>
        </div>
      </div>

      {/* Content Area - sits right beside sidebar */}
      <div className="flex-1 ml-64 overflow-auto">
        {/* Your main content will go here */}
      </div>
    </div>
  );
};

export default Sidebar;
