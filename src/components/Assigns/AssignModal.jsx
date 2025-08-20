import React, { useEffect, useState } from 'react';
import { Modal, Select, Button, message } from 'antd';
import api from '../../utils/axiosInstance';

const { Option } = Select;

const AssignModal = ({ visible, lead, onClose }) => {
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

  const handleAssign = async () => {
    try {
      setLoading(true);
      await api.post(`/assigns/${lead.id}/assign`, { assigneeIds: selectedUserIds });
      message.success('Lead assigned successfully');
      onClose();
    } catch (err) {
      console.error(err);
      message.error('Failed to assign lead');
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
