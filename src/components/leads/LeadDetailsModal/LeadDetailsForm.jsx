import React from "react";
import { Form, Input, Select, DatePicker, Button, Card } from "antd";
import dayjs from "dayjs";
import stateDistrictMap from "../../../utils/stateDistrictMap";

const { Option } = Select;

const LeadDetailsForm = ({ form, lead, selectedState, setSelectedState, onSave, isEmployee, SOURCE_OPTIONS = [] }) => {
    const disabledDate = (current) => current && current < dayjs().startOf('day');

    return (
        <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Lead Details</h3>
                <p className="text-sm text-gray-500 mt-1">Update information about this lead</p>
            </div>
            
            <div className="p-6">
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
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Name */}
                        <Form.Item 
                            name="customerName" 
                            label={
                                <span className="font-medium text-gray-700 flex items-center">
                                    Customer Name
                                    <span className="ml-1 text-red-500">*</span>
                                </span>
                            } 
                            rules={[{ required: true, message: "Customer Name is required" }]}
                        >
                            <Input 
                                disabled={isEmployee}
                                placeholder="Enter customer name"
                                className={`w-full h-11 px-4 rounded-lg border ${
                                    isEmployee ? 'bg-gray-50' : 'bg-white'
                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                            />
                        </Form.Item>

                        {/* Email */}
                        <Form.Item 
                            name="email" 
                            label={<span className="font-medium text-gray-700">Email</span>}
                            rules={[{ type: 'email', message: 'Enter a valid email' }]}
                        >
                            <Input 
                                disabled={isEmployee}
                                placeholder="example@email.com"
                                className={`w-full h-11 px-4 rounded-lg border ${
                                    isEmployee ? 'bg-gray-50' : 'bg-white'
                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                            />
                        </Form.Item>

                        {/* Phone */}
                        <Form.Item 
                            name="phone" 
                            label={
                                <span className="font-medium text-gray-700 flex items-center">
                                    Phone Number
                                    <span className="ml-1 text-red-500">*</span>
                                </span>
                            }
                            rules={[{ required: true, message: "Phone is required" }]}
                        >
                            <Input 
                                disabled={isEmployee}
                                placeholder="+91 XXXXXXXXXX"
                                className={`w-full h-11 px-4 rounded-lg border ${
                                    isEmployee ? 'bg-gray-50' : 'bg-white'
                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                            />
                        </Form.Item>

                        {/* Service/Source */}
                        <Form.Item 
                            name="source" 
                            label={
                                <span className="font-medium text-gray-700 flex items-center">
                                    Service
                                    <span className="ml-1 text-red-500">*</span>
                                </span>
                            }
                            rules={[{ required: true, message: "Service is required" }]}
                        >
                            <Select 
                                disabled={isEmployee}
                                placeholder="Select service"
                                className="w-full h-11"
                                dropdownClassName="rounded-lg"
                            >
                                {Array.isArray(SOURCE_OPTIONS) && SOURCE_OPTIONS.map(src => (
                                    <Option key={src} value={src} className="py-2">
                                        <div className="flex items-center">
                                            <span className="ml-2">{src}</span>
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* State */}
                        <Form.Item 
                            name="state" 
                            label={<span className="font-medium text-gray-700">State</span>}
                        >
                            <Select
                                disabled={isEmployee}
                                placeholder="Select State"
                                onChange={value => {
                                    setSelectedState(value);
                                    form.setFieldsValue({ district: undefined });
                                }}
                                className="w-full h-11"
                                dropdownClassName="rounded-lg"
                            >
                                {Object.keys(stateDistrictMap).map(state => (
                                    <Option key={state} value={state} className="py-2">
                                        {state}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* District */}
                        <Form.Item 
                            name="district" 
                            label={<span className="font-medium text-gray-700">District</span>}
                        >
                            <Select 
                                disabled={isEmployee || !selectedState} 
                                placeholder="Select District"
                                className="w-full h-11"
                                dropdownClassName="rounded-lg"
                            >
                                {selectedState && Object.keys(stateDistrictMap[selectedState]?.districts || {}).map(district => (
                                    <Option key={district} value={district} className="py-2">
                                        {district}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* Location */}
                        <Form.Item 
                            name="location" 
                            label={<span className="font-medium text-gray-700">Location</span>}
                        >
                            <Input 
                                disabled={isEmployee}
                                placeholder="Enter specific location"
                                className={`w-full h-11 px-4 rounded-lg border ${
                                    isEmployee ? 'bg-gray-50' : 'bg-white'
                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                            />
                        </Form.Item>

                        {/* Due Date */}
                        <Form.Item 
                            name="dueDate" 
                            label={<span className="font-medium text-gray-700">Due Date</span>}
                        >
                            <DatePicker 
                                disabledDate={disabledDate} 
                                disabled={isEmployee} 
                                className="w-full h-11 px-4 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                format="DD-MM-YYYY"
                                placeholder="Select due date"
                            />
                        </Form.Item>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                        <Button 
                            onClick={() => form.resetFields()}
                            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-all duration-200"
                        >
                            Cancel
                        </Button>
                        {!isEmployee && (
                            <Button 
                                type="primary" 
                                htmlType="submit"
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Save Changes
                            </Button>
                        )}
                    </div>
                </Form>
            </div>
        </Card>
    );
};

export default LeadDetailsForm;