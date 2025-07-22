import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchLeads = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(res.data);
    } catch (err) {
      console.error("Error fetching leads", err);
      navigate("/");
    }
  };

  const updateStatus = async (leadId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/leads/${leadId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update status locally after success
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (err) {
      console.error("Error updating status", err);
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <table className="min-w-full table-auto border-collapse border">
        <thead className="bg-gray-100">
          <tr>
            {[
              "Title",
              "Customer Name",
              "Phone",
              "Email",
              "Source",
              "Due Date",
              "Priority",
              "Status",
              "Notes",
            ].map((col) => (
              <th key={col} className="border px-4 py-2 text-left">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b">
              <td className="px-4 py-2">{lead.title}</td>
              <td className="px-4 py-2">{lead.customer_name}</td>
              <td className="px-4 py-2">{lead.phone}</td>
              <td className="px-4 py-2">{lead.email}</td>
              <td className="px-4 py-2">{lead.source}</td>
              <td className="px-4 py-2">{lead.due_date}</td>
              <td className="px-4 py-2">{lead.priority}</td>
              <td className="px-4 py-2">
                <select
                  value={lead.status || "New"}
                  onChange={(e) => updateStatus(lead.id, e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </td>
              <td className="px-4 py-2">{lead.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
