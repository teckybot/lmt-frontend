import React, { useEffect, useState, useMemo } from "react";
import { FiEdit, FiTrash2, FiChevronDown, FiSearch, FiChevronLeft, FiChevronRight, FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";
import { Modal, Form, Input, Select, DatePicker, Button, Popconfirm, Pagination } from "antd";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FiLoader } from "react-icons/fi";
import api from "../utils/axiosInstance";


const LeadsTable = () => {
  const [leads, setLeads] = useState([]);
  const [role, setRole] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    customerName: "",
    phone: "",
    email: "",
    source: "",
    dueDate: "",
    priority: "",
    status: "",
    notes: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [rowsPerPage, setRowsPerPage] = useState(10); // default rows per page


  const token = localStorage.getItem("token");

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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  const updateStatus = async (leadId, newStatus) => {
    try {
      if (role === 'employee') return; // employees cannot update
      setLoading(true);
      await api.patch(`/leads/${leadId}/status`, { status: newStatus });
      setLeads((prevLeads) =>
        prevLeads.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
      );
      toast.success("Status updated successfully!");
    } catch (err) {
      console.error("Error updating status", err);
      toast.error("Failed to update status.");
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


  // const handleEditClick = (lead) => {
  //   setEditingLead(lead.id);

  //   form.setFieldsValue({
  //     title: lead.title || "",
  //     customerName: lead.customerName || "",
  //     phone: lead.phone || "",
  //     email: lead.email || "",
  //     source: lead.source || "",
  //     dueDate: lead.dueDate ? dayjs(lead.dueDate) : null,
  //     priority: lead.priority || "",
  //     status: lead.status || "",
  //     notes: lead.notes || "",
  //   });
  //   setShowModal(true);
  // };

  const handleEditClick = (lead) => {
    setEditingLead(lead.id);

    if (isMobile) {
      // 👉 Mobile: use inline form (prefill formData)
      setFormData({
        title: lead.title || "",
        customerName: lead.customerName || "",
        phone: lead.phone || "",
        email: lead.email || "",
        source: lead.source || "",
        dueDate: lead.dueDate ? new Date(lead.dueDate).toISOString().split("T")[0] : "",
        priority: lead.priority || "",
        status: lead.status || "",
        notes: lead.notes || "",
      });
    } else {
      // 👉 Desktop: use antd modal form
      form.setFieldsValue({
        title: lead.title || "",
        customerName: lead.customerName || "",
        phone: lead.phone || "",
        email: lead.email || "",
        source: lead.source || "",
        dueDate: lead.dueDate ? dayjs(lead.dueDate) : null,
        priority: lead.priority || "",
        status: lead.status || "",
        notes: lead.notes || "",
      });
      setShowModal(true);
    }
  };

  // const handleEditSubmit = async (values) => {
  //   try {
  //     setLoading(true);

  //     await api.put(`/leads/${editingLead}`, {
  //       ...values,
  //       dueDate: values.dueDate ? values.dueDate.format("YYYY-MM-DD") : null,
  //     });

  //     setShowModal(false);
  //     setEditingLead(null);
  //     await fetchLeads();
  //     toast.success("Lead updated successfully!");
  //   } catch (err) {
  //     console.error("Error updating lead", err);
  //     toast.error("Failed to update lead.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleEditSubmit = async (eOrValues) => {
    try {
      setLoading(true);
      let values;
      if (isMobile) {
        eOrValues.preventDefault();
        values = formData;
      } else {
        values = eOrValues;
      }

      const updatedLead = {
        ...values,
        dueDate: values.dueDate
          ? (isMobile ? values.dueDate : values.dueDate.format("YYYY-MM-DD"))
          : null,
      };

      await api.put(`/leads/${editingLead}`, updatedLead);

      // Update the local state instead of re-fetching
      setLeads((prevLeads) =>
        prevLeads.map((lead) => (lead.id === editingLead ? { ...lead, ...updatedLead } : lead))
      );

      // Reset UI
      if (isMobile) {
        setEditingLead(null);
      } else {
        setShowModal(false);
        setEditingLead(null);
      }

      toast.success("Lead updated successfully!");
    } catch (err) {
      console.error("Error updating lead", err);
      toast.error("Failed to update lead.");
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Download excel
  const exportToExcel = () => {

    // check if filters are applied
    const isFiltered =
      searchTerm ||
      priorityFilter !== "All" ||
      statusFilter !== "All" ||
      sourceFilter !== "All";

    // decide which data to export
    const dataToExport = (isFiltered ? filteredLeads : leads).map((lead) => ({
      Title: lead.title || "N/A",
      Customer: lead.customerName || "N/A",
      Email: lead.email || "N/A",
      Phone: lead.phone || "N/A",
      Service: lead.source || "N/A",
      Priority: lead.priority || "N/A",
      Status: lead.status || "N/A",
      "Due Date": lead.dueDate
        ? new Date(lead.dueDate).toLocaleDateString("en-US")
        : "N/A",
      Notes: lead.notes || "",

    }));

    if (!dataToExport.length) {
      alert("No data to export");
      return;
    }

    // create Excel file
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

    // make filename dynamic
    const filename = isFiltered ? "Filtered_Leads.xlsx" : "All_Leads.xlsx";
    XLSX.writeFile(workbook, filename);
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

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLeads, currentPage, rowsPerPage]);

  const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
  const STATUS_OPTIONS = ["New", "In Progress", "Closed"];
  const SOURCE_OPTIONS = [
    "Year Long Programme",
    "STEM Labs",
    "Training",
    "LMS",
    "Workshop",
    "Projects",
    "Website Development",
    "Internships",
    "Bootcamps",
    "Product Selling",
    "Other"
  ];

  const uniquePriorities = PRIORITY_OPTIONS;
  const uniqueStatuses = STATUS_OPTIONS;
  const uniqueSources = SOURCE_OPTIONS;

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

  const PaginationControls = () => (
    <div className="flex flex-wrap items-center justify-between mb-4 mt-4 gap-3">
      {/* Rows per page (Antd Select) */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span className="md:ml-8">Rows per page:</span>
        <Select
          value={rowsPerPage}
          onChange={(value) => {
            setRowsPerPage(value);
            setCurrentPage(1);
          }}
          options={[5, 10, 20, 50].map((size) => ({ value: size, label: size }))}
          style={{ width: 80 }}
        />
      </div>

      {/* Ant Design Pagination */}
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


  );

  return (
    <div className="p-4 bg-white mt-16 md:mt-0">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-4 md:p-6">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Leads Management</h2>
            <p className="text-xs md:text-sm text-gray-600">Track and manage all your leads</p>
          </div>

          <div className="mb-4">
            <div className="flex flex-col md:flex-row items-center justify-between w-full mb-2 gap-3">
              {/* Search Input */}
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Download Excel Button */}
              <Button
                type="primary"
                icon={<FiDownload className="mr-1" />}
                onClick={exportToExcel}
                className="bg-gradient-to-r from-gray-800 to-gray-900 
                border-0 
                hover:from-gray-900 hover:to-gray-800 
                focus:from-gray-900 focus:to-gray-800 
                active:from-gray-950 active:to-gray-900 
                shadow-md hover:shadow-lg 
                transition-all duration-200 
                flex items-center justify-center 
                rounded-lg 
                px-4 py-2 
                h-auto
                font-medium
                text-white
              "
            size="middle"
              >
                Download Excel
              </Button>
            </div>


            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-600 text-sm font-medium flex items-center"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              <FiChevronDown className={`ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="All">All Priorities</option>
                  {uniquePriorities.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>


                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                >
                  <option value="All">All Sources</option>
                  {uniqueSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>

                {(searchTerm || priorityFilter !== "All" || statusFilter !== "All" || sourceFilter !== "All") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setPriorityFilter("All");
                      setStatusFilter("All");
                      setSourceFilter("All");
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium border border-blue-200 rounded-lg px-3 py-2"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>

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

          {/* Mobile Pagination */}
          <div className="md:hidden">
            <PaginationControls />
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <tr>
                <td colSpan={role !== 'employee' ? 9 : 8} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center">
                      <FiLoader className="animate-spin text-3xl text-blue-500 mb-2" />
                      <p className="text-gray-600">Loading analytics data...</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : paginatedLeads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No leads found matching the current filters.</div>
            ) : (
              paginatedLeads.map((lead) => (
                <div key={lead.id} className="border border-gray-200 rounded-lg p-4">
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

                  {editingLead === lead.id && (
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
                          {uniqueSources.map((source) => (
                            <option key={source} value={source}>
                              {source}
                            </option>
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
                          onClick={() => setEditingLead(null)}
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
                  )}

                  {editingLead !== lead.id && (
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority).bg
                            } ${getPriorityColor(lead.priority).text}`}
                        >
                          {lead.priority || "N/A"}
                        </span>

                        {role === 'employee' ? (
                          <span className="text-xs text-gray-600">{lead.status || 'New'}</span>
                        ) : (
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
                            <FiChevronDown className="absolute right-2 top-2 text-gray-400 text-xs pointer-events-none" />
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        <span className="font-medium">Due:</span> {lead.dueDate
                          ? new Date(lead.dueDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })
                          : "N/A"}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
            {/* Desktop Pagination */}
            <PaginationControls />

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Title</th>
                  <th className="px-12 pl-8 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Customer</th>
                  <th className="px-20 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-56">Email</th>
                  <th className="px-12 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Phone</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Service</th>
                  <th className="px-12 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Priority</th>
                  <th className="px-12 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Due Date</th>
                  {role !== 'employee' && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                  )}
                </tr>
              </thead>


              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={role !== 'employee' ? 9 : 8} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center">
                          <FiLoader className="animate-spin text-3xl text-blue-500 mb-2" />
                          <p className="text-gray-600">Loading analytics data...</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={role !== 'employee' ? 9 : 8} className="px-6 py-8 text-center text-gray-500">
                      No leads found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      {/* Title */}
                      <td
                        className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center truncate max-w-xs"
                        title={lead.title || "N/A"}
                      >
                        {lead.title || "N/A"}
                      </td>

                      {/* Customer */}
                      <td
                        className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center truncate max-w-xs"
                        title={lead.customerName || "N/A"}
                      >
                        {lead.customerName || "N/A"}
                      </td>

                      {/* Email */}
                      <td
                        className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center truncate max-w-xs"
                        title={lead.email || "N/A"}
                      >
                        {lead.email || "N/A"}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {lead.phone || "N/A"}
                      </td>

                      {/* Source */}
                      <td
                        className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center truncate max-w-xs"
                        title={lead.source || "N/A"}
                      >
                        {lead.source || "N/A"}
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority).bg} ${getPriorityColor(lead.priority).text}`}
                        >
                          {lead.priority || "N/A"}
                        </span>
                      </td>

                      {/* Status dropdown */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        {role === 'employee' ? (
                          <span className="text-sm text-gray-700">{lead.status || 'New'}</span>
                        ) : (
                          <div className="relative">
                            <select
                              value={lead.status || "New"}
                              onChange={(e) => updateStatus(lead.id, e.target.value)}
                              disabled={loading}
                              className={`block w-full pl-3 pr-8 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 appearance-none ${lead.status === "New"
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
                            <FiChevronDown className="absolute right-2 top-2.5 text-gray-400 text-xs pointer-events-none" />
                          </div>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {lead.dueDate
                          ? new Date(lead.dueDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })
                          : "N/A"}
                      </td>

                      {/* Actions */}
                      {role !== 'employee' && (
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex items-center gap-3">
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
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>

            </table>
            <Modal
              title={
                <div className="flex items-center gap-2">
                  <FiEdit className="text-blue-500" />
                  <span className="font-semibold text-gray-800">Edit Lead</span>
                </div>
              }
              open={showModal}
              onCancel={() => setShowModal(false)}
              footer={null}
              width={650}
              destroyOnHidden
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleEditSubmit}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                    <Input placeholder="Enter lead title" />
                  </Form.Item>

                  <Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}>
                    <Input placeholder="Enter customer name" />
                  </Form.Item>

                  <Form.Item name="email" label="Email" rules={[{ type: "email", required: "true" }]}>
                    <Input placeholder="Enter email" prefix={<FiEdit className="text-gray-400" />} />
                  </Form.Item>

                  <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                    <Input placeholder="Enter phone number" prefix={<FiEdit className="text-gray-400" />} />
                  </Form.Item>

                  <Form.Item name="source" label="Service" rules={[{ required: true }]}>
                    <Select placeholder="Select service">
                      {uniqueSources.map((src) => (
                        <Select.Option key={src} value={src}>
                          {src}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                    <Select placeholder="Select priority">
                      <Select.Option value="High">High</Select.Option>
                      <Select.Option value="Medium">Medium</Select.Option>
                      <Select.Option value="Low">Low</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                    <Select placeholder="Select status">
                      <Select.Option value="New">New</Select.Option>
                      <Select.Option value="In Progress">In Progress</Select.Option>
                      <Select.Option value="Closed">Closed</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
                    <DatePicker className="w-full" />
                  </Form.Item>
                </div>

                <Form.Item name="notes" label="Notes">
                  <Input.TextArea rows={3} placeholder="Additional notes..." />
                </Form.Item>

                <div className="flex justify-end gap-3 mt-4">
                  <div className="flex justify-end gap-3 mt-4">
                    <Button onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Form>
            </Modal>

          </div>

        </div>
      </div>
    </div>
  );
};

export default LeadsTable;