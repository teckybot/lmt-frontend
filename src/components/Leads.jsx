import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiChevronDown, FiSearch, FiDownload } from "react-icons/fi";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { toast } from "react-toastify";

const LeadsTable = () => {
  const [leads, setLeads] = useState([]);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    customer_name: "",
    phone: "",
    email: "",
    source: "",
    due_date: "",
    priority: "",
    status: "",
    notes: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://lmt-backend.onrender.com/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      setLoading(true);
      await axios.put(
        `https://lmt-backend.onrender.com/api/leads/${leadId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeads();
      toast.success("Status updated successfully!");
    } catch (err) {
      console.error("Error updating status", err);
      toast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      setLoading(true);
      await axios.delete(`https://lmt-backend.onrender.com/api/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeads();
      toast.success("Lead deleted successfully!");
    } catch (err) {
      console.error("Error deleting lead", err);
      toast.error("Failed to delete lead.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (lead) => {
    setEditingLead(lead.id);
    setFormData({
      ...lead,
      due_date: lead.due_date ? new Date(lead.due_date).toISOString().split("T")[0] : "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(
        `https://lmt-backend.onrender.com/api/leads/${editingLead}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingLead(null);
      fetchLeads();
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

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        (lead.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.phone || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority = priorityFilter === "All" || lead.priority === priorityFilter;
      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [leads, searchTerm, priorityFilter, statusFilter]);

  const uniquePriorities = [...new Set(leads.map((lead) => lead.priority).filter((p) => p))];
  const uniqueStatuses = [...new Set(leads.map((lead) => lead.status).filter((s) => s))];

  const downloadPDF = () => {
    try {
      if (filteredLeads.length === 0) {
        toast.info("No leads to download in the current filter selection.");
        return;
      }

      const doc = new jsPDF({
        orientation: "landscape"
      });

      // Add title and date
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "bold");
      doc.text("Leads Report", 14, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

      // Prepare table data
      const tableColumn = ["Title", "Customer", "Email", "Phone", "Priority", "Status", "Due Date"];
      const tableRows = filteredLeads.map((lead) => {
        const dueDate = lead.due_date
          ? new Date(lead.due_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
          : "N/A";
        return [
          lead.title || "N/A",
          lead.customer_name || "N/A",
          lead.email || "N/A",
          lead.phone || "N/A",
          lead.priority || "N/A",
          lead.status || "N/A",
          dueDate,
        ];
      });

      // Add table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: "grid",
        headStyles: {
          fillColor: [51, 102, 153],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 10
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: "linebreak"
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 25 },
          2: { cellWidth: 35 },
          3: { cellWidth: 25 },
          4: { cellWidth: 15 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 }
        },
        didDrawPage: function (data) {
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(
            `Page ${data.pageNumber}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10
          );
        }
      });

      // Save the PDF
      const fileName = `leads-report-${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Leads Management</h2>
              <p className="text-sm text-gray-600">Track and manage all your leads in one place</p>
            </div>

            {/* Search and Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
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

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="All">All Priorities</option>
                {uniquePriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="All">All Statuses</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button
                onClick={downloadPDF}
                disabled={filteredLeads.length === 0 || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  filteredLeads.length === 0 || loading
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                }`}
              >
                <FiDownload className="text-sm" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Leads Count */}
          <div className="mb-4 text-sm text-gray-600 flex items-center justify-between">
            {loading ? (
              <span>Loading...</span>
            ) : (
              <>
                <span>
                  Showing <span className="font-medium">{filteredLeads.length}</span> of{" "}
                  <span className="font-medium">{leads.length}</span> leads
                </span>
                {(searchTerm || priorityFilter !== "All" || statusFilter !== "All") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setPriorityFilter("All");
                      setStatusFilter("All");
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      Loading leads...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No leads found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      {editingLead === lead.id ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              name="title"
                              value={formData.title || ""}
                              onChange={handleChange}
                              className="border px-3 py-1 rounded-md w-full text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              name="customer_name"
                              value={formData.customer_name || ""}
                              onChange={handleChange}
                              className="border px-3 py-1 rounded-md w-full text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              name="email"
                              value={formData.email || ""}
                              onChange={handleChange}
                              className="border px-3 py-1 rounded-md w-full text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              name="phone"
                              value={formData.phone || ""}
                              onChange={handleChange}
                              className="border px-3 py-1 rounded-md w-full text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              name="priority"
                              value={formData.priority || ""}
                              onChange={handleChange}
                              className="border px-3 py-1 rounded-md w-full text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              name="status"
                              value={formData.status || ""}
                              onChange={handleChange}
                              className="border px-3 py-1 rounded-md w-full text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="New">New</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              name="due_date"
                              type="date"
                              value={formData.due_date || ""}
                              onChange={handleChange}
                              className="border px-3 py-1 rounded-md w-full text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={handleEditSubmit}
                              disabled={loading}
                              className="text-green-600 mr-2 hover:text-green-800 disabled:opacity-50 text-sm font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingLead(null)}
                              disabled={loading}
                              className="text-gray-600 hover:text-gray-800 disabled:opacity-50 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.title || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.customer_name || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.email || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                lead.priority === "High"
                                  ? "bg-red-100 text-red-800"
                                  : lead.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {lead.priority || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative">
                              <select
                                value={lead.status || "New"}
                                onChange={(e) => updateStatus(lead.id, e.target.value)}
                                disabled={loading}
                                className={`block w-full pl-3 pr-8 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 appearance-none ${
                                  lead.status === "New"
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lead.due_date
                              ? new Date(lead.due_date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "2-digit",
                                })
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleEditClick(lead)}
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                title="Edit"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteLead(lead.id)}
                                disabled={loading}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                title="Delete"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsTable;