/*
  File: components/LeadDetailsModal/LeadDetailsForm.js
  Grid layout for form fields (side-by-side)
*/

import React from "react";
import { Form, Input, Select, DatePicker, Button } from "antd";
import dayjs from "dayjs";
import stateDistrictMap from "../../../utils/stateDistrictMap";

const { Option } = Select;

const LeadDetailsForm = ({ form, lead, selectedState, setSelectedState, onSave, isEmployee, SOURCE_OPTIONS = [] }) => {
    const disabledDate = (current) => current && current < dayjs().startOf('day');

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                customerName: lead.customerName,
                email: lead.email,
                phone: lead.phone,
                source: lead.source,
                state: lead.state,
                district: lead.district,
                location: lead.location,
                dueDate: lead.dueDate ? dayjs(lead.dueDate) : null,
            }}
            onFinish={onSave}
            className="space-y-4"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item name="customerName" label="Customer Name" rules={[{ required: true, message: "Customer Name is required" }]}>
                    <Input disabled={isEmployee} />
                </Form.Item>

                <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Enter a valid email' }]}>
                    <Input disabled={isEmployee} />
                </Form.Item>

                <Form.Item name="phone" label="Phone" rules={[{ required: true, message: "Phone is required" }]}>
                    <Input disabled={isEmployee} />
                </Form.Item>

                <Form.Item name="source" label="Service" rules={[{ required: true, message: "Service is required" }]}>
                    <Select disabled={isEmployee} placeholder="Select service">
                        {Array.isArray(SOURCE_OPTIONS) && SOURCE_OPTIONS.map(src => (
                            <Option key={src} value={src}>{src}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="state" label="State">
                    <Select
                        disabled={isEmployee}
                        placeholder="Select State"
                        onChange={value => {
                            setSelectedState(value);
                            form.setFieldsValue({ district: undefined });
                        }}
                    >
                        {Object.keys(stateDistrictMap).map(state => (
                            <Option key={state} value={state}>{state}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="district" label="District">
                    <Select disabled={isEmployee || !selectedState} placeholder="Select District">
                        {selectedState && Object.keys(stateDistrictMap[selectedState]?.districts || {}).map(district => (
                            <Option key={district} value={district}>{district}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="location" label="Location">
                    <Input disabled={isEmployee} />
                </Form.Item>

                <Form.Item name="dueDate" label="Due Date">
                    <DatePicker disabledDate={disabledDate} disabled={isEmployee} className="w-full" format="DD-MM-YYYY" />
                </Form.Item>
            </div>

            <div className="flex justify-end gap-3 mt-2">
                <Button onClick={() => form.resetFields()}>Cancel</Button>
                {!isEmployee && <Button type="primary" htmlType="submit">Save</Button>}
            </div>
        </Form>
    );
};

export default LeadDetailsForm;
