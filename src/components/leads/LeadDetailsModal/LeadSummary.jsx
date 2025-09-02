/*
  File: components/LeadDetailsModal/LeadSummary.js
  Refactored description to correctly handle all cases, including custom action & custom action type.
*/

import React, { useState, useEffect } from "react";
import { Select, Tag, Button, Avatar, Tooltip, message, Input, DatePicker } from "antd";
import { FiList } from "react-icons/fi";
import dayjs from "dayjs";
import LeadComments from "./LeadComments";

const { Option } = Select;
const { TextArea } = Input;

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const STATUS_OPTIONS = ["New", "In Progress", "Closed"];

const faqVariants = {
    Mail: ["Mail them with brochure", "Mail them with account's data", "Mail them with poster as an attachment", "Custom"],
    Call: ["Cold call", "Follow-up call", "Product demo call", "Custom"],
    Visit: ["Office visit", "Home visit", "Site inspection", "Custom"],
};

const LeadSummary = ({ lead, isEmployee, descriptionData, setDescriptionData, onUpdate, setIsAssigneeSelectorVisible }) => {
    const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
    const [descriptionSaving, setDescriptionSaving] = useState(false);

    useEffect(() => {
        // Initialize local state with lead.description if not already set
        if (lead.description && !descriptionData.faqType) {
            setDescriptionData({
                faqType: faqVariants[lead.description.faqType] ? lead.description.faqType : "Custom",
                variant: lead.description.variant || "Custom",
                customFaqType: faqVariants[lead.description.faqType] ? null : lead.description.faqType,
                customVariant: (lead.description.variant && !faqVariants[lead.description.faqType]?.includes(lead.description.variant)) ? lead.description.variant : null,
            });
        }
    }, [lead, descriptionData, setDescriptionData]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return "blue";
            case 'In Progress': return "gold";
            case 'Closed': return "green";
            default: return "default";
        }
    };

    const getInitials = (name) => !name ? "?" : name.charAt(0).toUpperCase();

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'High': return <span className="text-red-500 text-lg">!</span>;
            case 'Medium': return <span className="text-yellow-500 text-lg">!</span>;
            case 'Low': return <span className="text-green-500 text-lg">!</span>;
            default: return <span className="text-gray-500 text-lg">!</span>;
        }
    };

    const handleStatusChange = async (value) => {
        try { await onUpdate({ status: value }); message.success("Status updated successfully!"); }
        catch { message.error("Failed to update status."); }
    };

    const handlePriorityChange = async (value) => {
        try { await onUpdate({ priority: value }); message.success("Priority updated successfully!"); }
        catch { message.error("Failed to update priority."); }
    };

    const handleDueDateChange = async (date) => {
        try {
            const updateData = { dueDate: date ? date.toISOString() : null };
            await onUpdate(updateData);
            message.success("Due date updated successfully!");
        } catch (err) {
            console.error(err);
            message.error("Failed to update due date.");
        }
    };

    const disabledDate = current => current && current < dayjs().startOf('day');

    const handleDescriptionSave = async () => {
        try {
            setDescriptionSaving(true);
            const updatedDescription = {
                faqType: descriptionData.faqType === "Custom" ? descriptionData.customFaqType : descriptionData.faqType,
                variant: descriptionData.variant === "Custom" ? descriptionData.customVariant : descriptionData.variant,
                customFaqType: descriptionData.customFaqType || null,
                customVariant: descriptionData.customVariant || null,
            };
            await onUpdate({ description: updatedDescription });
            setIsDescriptionEditing(false);
            message.success("Description updated successfully!");
        } catch { message.error("Failed to update description."); }
        finally { setDescriptionSaving(false); }
    };

    const renderVariantField = () => {
        if (!descriptionData.faqType) return null;
        if (descriptionData.faqType === "Custom") {
            return (
                <>
                    <TextArea placeholder="Custom Action" value={descriptionData.customFaqType} onChange={e => setDescriptionData({ ...descriptionData, customFaqType: e.target.value })} rows={2} />
                    <TextArea placeholder="Custom Action Type" value={descriptionData.customVariant} onChange={e => setDescriptionData({ ...descriptionData, customVariant: e.target.value })} rows={2} className="mt-2" />
                </>
            );
        }
        const variants = faqVariants[descriptionData.faqType] || [];
        if (descriptionData.variant === "Custom") {
            return <TextArea placeholder="Custom Action Type" value={descriptionData.customVariant} onChange={e => setDescriptionData({ ...descriptionData, customVariant: e.target.value })} rows={2} />;
        }
        return (
            <Select value={descriptionData.variant} onChange={val => setDescriptionData({ ...descriptionData, variant: val })} className="w-full">
                {variants.map(v => <Option key={v} value={v}>{v}</Option>)}
            </Select>
        );
    };

    const displayDescription = () => {
        const action = lead.description?.faqType || "N/A";
        const actionType = lead.description?.variant || "N/A";
        return (
            <>
                <div><span className="font-medium text-gray-700">Action:</span> <span>{action}</span></div>
                <div><span className="font-medium text-gray-700">Action type:</span> <span>{actionType}</span></div>
            </>
        );
    };

    return (
        <div className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-5 bg-white rounded-xl border border-gray-200">
                <div className="flex flex-col items-center">
                    <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
                    <Select value={lead.status} bordered={false} className="rounded-lg bg-gray-50 px-3 py-2 w-full" onChange={handleStatusChange} disabled={isEmployee}>
                        {STATUS_OPTIONS.map((status) => (<Option key={status} value={status}><Tag color={getStatusColor(status)}>{status}</Tag></Option>))}
                    </Select>
                </div>
                <div className="flex flex-col items-center">
                    <label className="text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <Select value={lead.priority} bordered={false} className="rounded-lg bg-gray-50 px-3 py-2 w-full" onChange={handlePriorityChange} disabled={isEmployee}>
                        {PRIORITY_OPTIONS.map((p) => (<Option key={p} value={p}><div className="flex items-center gap-2">{getPriorityIcon(p)}<span>{p}</span></div></Option>))}
                    </Select>
                </div>
                <div className="flex flex-col items-center">
                    <label className="text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <div className="text-black mt-1">{dayjs(lead.createdAt).format("MMM DD, YYYY")}</div>
                </div>
                <div className="flex flex-col items-center hover:cursor-pointer">
                    <label className="text-sm font-medium text-gray-700 mb-1 ">Due Date</label>
                    <DatePicker 
                    value={lead.dueDate ? dayjs(lead.dueDate) : null} 
                    disabledDate={disabledDate} 
                    onChange={handleDueDateChange} 
                    disabled={isEmployee} 
                    className="rounded-lg bg-gray-50 px-3 py-2 w-full "
                    format="DD-MM-YYYY"
                    />
                </div>
                <div className="flex flex-col items-center md:col-span-2 lg:col-span-4">
                    <label className="text-sm font-medium text-gray-700 mb-1">Assigned to</label>
                    <Tooltip title={lead.assignees.map(a => a.name).join(", ") || "No users assigned"}>
                        <div className={`flex flex-wrap items-center gap-3 p-2 rounded-lg border border-gray-200 bg-gray-50 ${!isEmployee ? "cursor-pointer hover:bg-gray-100" : ""}`} onClick={() => !isEmployee && setIsAssigneeSelectorVisible(true)}>
                            {lead.assignees.length > 0 ? lead.assignees.slice(0, 3).map(a => (<Avatar key={a.id} src={a.avatar} shape="square" className="!rounded-md bg-blue-500 text-white">{!a.avatar && getInitials(a.name)}</Avatar>)) : <span className="text-sm text-gray-400 font-semibold">Assign</span>}
                            {lead.assignees.length > 3 && <span className="text-xs text-gray-500">+{lead.assignees.length - 3}</span>}
                        </div>
                    </Tooltip>
                </div>
            </div>

            <div className="space-y-6 mt-6">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2"><FiList className="text-gray-600" /> Description</h3>
                        {!isEmployee && <Button type="text" size="small" onClick={() => setIsDescriptionEditing(!isDescriptionEditing)}>{isDescriptionEditing ? "Cancel" : "Edit"}</Button>}
                    </div>
                    {isDescriptionEditing ? (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                                <Select value={descriptionData.faqType} onChange={val => setDescriptionData({ ...descriptionData, faqType: val, variant: faqVariants[val] ? faqVariants[val][0] : "Custom", customFaqType: val === "Custom" ? "" : null, customVariant: null })} className="w-full">
                                    <Option value="Mail">Mail</Option>
                                    <Option value="Call">Call</Option>
                                    <Option value="Visit">Visit</Option>
                                    <Option value="Custom">Custom</Option>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                                {renderVariantField()}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button onClick={() => setIsDescriptionEditing(false)}>Cancel</Button>
                                <Button type="primary" onClick={handleDescriptionSave} loading={descriptionSaving}>Save</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                            {displayDescription()}
                        </div>
                    )}
                </div>
            </div>
            {/* Integrate the new LeadComments component */}
            <LeadComments leadId={lead.id} currentUser={lead.assignees[0]} />
        </div>
    );
};

export default LeadSummary;
