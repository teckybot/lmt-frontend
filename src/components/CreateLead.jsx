import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiChevronDown, FiCalendar, FiUser, FiMail, FiPhone, FiFileText } from "react-icons/fi";

const CreateLead = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    customer_name: "",
    phone: "",
    email: "",
    source: "",
    due_date: "",
    priority: "medium", // Default to medium
    notes: ""
  });

  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("https://lmt-backend.onrender.com/api/leads", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Lead created successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert("Error creating lead");
      console.error(err);
    }
  };

  // Field configuration with icons
  const fields = [
    { label: "Title", name: "title", icon: <FiFileText className="text-gray-400" /> },
    { label: "Customer Name", name: "customer_name", icon: <FiUser className="text-gray-400" /> },
    { label: "Phone", name: "phone", icon: <FiPhone className="text-gray-400" /> },
    { label: "Email", name: "email", type: "email", icon: <FiMail className="text-gray-400" /> },
    { label: "Source", name: "source", icon: <FiFileText className="text-gray-400" /> },
    { label: "Due Date", name: "due_date", type: "date", icon: <FiCalendar className="text-gray-400" /> },
    { label: "Notes", name: "notes", icon: <FiFileText className="text-gray-400" /> }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Lead</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(({ label, name, type = "text", icon }) => (
            <div key={name} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <div className="relative">
                {icon && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {icon}
                  </div>
                )}
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required={name !== "notes"}
                  className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
          ))}

          {/* Priority Dropdown */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <div className="relative">
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="block appearance-none w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLead;