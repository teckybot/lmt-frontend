import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import api from "../utils/axiosInstance";

const useLeadsData = () => {
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
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
      await api.patch(`/leads/${leadId}/status`, { status: newStatus });
      setLeads((prevLeads) =>
        prevLeads.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
      );
      toast.success("Status updated successfully!");
    } catch (err) {
      console.error("Error updating status", err);
      toast.error("Failed to update status.");
    }
  };

  const deleteLead = async (leadId) => {
    try {
      setLoading(true);
      await api.delete(`/leads/${leadId}`);
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
      toast.success("Lead deleted successfully!");
    } catch (err) {
      console.error("Error deleting lead", err);
      toast.error("Failed to delete lead.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (lead) => {
    if (!lead) {
      setEditingLead(null);
      return;
    }
    setEditingLead(lead);
    if (isMobile) {
      setFormData({
        title: lead.title || "",
        customerName: lead.customerName || "",
        phone: lead.phone || "",
        email: lead.email || "",
        source: lead.source || "",
        dueDate: lead.dueDate ? dayjs(lead.dueDate).format("YYYY-MM-DD") : "",
        priority: lead.priority || "",
        status: lead.status || "",
        notes: lead.notes || "",
      });
    } 
  };

  const handleEditSubmit = async (values) => {
    try {
      setLoading(true);
      const updatedLead = {
        ...values,
        dueDate: values.dueDate ? dayjs(values.dueDate).format("YYYY-MM-DD") : null,
      };

      await api.put(`/leads/${editingLead}`, updatedLead);

      setLeads((prevLeads) =>
        prevLeads.map((lead) => (lead.id === editingLead ? { ...lead, ...updatedLead } : lead))
      );
      
      setEditingLead(null);
      setShowModal(false);
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

  return {
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
    fetchLeads,
    updateStatus,
    deleteLead,
    handleEditClick,
    handleEditSubmit,
    handleChange,
  };
};

export default useLeadsData;