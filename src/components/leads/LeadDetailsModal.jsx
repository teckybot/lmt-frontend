import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, DatePicker, Button, Tag, Avatar, message } from "antd";
import { FiEdit, FiUser, FiCalendar, FiList, FiClock, FiCheckCircle } from "react-icons/fi";
import dayjs from "dayjs";
import stateDistrictMap from "../../utils/stateDistrictMap";
import AssigneeSelector from "./AssigneeSelector";
import api from "../../utils/axiosInstance";

const { TextArea } = Input;
const { Option } = Select;

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const STATUS_OPTIONS = ["New", "In Progress", "Closed"];
const SOURCE_OPTIONS = [
    "Year Long Programme", "STEM Labs", "Training", "LMS", "Workshop", "Projects",
    "Website Development", "Internships", "Bootcamps", "Product Selling", "Other"
];

const LeadDetailsModal = ({ lead, role, onClose, onUpdate, loading }) => {
    const [form] = Form.useForm();
    const [selectedState, setSelectedState] = useState(lead?.state);
    const [isAssigneeSelectorVisible, setIsAssigneeSelectorVisible] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(lead?.status);

    const isEmployee = (role || "").toLowerCase() === "employee";

    useEffect(() => {
        if (lead) {
            form.setFieldsValue({
                ...lead,
                dueDate: lead.dueDate ? dayjs(lead.dueDate) : null,
            });
            setSelectedState(lead.state);
            setCurrentStatus(lead.status);
        }
    }, [lead, form]);

    const handleFormSubmit = async (values) => {
        const updatedLead = {
            ...values,
            dueDate: values.dueDate ? values.dueDate.toISOString() : null,
            description: lead.description,
        };
        await onUpdate(updatedLead);
        onClose();
    };

    const handleStatusChange = async (value) => {
        try {
            setCurrentStatus(value);
            // Update the form value
            form.setFieldsValue({ status: value });

            // If you want to save immediately on status change
            // await api.patch(`/leads/${lead.id}`, { status: value });
            // message.success("Status updated successfully!");
        } catch (err) {
            console.error("Error updating status", err);
            message.error("Failed to update status.");
            // Revert to previous status
            setCurrentStatus(lead.status);
            form.setFieldsValue({ status: lead.status });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "New": return "blue";
            case "In Progress": return "orange";
            case "Closed": return "green";
            default: return "default";
        }
    };

    const disabledDate = (current) => {
        return current && current < dayjs().startOf("day");
    };

    const handleAssignLead = async (assigneeIds) => {
        try {
            await api.post(`/assigns/${lead.id}/assign`, { assigneeIds });
            const { data: assignments } = await api.get(`/assigns/${lead.id}/assignments`);
            const assignees = assignments.map(a => a.user);

            // Update the parent component with new assignments
            onUpdate({ ...lead, assignees, assignments });

            message.success("Lead assigned successfully!");
            setIsAssigneeSelectorVisible(false);
        } catch (err) {
            console.error("Error assigning lead", err);
            message.error("Failed to assign lead.");
        }
    };

    // Format date as "Aug 25, 03:32 PM"
    const formatDate = (dateString) => {
        return dayjs(dateString).format("MMM DD, hh:mm A");
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-4 text-lg font-medium">
                    <FiEdit className="text-blue-500" />
                    <span>{lead.title || "Lead Details"}</span>
                </div>
            }
            open={true}
            onCancel={onClose}
            footer={null}
            width={800}
            destroyOnClose
            bodyStyle={{ padding: 0, maxHeight: "75vh", overflowY: "auto" }}
            className="rounded-lg shadow-md"
        >
            {/* Top Bar */}
            <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    {/* Status */}
                    <Form.Item name="status" className="mb-0">
                        <Select
                            value={currentStatus}
                            onChange={handleStatusChange}
                            className="w-32"
                            size="small"
                            disabled={isEmployee}
                            dropdownMatchSelectWidth={false}
                        >
                            {STATUS_OPTIONS.map((status) => (
                                <Option key={status} value={status}>
                                    <Tag
                                        color={getStatusColor(status)}
                                        className="text-xs font-medium px-2 py-0.5 rounded"
                                    >
                                        {status}
                                    </Tag>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Assignees */}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="whitespace-nowrap">Assigned to</span>
                        <div
                            className="flex gap-1 cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded items-center"
                            onClick={() => !isEmployee && setIsAssigneeSelectorVisible(true)}
                        >
                            {lead.assignees && lead.assignees.length > 0 ? (
                                <>
                                    {lead.assignees.slice(0, 3).map((assignee) => (
                                        <Avatar
                                            key={assignee.id}
                                            src={assignee.avatar}
                                            shape="square"
                                            size={28}
                                            alt={assignee.name}
                                            className="border border-gray-300"
                                        />
                                    ))}
                                    {lead.assignees.length > 3 && (
                                        <span className="text-xs text-gray-500 flex items-center justify-center min-w-[20px]">
                                            +{lead.assignees.length - 3}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="text-xs text-gray-400 italic px-2 py-1 bg-gray-200 rounded">
                                    Unassigned
                                </span>
                            )}
                        </div>
                    </div>
                </div>


                <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="text-center">
                        <div className="font-medium text-gray-500 text-xs uppercase tracking-wide mb-1">Start Date</div>
                        <div className="text-gray-800 font-semibold">{dayjs(lead.createdAt).format("MMM DD, YYYY")}</div>
                    </div>
                    <div className="text-center">
                        <div className="font-medium text-gray-500 text-xs uppercase tracking-wide mb-1">Due Date</div>
                        <Form.Item name="dueDate" className="mb-0 flex justify-center">
                            <DatePicker
                                format="MMM DD, YYYY"
                                disabledDate={disabledDate}
                                disabled={isEmployee}
                                suffixIcon={<FiCalendar className="text-gray-400" />}
                                className="border-none p-0 text-gray-800 font-semibold text-center w-full"
                                allowClear={false}
                                style={{ textAlign: 'center' }}
                            />
                        </Form.Item>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleFormSubmit}
                disabled={isEmployee}
                className="p-6 space-y-6"
            >
                {/* Title & Metadata */}
                <div className="flex items-center gap-3 mb-4">
                    <FiCheckCircle className="text-blue-500" />
                    <h2 className="text-xl font-bold text-gray-800">{lead.title || "Untitled Lead"}</h2>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span className="font-medium">Priority:</span>
                    <Form.Item name="priority" className="mb-0">
                        <Select
                            className="w-24"
                            size="small"
                            bordered={false}
                        >
                            {PRIORITY_OPTIONS.map((priority) => (
                                <Option key={priority} value={priority}>
                                    <Tag
                                        color={
                                            priority === "High" ? "red" :
                                                priority === "Medium" ? "orange" : "green"
                                        }
                                        className="text-xs font-medium"
                                    >
                                        {priority}
                                    </Tag>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                        <FiList className="text-gray-500" /> Description
                    </label>
                    <Form.Item name="description" className="mb-0">
                        <TextArea
                            placeholder="Enter description"
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </Form.Item>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label="Customer Name" name="customerName" rules={[{ required: true }]}>
                        <Input placeholder="Customer Name" />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ type: "email", required: true }]}>
                        <Input placeholder="Email" />
                    </Form.Item>
                    <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
                        <Input placeholder="Phone" />
                    </Form.Item>
                    <Form.Item label="Service" name="source" rules={[{ required: true }]}>
                        <Select placeholder="Select service">
                            {SOURCE_OPTIONS.map((src) => (
                                <Option key={src} value={src}>{src}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="State" name="state">
                        <Select
                            placeholder="Select State"
                            onChange={(value) => {
                                setSelectedState(value);
                                form.setFieldsValue({ district: undefined });
                            }}
                        >
                            {Object.keys(stateDistrictMap).map(state => (
                                <Option key={state} value={state}>{state}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="District" name="district">
                        <Select placeholder="Select District" disabled={!selectedState}>
                            {selectedState && Object.keys(stateDistrictMap[selectedState]?.districts || {}).map(district => (
                                <Option key={district} value={district}>{district}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Location" name="location">
                        <Input placeholder="Location" />
                    </Form.Item>
                </div>

                {/* Timeline */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                        <FiClock className="text-gray-500" /> Timeline
                    </h3>
                    <div className="space-y-2">
                        {/* Created */}
                        <div className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-gray-300 mt-1"></div>
                            <div className="text-sm text-gray-700">
                                <span className="font-medium">{lead.assignedByNames?.join(", ") || "System"}</span> created this lead.
                                <span className="block text-xs text-gray-500">{formatDate(lead.createdAt)}</span>
                            </div>
                        </div>

                        {/* Assignments */}
                        {lead.assignments?.map((assignment, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <div className="w-4 h-4 rounded-full bg-gray-300 mt-1"></div>
                                <div className="text-sm text-gray-700">
                                    <span className="font-medium">{assignment.assignedByUser?.name || "Admin"}</span> assigned the task to{" "}
                                    <span className="font-medium">{assignment.user?.name || "a team member"}</span>.
                                    <span className="block text-xs text-gray-500">{formatDate(assignment.createdAt)}</span>
                                </div>
                            </div>
                        ))}

                        {/* Updated */}
                        {dayjs(lead.updatedAt).isAfter(dayjs(lead.createdAt)) && (
                            <div className="flex items-start gap-2">
                                <div className="w-4 h-4 rounded-full bg-gray-300 mt-1"></div>
                                <div className="text-sm text-gray-700">
                                    <span className="font-medium">Lead</span> was updated.
                                    <span className="block text-xs text-gray-500">{formatDate(lead.updatedAt)}</span>
                                </div>
                            </div>
                        )}

                        {/* Closed */}
                        {lead.closedAt && (
                            <div className="flex items-start gap-2">
                                <div className="w-4 h-4 rounded-full bg-gray-300 mt-1"></div>
                                <div className="text-sm text-gray-700">
                                    <span className="font-medium">Lead</span> was closed by{" "}
                                    <span className="font-medium">{lead.closedBy || "an admin"}</span>.
                                    <span className="block text-xs text-gray-500">{formatDate(lead.closedAt)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button onClick={onClose}>Close</Button>
                    {!isEmployee && (
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Save Changes
                        </Button>
                    )}
                </div>
            </Form>

            {/* Assignee Selector */}
            {!isEmployee && (
                <AssigneeSelector
                    lead={lead}
                    visible={isAssigneeSelectorVisible}
                    onClose={() => setIsAssigneeSelectorVisible(false)}
                    onAssign={handleAssignLead}
                />
            )}
        </Modal>
    );
};

export default LeadDetailsModal;