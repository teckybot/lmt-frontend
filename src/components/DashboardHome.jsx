import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FiTrendingUp, 
  FiClock, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiUser, 
  FiCalendar,
  FiLoader,
  FiBarChart2,
  FiPieChart
} from 'react-icons/fi';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please log in.');
          setIsLoading(false);
          return;
        }

        const res = await axios.get('http://localhost:5000/api/leads/analytics', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAnalyticsData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-3xl text-blue-500 mb-2" />
          <p className="text-gray-600">Loading analytics data...</p>
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

  if (!analyticsData) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
        <div className="flex items-center">
          <FiAlertCircle className="text-yellow-500 mr-2" />
          <span className="text-yellow-700">No analytics data available</span>
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
  } = analyticsData;

  // Calculate conversion rate
  const conversionRate =
    stats.total && stats.closed
      ? ((stats.closed / stats.total) * 100).toFixed(1)
      : '0.0';

  // Priority distribution data for chart
  const priorityData = [
    { name: 'High', value: priorityCounts.high || 0, color: '#EF4444' },
    { name: 'Medium', value: priorityCounts.medium || 0, color: '#F59E0B' },
    { name: 'Low', value: priorityCounts.low || 0, color: '#10B981' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lead Analytics Dashboard</h1>
        <p className="text-gray-600">Overview of your leads and conversions</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Leads" 
          value={stats.total || 0} 
          icon={<FiBarChart2 className="text-blue-500" />}
          trend="total"
        />
        <KPICard 
          title="New Leads" 
          value={stats.new || 0} 
          icon={<FiUser className="text-green-500" />}
          trend="new"
        />
        <KPICard 
          title="In Progress" 
          value={stats.inProgress || 0} 
          icon={<FiLoader className="text-yellow-500" />}
          trend="inProgress"
        />
        <KPICard 
          title="Closed Leads" 
          value={stats.closed || 0} 
          icon={<FiCheckCircle className="text-purple-500" />}
          trend="closed"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Lead Priorities</h2>
            <FiPieChart className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {priorityData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-blue-600">{conversionRate}%</span>
            </div>
          </div>
        </div>

        {/* Upcoming Leads */}
        <LeadSection 
          title="Upcoming Due Leads" 
          leads={upcomingLeads} 
          icon={<FiClock className="text-blue-500" />}
          emptyMessage="No upcoming leads"
        />

        {/* Overdue Leads */}
        <LeadSection 
          title="Overdue Leads" 
          leads={overdueLeads} 
          icon={<FiAlertCircle className="text-red-500" />}
          emptyMessage="No overdue leads"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <LeadSection 
          title="Recent Leads" 
          leads={recentLeads} 
          icon={<FiTrendingUp className="text-green-500" />}
          emptyMessage="No recent leads"
        />

        {/* Recently Closed Leads */}
        <LeadSection 
          title="Recently Closed Leads" 
          leads={recentlyClosedLeads} 
          icon={<FiCheckCircle className="text-purple-500" />}
          emptyMessage="No recently closed leads"
        />
      </div>
    </div>
  );
};

// Enhanced KPI Card Component
const KPICard = ({ title, value, icon, trend }) => {
  // This would be more dynamic in a real app with actual trend data
  const trendData = {
    total: { value: '+12%', color: 'text-green-500' },
    new: { value: '+5%', color: 'text-green-500' },
    inProgress: { value: '-2%', color: 'text-red-500' },
    closed: { value: '+8%', color: 'text-green-500' },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-2 rounded-lg bg-gray-50">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${trendData[trend].color}`}>
          {trendData[trend].value}
        </span>
        <span className="text-gray-500 text-sm ml-1">vs last week</span>
      </div>
    </div>
  );
};

// Enhanced Lead Section Component
const LeadSection = ({ title, leads, icon, emptyMessage }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {icon}
      </div>
      
      {(!leads || leads.length === 0) ? (
        <div className="text-center py-8">
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => (
            <li 
              key={lead.id || lead._id} 
              className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">{lead.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{lead.customer_name}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <PriorityBadge priority={lead.priority} />
                  <StatusBadge status={lead.status} />
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <FiCalendar className="mr-1" />
                <span>Due: {lead.due_date ? new Date(lead.due_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const priorityStyles = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${priorityStyles[priority] || 'bg-gray-100 text-gray-800'}`}>
      {priority || 'Unknown'}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    new: 'bg-blue-100 text-blue-800',
    'in progress': 'bg-yellow-100 text-yellow-800',
    closed: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default Analytics;