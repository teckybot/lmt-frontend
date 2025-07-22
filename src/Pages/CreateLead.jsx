import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateLead = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    customer_name: "",
    phone: "",
    email: "",
    source: "",
    due_date: "",
    priority: "",
    notes: ""
  });

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
      await axios.post("http://localhost:5000/api/leads", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Lead created successfully!");
      navigate("/dashboard"); // redirect to dashboard after creation
    } catch (err) {
      alert("Error creating lead");
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Lead</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: "Title", name: "title" },
          { label: "Customer Name", name: "customer_name" },
          { label: "Phone", name: "phone" },
          { label: "Email", name: "email" },
          { label: "Source", name: "source" },
          { label: "Due Date", name: "due_date", type: "date" },
          { label: "Priority", name: "priority" },
          { label: "Notes", name: "notes" }
        ].map(({ label, name, type = "text" }) => (
          <div key={name}>
            <label className="block text-sm font-medium">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        ))}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Lead
        </button>
      </form>
    </div>
  );
};

export default CreateLead;
