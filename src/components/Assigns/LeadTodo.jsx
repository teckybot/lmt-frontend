import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, message, Tag, Card, Dropdown, Space } from 'antd';
import { FiUserPlus, FiLoader, FiMoreVertical, FiUsers, FiPlus } from 'react-icons/fi';
import api from '../../utils/axiosInstance';
import AssignModal from './AssignModal';
import BulkAssignModal from './BulkAssignModal';
import LeadDetailsModal from '../leads/LeadDetailsModal';

const LeadTodo = ({ role }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
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
      // Per requirement, show assigned-to-me for all roles in ToDo
      const url = '/leads/my-leads';
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

  const openDetailsModal = (lead) => {
    setSelectedLead(lead);
    setDetailsModalVisible(true);
  };

  const handleUpdateLead = async (updatedValues) => {
    if (!selectedLead) return;
    try {
      setLoading(true);
      console.log("ToDo: Sending update request with data:", updatedValues); // Debug log

      const res = await api.put(`/leads/${selectedLead.id}`, updatedValues);
      console.log("ToDo: Backend response:", res.data); // Debug log

      // Update the leads list with the updated lead data
      setLeads(prevLeads => prevLeads.map(lead => {
        if (lead.id === selectedLead.id) {
          // Merge the updated values with the existing lead data
          return {
            ...lead,
            ...updatedValues,
            // Ensure we preserve the assignees and other complex fields
            assignees: updatedValues.assignees || lead.assignees,
            assignments: updatedValues.assignments || lead.assignments,
            assignedByNames: updatedValues.assignedByNames
              ? [...new Set(updatedValues.assignedByNames)]
              : lead.assignedByNames,
          };
        }
        return lead;
      }));

      // Update the selectedLead state as well
      setSelectedLead(prev => ({
        ...prev,
        ...updatedValues,
        assignees: updatedValues.assignees || prev.assignees,
        assignments: updatedValues.assignments || prev.assignments,
        assignedByNames: updatedValues.assignedByNames
          ? [...new Set(updatedValues.assignedByNames)]
          : prev.assignedByNames,
      }));

      // message.success('Lead updated successfully');
    } catch (err) {
      console.error("ToDo: Error updating lead", err);
      console.error("ToDo: Error response data:", err.response?.data); // Debug log
      console.error("ToDo: Error response status:", err.response?.status); // Debug log
      message.error(err.response?.data?.error || err.response?.data?.message || 'Failed to update lead');
    } finally {
      setLoading(false);
    }
  };

  // Status color mapping (updated)
  const statusColors = {
    'New': 'geekblue',
    'In Progress': 'gold',
    'Closed': 'green',
    'Contacted': 'purple',
    'Qualified': 'cyan',
    'Proposal': 'orange',
    'Negotiation': 'volcano',
    'Lost': 'red'
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
      <Card key={lead.id} className="mb-5 rounded-xl shadow-sm border-0 bg-white overflow-hidden" onClick={() => openDetailsModal(lead)}>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{lead.source}</h3>
              <p className="text-gray-600 text-sm">{lead.customerName}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Tag color={statusColors[lead.status] || 'geekblue'} className="rounded-full px-3 py-1 text-xs font-medium">
              {lead.status}
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
      title: 'Service',
      dataIndex: 'source',
      key: 'source',
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
          color={statusColors[status] || 'geekblue'}
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
    }
  ];

  return (
    <div className="bg-gray-50 p-4 rounded-xl">
      {/* Header without bulk actions for super admin per requirement */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 md:mt-0 mt-16">
        <div>
          <h2 className="text-xl font-bold text-gray-900"> Lead ToDo </h2>
          <p className="text-gray-500 text-sm"> View leads assigned to you </p>
        </div>
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
          <div className="hidden md:block hover:cursor-pointer">
            <Table
              columns={columns}
              dataSource={leads}
              rowKey="id"
              loading={loading}
              rowSelection={null}
              onRow={(record) => ({ onClick: () => openDetailsModal(record) })}
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

      {detailsModalVisible && selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          role={role}
          onClose={() => { setDetailsModalVisible(false); setSelectedLead(null); }}
          onUpdate={handleUpdateLead}
          loading={loading}
        />
      )}
    </div>
  );
};

export default LeadTodo; 