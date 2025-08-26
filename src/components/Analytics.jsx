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
} from "react-icons/fi";

import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addDays,
  subDays,
} from "date-fns";

import api from "../utils/axiosInstance"; // your axios instance

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  const [view, setView] = useState("weekly");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const popRef = useRef();

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

  // Fetch analytics when dates change
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

  const goPrev = () => {
    if (!startDate) return;
    if (view === "daily") setRangeForView(subDays(startDate, 1), view);
    else if (view === "weekly") setRangeForView(subWeeks(startDate, 1), view);
    else if (view === "monthly") setRangeForView(subMonths(startDate, 1), view);
  };

  const goNext = () => {
    if (!startDate) return;
    if (view === "daily") setRangeForView(addDays(startDate, 1), view);
    else if (view === "weekly") setRangeForView(addWeeks(startDate, 1), view);
    else if (view === "monthly") setRangeForView(addMonths(startDate, 1), view);
  };

  // Close custom picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) {
        setShowCustomPicker(false);
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
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
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

  return (
    <div className="p-4 space-y-4 bg-gray-50 mt-16 md:mt-0">
      {/* Header */}
      <header className="mb-4 flex items-start md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lead Analytics Dashboard</h1>
          <p className="text-gray-600">Overview of your leads and conversions</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-900 text-white rounded-md px-2 py-1">
            <button onClick={goPrev} className="p-1 hover:bg-white/10 rounded" title="Previous">
              <FiChevronLeft />
            </button>

            <button
              onClick={() => setShowCustomPicker((s) => !s)}
              className="px-3 py-1 text-sm font-medium text-left"
            >
              {rangeText}
            </button>

            <button onClick={goNext} className="p-1 hover:bg-white/10 rounded" title="Next">
              <FiChevronRight />
            </button>
          </div>

          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="bg-white border rounded px-3 py-1 text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </header>

      {/* Custom Date Picker Popover */}
      {showCustomPicker && (
        <div ref={popRef} className="absolute z-30 mt-2 right-6 bg-white border rounded shadow p-4 w-[320px]">
          <div className="flex flex-col space-y-3">
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
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCustomPicker(false)}
                className="px-3 py-1 text-sm border rounded"
              >
                Cancel
              </button>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <KPICard
          title="Total Leads"
          value={stats.total || 0}
          icon={<FiBarChart2 className="text-blue-500 text-2xl" />}
          trend="total"
          large
        />
        <KPICard
          title="New Leads"
          value={stats.new || 0}
          icon={<FiUser className="text-green-500 text-2xl" />}
          trend="new"
          large
        />
        <KPICard
          title="In Progress"
          value={stats.inProgress || 0}
          icon={<FiLoader className="text-yellow-500 text-2xl" />}
          trend="inProgress"
          large
        />
        <KPICard
          title="Closed Leads"
          value={stats.closed || 0}
          icon={<FiCheckCircle className="text-purple-500 text-2xl" />}
          trend="closed"
          large
        />
      </div>

      {/* Priority Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Lead Priorities</h2>
          <FiPieChart className="text-gray-400 text-xl" />
        </div>
        <div className="space-y-3">
          {[
            { name: "High", value: priorityCounts.high || 0, color: "#EF4444" },
            { name: "Medium", value: priorityCounts.medium || 0, color: "#F59E0B" },
            { name: "Low", value: priorityCounts.low || 0, color: "#10B981" },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }} />
                <span className="text-gray-800">{item.name}</span>
              </div>
              <span className="font-medium text-lg">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Conversion Rate</span>
            <span className="font-semibold text-blue-600 text-lg">{conversionRate}%</span>
          </div>
        </div>
      </div>

      {/* Lists */}
      <CollapsibleSection
        title="Upcoming Due Leads"
        isExpanded={expandedSection === "upcoming"}
        onToggle={() => toggleSection("upcoming")}
        icon={<FiClock className="text-blue-500 text-xl" />}
      >
        <LeadList leads={upcomingLeads} emptyMessage="No upcoming leads" />
      </CollapsibleSection>

      <CollapsibleSection
        title="Overdue Leads"
        isExpanded={expandedSection === "overdue"}
        onToggle={() => toggleSection("overdue")}
        icon={<FiAlertCircle className="text-red-500 text-xl" />}
      >
        <LeadList leads={overdueLeads} emptyMessage="No overdue leads" />
      </CollapsibleSection>

      <CollapsibleSection
        title="Recent Leads (in range)"
        isExpanded={expandedSection === "recent"}
        onToggle={() => toggleSection("recent")}
        icon={<FiTrendingUp className="text-green-500 text-xl" />}
      >
        <LeadList leads={recentLeads} emptyMessage="No recent leads" />
      </CollapsibleSection>

      <CollapsibleSection
        title="Recently Closed (in range)"
        isExpanded={expandedSection === "closed"}
        onToggle={() => toggleSection("closed")}
        icon={<FiCheckCircle className="text-purple-500 text-xl" />}
      >
        <LeadList leads={recentlyClosedLeads} emptyMessage="No closed leads" />
      </CollapsibleSection>
    </div>
  );
};

