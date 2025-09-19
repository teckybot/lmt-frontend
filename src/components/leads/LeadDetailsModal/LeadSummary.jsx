import React, { useEffect, useState } from "react";
import { Select, Button, message, Input } from "antd";
import { FiList } from "react-icons/fi";
import LeadComments from "./LeadComments";

const { Option } = Select;
const { TextArea } = Input;

const faqVariants = {
  Mail: ["Mail them with brochure", "Mail them with account's data", "Mail them with poster as an attachment", "Custom"],
  Call: ["Cold call", "Follow-up call", "Product demo call", "Custom"],
  Visit: ["Office visit", "Home visit", "Site inspection", "Custom"],
};

const LeadSummary = ({ lead = {}, isEmployee, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [desc, setDesc] = useState({
    faqType: "",
    variant: "",
    customFaqType: "",
    customVariant: "",
  });

  // initialize from lead.description
  useEffect(() => {
    const d = lead?.description || {};
    const isKnownType = d.faqType && faqVariants[d.faqType];
    setDesc({
      faqType: isKnownType ? d.faqType : d.faqType ? "Custom" : "",
      variant: isKnownType
        ? d.variant && faqVariants[d.faqType].includes(d.variant)
          ? d.variant
          : "Custom"
        : d.variant
        ? "Custom"
        : "",
      customFaqType: !isKnownType ? d.faqType || "" : "",
      customVariant:
        !isKnownType
          ? d.variant || ""
          : d.variant && !faqVariants[d.faqType]?.includes(d.variant)
          ? d.variant
          : "",
    });
  }, [lead]);

  const saveDescription = async () => {
    try {
      setSaving(true);
      const payload = {
        faqType: desc.faqType === "Custom" ? (desc.customFaqType || "").trim() : desc.faqType,
        variant: desc.variant === "Custom" ? (desc.customVariant || "").trim() : desc.variant,
        customFaqType: desc.faqType === "Custom" ? (desc.customFaqType || "").trim() : null,
        customVariant: desc.variant === "Custom" ? (desc.customVariant || "").trim() : null,
      };
      await onUpdate({ ...lead, description: payload });
      setIsEditing(false);
      message.success("Description updated");
    } catch {
      message.error("Failed to update description");
    } finally {
      setSaving(false);
    }
  };

  const renderVariantField = () => {
    if (!desc.faqType) return null;

    if (desc.faqType === "Custom") {
      return (
        <>
          <TextArea
            placeholder="Custom Action"
            value={desc.customFaqType}
            onChange={(e) => setDesc({ ...desc, customFaqType: e.target.value })}
            rows={2}
          />
          <TextArea
            placeholder="Custom Action Type"
            value={desc.customVariant}
            onChange={(e) => setDesc({ ...desc, customVariant: e.target.value })}
            rows={2}
            className="mt-2"
          />
        </>
      );
    }

    const variants = faqVariants[desc.faqType] || [];
    if (desc.variant === "Custom") {
      return (
        <TextArea
          placeholder="Custom Action Type"
          value={desc.customVariant}
          onChange={(e) => setDesc({ ...desc, customVariant: e.target.value })}
          rows={2}
        />
      );
    }
    return (
      <Select
        value={desc.variant}
        onChange={(val) => setDesc({ ...desc, variant: val })}
        className="w-full"
      >
        {variants.map((v) => (
          <Option key={v} value={v}>
            {v}
          </Option>
        ))}
      </Select>
    );
  };

  const displayDescription = () => {
    const action = lead.description?.faqType || "N/A";
    const actionType = lead.description?.variant || "N/A";
    return (
      <>
        <div>
          <span className="font-medium text-gray-700">Action:</span>{" "}
          <span>{action}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Action type:</span>{" "}
          <span>{actionType}</span>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
            <FiList className="text-gray-600" /> Description
          </h3>
          {!isEmployee && (
            <Button type="text" size="small" onClick={() => setIsEditing((v) => !v)}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <Select
                value={desc.faqType}
                onChange={(val) =>
                  setDesc({
                    ...desc,
                    faqType: val,
                    variant: faqVariants[val] ? faqVariants[val][0] : "Custom",
                    customFaqType: val === "Custom" ? "" : "",
                    customVariant: "",
                  })
                }
                className="w-full"
              >
                <Option value="Mail">Mail</Option>
                <Option value="Call">Call</Option>
                <Option value="Visit">Visit</Option>
                <Option value="Custom">Custom</Option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Type
              </label>
              {renderVariantField()}
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button type="primary" onClick={saveDescription} loading={saving}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-2">
            {displayDescription()}
          </div>
        )}
      </div>

      {/* Comments (added below Description) */}
      <div className="mt-4">
        <h4 className="text-md font-semibold mb-2">Comments</h4>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <LeadComments leadId={lead.id} currentUser={lead.assignees?.[0]} />
        </div>
      </div>
    </div>
  );
};

export default LeadSummary;