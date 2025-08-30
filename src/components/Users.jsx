import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Tag } from "antd";
import { FiUser, FiMail, FiLock, FiPhone, FiUserCheck, FiUserPlus, FiEdit, FiTrash2, FiSearch, FiLoader } from "react-icons/fi";
import api from "../utils/axiosInstance";
import Teckybot from "../Data/Teckybot.png";

const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentUser, setCurrentUser] = useState(null);

  // Leads modal
  const [userLeadsVisible, setUserLeadsVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserLeads, setSelectedUserLeads] = useState([]);
  const [userLeadsLoading, setUserLeadsLoading] = useState(false);

  const [form] = Form.useForm();

  // Load current user and fetch users
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(storedUser);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user = null) => {
    setEditingUser(user);
    setModalVisible(true);
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
    } else {
      form.resetFields();
    }
  };

  // Update user info (name, email, role, phone)
  const handleSave = async (userData) => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, userData);
        message.success("User updated successfully");
      } else {
        await api.post("/auth/register", userData);
        message.success("User added successfully");
      }
      setModalVisible(false);
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to save user");
    }
  };

  // Force reset password (only for super admin / admin)
  const handleForceResetPassword = async (userId, newPassword) => {
    try {
      await api.post("/auth/force-reset-password", {
        userId,
        newPassword, // ← Sent in plain text (safe because HTTPS)
      });
      message.success("User password has been reset successfully");
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to reset user password");
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      message.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      message.error("Failed to delete user");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ['md'],
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      responsive: ['md'],
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${role === "super admin"
              ? "bg-red-100 text-red-600"
              : role === "admin"
                ? "bg-blue-100 text-blue-600"
                : "bg-green-100 text-green-600"
            }`}
        >
          {role}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-3">
          <Button
            type="link"
            icon={<FiEdit className="text-lg" />}
            onClick={(e) => { e.stopPropagation(); openModal(record); }}
            className="text-gray-900 hover:text-gray-900 p-0"
          />
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ className: "bg-gray-900 border-gray-900 hover:bg-gray-800" }}
          >
            <Button
              type="link"
              danger
              icon={<FiTrash2 className="text-lg" />}
              className="text-red-600 hover:text-red-600 p-0"
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Filter users
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    );
  });

  const openUserLeadsModal = async (user) => {
    setSelectedUser(user);
    setUserLeadsVisible(true);
    setUserLeadsLoading(true);
    try {
      const res = await api.get('/leads');
      const leads = res.data.filter((lead) => lead.assignees?.some(a => a.id === user.id));
      setSelectedUserLeads(leads);
    } catch (err) {
      message.error('Failed to fetch user leads');
    } finally {
      setUserLeadsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md lg:mt-5 mt-28">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">User Management</h1>
            <p className="text-sm text-gray-500 -mt-3">
              Manage, add, update, or remove users, roles, and contact information.
            </p>
          </div>
          <Button
            type="primary"
            icon={<FiUserPlus className="text-base" />}
            onClick={() => openModal()}
            className="bg-gradient-to-r from-gray-800 to-gray-900 border-0 hover:from-gray-900 hover:to-gray-800 focus:from-gray-900 focus:to-gray-800 active:from-gray-950 active:to-gray-900 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center rounded-lg px-4 py-2 h-auto font-medium text-white"
          >
            Add User
          </Button>
        </div>

        <div className="w-full">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400 transition duration-200"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <FiLoader className="animate-spin text-3xl text-blue-500 mb-2" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            bordered
            onRow={(record) => ({ onClick: () => openUserLeadsModal(record) })}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredUsers.length,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              responsive: true,
              showLessItems: true,
            }}
            scroll={{ x: true }}
            size="middle"
            className="custom-table hover:cursor-pointer"
          />
        </div>
      )}

      {/* Edit/Add User Modal */}
      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText={editingUser ? "Update" : "Create"}
        okButtonProps={{ className: "bg-gray-900 hover:bg-gray-800" }}
        cancelButtonProps={{ className: "" }}
        width={400}
        style={{ top: 120 }}
      >
        <div className="flex justify-center mb-4">
          <img src={Teckybot} alt="Teckybot Logo" className="h-10 object-contain" />
        </div>

        <Form
        form={form}
        layout="vertical"
          onFinish={(values) => {
            if (editingUser) {
              // Editing user
              const { password: newPassword, ...userData } = values;
              handleSave(userData);

              if (newPassword && currentUser?.role === "super admin") {
                handleForceResetPassword(editingUser.id, newPassword);
              }
            } else {
              // Creating user
              handleSave(values); 
            }
          }}
        >

          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter full name" }]}
          >
            <Input prefix={<FiUser className="text-gray-400" />} className="focus:border-gray-900" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input prefix={<FiMail className="text-gray-400" />} className="focus:border-gray-900" />
          </Form.Item>

          {/* Show only to super admin when editing */}
          {editingUser && currentUser?.role === "super admin" && (
            <>
              <div className="text-xs text-blue-600 mb-1">
                As super admin, you can reset this user's password.
              </div>
              <Form.Item
                name="password"
                label="Change Password"
                rules={[{ min: 6, message: "Password must be at least 6 characters" }]}
                extra="Leave blank to keep current password"
              >
                <Input.Password
                  prefix={<FiLock className="text-gray-400" />}
                  placeholder="Leave blank to keep current"
                />
              </Form.Item>
            </>
          )}

          {/* Password required only when creating */}
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please enter password" }]}
            >
              <Input.Password prefix={<FiLock className="text-gray-400" />} className="focus:border-gray-900" />
            </Form.Item>
          )}

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input prefix={<FiPhone className="text-gray-400" />} className="focus:border-gray-900" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select suffixIcon={<FiUserCheck className="text-gray-400" />}>
              <Option value="employee">Employee</Option>
              <Option value="admin">Admin</Option>
              <Option value="super admin">Super Admin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Leads Modal */}
      <Modal
        title={selectedUser ? `Leads Assigned to ${selectedUser.name}` : 'User Leads'}
        open={userLeadsVisible}
        onCancel={() => {
          setUserLeadsVisible(false);
          setSelectedUser(null);
          setSelectedUserLeads([]);
        }}
        footer={null}
        width={800}
      >
        {userLeadsLoading ? (
          <div className="flex items-center justify-center h-40">
            <FiLoader className="animate-spin text-2xl text-blue-500 mr-2" />
            <span>Loading leads...</span>
          </div>
        ) : selectedUserLeads.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No leads assigned to this user.</div>
        ) : (
          <div className="space-y-3">
            {selectedUserLeads.map((lead) => (
              <div key={lead.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{lead.source} - {lead.customerName}</div>
                    <div className="text-xs text-gray-500">{lead.email} • {lead.phone}</div>
                  </div>
                  <Tag color="geekblue" className="capitalize">{lead.status}</Tag>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <span className="mr-3"><strong>Priority:</strong> {lead.priority || 'N/A'}</span>
                  <span className="mr-3"><strong>Due:</strong> {lead.dueDate ? new Date(lead.dueDate).toLocaleDateString('en-GB') : 'N/A'}</span>
                  <span className="mr-3"><strong>Assigned By:</strong> {lead.assignedByNames?.join(', ') || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;