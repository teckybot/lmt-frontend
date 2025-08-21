import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm } from "antd";
import { FiUser, FiMail, FiLock, FiPhone, FiUserCheck, FiUserPlus, FiEdit, FiTrash2, FiSearch } from "react-icons/fi";
import api from "../utils/axiosInstance";
import Teckybot from "../Data/Teckybot.png";
import { FiLoader } from "react-icons/fi";
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [form] = Form.useForm();

  // Fetch Users
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

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open Add/Edit Modal
  const openModal = (user = null) => {
    setEditingUser(user);
    setModalVisible(true);
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
  };

  // Add or Update User
  const handleSave = async (values) => {
    try {
      if (editingUser) {
        // Update user
        await api.put(`/users/${editingUser.id}`, values);
        message.success("User updated successfully");
      } else {
        // Create user
        await api.post("/auth/register", values);
        message.success("User added successfully");
      }
      setModalVisible(false);
      fetchUsers();
    } catch (err) {
      message.error("Failed to save user");
    }
  };

  // Delete User
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
            onClick={() => openModal(record)}
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
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Filtered users
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-4 bg-white rounded-xl shadow-md lg:mt-5 mt-28">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Manage Users</h1>
          <Button
            type="primary"
            icon={<FiUserPlus className="text-base" />}
            onClick={() => openModal()}
            className="
                bg-gradient-to-r from-gray-800 to-gray-900 
                border-0 
                hover:from-gray-900 hover:to-gray-800 
                focus:from-gray-900 focus:to-gray-800 
                active:from-gray-950 active:to-gray-900 
                shadow-md hover:shadow-lg 
                transition-all duration-200 
                flex items-center justify-center 
                rounded-lg 
                px-4 py-2 
                h-auto
                font-medium
                text-white
              "
            size="middle"
          >
            <span className="flex items-center">
              Add User
            </span>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900
                    placeholder-gray-400 transition duration-200"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <FiLoader className="animate-spin text-3xl text-blue-500 mb-2" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            bordered
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
              className: "px-2",
            }}
            scroll={{ x: true }}
            size="middle"
            className="custom-table"
          />
        </div>
      )}

      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText={editingUser ? "Update" : "Create"}
        okButtonProps={{
          className: "bg-gray-900  hover:bg-gray-900  focus:bg-gray-900 "
        }}
        cancelButtonProps={{ className: "" }}
        width={400}
        className="user-modal"
        style={{ top: 120 }}
      >
        <div className="flex justify-center mb-4">
          <img src={Teckybot} alt="Teckybot Logo" className="h-10 object-contain" />
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
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
            <Select
              suffixIcon={<FiUserCheck className="text-gray-400" />}
              className="focus:border-gray-900"
              popupClassName="role-dropdown"
            >
              <Option value="employee">Employee</Option>
              <Option value="admin">Admin</Option>
              <Option value="super admin">Super Admin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;