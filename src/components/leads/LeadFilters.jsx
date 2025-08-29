import React from "react";
import { FiSearch, FiDownload } from "react-icons/fi";
import { Button } from "antd";
import ExcelJS from 'exceljs';
import { saveAs } from "file-saver";

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const STATUS_OPTIONS = ["New", "In Progress", "Closed"];
const SOURCE_OPTIONS = [
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

const LeadFilters = ({
  searchTerm,
  setSearchTerm,
  priorityFilter,
  setPriorityFilter,
  statusFilter,
  setStatusFilter,
  sourceFilter,
  setSourceFilter,
  filteredLeads
}) => {
  const exportToExcel = async () => {
    const isFiltered =
      searchTerm ||
      priorityFilter !== "All" ||
      statusFilter !== "All" ||
      sourceFilter !== "All";

    const dataToExport = filteredLeads.map((lead) => ({
      Title: lead.title || "N/A",
      Customer: lead.customerName || "N/A",
      Email: lead.email || "N/A",
      Phone: lead.phone || "N/A",
      Service: lead.source || "N/A",
      Priority: lead.priority || "N/A",
      Status: lead.status || "N/A",
      "Due Date": lead.dueDate
        ? new Date(lead.dueDate).toLocaleDateString("en-US")
        : "N/A",
      Notes: lead.notes || "",
    }));

    if (!dataToExport.length) {
      alert("No data to export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');

    const headers = Object.keys(dataToExport[0]);
    worksheet.addRow(headers);

    dataToExport.forEach(item => {
      const row = headers.map(header => item[header]);
      worksheet.addRow(row);
    });

    const filename = isFiltered ? 'Filtered_Leads.xlsx' : 'All_Leads.xlsx';

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, filename);
  };

  return (
    <div className="mb-4">
      <div className="flex flex-col md:flex-row items-center justify-between w-full mb-2 gap-3">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <Button
          type="primary"
          icon={<FiDownload className="mr-1" />}
          onClick={exportToExcel}
          className="bg-gradient-to-r from-gray-800 to-gray-700 
            border-0 
            hover:from-gray-900 hover:to-gray-800 
            focus:from-gray-900 focus:to-gray-800 
            active:from-gray-950 active:to-gray-900 
            shadow-md hover:shadow-lg 
            transition-all duration-200 
            flex items-center justify-center 
            rounded-lg 
            px-4 py-2 
            h-auto
            font-medium
            text-white
          "
          size="middle"
        >
          Download Excel
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
        >
          <option value="All">All Priorities</option>
          {PRIORITY_OPTIONS.map((priority) => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
        >
          <option value="All">All Sources</option>
          {SOURCE_OPTIONS.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>

        {(searchTerm || priorityFilter !== "All" || statusFilter !== "All" || sourceFilter !== "All") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setPriorityFilter("All");
              setStatusFilter("All");
              setSourceFilter("All");
            }}
            className="text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium border border-blue-200 rounded-lg px-3 py-2"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};

export default LeadFilters;