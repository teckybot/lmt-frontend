// Analytics.js
import React, { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  FiTrendingUp,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiUser,
  FiCalendar,
  FiLoader,
  FiBarChart2,
  FiPieChart,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
} from "react-icons/fi";

import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addYears,
  subYears,
  addDays,
  subDays,
} from "date-fns";

import api from "../utils/axiosInstance";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  // View and date range
  const [view, setView] = useState("monthly"); // default to monthly
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Filter: show all or specific status
  const [filter, setFilter] = useState("total"); // "total", "new", "inProgress", "closed"

  // Custom date picker visibility
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const popRef = useRef();
  const filterRef = useRef();

  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  };

  // Set range based on view
  const setRangeForView = (anchorDate = new Date(), v = view) => {
    let s, e;
    if (v === "daily") {
      s = startOfDay(anchorDate);
      e = endOfDay(anchorDate);
    } else if (v === "weekly") {
      s = startOfWeek(anchorDate, { weekStartsOn: 0 });
      e = endOfWeek(anchorDate, { weekStartsOn: 0 });
    } else if (v === "monthly") {
      s = startOfMonth(anchorDate);
      e = endOfMonth(anchorDate);
    } else if (v === "yearly") {
      s = startOfYear(anchorDate);
      e = endOfYear(anchorDate);
    } else {
      s = startOfDay(anchorDate);
      e = endOfDay(anchorDate);
    }
    setStartDate(s);
    setEndDate(e);
  };

  // Initialize on mount
  useEffect(() => {
    setRangeForView(new Date(), view);
  }, []);

  // Update range when view changes
  useEffect(() => {
    const anchor = startDate || new Date();
    setRangeForView(anchor, view);
  }, [view]);

  // Fetch analytics when dates or filter changes
  useEffect(() => {
    if (!startDate || !endDate) return;
    fetchAnalytics();
  }, [startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token. Please log in.");
        setIsLoading(false);
        return;
      }

      const res = await api.get("/analytics", {
        params: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          view,
        },
      });

      setAnalyticsData(res.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      const message = err.response?.data?.error || err.message || "Failed to load analytics";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation
  const goPrev = () => {
    if (!startDate) return;
    if (view === "daily") setRangeForView(subDays(startDate, 1));
    else if (view === "weekly") setRangeForView(subWeeks(startDate, 1));
    else if (view === "monthly") setRangeForView(subMonths(startDate, 1));
    else if (view === "yearly") setRangeForView(subYears(startDate, 1));
  };

  const goNext = () => {
    if (!startDate) return;
    if (view === "daily") setRangeForView(addDays(startDate, 1));
    else if (view === "weekly") setRangeForView(addWeeks(startDate, 1));
    else if (view === "monthly") setRangeForView(addMonths(startDate, 1));
    else if (view === "yearly") setRangeForView(addYears(startDate, 1));
  };

  // Close popovers on outside click
  useEffect(() => {
    const handler = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) {
        setShowCustomPicker(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-3xl text-blue-500 mb-2" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 my-4 rounded">
        <div className="flex items-center">
          <FiAlertCircle className="text-red-500 mr-2" />
          <span className="text-red-700 font-medium">{error}</span>
        </div>
      </div>
    );
  }

  const {
    stats = {},
    priorityCounts = {},
    upcomingLeads = [],
    overdueLeads = [],
    recentLeads = [],
    recentlyClosedLeads = [],
  } = analyticsData || {};

  const conversionRate =
    stats.total && stats.closed ? ((stats.closed / stats.total) * 100).toFixed(1) : "0.0";

  const fmt = (d) => (d ? format(d, "dd MMM yyyy") : "N/A");
  const rangeText = `${fmt(startDate)} - ${fmt(endDate)}`;

  // Filtered stats for KPI cards
  const displayStats = {
    total: stats.total || 0,
    new: stats.new || 0,
    inProgress: stats.inProgress || 0,
    closed: stats.closed || 0,
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <header className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="mt-12">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Lead Analytics</h1>
          <p className="text-gray-600 text-sm">Track performance by day, week, month, or year</p>
        </div>

        {/* View & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Date Navigation */}
          <div className="flex items-center bg-gray-900 text-white rounded-md px-2 py-1 text-sm w-full sm:w-auto">
            <button onClick={goPrev} className="p-1 hover:bg-white/10 rounded" aria-label="Previous">
              <FiChevronLeft />
            </button>
            <button
              onClick={() => setShowCustomPicker((s) => !s)}
              className="px-2 py-1 flex-1 text-left truncate"
            >
              {rangeText}
            </button>
            <button onClick={goNext} className="p-1 hover:bg-white/10 rounded" aria-label="Next">
              <FiChevronRight />
            </button>
          </div>

          {/* View Selector */}
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="w-full sm:w-auto bg-white border rounded px-3 py-1 text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          {/* Filter Button */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded text-sm w-full sm:w-auto"
            >
              <FiFilter /> Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-1 bg-white border rounded shadow-lg z-10 w-40">
                {Object.entries(displayStats).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setFilter(key);
                      setShowFilterMenu(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      filter === key ? "bg-blue-50 font-medium text-blue-700" : ""
                    }`}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Custom Date Picker */}
      {showCustomPicker && (
        <div ref={popRef} className="absolute z-30 mt-2 left-4 right-4 sm:left-auto sm:right-6 bg-white border rounded shadow p-4 max-w-md mx-auto">
          <h3 className="font-semibold mb-3">Custom Range</h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs text-gray-500">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(startOfDay(date))}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd MMM yyyy"
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(endOfDay(date))}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd MMM yyyy"
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCustomPicker(false)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(displayStats).map(([key, value]) => (
          <div
            key={key}
            className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 ${
              filter === key ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-gray-500 capitalize">{key} Leads</p>
                <h3 className="text-2xl font-bold mt-1">{value}</h3>
              </div>
              <div className="p-2 rounded-lg bg-gray-50">
                {key === "total" && <FiBarChart2 className="text-blue-500" />}
                {key === "new" && <FiUser className="text-green-500" />}
                {key === "inProgress" && <FiLoader className="text-yellow-500" />}
                {key === "closed" && <FiCheckCircle className="text-purple-500" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Priority Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Priorities</h2>
        <div className="space-y-2">
          {[
            { name: "High", value: priorityCounts.high || 0, color: "#EF4444" },
            { name: "Medium", value: priorityCounts.medium || 0, color: "#F59E0B" },
            { name: "Low", value: priorityCounts.low || 0, color: "#10B981" },
          ].map((item) => (
            <div key={item.name} className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span>{item.name}</span>
              </div>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Conversion Rate</span>
            <span className="font-semibold text-blue-600">{conversionRate}%</span>
          </div>
        </div>
      </div>

      {/* Collapsible Lists */}
      <CollapsibleSection
        title="Upcoming Leads"
        icon={<FiClock className="text-blue-500" />}
        isExpanded={expandedSection === "upcoming"}
        onToggle={() => toggleSection("upcoming")}
      >
        <LeadList leads={upcomingLeads} emptyMessage="No upcoming leads" />
      </CollapsibleSection>

      <CollapsibleSection
        title="Overdue Leads"
        icon={<FiAlertCircle className="text-red-500" />}
        isExpanded={expandedSection === "overdue"}
        onToggle={() => toggleSection("overdue")}
      >
        <LeadList leads={overdueLeads} emptyMessage="No overdue leads" />
      </CollapsibleSection>

      <CollapsibleSection
        title="Recent Leads"
        icon={<FiTrendingUp className="text-green-500" />}
        isExpanded={expandedSection === "recent"}
        onToggle={() => toggleSection("recent")}
      >
        <LeadList leads={recentLeads} emptyMessage="No recent leads" />
      </CollapsibleSection>

      <CollapsibleSection
        title="Recently Closed"
        icon={<FiCheckCircle className="text-purple-500" />}
        isExpanded={expandedSection === "closed"}
        onToggle={() => toggleSection("closed")}
      >
        <LeadList leads={recentlyClosedLeads} emptyMessage="No closed leads" />
      </CollapsibleSection>
    </div>
  );
};

// --- Reusable Components (Mobile-Friendly) ---

const CollapsibleSection = ({ title, isExpanded, onToggle, icon, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 text-left"
    >
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-semibold text-gray-800 text-sm sm:text-base">{title}</h2>
      </div>
      {isExpanded ? (
        <FiChevronUp className="text-gray-400" />
      ) : (
        <FiChevronDown className="text-gray-400" />
      )}
    </button>
    {isExpanded && <div className="p-4 border-t border-gray-100">{children}</div>}
  </div>
);

const LeadList = ({ leads, emptyMessage }) => (
  !leads || leads.length === 0 ? (
    <div className="text-center py-4">
      <p className="text-gray-400 text-sm">{emptyMessage}</p>
    </div>
  ) : (
    <ul className="space-y-2">
      {leads.map((lead) => (
        <li key={lead.id} className="p-3 rounded-lg border border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <div>
              <p className="font-medium text-gray-800 text-sm">{lead.title || "Untitled"}</p>
              <p className="text-xs text-gray-600">{lead.customerName || "Unknown"}</p>
              {lead.closedByUser && (
                <p className="text-xs text-gray-500 mt-1">
                  Closed by: {lead.closedByUser.name} on {new Date(lead.closedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <PriorityBadge priority={lead.priority} />
              <StatusBadge status={lead.status} />
            </div>
          </div>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <FiCalendar className="mr-1" size={14} />
            <span>Due: {lead.dueDate ? new Date(lead.dueDate).toLocaleDateString() : "N/A"}</span>
          </div>
        </li>
      ))}
    </ul>
  )
);

const PriorityBadge = ({ priority }) => {
  const styles = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[priority?.toLowerCase()] || "bg-gray-100 text-gray-800"}`}>
      {priority || "N/A"}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    new: "bg-blue-100 text-blue-800",
    "in progress": "bg-yellow-100 text-yellow-800",
    closed: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[status?.toLowerCase()] || "bg-gray-100 text-gray-800"}`}>
      {status || "N/A"}
    </span>
  );
};

export default Analytics;