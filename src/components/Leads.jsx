import React, { useEffect, useState, useMemo } from "react";
import { FiSearch, FiDownload, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";
import { Pagination, Select, Button } from "antd";
import ExcelJS from 'exceljs';
import { saveAs } from "file-saver";
import api from "../utils/axiosInstance";

// Import modular components
import LeadCard from "../components/leads/LeadCard";
import LeadDetailsModal from "../components/leads/LeadDetailsModal";
import LeadFilters from "../components/leads/LeadFilters";

const LeadsTable = () => {
    const [leads, setLeads] = useState([]);
    const [role, setRole] = useState(null);
    const [editingLead, setEditingLead] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sourceFilter, setSourceFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(9);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setRole((parsed.role || '').toLowerCase());
            } catch { }
        }
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const endpoint = (JSON.parse(localStorage.getItem('user') || '{}').role || '').toLowerCase() === 'employee' ? '/leads/my-leads' : '/leads';
            const res = await api.get(endpoint);
            setLeads(res.data);
        } catch (err) {
            console.error("Error fetching leads", err);
            toast.error("Failed to fetch leads. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const deleteLead = async (leadId) => {
        try {
            setLoading(true);
            await api.delete(`/leads/${leadId}`);
            fetchLeads();
            toast.success("Lead deleted successfully!");
        } catch (err) {
            console.error("Error deleting lead", err);
            toast.error("Failed to delete lead.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleCardClick = (lead) => {
        setEditingLead(lead);
        setShowModal(true);
    };

    const handleUpdateLead = async (updatedValues) => {
        try {
            setLoading(true);
            const res = await api.put(`/leads/${editingLead.id}`, updatedValues);
            setLeads(prevLeads => prevLeads.map(lead => lead.id === res.data.id ? res.data : lead));
            toast.success("Lead updated successfully!");
        } catch (err) {
            console.error("Error updating lead", err);
            toast.error("Failed to update lead.");
        } finally {
            setLoading(false);
        }
    };

    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            const matchesSearch =
                (lead.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.phone || "").toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPriority = priorityFilter === "All" || lead.priority === priorityFilter;
            const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
            const matchesSource = sourceFilter === "All" || lead.source === sourceFilter;
            return matchesSearch && matchesPriority && matchesStatus && matchesSource;
        });
    }, [leads, searchTerm, priorityFilter, statusFilter, sourceFilter]);

    const paginatedLeads = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredLeads.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredLeads, currentPage, rowsPerPage]);

    const exportToExcel = async () => { /* ... (same export logic) ... */ };

    const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
    const STATUS_OPTIONS = ["New", "In Progress", "Closed"];
    const SOURCE_OPTIONS = [
        "Year Long Programme", "STEM Labs", "Training", "LMS", "Workshop", "Projects", 
        "Website Development", "Internships", "Bootcamps", "Product Selling", "Other"
    ];

    return (
        <div className="p-4 bg-white mt-16 md:mt-0">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg p-4 md:p-6">
                    <div className="mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Leads Management</h2>
                        <p className="text-xs md:text-sm text-gray-600">Track and manage all your leads</p>
                    </div>

                    <LeadFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        priorityFilter={priorityFilter}
                        setPriorityFilter={setPriorityFilter}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        sourceFilter={sourceFilter}
                        setSourceFilter={setSourceFilter}
                        filteredLeads={filteredLeads}
                        exportToExcel={exportToExcel}
                        uniquePriorities={PRIORITY_OPTIONS}
                        uniqueStatuses={STATUS_OPTIONS}
                        uniqueSources={SOURCE_OPTIONS}
                    />

                    <div className="mb-3 text-xs md:text-sm text-gray-600 flex items-center justify-between">
                        {loading ? (
                            <span>Loading...</span>
                        ) : (
                            <span>Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredLeads.length)} of {filteredLeads.length}</span>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <FiLoader className="animate-spin text-3xl text-blue-500 mb-2" />
                            <p className="text-gray-600">Loading leads data...</p>
                        </div>
                    ) : paginatedLeads.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No leads found matching the current filters.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedLeads.map((lead) => (
                                <LeadCard
                                    key={lead.id}
                                    lead={lead}
                                    role={role}
                                    onDelete={deleteLead}
                                    onClick={() => handleCardClick(lead)}
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between mb-4 mt-4 gap-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>Cards per page:</span>
                            <Select
                                value={rowsPerPage}
                                onChange={(value) => { setRowsPerPage(value); setCurrentPage(1); }}
                                options={[9, 18, 27].map((size) => ({ value: size, label: size }))}
                                style={{ width: 80 }}
                            />
                        </div>
                        <div className="flex justify-end flex-1">
                            <Pagination
                                current={currentPage}
                                total={filteredLeads.length}
                                pageSize={rowsPerPage}
                                onChange={(page) => setCurrentPage(page)}
                                showSizeChanger={false}
                                responsive
                            />
                        </div>
                    </div>

                    {showModal && editingLead && (
                        <LeadDetailsModal
                            lead={editingLead}
                            role={role}
                            onClose={() => setShowModal(false)}
                            onUpdate={handleUpdateLead}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadsTable;