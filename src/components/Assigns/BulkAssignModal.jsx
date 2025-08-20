import React, { useEffect, useState } from 'react';
import { Modal, Select, Button, message } from 'antd';
import api from '../../utils/axiosInstance';

const { Option } = Select;

const BulkAssignModal = ({ visible, onClose }) => {
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsersAndLeads = async () => {
    try {
      const [usersRes, leadsRes] = await Promise.all([
        api.get('/users'),
        api.get('/leads')
      ]);
      setUsers(usersRes.data);
      setLeads(leadsRes.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchUsersAndLeads();
  }, []);

  const handleBulkAssign = async () => {
    try {
      setLoading(true);
      await api.post('/assigns/bulk-assign', {
        leadIds: selectedLeadIds,
        assigneeIds: selectedUserIds
      });
      message.success('Bulk assignment successful');
      onClose();
    } catch (err) {
      console.error(err);
      message.error('Bulk assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Bulk Assign Leads"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="assign" type="primary" loading={loading} onClick={handleBulkAssign}>
          Assign
        </Button>
      ]}
    >
      <p>Select Leads</p>
      <Select
        mode="multiple"
        style={{ width: '100%', marginBottom: 16 }}
        placeholder="Select leads"
        onChange={setSelectedLeadIds}
        value={selectedLeadIds}
      >
        {leads.map(lead => (
          <Option key={lead.id} value={lead.id}>
            {lead.title}
          </Option>
        ))}
      </Select>

      <p>Select Users</p>
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

export default BulkAssignModal;
