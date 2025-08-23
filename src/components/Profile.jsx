import React, { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import { Popconfirm, Button, message } from 'antd';
import { FiLoader, FiUserPlus, FiEdit, FiX, FiCheck, FiActivity, FiMenu, FiXCircle } from 'react-icons/fi';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const [profileError, setProfileError] = useState(null);
  const [activityError, setActivityError] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activitySummary, setActivitySummary] = useState({ leadsAdded: 0, leadsClosed: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showActivitySidebar, setShowActivitySidebar] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-hide sidebar when switching to mobile
      if (!mobile && showActivitySidebar) {
        setShowActivitySidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showActivitySidebar]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setProfileError('No authentication token found. Please log in.');
        setActivityError('No authentication token found. Please log in.');
        setProfileLoading(false);
        setActivityLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        const userRes = await api.get('/users/profile');
        const userData = userRes.data;
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          avatar: userData.avatar || ''
        });
        setProfileError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setProfileError(err.response?.data?.message || `Failed to fetch profile data.`);
      } finally {
        setProfileLoading(false);
      }

      try {
        setActivityLoading(true);
        const activityRes = await api.get('/users/activity');
        setActivitySummary(activityRes.data.summary || { leadsAdded: 0, leadsClosed: 0 });
        setActivity(activityRes.data.activity || []);
        setActivityError(null);
      } catch (err) {
        console.error('Error fetching activity:', err);
        setActivityError(err.response?.data?.message || `Failed to fetch activity data.`);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setProfileError('No authentication token found. Please log in.');
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("phone", formData.phone);

      if (formData.avatar instanceof File) {
        fd.append("avatar", formData.avatar);
      }

      const res = await api.put('/users/profile', fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);
      setProfileError(null);
      message.success('Profile updated successfully!');
    } catch (err) {
      console.error("Error updating profile:", err);
      setProfileError(err.response?.data?.message || "Failed to update profile.");
      message.error('Failed to update profile.');
    }
  };

  if (profileError && activityError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">Please log in again to access your profile.</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-3xl text-blue-500 mb-2" />
          <p className="text-gray-600">Loading Data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <p className="text-red-500">No user data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Activity Toggle Button */}
        {isMobile && (
          <div className="fixed bottom-6 right-6 z-30">
            <button
              onClick={() => setShowActivitySidebar(!showActivitySidebar)}
              className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
            >
              {showActivitySidebar ? <FiXCircle size={24} /> : <FiActivity size={24} />}
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 pt-4">
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-20">
              {/* Profile Header */}
              <div className="bg-gray-800 text-white p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=ffffff&color=6366F1`}
                    alt="Profile"
                    className="h-20 w-20 rounded-full border-4 border-white border-opacity-30 shadow-md"
                  />
                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-indigo-100 bg-indigo-500 bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium mt-1 inline-block">
                      {user.role || 'User'}
                    </p>
                  </div>

                  {!isEditing && (
                    <div className="ml-auto">
                      <Button
                        onClick={() => setIsEditing(true)}
                        icon={<FiEdit className="text-base" />}
                        className="bg-white text-indigo-700 hover:bg-indigo-50 border-0 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center rounded-lg px-4 py-2 font-medium"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-6">
                {profileError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                    <p className="text-red-700">Error: {profileError}</p>
                  </div>
                )}

                {isEditing ? (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
                          <input
                            type="file"
                            name="avatar"
                            accept="image/*"
                            onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.files[0] }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<FiCheck className="text-base" />}
                          className="bg-indigo-600 hover:bg-indigo-700 border-0 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center rounded-lg px-4 py-2 font-medium text-white"
                        >
                          Save Changes
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          className="bg-gray-200 text-gray-700 hover:bg-gray-300 border-0 rounded-lg px-4 py-2 font-medium"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">Contact Info</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500">Email Address</p>
                            <p className="text-sm text-gray-800 font-medium">{user.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Phone Number</p>
                            <p className="text-sm text-gray-800 font-medium">{user.phone || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">Account Details</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500">Member Since</p>
                            <p className="text-sm text-gray-800">{new Date(user.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Last Login</p>
                            <p className="text-sm text-gray-800">{new Date(user.previousLogin).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Current Login</p>
                            <p className="text-sm text-gray-800">{new Date(user.lastLogin).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Sidebar - Desktop Only */}
          {!isMobile && (
            <div className="w-96">
              <div className="bg-white rounded-xl shadow-sm h-full">
                <div className="p-6">
                  {/* Activity Summary */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FiActivity className="text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Activity Summary</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-100">
                        <h4 className="text-sm font-medium text-indigo-700 mb-2">Leads Added</h4>
                        <p className="text-2xl font-bold text-indigo-900">{activitySummary.leadsAdded}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-100">
                        <h4 className="text-sm font-medium text-green-700 mb-2">Leads Closed</h4>
                        <p className="text-2xl font-bold text-green-900">{activitySummary.leadsClosed}</p>
                      </div>
                    </div>

                    {activityError && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-4 rounded">
                        <p className="text-red-700 text-sm">Activity Error: {activityError}</p>
                      </div>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>

                      {activity.length > 0 && (
                        <Popconfirm
                          title="Are you sure you want to clear all activity history?"
                          onConfirm={async () => {
                            try {
                              message.loading({ content: "Clearing history...", key: "clear" });
                              await api.delete("/activity/clear");
                              setActivity([]);
                              setActivitySummary({ leadsAdded: 0, leadsClosed: 0 });
                              message.success({ content: "Activity history cleared!", key: "clear" });
                            } catch (err) {
                              console.error(err);
                              message.error("Failed to clear activity history.");
                            }
                          }}
                          okText="Yes"
                          cancelText="No"
                          okButtonProps={{
                            className: "bg-indigo-600 hover:bg-indigo-700"
                          }}
                        >
                          <Button
                            size="small"
                            className="text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 border-0"
                          >
                            Clear All
                          </Button>
                        </Popconfirm>
                      )}
                    </div>

                    {activityLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="flex flex-col items-center">
                          <FiLoader className="animate-spin text-2xl text-gray-600 mb-2" />
                          <p className="text-gray-600">Loading activity...</p>
                        </div>
                      </div>
                    ) : activity.length > 0 ? (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {activity.map((item, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-gray-800 bg-white px-2 py-1 rounded">
                                {item.action}
                              </span>
                              <div className="flex flex-col items-end text-xs text-gray-500">
                                <span className='text-sm'>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</span>
                                <span className="text-gray-400 mt-1">
                                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : 'N/A'}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 font-medium mb-1">{item.leadTitle || '-'}</p>
                            <p className="text-xs text-gray-600 truncate">{item.details || 'No details available'}</p>
                            <div className="flex justify-end text-sm text-gray-500 mt-1">
                              <span className="text-gray-400">{item.username || 'N/A'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">No recent activity available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Activity Sidebar */}
          {isMobile && (
            <div className={`fixed inset-0 z-20 transform ${showActivitySidebar ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
              <div className="bg-white h-full overflow-y-auto">
                {/* Mobile sidebar header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
                  <h2 className="text-lg font-semibold text-gray-800">Activity</h2>
                  <button
                    onClick={() => setShowActivitySidebar(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Activity Summary */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FiActivity className="text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Activity Summary</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-100">
                        <h4 className="text-sm font-medium text-indigo-700 mb-2">Leads Added</h4>
                        <p className="text-2xl font-bold text-indigo-900">{activitySummary.leadsAdded}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-100">
                        <h4 className="text-sm font-medium text-green-700 mb-2">Leads Closed</h4>
                        <p className="text-2xl font-bold text-green-900">{activitySummary.leadsClosed}</p>
                      </div>
                    </div>

                    {activityError && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-4 rounded">
                        <p className="text-red-700 text-sm">Activity Error: {activityError}</p>
                      </div>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>

                      {activity.length > 0 && (
                        <Popconfirm
                          title="Are you sure you want to clear all activity history?"
                          onConfirm={async () => {
                            try {
                              message.loading({ content: "Clearing history...", key: "clear" });
                              await api.delete("/activity/clear");
                              setActivity([]);
                              setActivitySummary({ leadsAdded: 0, leadsClosed: 0 });
                              message.success({ content: "Activity history cleared!", key: "clear" });
                            } catch (err) {
                              console.error(err);
                              message.error("Failed to clear activity history.");
                            }
                          }}
                          okText="Yes"
                          cancelText="No"
                          okButtonProps={{
                            className: "bg-indigo-600 hover:bg-indigo-700"
                          }}
                        >
                          <Button
                            size="small"
                            className="text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 border-0"
                          >
                            Clear All
                          </Button>
                        </Popconfirm>
                      )}
                    </div>

                    {activityLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="flex flex-col items-center">
                          <FiLoader className="animate-spin text-2xl text-gray-600 mb-2" />
                          <p className="text-gray-600">Loading activity...</p>
                        </div>
                      </div>
                    ) : activity.length > 0 ? (
                      <div className="space-y-4">
                        {activity.map((item, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-gray-800 bg-white px-2 py-1 rounded">
                                {item.action}
                              </span>
                              <div className="flex flex-col items-end text-xs text-gray-500">
                                <span className='text-sm'>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</span>
                                <span className="text-gray-400 mt-1">
                                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : 'N/A'}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 font-medium mb-1">{item.leadTitle || '-'}</p>
                            <p className="text-xs text-gray-600 truncate">{item.details || 'No details available'}</p>
                            <div className="flex justify-end text-xs text-gray-500 mt-2">
                              <span className="text-gray-400">{item.username || 'N/A'}</span>
                            </div>

                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">No recent activity available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;