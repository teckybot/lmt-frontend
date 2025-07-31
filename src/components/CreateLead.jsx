import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiChevronDown, FiCalendar, FiUser, FiMail, FiPhone, FiFileText, FiX } from "react-icons/fi";

const CreateLead = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    customer_name: "",
    phone: "",
    email: "",
    services: [], // Changed from source to services (array)
    otherServices: [], // Changed from otherSource to otherServices (array)
    due_date: "",
    priority: "medium",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showOtherServiceInput, setShowOtherServiceInput] = useState(false);
  const [otherServiceInput, setOtherServiceInput] = useState("");

  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
  ];

  const serviceOptions = [
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
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const toggleServiceDropdown = () => {
    setShowServiceDropdown(!showServiceDropdown);
  };

  const handleServiceSelection = (service) => {
    if (service === "Other") {
      setShowOtherServiceInput(true);
      return;
    }

    if (formData.services.includes(service)) {
      // Remove service if already selected
      setFormData({
        ...formData,
        services: formData.services.filter(s => s !== service)
      });
    } else {
      // Add service if not selected
      setFormData({
        ...formData,
        services: [...formData.services, service]
      });
    }
  };

  const handleAddOtherService = () => {
    if (otherServiceInput.trim() && !formData.otherServices.includes(otherServiceInput.trim())) {
      setFormData({
        ...formData,
        otherServices: [...formData.otherServices, otherServiceInput.trim()]
      });
      setOtherServiceInput("");
    }
  };

  const removeService = (service) => {
    setFormData({
      ...formData,
      services: formData.services.filter(s => s !== service)
    });
  };

  const removeOtherService = (service) => {
    setFormData({
      ...formData,
      otherServices: formData.otherServices.filter(s => s !== service)
    });
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
    if (formData.services.length === 0 && formData.otherServices.length === 0) {
      newErrors.services = "At least one service is required";
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
      // Combine both services and otherServices into a single string
      const allServices = [...formData.services, ...formData.otherServices].join(", ");
      
      const payload = { 
        ...formData,
        source: allServices // Use "source" field instead of "services" to match backend expectation
      };
      
      // Remove the services and otherServices fields
      delete payload.services;
      delete payload.otherServices;
      
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
    <div className="max-w-2xl mx-auto p-4 sm:p-6 mt-16 md:mt-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-4xl text-center font-bold text-gray-800 mb-6">Create New Lead</h2>
        
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
                    min={new Date().toISOString().split("T")[0]}
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

          {/* Services Multi-Select Dropdown */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Services <span className="text-red-500">*</span>
            </label>
            
            {/* Selected Services Display */}
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.services.map((service, index) => (
                <div key={`service-${index}`} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {service}
                  <button 
                    type="button" 
                    onClick={() => removeService(service)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
              {formData.otherServices.map((service, index) => (
                <div key={`other-service-${index}`} className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {service}
                  <button 
                    type="button" 
                    onClick={() => removeOtherService(service)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={toggleServiceDropdown}
                className={`w-full text-left pl-3 pr-8 py-2 border ${
                  errors.services ? 'border-red-300' : 'border-gray-200'
                } rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-between`}
              >
                <span>Select Services</span>
                <FiChevronDown className={`transition-transform ${showServiceDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showServiceDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {serviceOptions.map((service, index) => (
                    <div
                      key={index}
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                        formData.services.includes(service) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleServiceSelection(service)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service)}
                          readOnly
                          className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span>{service}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.services && (
              <p className="mt-1 text-sm text-red-600">{errors.services}</p>
            )}
          </div>

          {/* Other Services Input (shown only when "Other" is selected) */}
          {showOtherServiceInput && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Add Custom Services
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otherServiceInput}
                  onChange={(e) => setOtherServiceInput(e.target.value)}
                  placeholder="Enter custom service"
                  className="block w-full pl-3 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddOtherService}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Add
                </button>
              </div>
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