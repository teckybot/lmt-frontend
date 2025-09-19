import React, { useEffect, useState } from "react";
import {
  Modal,
  Select,
  DatePicker,
  Tooltip,
  Avatar,
  message,
  Form,
} from "antd";
import { FiUser } from "react-icons/fi";
import dayjs from "dayjs";

import LeadSummary from "./LeadSummary";
import LeadDetailsForm from "./LeadDetailsForm";
import LeadActivity from "./LeadActivity";
import AssigneeSelector from "../AssigneeSelector";
import LeadDetailsHeader from "./LeadDetailsHeader"; // 👈 IMPORT HEADER

const { Option } = Select;

const STATUS_OPTIONS = ["New", "In Progress", "Closed"];
const PRIORITY_OPTIONS = ["High", "Medium", "Low"];

const LeadDetailsModal = ({ lead = {}, role, onClose, onUpdate }) => {
  const isEmployee = (role || "").toLowerCase() === "employee";

  const [activeView, setActiveView] = useState("comments");
  const [isAssigneeSelectorVisible, setIsAssigneeSelectorVisible] = useState(false);

  const [status, setStatus] = useState(lead?.status || "New");
  const [priority, setPriority] = useState(lead?.priority || "Medium");
  const [dueDate, setDueDate] = useState(
    lead?.dueDate ? dayjs(lead.dueDate) : lead?.due_date ? dayjs(lead.due_date) : null
  );

  const [form] = Form.useForm();
  const [selectedState, setSelectedState] = useState(lead?.state || null);
  const [savingForm, setSavingForm] = useState(false);

  useEffect(() => {
    setStatus(lead?.status || "New");
    setPriority(lead?.priority || "Medium");
    setDueDate(lead?.dueDate ? dayjs(lead.dueDate) : lead?.due_date ? dayjs(lead.due_date) : null);
    setSelectedState(lead?.state || null);

    form.setFieldsValue({
      customerName: lead.customerName,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      state: lead.state,
      district: lead.district,
      location: lead.location,
      dueDate: lead.dueDate ? dayjs(lead.dueDate) : lead?.due_date ? dayjs(lead.due_date) : null,
    });
  }, [lead, form]);

  const handleStatusChange = async (value) => {
    try {
      setStatus(value);
      await onUpdate({ ...lead, status: value });
      message.success("Status updated");
    } catch {
      message.error("Failed to update status");
    }
  };

  const handlePriorityChange = async (value) => {
    try {
      setPriority(value);
      await onUpdate({ ...lead, priority: value });
      message.success("Priority updated");
    } catch {
      message.error("Failed to update priority");
    }
  };

  const handleDueDateChange = async (date) => {
    try {
      setDueDate(date);
      await onUpdate({ ...lead, dueDate: date ? date.toISOString() : null });
      message.success("Due date updated");
    } catch {
      message.error("Failed to update due date");
    }
  };

  const handleAssignLead = async (assignees, assignments) => {
    try {
      const updatedLead = {
        ...lead,
        assignees,
        assignments,
        assignedByNames: (assignments || []).map((a) => a.assignedByUser?.name).filter(Boolean),
      };
      await onUpdate(updatedLead);
      setIsAssigneeSelectorVisible(false);
    } catch (err) {
      console.error(err);
      message.error("Failed to assign");
    }
  };

  const renderAssigneesMini = () => {
    const list = Array.isArray(lead.assignees) ? lead.assignees : [];
    if (list.length === 0) return (
      <div className="flex items-center text-gray-500">
        <FiUser className="mr-1" /> Unassigned
      </div>
    );

    const visibleAssignees = list.slice(0, 2);
    const extraCount = list.length - 2;

    return (
      <div className="flex items-center">
        {visibleAssignees.map((a, index) => (
          <Tooltip key={a.id || a.email || a.name} title={a.name}>
            <Avatar
              src={a.avatar}
              shape="square"
              className="!w-5 !h-5"
              style={{
                backgroundColor: a.color || "#f0f0f0",
                marginLeft: index > 0 ? "1px" : "0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                zIndex: 2 - index,
              }}
            >
              {!a.avatar && (a.name?.charAt(0)?.toUpperCase() || "?")}
            </Avatar>
          </Tooltip>
        ))}
        {extraCount > 0 && (
          <Tooltip title={list.slice(2).map((a) => a.name).join(", ")}>
            <div
              className="flex items-center justify-center !w-5 !h-5 rounded-md bg-gray-200 text-xs font-medium text-gray-700"
              style={{ marginLeft: "1px", zIndex: 1 }}
            >
              +{extraCount}
            </div>
          </Tooltip>
        )}
      </div>
    );
  };

  const handleSaveForm = async (values) => {
    try {
      setSavingForm(true);
      const payload = {
        ...lead,
        customerName: values.customerName,
        email: values.email,
        phone: values.phone,
        source: values.source,
        state: values.state,
        district: values.district,
        location: values.location,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      };
      await onUpdate(payload);
      message.success("Lead details saved");
      setActiveView("comments");
    } catch (err) {
      console.error(err);
      message.error("Failed to save lead details");
    } finally {
      setSavingForm(false);
    }
  };

  return (
    <Modal
      title={null}
      open={true}
      onCancel={onClose}
      footer={null}
      width={980}
      destroyOnClose
      closeIcon={null}
      className="lead-details-modal -mt-8"
      
      bodyStyle={{
        padding: 0,
        height: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
      wrapClassName="lead-details-modal-wrapper"
    >
      <LeadDetailsHeader
        lead={lead}
        status={status}
        priority={priority}
        dueDate={dueDate}
        isEmployee={isEmployee}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onDueDateChange={handleDueDateChange}
        onAssignClick={() => !isEmployee && setIsAssigneeSelectorVisible(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        onClose={onClose}
        renderAssigneesMini={renderAssigneesMini}
      />

      {/* Body with custom scroll area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-5 modal-scroll-area">
        {activeView === "comments" && (
          <LeadSummary lead={lead} isEmployee={isEmployee} onUpdate={onUpdate} />
        )}

        {activeView === "details" && (
          <LeadDetailsForm
            form={form}
            lead={lead}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            onSave={handleSaveForm}
            isEmployee={isEmployee}
            SOURCE_OPTIONS={["Referral", "Website", "Email", "Call"]}
            saving={savingForm}
            onCancel={() => setActiveView("comments")}
          />
        )}

        {activeView === "activity" && <LeadActivity lead={lead} />}
      </div>

      {!isEmployee && (
        <AssigneeSelector
          lead={lead}
          visible={isAssigneeSelectorVisible}
          onClose={() => setIsAssigneeSelectorVisible(false)}
          onAssign={handleAssignLead}
        />
      )}

      <style jsx>{`
        .lead-details-modal :global(.ant-modal-body) {
          padding: 0;
        }

        .lead-details-modal-wrapper {
          position: relative;
        }

        /* ✅ Custom scrollbar for modal body */
        .modal-scroll-area::-webkit-scrollbar {
          width: 10px;
        }
        .modal-scroll-area::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 0px;
        }
        .modal-scroll-area::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </Modal>
  );
};

export default LeadDetailsModal;
