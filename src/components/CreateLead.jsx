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
    otherSource: "",
    due_date: "",
    priority: "medium",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
  ];

  const sourceOptions = [
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.customer_name) newErrors.customer_name = "Customer name is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.source) newErrors.source = "Service is required";
    if (formData.source === "Other" && !formData.otherSource) {
      newErrors.otherSource = "Please specify the service";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const payload = { ...formData };
      
      // If "Other" is selected, use the otherSource value
      if (payload.source === "Other") {
        payload.source = payload.otherSource;
        delete payload.otherSource;
      }
      
      await axios.post("https://lmt-backend.onrender.com/api/leads", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Lead created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Field configuration with icons
  const fields = [
    { label: "Title", name: "title", icon: <FiFileText className="text-gray-400" /> },
    { label: "Customer Name", name: "customer_name", icon: <FiUser className="text-gray-400" /> },
    { label: "Phone", name: "phone", icon: <FiPhone className="text-gray-400" /> },
    { label: "Email", name: "email", type: "email", icon: <FiMail className="text-gray-400" /> },
    { label: "Due Date", name: "due_date", type: "date", icon: <FiCalendar className="text-gray-400" /> },
    { label: "Notes", name: "notes", icon: <FiFileText className="text-gray-400" /> }
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6  mt-16 md:mt-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-4xl  text-center font-bold text-gray-800 mb-6">Create New Lead</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ label, name, type = "text", icon }) => (
            <div key={name} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {label}
                {name !== "notes" && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                {icon && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {icon}
                  </div>
                )}
                {type === "date" ? (
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]} // Set min date to today
                    className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${
                      errors[name] ? 'border-red-300' : 'border-gray-200'
                    } rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                ) : (
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${
                      errors[name] ? 'border-red-300' : 'border-gray-200'
                    } rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                )}
              </div>
              {errors[name] && (
                <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
              )}
            </div>
          ))}

          {/* Service Dropdown */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Service <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className={`block appearance-none w-full pl-3 pr-8 py-2 border ${
                  errors.source ? 'border-red-300' : 'border-gray-200'
                } rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">Select a Service</option>
                {sourceOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-3 text-gray-400" />
            </div>
            {errors.source && (
              <p className="mt-1 text-sm text-red-600">{errors.source}</p>
            )}
          </div>

          {/* Other Service Input (shown only when "Other" is selected) */}
          {formData.source === "Other" && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Specify Service <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="otherSource"
                  value={formData.otherSource}
                  onChange={handleChange}
                  placeholder="Enter the service name"
                  className={`block w-full pl-3 pr-3 py-2 border ${
                    errors.otherSource ? 'border-red-300' : 'border-gray-200'
                  } rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              {errors.otherSource && (
                <p className="mt-1 text-sm text-red-600">{errors.otherSource}</p>
              )}
            </div>
          )}

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
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLead;