import React, { useState, useEffect } from "react";
import axios from "axios";

const AssignedLeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignedLeads = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setError("Authentication required");
          setLoading(false);
          return;
        }
        const response = await axios.get("http://localhost:5000/api/leads/assigned", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched leads:", response.data); // Debug log
        setLeads(response.data);
      } catch (err) {
        console.error("Error fetching assigned leads:", err);
        setError(err.response?.data?.message || "Failed to fetch assigned leads");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedLeads();
  }, []);

  if (loading) return <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>;
  if (error) return <p className="text-center text-red-500 dark:text-red-400">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Tasks</h1>
      {leads.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No assigned leads found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900">
                <th className="py-2 px-4 border-b text-gray-700 dark:text-gray-300">ID</th>
                <th className="py-2 px-4 border-b text-gray-700 dark:text-gray-300">Title</th>
                <th className="py-2 px-4 border-b text-gray-700 dark:text-gray-300">Customer</th>
                <th className="py-2 px-4 border-b text-gray-700 dark:text-gray-300">Status</th>
                <th className="py-2 px-4 border-b text-gray-700 dark:text-gray-300">Assigned To</th>
                <th className="py-2 px-4 border-b text-gray-700 dark:text-gray-300">Created At</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">{lead.id}</td>
                  <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">{lead.title}</td>
                  <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">{lead.customer_name}</td>
                  <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">{lead.status}</td>
                  <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">
                    {lead.assigned_to_names && lead.assigned_to_names.length > 0
                      ? lead.assigned_to_names.join(", ")
                      : "Unassigned"}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignedLeadsPage;