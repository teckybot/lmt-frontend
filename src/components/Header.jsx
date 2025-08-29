import React, { useEffect, useState } from "react";
import { FiUser, FiSearch, FiBell, FiX, FiLogOut, FiLock } from "react-icons/fi";
import {
  Dropdown,
  Menu,
  message,
  Modal,
  Form,
  Input,
  Button,
} from "antd";
import api from "../utils/axiosInstance";

// Profile Dropdown Menu
const ProfileDropdownMenu = ({ user, handleLogout, setActiveTab, onResetPassword }) => {
  const menu = (
    <Menu className="w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700">
      {/* User Info */}
      <Menu.Item
        key="user-info"
        className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 pointer-events-none"
      >
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {user.firstName || user.name || "User"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {user.email}
        </p>
        <div className="flex items-center mt-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {user.role?.toUpperCase() || "USER"}
          </span>
          <span className="ml-2 flex items-center">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="ml-1 text-xs text-green-600 dark:text-green-400">Online</span>
          </span>
        </div>
      </Menu.Item>

      {/* Profile */}
      <Menu.Item
        key="profile"
        onClick={() => setActiveTab("profile")}
        className="px-4 py-2 text-sm text-gray-700 dark:!text-white hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <FiUser className="inline mr-2 text-lg dark:text-white" />
        Profile
      </Menu.Item>

      {/* Reset Password */}
      <Menu.Item
        key="reset-password"
        onClick={onResetPassword}
        className="px-4 py-2 text-sm text-gray-700 dark:!text-white hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <FiLock className="inline mr-2 text-lg dark:text-white" />
        Reset Password
      </Menu.Item>

      {/* Logout */}
      <Menu.Item
        key="logout"
        onClick={handleLogout}
        className="px-4 py-2 text-sm text-gray-700 dark:!text-white hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <FiLogOut className="inline mr-2 text-lg dark:text-white" />
        Sign out
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
      <div className="cursor-pointer relative">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt="user avatar"
            className="w-10 h-10 rounded-full border-2 border-blue-500/30 dark:border-blue-400/30 object-cover"
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <FiUser className="text-gray-500 dark:text-gray-300 text-xl" />
          </div>
        )}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
      </div>
    </Dropdown>
  );
};

// Password Reset Modal
const PasswordResetModal = ({ visible, onCancel, onOk, loading, form }) => {
  return (
    <Modal
      title="Reset Password"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={async () => {
            try {
              const values = await form.validateFields();
              onOk(values);
            } catch (err) {
              // validation error handled by Ant Design
            }
          }}
        >
          Reset Password
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[
            { required: true, message: 'Please enter your current password' }
          ]}
        >
          <Input.Password placeholder="Enter current password" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: 'Please enter your new password' },
            { min: 6, message: 'Password must be at least 6 characters' }
          ]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your new password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Main Header Component
const Header = ({ setActiveTab }) => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [form] = Form.useForm(); // Proper Ant Design form control

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await api.get('/users/profile');
        const userData = userRes.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        const notiRes = await api.get('/users/notifications');
        setNotifications(notiRes.data || []);
      } catch (err) {
        console.error('Error fetching user data:', err);
        message.error("Failed to load user data.");
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
      }
    };

    if (localStorage.getItem('token')) {
      fetchUserData();
    } else {
      setUser(null);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement search logic here
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  const handleResetPassword = () => {
    setResetPasswordVisible(true);
    form.resetFields(); // Clear previous inputs
  };

  const handlePasswordResetCancel = () => {
    setResetPasswordVisible(false);
    form.resetFields();
  };

  const handlePasswordResetSubmit = async (values) => {
    setResetLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      message.success(response.data.message || 'Password reset successfully!');
      setResetPasswordVisible(false);
      form.resetFields();
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to reset password';
      message.error(errorMsg);
      console.error('Password reset error:', error);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <header className="hidden md:flex items-center justify-center px-6 py-3 h-16 shadow-sm
        bg-white/95 dark:bg-gray-900 backdrop-blur-sm
        text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800
        transition-colors duration-300 relative"
      >
        {/* Brand */}
        <div className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-wide relative">
          LEADZO
          <span className="absolute -right-4 top-0 text-[0.6rem] text-blue-400 dark:text-blue-300">®</span>
        </div>

        {/* Search Bar */}
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

        {/* Right Icons */}
        <div className="absolute right-6 flex items-center space-x-4">
          {/* Search Toggle */}
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setShowSearch(!showSearch)}
          >
            <FiSearch className="text-xl text-gray-600 dark:text-gray-300" />
          </button>

          {/* Notifications */}
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            overlay={
              <Menu className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Notifications</span>
                </div>

                {Array.isArray(notifications) && notifications.length > 0 ? (
                  notifications.map((n) => (
                    <Menu.Item key={n.id} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">{n.message}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </Menu.Item>
                  ))
                ) : (
                  <Menu.Item className="px-4 py-3 text-gray-500 dark:text-gray-400">No notifications</Menu.Item>
                )}

                <div className="px-4 py-2 text-center border-t border-gray-100 dark:border-gray-700">
                  <button
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={async () => {
                      await api.post('/users/notifications/read');
                      const res = await api.get('/users/notifications');
                      setNotifications(res.data || []);
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              </Menu>
            }
          >
            <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <FiBell className="text-xl text-gray-600 dark:text-gray-300" />
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {Math.min(9, notifications.filter(n => !n.read).length)}
                </span>
              )}
            </button>
          </Dropdown>

          {/* Role & Avatar */}
          <div className="flex items-center space-x-3">
            <span className="font-medium text-sm text-gray-600 dark:text-gray-300">
              {user?.role?.toUpperCase() || "GUEST"}
            </span>
            {user && (
              <ProfileDropdownMenu
                user={user}
                handleLogout={handleLogout}
                setActiveTab={setActiveTab}
                onResetPassword={handleResetPassword}
              />
            )}
          </div>
        </div>
      </header>

      {/* Password Reset Modal */}
      <PasswordResetModal
        visible={resetPasswordVisible}
        onCancel={handlePasswordResetCancel}
        onOk={handlePasswordResetSubmit}
        loading={resetLoading}
        form={form}
      />
    </>
  );
};

export default Header;