import React, { useEffect, useState } from 'react';
import { Modal, Select, Button, message } from 'antd';
import api from '../../utils/axiosInstance';

const { Option } = Select;

const AssignModal = ({ visible, lead, onClose, role }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users'); // fetch all users
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (lead?.assignees?.length) {
      setSelectedUserIds(lead.assignees.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  }, [lead]);

  const handleAssign = async () => {
    try {
      setLoading(true);
      await api.post(`/assigns/${lead.id}/assign`, { assigneeIds: selectedUserIds });
      message.success('Lead assigned successfully');
      onClose();
    } catch (err) {
      if (role === 'admin' && err.response?.status === 403) {
        Modal.confirm({
          title: 'Request Reassignment',
          content: 'This lead is already assigned by a super admin. Send a reassignment request?',
          okText: 'Send',
          cancelText: 'Cancel',
          async onOk() {
            await api.post(`/assigns/${lead.id}/reassign-request`);
            message.success('Request sent to super admins');
            onClose();
          }
        });
      } else {
        console.error(err);
        message.error('Failed to assign lead');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Assign Lead: ${lead.title}`}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="assign" type="primary" loading={loading} onClick={handleAssign}>
          Assign
        </Button>
      ]}
    >
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="Select users"
        onChange={setSelectedUserIds}
        value={selectedUserIds}
      >
        {users.map(user => (
          <Option key={user.id} value={user.id}>
            {user.name} ({user.role})
          </Option>
        ))}
      </Select>
    </Modal>
  );
};

export default AssignModal;
