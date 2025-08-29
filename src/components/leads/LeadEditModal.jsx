import React from "react";
import { Modal, Form, Input, Select, DatePicker, Button } from "antd";
import { FiEdit } from "react-icons/fi";

const LeadEditModal = ({ showModal, setShowModal, handleEditSubmit, form, loading, SOURCE_OPTIONS }) => {
    
    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <FiEdit className="text-blue-500" />
                    <span className="font-semibold text-gray-800">Edit Lead</span>
                </div>
            }
            open={showModal}
            onCancel={() => setShowModal(false)}
            footer={null}
            width={650}
            destroyOnClose
            forceRender
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleEditSubmit}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                        <Input placeholder="Enter lead title" />
                    </Form.Item>

                    <Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}>
                        <Input placeholder="Enter customer name" />
                    </Form.Item>

                    <Form.Item name="email" label="Email" rules={[{ type: "email", required: true }]}>
                        <Input placeholder="Enter email" prefix={<FiEdit className="text-gray-400" />} />
                    </Form.Item>

                    <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                        <Input placeholder="Enter phone number" prefix={<FiEdit className="text-gray-400" />} />
                    </Form.Item>

                    <Form.Item name="source" label="Service" rules={[{ required: true }]}>
                        <Select placeholder="Select service">
                            {SOURCE_OPTIONS.map((src) => (
                                <Select.Option key={src} value={src}>
                                    {src}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                        <Select placeholder="Select priority">
                            <Select.Option value="High">High</Select.Option>
                            <Select.Option value="Medium">Medium</Select.Option>
                            <Select.Option value="Low">Low</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                        <Select placeholder="Select status">
                            <Select.Option value="New">New</Select.Option>
                            <Select.Option value="In Progress">In Progress</Select.Option>
                            <Select.Option value="Closed">Closed</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>
                </div>

                <Form.Item name="notes" label="Notes">
                    <Input.TextArea rows={3} placeholder="Additional notes..." />
                </Form.Item>

                <div className="flex justify-end gap-3 mt-4">
                    <Button onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Save Changes
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default LeadEditModal;