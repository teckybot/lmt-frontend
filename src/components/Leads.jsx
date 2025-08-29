import React from "react";
import { FiLoader } from "react-icons/fi";
import { Form } from "antd";
import dayjs from "dayjs";

// Custom Hooks
import useLeadsData from "../hooks/useLeadsData";
import useLeadFilters from "../hooks/useLeadFilters";
import useLeadPagination from "../hooks/useLeadPagination";

// Sub-components
import LeadCard from "../components/leads/LeadCard";
import LeadEditModal from "../components/leads/LeadEditModal";
import LeadFilters from "../components/leads/LeadFilters";
import PaginationControls from "../components/leads/PaginationControls";

const LeadsTable = () => {
    const [form] = Form.useForm();
    const {
        leads,
        role,
        loading,
        editingLead,
        setEditingLead,
        formData,
        setFormData,
        showModal,
        setShowModal,
        isMobile,
        updateStatus,
        deleteLead,
        handleEditClick,
        handleEditSubmit,
        handleChange,
    } = useLeadsData();

    // separate function to handle the modal opening logic
    const showEditModal = (lead) => {
      form.setFieldsValue({
        ...lead,
        dueDate: lead.dueDate ? dayjs(lead.dueDate) : null,
      });
      setShowModal(true);
      setEditingLead(lead.id); 
    };

    const handleFormSubmit = async (values) => {
        try {
            await handleEditSubmit(values);
            form.resetFields(); // Reset form after successful submission
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const {
        searchTerm,
        setSearchTerm,
        priorityFilter,
        setPriorityFilter,
        statusFilter,
        setStatusFilter,
        sourceFilter,
        setSourceFilter,
        filteredLeads,
    } = useLeadFilters(leads);

    const {
        currentPage,
        setCurrentPage,
        rowsPerPage,
        setRowsPerPage,
        paginatedLeads,
    } = useLeadPagination(filteredLeads);

    const SOURCE_OPTIONS = [
        "Year Long Programme", "STEM Labs", "Training", "LMS", "Workshop", "Projects", "Website Development", "Internships", "Bootcamps", "Product Selling", "Other"
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
                    />

                    <div className="mb-3 text-xs md:text-sm text-gray-600 flex items-center justify-between">
                        {loading ? (
                            <span>Loading...</span>
                        ) : (
                            <>
                                <span>
                                    Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{" "}
                                    <span className="font-medium">
                                        {Math.min(currentPage * rowsPerPage, filteredLeads.length)}
                                    </span>{" "}
                                    of <span className="font-medium">{filteredLeads.length}</span>
                                </span>
                            </>
                        )}
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-3">
                      <PaginationControls
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            rowsPerPage={rowsPerPage}
                            setRowsPerPage={setRowsPerPage}
                            totalItems={filteredLeads.length}
                        />
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="flex flex-col items-center">
                                    <FiLoader className="animate-spin text-3xl text-blue-500 mb-2" />
                                    <p className="text-gray-600">Loading analytics data...</p>
                                </div>
                            </div>
                        ) : paginatedLeads.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No leads found matching the current filters.</div>
                        ) : (
                            paginatedLeads.map((lead) => (
                                <LeadCard
                                    key={lead.id}
                                    lead={lead}
                                    role={role}
                                    loading={loading}
                                    isEditing={editingLead === lead.id}
                                    handleEditClick={() => handleEditClick(lead)}
                                    onCancelEdit={() => setEditingLead(null)}
                                    deleteLead={deleteLead}
                                    updateStatus={updateStatus}
                                    formData={formData}
                                    handleChange={handleChange}
                                    handleEditSubmit={(e) => { e.preventDefault(); handleEditSubmit(formData); }}
                                />
                            ))
                        )}
                    </div>

                    {/* Desktop Card View */}
                    <div className="hidden md:block">
                        <PaginationControls
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            rowsPerPage={rowsPerPage}
                            setRowsPerPage={setRowsPerPage}
                            totalItems={filteredLeads.length}
                        />
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="flex flex-col items-center">
                                    <FiLoader className="animate-spin text-3xl text-blue-500 mb-2" />
                                    <p className="text-gray-600">Loading leads data...</p>
                                </div>
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
                                        loading={loading}
                                        handleEditClick={() => showEditModal(lead)}
                                        deleteLead={deleteLead}
                                        updateStatus={updateStatus}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <LeadEditModal
                        showModal={showModal}
                        setShowModal={setShowModal}
                        handleEditSubmit={handleFormSubmit}
                        formData={formData}
                        form={form}
                        loading={loading}
                        SOURCE_OPTIONS={SOURCE_OPTIONS}
                    />
                </div>
            </div>
        </div>
    );
};

export default LeadsTable;