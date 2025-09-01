import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, DatePicker, Button, Tag, Avatar, message, Tooltip } from "antd";
import { FiEdit, FiUser, FiCalendar, FiList, FiClock, FiInfo } from "react-icons/fi";
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

// Default variants for FAQ types (from CreateLead)
const faqVariants = {
    Mail: [
        "Mail them with brochure",
        "Mail them with account's data",
        "Mail them with poster as an attachment",
        "Custom",
    ],
    Call: ["Cold call", "Follow-up call", "Product demo call", "Custom"],
    Visit: ["Office visit", "Home visit", "Site inspection", "Custom"],
};

const LeadDetailsModal = ({ lead, role, onClose, onUpdate, loading }) => {
    const [form] = Form.useForm();
    const [selectedState, setSelectedState] = useState(lead?.state);
    const [isAssigneeSelectorVisible, setIsAssigneeSelectorVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
    const [descriptionSaving, setDescriptionSaving] = useState(false);
    const [detailsSaving, setDetailsSaving] = useState(false);
    const [descriptionData, setDescriptionData] = useState({
        faqType: "",
        variant: "",
        customFaqType: "",
        customVariant: "",
    });

    const isEmployee = (role || "").toLowerCase() === "employee";

    useEffect(() => {
        if (lead) {
            form.setFieldsValue({
                ...lead,
                dueDate: lead.dueDate ? dayjs(lead.dueDate) : null,
            });
            
            // Set description data from lead
            setDescriptionData({
                faqType: lead.description?.faqType || "",
                variant: lead.description?.variant || "",
                customFaqType: lead.description?.customFaqType || "",
                customVariant: lead.description?.customVariant || "",
            });
            
            setSelectedState(lead.state);
        }
    }, [lead, form]);

    // Initialize form when details section is shown
    useEffect(() => {
        if (showDetails && lead) {
            form.setFieldsValue({
                customerName: lead.customerName || "",
                email: lead.email || "",
                phone: lead.phone || "",
                source: lead.source || "",
                state: lead.state || undefined,
                district: lead.district || undefined,
                location: lead.location || "",
                dueDate: lead.dueDate ? dayjs(lead.dueDate) : null,
            });
            setSelectedState(lead.state);
        }
    }, [showDetails, lead, form]);

    const handleStatusChange = async (value) => {
        try {
            const updateData = { status: value };
            await onUpdate(updateData);
            message.success("Status updated successfully!");
        } catch (err) {
            console.error("Error updating status", err);
            message.error("Failed to update status.");
        }
    };

    const handlePriorityChange = async (value) => {
        try {
            const updateData = { priority: value };
            await onUpdate(updateData);
            message.success("Priority updated successfully!");
        } catch (err) {
            console.error("Error updating priority", err);
            message.error("Failed to update priority.");
        }
    };

    const handleDueDateChange = async (date) => {
        try {
            const updateData = { dueDate: date ? date.toISOString() : null };
            await onUpdate(updateData);
            message.success("Due date updated successfully!");
        } catch (err) {
            console.error("Error updating due date", err);
            message.error("Failed to update due date.");
        }
    };

    const handleDescriptionSave = async () => {
        try {
            setDescriptionSaving(true);
            const updatedDescription = {
                faqType: descriptionData.faqType === "Custom" ? descriptionData.customFaqType : descriptionData.faqType,
                variant: descriptionData.variant === "Custom" ? descriptionData.customVariant : descriptionData.variant,
                customFaqType: descriptionData.customFaqType || null,
                customVariant: descriptionData.customVariant || null,
            };
            const updateData = { description: updatedDescription };
            await onUpdate(updateData);
            setIsDescriptionEditing(false);
            message.success("Description updated successfully!");
        } catch (err) {
            console.error("Error updating description", err);
            message.error("Failed to update description.");
        } finally {
            setDescriptionSaving(false);
        }
    };

    const handleDetailsSave = async (values) => {
        try {
            setDetailsSaving(true);
            console.log("Form values:", values); // Debug log
            
            // Validate required fields
            if (!values.customerName || !values.phone || !values.source) {
                message.error("Customer Name, Phone, and Service are required fields.");
                return;
            }

            // Only send the fields that the backend expects
            const updateData = {
                customerName: values.customerName,
                phone: values.phone,
                source: values.source,
            };

            // Add optional fields only if they have values
            if (values.email !== undefined) updateData.email = values.email;
            if (values.state !== undefined) updateData.state = values.state;
            if (values.district !== undefined) updateData.district = values.district;
            if (values.location !== undefined) updateData.location = values.location;
            if (values.dueDate) updateData.dueDate = values.dueDate.toISOString();

            console.log("Sending update data:", updateData); // Debug log
            await onUpdate(updateData);
            message.success("Lead details updated successfully!");
            setShowDetails(false);
        } catch (err) {
            console.error("Error updating lead details", err);
            console.error("Error response:", err.response?.data); // Debug log
            message.error(err.response?.data?.error || err.response?.data?.message || "Failed to update lead details.");
        } finally {
            setDetailsSaving(false);
        }
    };

    const handleFaqTypeChange = (value) => {
        setDescriptionData({
            faqType: value,
            variant: "",
            customFaqType: "",
            customVariant: "",
        });
    };

    const handleVariantChange = (value) => {
        setDescriptionData({
            ...descriptionData,
            variant: value,
            customVariant: value === "Custom" ? descriptionData.customVariant : "",
        });
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

    const handleAssignLead = async (assignees, assignments) => {
        try {
            // Update the lead with new assignees and assignments
            const updatedLead = {
                ...lead,
                assignees,
                assignments,
                assignedByNames: assignments.map(a => a.assignedByUser?.name).filter(Boolean),
            };
            
            // Call onUpdate to update parent component state
            await onUpdate(updatedLead);
            message.success("Lead assignment updated successfully!");
            setIsAssigneeSelectorVisible(false);
        } catch (err) {
            console.error("Error assigning lead", err);
            message.error("Failed to assign lead.");
        }
    };

    // Function to get first letter of name for avatar fallback
    const getInitials = (name) => {
        if (!name) return "?";
        return name.charAt(0).toUpperCase();
    };

    // Function to get priority icon
    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'High':
                return <span className="text-red-500 text-lg">!</span>;
            case 'Medium':
                return <span className="text-yellow-500 text-lg">!</span>;
            case 'Low':
                return <span className="text-green-500 text-lg">!</span>;
            default:
                return <span className="text-gray-500 text-lg">!</span>;
        }
    };

    // Function to get assigned users tooltip text
    const getAssignedUsersTooltip = () => {
        if (lead.assignees.length === 0) return "No users assigned";
        return lead.assignees.map(assignee => assignee.name).join(", ");
    };

    return (
        <Modal
            title={
                <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    <FiEdit className="text-blue-500" />
                    <span className="font-semibold text-gray-800">{lead.title || (isEmployee ? "View Lead" : "Edit Lead")}</span>
                    </div>
                    {/* {!isEmployee && ( */}
                        <Tooltip title="View Details">
                            <Button
                                type="text"
                                icon={<FiInfo className="text-blue-500" />}
                                onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center"
                            >
                                {showDetails ? "Hide Details" : "Details"}
                            </Button>
                        </Tooltip>
                    {/* )} */}
                </div>
            }
            open={true}
            onCancel={onClose}
            footer={null}
            width={800}
            destroyOnClose
            bodyStyle={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}
        >
            {!showDetails ? (
                // Main Modal Content
                <div className="mt-2">
                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-5 bg-white rounded-xl border border-gray-200">
                    {/* Status */}
                    <div className="flex flex-col items-center">
                        <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
                            <div className="w-full">
                                <Select 
                                    value={lead.status}
                                    bordered={false} 
                                    className="rounded-lg bg-gray-50 px-3 py-2 w-full"
                                    onChange={handleStatusChange}
                                    disabled={isEmployee}
                                >
                                {STATUS_OPTIONS.map((status) => (
                                    <Option key={status} value={status}>
                                        <Tag color={getStatusColor(status)}>{status}</Tag>
                                    </Option>
                                ))}
                            </Select>
                            </div>
                    </div>

                    {/* Priority */}
                    <div className="flex flex-col items-center">
                        <label className="text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <div className="w-full">
                            <Select
                                    value={lead.priority}
                                bordered={false}
                                placeholder="Select priority"
                                    className="rounded-lg bg-gray-50 px-3 py-2 w-full"
                                    onChange={handlePriorityChange}
                                    disabled={isEmployee}
                            >
                                {PRIORITY_OPTIONS.map((p) => (
                                        <Option key={p} value={p}>
                                            <div className="flex items-center gap-2">
                                                {getPriorityIcon(p)}
                                                <span>{p}</span>
                                            </div>
                                        </Option>
                                ))}
                            </Select>
                            </div>
                    </div>

                    {/* Start Date */}
                    <div className="flex flex-col items-center">
                        <label className="text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <div className="text-black mt-1">{dayjs(lead.createdAt).format("MMM DD, YYYY")}</div>
                    </div>

                    {/* Due Date */}
                    <div className="flex flex-col items-center">
                        <label className="text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <div className="w-full">
                            <DatePicker
                                    value={lead.dueDate ? dayjs(lead.dueDate) : null}
                                bordered={false}
                                format="DD-MM-YYYY"
                                className="rounded-lg bg-gray-50 w-full px-3 py-2"
                                disabledDate={disabledDate}
                                    onChange={handleDueDateChange}
                                    disabled={isEmployee}
                            />
                            </div>
                    </div>

                    {/* Assigned to */}
                    <div className="flex flex-col items-center md:col-span-2 lg:col-span-4">
                        <label className="text-sm font-medium text-gray-700 mb-1">Assigned to</label>
                            <Tooltip title={getAssignedUsersTooltip()} placement="top">
                        <div
                            className={`flex flex-wrap items-center gap-3 p-2 rounded-lg border border-gray-200 bg-gray-50 ${!isEmployee ? "cursor-pointer hover:bg-gray-100" : ""
                                }`}
                            onClick={() => { if (!isEmployee) setIsAssigneeSelectorVisible(true); }}
                        >
                            {lead.assignees.length > 0 ? (
                                lead.assignees.slice(0, 3).map((assignee) => (
                                    <div key={assignee.id} className="flex flex-col items-center w-16">
                                                <Avatar 
                                                    src={assignee.avatar} 
                                                    size="small" 
                                                    alt={assignee.name}
                                                    style={{ 
                                                        backgroundColor: assignee.avatar ? undefined : '#1890ff',
                                                        borderRadius: '4px' // Make it rectangular
                                                    }}
                                                >
                                                    {!assignee.avatar && getInitials(assignee.name)}
                                                </Avatar>
                                    </div>
                                ))
                            ) : (
                                <span className="text-sm text-gray-400 font-semibold">Assign</span>
                            )}
                            {lead.assignees.length > 3 && (
                                <span className="text-xs text-gray-500">+{lead.assignees.length - 3}</span>
                            )}
                        </div>
                            </Tooltip>
                    </div>
                </div>

                    {/* Middle Section: Description */}
                    <div className="space-y-6 mt-6">
                    <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                            <FiList className="text-gray-600" /> Description
                        </h3>
                                {!isEmployee && (
                                    <Button
                                        type="text"
                                        size="small"
                                        onClick={() => setIsDescriptionEditing(!isDescriptionEditing)}
                                    >
                                        {isDescriptionEditing ? "Cancel" : "Edit"}
                                    </Button>
                                )}
                            </div>
                            {isDescriptionEditing ? (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                                            <Select
                                                value={descriptionData.faqType}
                                                onChange={handleFaqTypeChange}
                                                placeholder="Select action type"
                                                className="w-full"
                                            >
                                                <Option value="Mail">Mail</Option>
                                                <Option value="Call">Call</Option>
                                                <Option value="Visit">Visit</Option>
                                                <Option value="Custom">Custom</Option>
                                            </Select>
                                        </div>

                                        {descriptionData.faqType && (
                                            <>
                                                {descriptionData.faqType === "Custom" ? (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Action Type</label>
                                                        <Input
                                                            placeholder="Enter custom action type"
                                                            value={descriptionData.customFaqType}
                                                            onChange={(e) => setDescriptionData({
                                                                ...descriptionData,
                                                                customFaqType: e.target.value
                                                            })}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Action Details</label>
                                                        <Select
                                                            value={descriptionData.variant}
                                                            onChange={handleVariantChange}
                                                            placeholder="Select action details"
                                                            className="w-full"
                                                        >
                                                            {(faqVariants[descriptionData.faqType] || []).map((variant) => (
                                                                <Option key={variant} value={variant}>
                                                                    {variant}
                                                                </Option>
                                                            ))}
                                                        </Select>
                                                    </div>
                                                )}

                                                {(descriptionData.variant === "Custom" || descriptionData.faqType === "Custom") && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Details</label>
                                                        <TextArea
                                                            placeholder="Enter custom details"
                                                            value={descriptionData.customVariant}
                                                            onChange={(e) => setDescriptionData({
                                                                ...descriptionData,
                                                                customVariant: e.target.value
                                                            })}
                                                            rows={3}
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <div className="flex justify-end gap-2">
                                            <Button onClick={() => setIsDescriptionEditing(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="primary" onClick={handleDescriptionSave} loading={descriptionSaving}>
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Action:</span>
                                <span className="text-gray-900">{lead.description?.faqType || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Action type:</span>
                                <span className="text-gray-900">{lead.description?.variant || "N/A"}</span>
                            </div>
                        </div>
                            )}
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
                    <Button onClick={onClose}>Close</Button>
                    </div>
                </div>
            ) : (
                // Details Section
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleDetailsSave}
                    className="mt-2"
                    disabled={isEmployee}
                >
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item label="Customer Name" name="customerName" rules={[{ required: true, message: "Customer Name is required" }]}>
                            <Input placeholder="Customer Name" />
                        </Form.Item>
                        <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Please enter a valid email" }]}>
                            <Input placeholder="Email" />
                        </Form.Item>
                        <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Phone is required" }]}>
                            <Input placeholder="Phone" />
                        </Form.Item>
                        <Form.Item label="Service" name="source" rules={[{ required: true, message: "Service is required" }]}>
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

                    <div className="flex justify-end gap-3 mt-4">
                        <Button onClick={() => setShowDetails(false)}>Cancel</Button>
                    {!isEmployee && (
                            <Button type="primary" htmlType="submit" loading={detailsSaving}>
                            Save Changes
                        </Button>
                    )}
                </div>
            </Form>
            )}

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