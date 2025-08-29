import React, { useState, useEffect } from "react";
import { Modal, Spin, Avatar, Input, List, Button } from "antd";
import { FiUser, FiSearch } from "react-icons/fi";
import api from "../../utils/axiosInstance";

const AssigneeSelector = ({ lead, visible, onClose, onAssign }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
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
        } finally {
            setLoading(false);
        }
    };

    // Initialize selection from current lead when opened
    useEffect(() => {
        if (visible) {
            setSelectedIds(lead.assignees?.map(a => a.id) || []);
        }
    }, [visible, lead]);

    const toggleUser = (userId) => {
        setSelectedIds((prev) => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            }
            return [...prev, userId];
        });
    };

    const handleSave = () => {
        onAssign(selectedIds);
    };

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal
            title="Assignees"
            open={visible}
            onCancel={onClose}
            footer={
                <div className="flex justify-end gap-2">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" onClick={handleSave} disabled={loading}>Save</Button>
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
                                            <Avatar
                                                src={user.avatar } 
                                                icon={<FiUser />}
                                            />
                                        }
                                        title={<div className="font-semibold text-sm">{user.name}</div>}
                                        description={<div className="text-xs text-gray-500">{user.email}</div>}
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