import React, { useState, useEffect } from "react";
import { Modal, Spin, Avatar, Input, List, Button, message, Tooltip } from "antd";
import { FiUser, FiSearch } from "react-icons/fi";
import api from "../../utils/axiosInstance";

const AssigneeSelector = ({ lead, visible, onClose, onAssign, role }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        if (visible) {
            fetchUsers();
        }
    }, [visible]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
            message.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    // Initialize selection from current lead when opened
    useEffect(() => {
        if (visible) {
            setSelectedIds(lead?.assignees?.map((a) => a.id) || []);
        }
    }, [visible, lead]);

    const toggleUser = (userId) => {
        setSelectedIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.post(`/assigns/${lead.id}/assign`, { assigneeIds: selectedIds });
            
            // Fetch updated assignments and call onAssign to update parent state
            const { data: assignments } = await api.get(`/assigns/${lead.id}/assignments`);
            const assignees = assignments.map(a => a.user);
            
            // Call the onAssign callback to update parent component state
            if (onAssign) {
                onAssign(assignees, assignments);
            }
            
            message.success("Lead assigned successfully");
            onClose();
        } catch (err) {
            console.error("Assign error:", err.response?.data || err);

            if (role === "admin" && err.response?.status === 403) {
                // Show popup to request reassignment
                Modal.confirm({
                    title: "Request Reassignment",
                    content: err.response?.data?.message ||
                        "This lead is already assigned by a super admin. Send a reassignment request?",
                    okText: "Send",
                    cancelText: "Cancel",
                    async onOk() {
                        try {
                            await api.post(`/assigns/${lead.id}/reassign-request`);
                            message.success("Request sent to super admins");
                            onClose();
                        } catch (e) {
                            console.error("Reassign error:", e.response?.data || e);
                            message.error(e.response?.data?.message || "Failed to send reassignment request");
                        }
                    }
                });
            } else {
                message.error(err.response?.data?.message || "Failed to assign lead");
            }
        } finally {
            setSaving(false);
        }
    };

    // Function to get first letter of name for avatar fallback
    const getInitials = (name) => {
        if (!name) return "?";
        return name.charAt(0).toUpperCase();
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal
            title="Assign Assignees"
            open={visible}
            onCancel={onClose}
            footer={
                <div className="flex justify-end gap-2">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" onClick={handleSave} loading={saving}>
                        Save
                    </Button>
                </div>
            }
            width={400}
        >
            <div className="mb-4">
                <Input
                    prefix={<FiSearch className="text-gray-400" />}
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Spin />
                </div>
            ) : (
                <div className="h-64 overflow-y-auto">
                    <List
                        dataSource={filteredUsers}
                        renderItem={(user) => {
                            const isAssigned = selectedIds.includes(user.id);
                            return (
                                <List.Item
                                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => toggleUser(user.id)}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Tooltip title={user.name}>
                                                <Avatar 
                                                    src={user.avatar} 
                                                    icon={<FiUser />}
                                                    style={{ 
                                                        backgroundColor: user.avatar ? undefined : '#1890ff',
                                                        borderRadius: '4px' // Make it rectangular
                                                    }}
                                                >
                                                    {!user.avatar && getInitials(user.name)}
                                                </Avatar>
                                            </Tooltip>
                                        }
                                        title={
                                            <div className="font-semibold text-sm">{user.name}</div>
                                        }
                                        description={
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        }
                                    />
                                    {isAssigned && <span className="text-blue-500">✓</span>}
                                </List.Item>
                            );
                        }}
                    />
                </div>
            )}
        </Modal>
    );
};

export default AssigneeSelector;
