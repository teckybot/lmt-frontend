import React from "react";
import { FiTrash2 } from "react-icons/fi";
import { Popconfirm, Tag } from "antd";
import dayjs from "dayjs";

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'High':
            return { bg: 'bg-red-100', text: 'text-red-800' };
        case 'Medium':
            return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
        case 'Low':
            return { bg: 'bg-green-100', text: 'text-green-800' };
        default:
            return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'New':
            return "blue";
        case 'In Progress':
            return "gold";
        case 'Closed':
            return "green";
        default:
            return "default";
    }
};

const LeadCard = ({ lead, role, onDelete, onClick }) => {
    return (
        <div
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 truncate">{lead.source || "N/A"}</h3>
                {role !== 'employee' && (
                    <Popconfirm
                        title="Are you sure you want to delete this lead?"
                        okText="Yes"
                        cancelText="No"
                        okType="danger"
                        onConfirm={(e) => { e.stopPropagation(); onDelete(lead.id); }}
                    >
                        <button
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            title="Delete"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <FiTrash2 className="w-4 h-4" />
                        </button>
                    </Popconfirm>
                )}
            </div>

            <div className="text-sm text-gray-500 mb-1">
                <span className="font-medium">Customer:</span> {lead.customerName || "N/A"}
            </div>
            <div className="text-sm text-gray-500 mb-1">
                <span className="font-medium">Phone:</span> {lead.phone || "N/A"}
            </div>
            <div className="text-sm text-gray-500 mb-1">
                <span className="font-medium">Email:</span> {lead.email || "N/A"}
            </div>
            
            

            <div className="flex justify-between items-center mt-3">
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority).bg} ${getPriorityColor(lead.priority).text}`}
                >
                    {lead.priority || "N/A"}
                </span>
                <Tag color={getStatusColor(lead.status)}>
                    {lead.status || "N/A"}
                </Tag>
            </div>

            <div className="text-xs text-gray-500 mt-2">
                <span className="font-medium">Due:</span> {lead.dueDate ? dayjs(lead.dueDate).format("MMM DD, YYYY") : "N/A"}
            </div>
        </div>
    );
};

export default LeadCard;