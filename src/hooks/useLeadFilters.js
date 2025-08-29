import { useState, useMemo } from "react";

const useLeadFilters = (leads) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

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

  return {
    searchTerm,
    setSearchTerm,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    filteredLeads,
  };
};

export default useLeadFilters;