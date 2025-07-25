import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiChevronDown } from "react-icons/fi";

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
    notes: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get("https://lmt-backend.onrender.com/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(res.data);
    } catch (err) {
      console.error("Error fetching leads", err);
    }
  };

  const updateStatus = async (leadId, newStatus) => {
    try {
      await axios.put(
        `https://lmt-backend.onrender.com/api/leads/${leadId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchLeads();
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const deleteLead = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await axios.delete(`https://lmt-backend.onrender.com/api/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeads();
    } catch (err) {
      console.error("Error deleting lead", err);
    }
  };

  const handleEditClick = (lead) => {
    setEditingLead(lead.id);
    setFormData({ ...lead });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `https://lmt-backend.onrender.com/api/leads/${editingLead}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditingLead(null);
      fetchLeads();
    } catch (err) {
      console.error("Error updating lead", err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">All Leads</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Priority</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Due Date</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t">
                {editingLead === lead.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">{lead.status}</td>
                    <td className="px-4 py-2">
                      <input
                        name="due_date"
                        type="date"
                        value={formData.due_date?.split("T")[0]}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={handleEditSubmit}
                        className="text-green-600 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingLead(null)}
                        className="text-gray-600"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2">{lead.title}</td>
                    <td className="px-4 py-2">{lead.customer_name}</td>
                    <td className="px-4 py-2">{lead.email}</td>
                    <td className="px-4 py-2">{lead.phone}</td>
                    <td className="px-4 py-2">{lead.priority}</td>
                    <td className="px-4 py-2">
                      <div className="relative">
                        <select
                          value={lead.status || "New"}
                          onChange={(e) =>
                            updateStatus(lead.id, e.target.value)
                          }
                          className={`block w-full pl-3 pr-8 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 appearance-none
                          ${lead.status === "New"
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
                        <FiChevronDown className="absolute right-2 top-2.5 text-gray-400 text-xs" />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(lead.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(lead)}
                        className="text-blue-600"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="text-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsTable;
