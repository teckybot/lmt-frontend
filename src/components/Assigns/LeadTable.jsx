import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, message, Tag } from 'antd';
import { FiUserPlus } from 'react-icons/fi';
import api from '../../utils/axiosInstance';
import AssignModal from './AssignModal';
import BulkAssignModal from './BulkAssignModal';

const LeadTable = ({ role }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const url = role === 'employee' ? '/leads/my-leads' : '/leads';
      const res = await api.get(url);
      setLeads(res.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAssignClick = (lead) => {
    setSelectedLead(lead);
    setAssignModalVisible(true);
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Assigned To',
      key: 'assignedTo',
      render: (_, record) =>
        record.assignees?.map(user => (
          <Tag key={user.id} color="blue">{user.name}</Tag>
        ))
    },
    {
      title: 'Assigned By',
      key: 'assignedBy',
      render: (_, record) =>
        record.assignedByNames?.length ? record.assignedByNames.map((n, i) => (
          <Tag key={i} color="purple">{n}</Tag>
        )) : null
    },
    ...(role === 'employee' ? [] : [{
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          {(role === 'admin' || role === 'super admin') && (
            <Button icon={<FiUserPlus />} onClick={() => handleAssignClick(record)}>
              Assign
            </Button>
          )}
        </>
      ),
    }]),
  ];

  return (
    <div>
      {role === 'super admin' && (
        <Button className="mb-2" onClick={() => setBulkModalVisible(true)}>
          Bulk Assign
        </Button>
      )}

      <Table columns={columns} dataSource={leads} rowKey="id" loading={loading} />

      {assignModalVisible && selectedLead && (
        <AssignModal
          visible={assignModalVisible}
          lead={selectedLead}
          role={role}
          onClose={() => { setAssignModalVisible(false); fetchLeads(); }}
        />
      )}

      {bulkModalVisible && (
        <BulkAssignModal
          visible={bulkModalVisible}
          role={role}
          onClose={() => { setBulkModalVisible(false); fetchLeads(); }}
        />
      )}
    </div>
  );
};

export default LeadTable;
