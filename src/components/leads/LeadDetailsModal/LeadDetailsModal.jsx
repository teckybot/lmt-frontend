
import React, { useState, useEffect } from "react";
import { Modal, Button, Tooltip } from "antd";
import { FiEdit, FiInfo, FiClock } from "react-icons/fi";
import LeadSummary from "./LeadSummary";
import LeadDetailsForm from "./LeadDetailsForm";
import LeadActivity from "./LeadActivity";
import AssigneeSelector from "../AssigneeSelector";


const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const STATUS_OPTIONS = ["New", "In Progress", "Closed"];
const SOURCE_OPTIONS = [
    "Year Long Programme", "STEM Labs", "Training", "LMS", "Workshop", "Projects",
    "Website Development", "Internships", "Bootcamps", "Product Selling", "Other"
];

const LeadDetailsModal = ({ lead, role, onClose, onUpdate, loading }) => {
    const [form] = React.useState(null); // Form state will be initialized in child
    const [selectedState, setSelectedState] = useState(lead?.state);
    const [isAssigneeSelectorVisible, setIsAssigneeSelectorVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showActivity, setShowActivity] = useState(false);
    const [descriptionData, setDescriptionData] = useState({
        faqType: "",
        variant: "",
        customFaqType: "",
        customVariant: "",
    });

    const isEmployee = (role || "").toLowerCase() === "employee";

    useEffect(() => {
        if (lead?.description) {
            setDescriptionData({
                faqType: lead.description.faqType || "",
                variant: lead.description.variant || "",
                customFaqType: lead.description.customFaqType || "",
                customVariant: lead.description.customVariant || "",
            });
        }
    }, [lead]);

    // Handle lead assignment
    const handleAssignLead = async (assignees, assignments) => {
        try {
            const updatedLead = {
                ...lead,
                assignees,
                assignments,
                assignedByNames: assignments.map(a => a.assignedByUser?.name).filter(Boolean),
            };
            await onUpdate(updatedLead);
            setIsAssigneeSelectorVisible(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <FiEdit className="text-blue-500" />
                        <span className="font-semibold text-gray-800">{lead.title || (isEmployee ? "View Lead" : "Edit Lead")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tooltip title="View Details">
                            <Button
                                type="text"
                                icon={<FiInfo className="text-blue-500" />}
                                onClick={() => { setShowDetails(!showDetails); setShowActivity(false); }}
                                className="flex items-center"
                            >
                                {showDetails ? "Hide Details" : "Details"}
                            </Button>
                        </Tooltip>
                        <Tooltip title="Activity Timeline">
                            <Button
                                type="text"
                                icon={<FiClock className="text-blue-500" />}
                                onClick={() => { setShowActivity(!showActivity); setShowDetails(false); }}
                                className="flex items-center"
                            >
                                {showActivity ? "Hide Activity" : "Activity"}
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            }
            open={true}
            onCancel={onClose}
            footer={null}
            width={800}
            destroyOnClose
            bodyStyle={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}
        >
            {!showDetails && !showActivity && (
                <LeadSummary
                    lead={lead}
                    isEmployee={isEmployee}
                    descriptionData={descriptionData}
                    setDescriptionData={setDescriptionData}
                    onUpdate={onUpdate}
                    setIsAssigneeSelectorVisible={setIsAssigneeSelectorVisible}
                />
            )}

            {showDetails && (
                <LeadDetailsForm
                    form={form}
                    lead={lead}
                    selectedState={selectedState}
                    setSelectedState={setSelectedState}
                    onSave={onUpdate}
                    isEmployee={isEmployee}
                    SOURCE_OPTIONS={SOURCE_OPTIONS}
                />
            )}

            {showActivity && <LeadActivity lead={lead} />}

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