// --- Reusable Components ---

const CollapsibleSection = ({ title, isExpanded, onToggle, icon, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left">
      <div className="flex items-center">
        <h2 className="font-semibold text-lg text-gray-800">{title}</h2>
      </div>
      <div className="flex items-center">
        {icon}
        {isExpanded ? (
          <FiChevronUp className="ml-3 text-gray-400 text-xl" />
        ) : (
          <FiChevronDown className="ml-3 text-gray-400 text-xl" />
        )}
      </div>
    </button>
    {isExpanded && <div className="p-5 border-t border-gray-100">{children}</div>}
  </div>
);

const KPICard = ({ title, value, icon, trend, large }) => {
  const trends = {
    total: { value: "+12%", color: "text-green-500" },
    new: { value: "+5%", color: "text-green-500" },
    inProgress: { value: "-2%", color: "text-red-500" },
    closed: { value: "+8%", color: "text-green-500" },
  };

  return (
    <div className={`bg-white ${large ? "p-5" : "p-4"} rounded-xl shadow-sm border border-gray-100 h-full`}>
      <div className="flex justify-between items-start h-full">
        <div>
          <p className={`${large ? "text-sm" : "text-xs"} font-medium text-gray-500`}>{title}</p>
          <h3 className={`${large ? "text-3xl" : "text-2xl"} font-bold mt-2`}>{value}</h3>
          <div className="mt-3 flex items-center">
            <span className={`text-sm font-medium ${trends[trend]?.color || "text-gray-500"}`}>
              {trends[trend]?.value || "0%"}
            </span>
            <span className="text-gray-500 text-xs ml-1">vs last week</span>
          </div>
        </div>
        <div className={`${large ? "p-3" : "p-2"} rounded-lg bg-gray-50 self-center`}>{icon}</div>
      </div>
    </div>
  );
};

const LeadList = ({ leads, emptyMessage }) => (
  !leads || leads.length === 0 ? (
    <div className="text-center py-6">
      <p className="text-gray-400">{emptyMessage}</p>
    </div>
  ) : (
    <ul className="space-y-3">
      {leads.map((lead) => (
        <li key={lead.id} className="p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start">
            <div className="pr-3">
              <p className="font-medium text-gray-800">{lead.title || "Untitled Lead"}</p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">{lead.customerName || "Unknown Customer"}</span>
              </p>
              {lead.closedByUser && (
                <p className="text-xs text-gray-500 mt-1">
                  Closed by: <span className="font-medium">{lead.closedByUser.name}</span>
                  {lead.closedAt && ` on ${new Date(lead.closedAt).toLocaleDateString()}`}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end space-y-2">
              <PriorityBadge priority={lead.priority} />
              <StatusBadge status={lead.status} />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm text-gray-500">
            <FiCalendar className="mr-2" />
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
    <span className={`text-xs px-3 py-1.5 rounded-full ${styles[priority?.toLowerCase()] || "bg-gray-100 text-gray-800"}`}>
      {priority || "Unknown"}
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
    <span className={`text-xs px-3 py-1.5 rounded-full ${styles[status?.toLowerCase()] || "bg-gray-100 text-gray-800"}`}>
      {status || "Unknown"}
    </span>
  );
};

export default Analytics;