// components/LeadDetailsModal/LeadDetailsHeader.js

import React from "react";
import { Select, DatePicker, Button, Tag } from "antd";
import {
  FiX,
  FiChevronDown,
  FiCalendar,
  FiMessageSquare,
  FiInfo,
  FiClock,
} from "react-icons/fi";
import dayjs from "dayjs";

const { Option } = Select;

const STATUS_OPTIONS = ["New", "In Progress", "Closed"];
const PRIORITY_OPTIONS = ["High", "Medium", "Low"];

const statusConfig = {
  New: { color: "#3B82F6" },
  "In Progress": { color: "#F59E0B" },
  Closed: { color: "#10B981" },
};

const priorityConfig = {
  High: { color: "#EF4444" },
  Medium: { color: "#F59E0B" },
  Low: { color: "#10B981" },
};

const LeadDetailsHeader = ({
  lead,
  status,
  priority,
  dueDate,
  isEmployee,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
  onAssignClick,
  activeView,
  setActiveView,
  onClose,
  renderAssigneesMini,
}) => {
  const disabledDate = (current) => current && current < dayjs().startOf("day");

  return (
    <>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-200 transition-colors"
      >
        <FiX size={18} />
      </button>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-200 px-6 py-4 shadow-sm">
        {/* Title + Meta */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {lead.title || "Lead Details"}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span className="flex items-center">
                <FiCalendar className="mr-1" />
                {lead.createdAt
                  ? `Created: ${dayjs(lead.createdAt).format("MMM DD, YYYY")}`
                  : "Created: —"}
              </span>
             
            </div>
          </div>

          {/* Quick glance labels */}
          <div className="flex gap-2">
            <Tag color={statusConfig[status]?.color}>{status}</Tag>
            <Tag color={priorityConfig[priority]?.color}>{priority}</Tag>
          </div>
        </div>

        {/* Controls + Tabs */}
        <div className="flex items-center justify-between mt-4">
          {/* Controls Row */}
          <div className="flex items-center gap-8 text-sm">
            {/* Status */}
            <div className="flex flex-col">
              <span className="text-gray-600 text-xs mb-1 ml-3">Status</span>
              <Select
                value={status}
                onChange={onStatusChange}
                disabled={isEmployee}
                dropdownMatchSelectWidth={false}
                suffixIcon={<FiChevronDown size={14} />}
                bordered={false}
                
                className="borderless-selector"
              >
                {STATUS_OPTIONS.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Priority */}
            <div className="flex flex-col">
              <span className="text-gray-600 text-xs mb-1 ml-3">Priority</span>
              <Select
                value={priority}
                onChange={onPriorityChange}
                disabled={isEmployee}
                dropdownMatchSelectWidth={false}
                suffixIcon={<FiChevronDown size={14} />}
                bordered={false}
                
                className="borderless-selector"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <Option key={p} value={p}>
                    {p}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Due Date */}
            <div className="flex flex-col">
              <span className="text-gray-600 text-xs mb-1 ml-3">Due Date</span>
              <DatePicker
                value={dueDate}
                onChange={onDueDateChange}
                disabled={isEmployee}
                disabledDate={disabledDate}
                format="MMM DD, YYYY"
                allowClear
                suffixIcon={<FiCalendar size={14} />}
                style={{ width: 140 }}
                bordered={false}
                className="borderless-selector"
              />
            </div>

            {/* Assigned */}
            <div className="flex flex-col">
              <span className="text-gray-600 text-xs mb-1 ml-3">Assigned To</span>
              <Button
                type="text"
                size="small"
                className="!rounded-md !h-8 !px-3 flex items-center borderless-btn"
                onClick={onAssignClick}
                disabled={isEmployee}
              >
                {renderAssigneesMini()}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-white rounded-full shadow-sm overflow-hidden">
            <button
              onClick={() => setActiveView("comments")}
              className={`px-4 py-1 text-sm flex items-center gap-1 transition ${
                activeView === "comments"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FiMessageSquare size={14} /> Comments
            </button>
            <button
              onClick={() => setActiveView("details")}
              className={`px-4 py-1 text-sm flex items-center gap-1 transition ${
                activeView === "details"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FiInfo size={14} /> Details
            </button>
            <button
              onClick={() => setActiveView("activity")}
              className={`px-4 py-1 text-sm flex items-center gap-1 transition ${
                activeView === "activity"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FiClock size={14} /> Activity
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(.borderless-selector .ant-select-selector),
        :global(.borderless-selector .ant-picker) {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          padding-left: 0 !important;
        }
      `}</style>
    </>
  );
};

export default LeadDetailsHeader;
