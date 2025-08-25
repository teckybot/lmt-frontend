import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, message, Tag, Card, Dropdown, Space } from 'antd';
import { FiUserPlus, FiLoader, FiMoreVertical, FiUsers, FiPlus } from 'react-icons/fi';
import api from '../../utils/axiosInstance';
import AssignModal from './AssignModal';
import BulkAssignModal from './BulkAssignModal';

const LeadTable = ({ role }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleBulkAssignClick = () => {
    if (selectedRows.length === 0) {
      message.warning('Please select at least one lead to assign');
      return;
    }
    setBulkModalVisible(true);
  };

  const rowSelection = {
    selectedRowKeys: selectedRows.map(row => row.id),
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  };

  // Status color mapping
  const statusColors = {
    'new': 'blue',
    'contacted': 'purple',
    'qualified': 'cyan',
    'proposal': 'orange',
    'negotiation': 'gold',
    'closed': 'green',
    'lost': 'red'
  };

  // Mobile card view for leads
  const renderMobileLeadCards = () => {
    if (leads.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
          <div className="text-gray-400 text-4xl mb-3">📋</div>
          <p className="text-gray-500 font-medium">No leads available</p>
          <p className="text-gray-400 text-sm mt-1">Leads will appear here once created</p>
        </div>
      );
    }

    return leads.map(lead => (
      <Card key={lead.id} className="mb-5 rounded-xl shadow-sm border-0 bg-white overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{lead.title}</h3>
              <p className="text-gray-600 text-sm">{lead.customerName}</p>
            </div>
            {(role === 'admin' || role === 'super admin') && (
              <Button 
                type="primary" 
                size="small" 
                icon={<FiUserPlus className="text-xs" />} 
                onClick={() => handleAssignClick(lead)}
                className="bg-indigo-600 hover:bg-indigo-700 border-0 shadow-sm"
              >
                Assign
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <Tag color={statusColors[lead.status] || 'blue'} className="rounded-full px-3 py-1 text-xs font-medium">
              {lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1)}
            </Tag>
          </div>
          
          {lead.assignees && lead.assignees.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-2">ASSIGNED TO</p>
              <div className="flex flex-wrap gap-2">
                {lead.assignees.map(user => (
                  <Tag key={user.id} color="blue" className="rounded-full px-2 py-1 text-xs bg-blue-50 border-0">
                    {user.name}
                  </Tag>
                ))}
              </div>
            </div>
          )}
          
          {lead.assignedByNames && lead.assignedByNames.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-2">ASSIGNED BY</p>
              <div className="flex flex-wrap gap-2">
                {lead.assignedByNames.map((name, i) => (
                  <Tag key={i} color="purple" className="rounded-full px-2 py-1 text-xs bg-purple-50 border-0">
                    {name}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    ));
  };

  const columns = [
    { 
      title: 'Title', 
      dataIndex: 'title', 
      key: 'title',
      render: (text) => <span className="font-medium text-gray-900">{text}</span>,
      responsive: ['md'] 
    },
    { 
      title: 'Customer', 
      dataIndex: 'customerName', 
      key: 'customerName',
      render: (text) => <span className="text-gray-700">{text}</span>,
      responsive: ['md'] 
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag 
          color={statusColors[status] || 'blue'} 
          className="rounded-full px-3 py-1 text-xs font-medium capitalize"
        >
          {status}
        </Tag>
      ),
      responsive: ['md'] 
    },
    {
      title: 'Assigned To',
      key: 'assignedTo',
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.assignees?.map(user => (
            <Tag 
              key={user.id} 
              color="blue" 
              className="rounded-full px-2 py-1 text-xs bg-blue-50 border-0"
            >
              {user.name}
            </Tag>
          ))}
        </div>
      ),
      responsive: ['md'] 
    },
    {
      title: 'Assigned By',
      key: 'assignedBy',
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.assignedByNames?.length ? record.assignedByNames.map((n, i) => (
            <Tag 
              key={i} 
              color="purple" 
              className="rounded-full px-2 py-1 text-xs bg-purple-50 border-0"
            >
              {n}
            </Tag>
          )) : (
            <span className="text-gray-400 text-sm">Not assigned</span>
          )}
        </div>
      ),
      responsive: ['md'] 
    },
    ...(role === 'employee' ? [] : [{
      title: 'Actions',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <div className="flex justify-center">
          {(role === 'admin' || role === 'super admin') && (
            <Button 
              type="primary"
              icon={<FiUserPlus className="text-sm" />} 
              onClick={() => handleAssignClick(record)}
              size="small"
              className="bg-indigo-600 hover:bg-indigo-700 border-0 shadow-sm"
            >
              Assign
            </Button>
          )}
        </div>
      ),
      responsive: ['md'] 
    }]),
  ];

  return (
    <div className="bg-gray-50 p-4 rounded-xl">
      {/* Header with Bulk Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900"> Lead Assignment Dashboard </h2>
          <p className="text-gray-500 text-sm"> Assign Leads to a Right Persion </p>
        </div>
        
        {role === 'super admin' && (
          <div className="flex gap-2">
            {selectedRows.length > 0 && (
              <Button 
                icon={<FiUsers className="text-sm" />} 
                onClick={handleBulkAssignClick}
                type="primary"
                className="bg-indigo-600 hover:bg-indigo-700 border-0 shadow-sm flex items-center"
              >
                Bulk Assign ({selectedRows.length})
              </Button>
            )}
            <Button 
              icon={<FiPlus className="text-sm" />} 
              onClick={() => setBulkModalVisible(true)}
              type="default"
              className="border-gray-300 shadow-sm flex items-center"
            >
              Bulk Assign
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm">
          <div className="flex flex-col items-center">
            <FiLoader className="animate-spin text-3xl text-indigo-600 mb-3" />
            <p className="text-gray-600 font-medium">Loading leads data...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          {isMobile && (
            <div className="md:hidden">
              {renderMobileLeadCards()}
            </div>
          )}
          
          {/* Desktop View */}
          <div className="hidden md:block">
            <Table 
              columns={columns} 
              dataSource={leads} 
              rowKey="id" 
              loading={loading}
              rowSelection={role === 'super admin' ? rowSelection : null}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                responsive: true,
                showTotal: (total, range) => (
                  <p className="text-gray-600 text-sm">
                    Showing {range[0]}-{range[1]} of {total} leads
                  </p>
                )
              }}
              scroll={{ x: 1000 }}
              className="bg-white rounded-xl shadow-sm border-0"
            />
          </div>
        </>
      )}

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
          selectedLeads={selectedRows}
          onClose={() => { 
            setBulkModalVisible(false); 
            setSelectedRows([]);
            fetchLeads(); 
          }}
        />
      )}
    </div>
  );
};

export default LeadTable;