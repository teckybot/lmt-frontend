import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, DatePicker, Button, Tag, Avatar, message } from "antd";
import { FiEdit, FiUser, FiCalendar, FiList, FiClock } from "react-icons/fi";
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


const LeadDetailsModal = ({ lead, onClose, onUpdate, loading }) => {
    const [form] = Form.useForm();
    const [selectedState, setSelectedState] = useState(lead?.state);
    const [isAssigneeSelectorVisible, setIsAssigneeSelectorVisible] = useState(false);

    useEffect(() => {
        if (lead) {
            form.setFieldsValue({
                ...lead,
                dueDate: lead.dueDate ? dayjs(lead.dueDate) : null,
            });
            setSelectedState(lead.state);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return "blue";
            case 'In Progress': return "gold";
            case 'Closed': return "green";
            default: return "default";
        }
    };

    // Validation for Due Date
    const disabledDate = (current) => {
        return current && current < dayjs().startOf('day');
    };

    const handleAssignLead = async (assigneeIds) => {
        try {
            await api.post(`/assigns/${lead.id}/assign`, { assigneeIds });
            const { data: assignments } = await api.get(`/assigns/${lead.id}/assignments`);
            const assignees = assignments.map(a => a.user);
            onUpdate({ ...lead, assignees, assignments });
            message.success("Lead assignment updated successfully!");
            setIsAssigneeSelectorVisible(false);
        } catch (err) {
            console.error("Error assigning lead", err);
            message.error("Failed to assign lead.");
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <FiEdit className="text-blue-500" />
                    <span className="font-semibold text-gray-800">{lead.title || "Edit Lead"}</span>
                </div>
            }
            open={true}
            onCancel={onClose}
            footer={null}
            width={750}
            destroyOnClose
            bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFormSubmit}
                className="mt-4"
            >
                {/* Top Section */}
                <div className="flex items-center justify-between gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 flex flex-col items-center">
                        <span className="text-sm font-medium text-gray-600">Status</span>
                        <Form.Item name="status" className="mb-0 mt-1">
                            <Select bordered={false} style={{ width: 120 }}>
                                {STATUS_OPTIONS.map((status) => (
                                    <Option key={status} value={status}>
                                        <Tag color={getStatusColor(status)}>{status}</Tag>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                        <span className="text-sm font-medium text-gray-600">Assigned to</span>
                        <div
                            className="flex items-center gap-1 mt-1 cursor-pointer hover:underline"
                            onClick={() => setIsAssigneeSelectorVisible(true)}
                        >
                            {lead.assignees.length > 0 ? (
                                lead.assignees.slice(0, 3).map((assignee) => (
                                    <Avatar
                                        key={assignee.id}
                                        src={assignee.avatar} 
                                        size="small"
                                        alt={assignee.name}
                                    />))
                            ) : (
                                <span className="text-sm font-semibold text-gray-400">Assign</span>
                            )}
                            {lead.assignees.length > 3 && (
                                <span className="text-xs text-gray-500">+{lead.assignees.length - 3}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                        <span className="text-sm font-medium text-gray-600">Due Date</span>
                        <Form.Item name="dueDate" className="mb-0 mt-1">
                            <DatePicker
                                bordered={false}
                                format="YYYY-MM-DD"
                                style={{ width: 120 }}
                                disabledDate={disabledDate}
                            />
                        </Form.Item>
                    </div>
                </div>

                {/* Middle Section: Description and Details */}
                <div className="space-y-6">
                    {/* CORRECTED: Non-editable Description Section */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2 mb-2">
                            <FiList className="text-gray-600" /> Description
                        </h3>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">FAQ Type:</span>
                                <span className="text-gray-900">{lead.description?.faqType || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Variant:</span>
                                <span className="text-gray-900">{lead.description?.variant || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* CORRECTED: Details Section */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2 mb-2">
                            <FiList className="text-gray-600" /> Details
                        </h3>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <Form.Item label="Priority" name="priority" rules={[{ required: true }]}>
                                <Select placeholder="Select priority">
                                    {PRIORITY_OPTIONS.map((p) => (
                                        <Option key={p} value={p}>{p}</Option>
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
                    </div>
                </div>

                {/* Bottom Section: Timeline */}
                <div className="mt-8 space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2 mb-2">
                        <FiClock className="text-gray-600" /> Timeline
                    </h3>
                    <div className="relative pl-6 before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:bg-gray-200">
                        {/* Creation Event */}
                        <div className="relative mb-4">
                            <span className="absolute left-[-26px] top-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white"></span>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium text-gray-800">{lead.assignedByNames?.join(", ") || "A user"}</span> created this lead.
                                <span className="block text-xs text-gray-400">{dayjs(lead.createdAt).format("MMM DD, YYYY hh:mm A")}</span>
                            </p>
                        </div>
                        {/* Assignment Events */}
                        {lead.assignments?.length > 0 && lead.assignments.map((assignment, index) => (
                            <div key={index} className="relative mb-4">
                                <span className="absolute left-[-26px] top-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white"></span>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium text-gray-800">{assignment.assignedByUser?.name || "A user"}</span> assigned the task to <span className="font-medium text-gray-800">{assignment.user?.name || "a user"}</span>.
                                    <span className="block text-xs text-gray-400">{dayjs(lead.updatedAt).format("MMM DD, YYYY hh:mm A")}</span>
                                </p>
                            </div>
                        ))}
                        {/* Other Update Events */}
                        {dayjs(lead.updatedAt).isAfter(dayjs(lead.createdAt)) && (
                            <div className="relative mb-4">
                                <span className="absolute left-[-26px] top-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white"></span>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium text-gray-800">Lead</span> was updated.
                                    <span className="block text-xs text-gray-400">{dayjs(lead.updatedAt).format("MMM DD, YYYY hh:mm A")}</span>
                                </p>
                            </div>
                        )}
                        {/* Closed Event */}
                        {lead.closedAt && (
                            <div className="relative mb-4">
                                <span className="absolute left-[-26px] top-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></span>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium text-gray-800">Lead</span> was closed by <span className="font-medium text-gray-800">{lead.closedBy || "an admin"}</span>.
                                    <span className="block text-xs text-gray-400">{dayjs(lead.closedAt).format("MMM DD, YYYY hh:mm A")}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Save Changes
                    </Button>
                </div>
            </Form>
            <AssigneeSelector
                lead={lead}
                visible={isAssigneeSelectorVisible}
                onClose={() => setIsAssigneeSelectorVisible(false)}
                onAssign={handleAssignLead}
            />
        </Modal>
    );
};

export default LeadDetailsModal;