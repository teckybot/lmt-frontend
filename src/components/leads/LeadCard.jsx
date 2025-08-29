import React from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Popconfirm } from "antd";
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

const SOURCE_OPTIONS = [
  "Year Long Programme", "STEM Labs", "Training", "LMS", "Workshop", "Projects", "Website Development", "Internships", "Bootcamps", "Product Selling", "Other"
];

const LeadCard = ({ 
    lead, 
    role, 
    loading, 
    isEditing, 
    handleEditClick, 
    onCancelEdit,
    deleteLead, 
    updateStatus, 
    formData, 
    handleChange, 
    handleEditSubmit 
}) => {
    return (
        <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 truncate">{lead.title || "N/A"}</h3>
                {role !== 'employee' && (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleEditClick(lead)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            title="Edit"
                        >
                            <FiEdit className="w-4 h-4" />
                        </button>
                        <Popconfirm
                            title="Are you sure you want to delete this lead?"
                            okText="Yes"
                            cancelText="No"
                            okType="danger"
                            onConfirm={() => deleteLead(lead.id)}
                        >
                            <button
                                disabled={loading}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                title="Delete"
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        </Popconfirm>
                    </div>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleEditSubmit} className="mt-3 space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                        <input
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                        <select
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select Source</option>
                            {SOURCE_OPTIONS.map((source) => (
                                <option key={source} value={source}>{source}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="New">New</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="text-sm text-gray-500 mb-1">
                        <span className="font-medium">Customer:</span> {lead.customerName || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                        <span className="font-medium">Email:</span> {lead.email || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                        <span className="font-medium">Phone:</span> {lead.phone || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                        <span className="font-medium">Service:</span> {lead.source || "N/A"}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority).bg} ${getPriorityColor(lead.priority).text}`}
                        >
                            {lead.priority || "N/A"}
                        </span>
                        <div className="relative">
                            <select
                                value={lead.status || "New"}
                                onChange={(e) => updateStatus(lead.id, e.target.value)}
                                disabled={loading}
                                className={`block w-full pl-3 pr-8 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-2 appearance-none ${lead.status === "New"
                                    ? "border-blue-200 bg-blue-50 text-blue-800"
                                    : lead.status === "In Progress"
                                        ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                                        : "border-green-200 bg-green-50 text-green-800"
                                    }`}
                            >
                                <option value="New">New</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                        <span className="font-medium">Due:</span> {lead.dueDate
                            ? dayjs(lead.dueDate).format("MMM DD, YYYY")
                            : "N/A"}
                    </div>
                </>
            )}
        </div>
    );
};

export default LeadCard;