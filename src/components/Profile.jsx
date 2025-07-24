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

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        // Fetch user data
        const userRes = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userRes.data);
        setFormData({
          name: userRes.data.name,
          email: userRes.data.email,
          phone: userRes.data.phone || '',
          avatar: userRes.data.avatar || ''
        });

        // Fetch user activity
        const activityRes = await axios.get('http://localhost:5000/api/user/activity', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivity(activityRes.data);
      } catch (err) {
        console.error('Error fetching profile data', err);
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
    try {
      await axios.put('http://localhost:5000/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...user, ...formData });
      localStorage.setItem('user', JSON.stringify({ ...user, ...formData }));
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile', err);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">My Profile</h2>
      
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
                  <span className="font-medium">Member Since:</span> {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Last Login:</span> {new Date(user.lastLogin).toLocaleString()}
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
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow">
                  <h4 className="text-sm font-medium text-gray-500">Leads Added</h4>
                  <p className="text-2xl font-bold text-gray-900">{user.leadsAdded || 0}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <h4 className="text-sm font-medium text-gray-500">Leads Converted</h4>
                  <p className="text-2xl font-bold text-gray-900">{user.leadsConverted || 0}</p>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {activity.length > 0 ? (
                  activity.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded shadow">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">{item.action}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{item.details}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;