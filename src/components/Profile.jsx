import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
        // Fetch user data
        setProfileLoading(true);
        const userRes = await axios.get('https://lmt-backend.onrender.com/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = userRes.data;
        console.log('Profile API Response:', userData); // Debug log
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          avatar: userData.avatar || ''
        });
        setProfileError(null);
      } catch (err) {
        console.error('Error fetching profile:', err.response?.status, err.response?.data, err.message);
        setProfileError(err.response?.data?.message || `Failed to fetch profile data (Status: ${err.response?.status || 'Network Error'}).`);
      } finally {
        setProfileLoading(false);
      }

      try {
        // Fetch user activity
        setActivityLoading(true);
        const activityRes = await axios.get('http://localhost:5000/api/user/activity', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Activity API Response:', activityRes.data); // Debug log
        setActivity(activityRes.data || []);
        setActivityError(null);
      } catch (err) {
        console.error('Error fetching activity:', err.response?.status, err.response?.data, err.message);
        setActivityError(err.response?.data?.message || `Failed to fetch activity data (Status: ${err.response?.status || 'Network Error'}).`);
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
      await axios.put('https://lmt-backend.onrender.com/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...user, ...formData });
      localStorage.setItem('user', JSON.stringify({ ...user, ...formData }));
      setIsEditing(false);
      setProfileError(null);
    } catch (err) {
      console.error('Error updating profile:', err.response?.status, err.response?.data, err.message);
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (profileError && activityError) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center ">
        <p className="text-red-500">Profile Error: {profileError}</p>
        <p className="text-red-500">Activity Error: {activityError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-red-500">No user data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6  mt-16 md:mt-0">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">My Profile</h2>
      
      {profileError && (
        <p className="text-red-500 mb-4">Profile Error: {profileError}</p>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex flex-col items-center">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                alt="Profile" 
                className="h-32 w-32 rounded-full mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
              <p className="text-gray-500">{user.role || 'User'}</p>
              
              {isEditing ? (
                <button
                  onClick={handleSubmit}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Account Details</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Member Since:</span> {new Date(user.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Last Login:</span> {new Date(user.last_login).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-2/3">
          {isEditing ? (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Profile</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-md"
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
                      className="w-full px-4 py-2 border rounded-md"
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
                      className="w-full px-4 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                    <input
                      type="url"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-md"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow">
                  <h4 className="text-sm font-medium text-gray-500">Leads Added</h4>
                  <p className="text-2xl font-bold text-gray-900">{user.leadsAdded ?? '0'}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <h4 className="text-sm font-medium text-gray-500">Leads Converted</h4>
                  <p className="text-2xl font-bold text-gray-900">{user.leadsConverted ?? '0'}</p>
                </div>
              </div>  

              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              {activityError && (
                <p className="text-red-500 mb-4">Activity Error: {activityError}</p>
              )}
              {activityLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div> 
                </div>
              ) : activity.length > 0 ? (
                <div className="space-y-4"> 
                  {activity.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded shadow">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">{item.action || 'Unknown Action'}</p>
                        <p className="text-sm text-gray-500">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{item.details || 'No details available'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;