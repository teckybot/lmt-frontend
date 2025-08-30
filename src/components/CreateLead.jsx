import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DownOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Card,
  Tag,
  Space,
  Row,
  Col,
  Divider,
  Dropdown,
  Menu,
  Modal,
  message,
  Typography,
} from "antd";
import { toast, ToastContainer } from "react-toastify";
import api from "../utils/axiosInstance";
import stateDistrictMap from "../utils/stateDistrictMap.js";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Default variants for FAQ types
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

const CreateLead = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const initialFormState = {
    customerName: "",
    phone: "",
    email: "",
    services: [],
    otherServices: [],
    dueDate: "",
    priority: "Medium",
    description: {
      faqType: "",
      variant: "",
      customFaqType: "",
      customVariant: "",
    },
    state: "",
    district: "",
    location: "",
    assignedTo: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [otherServiceInput, setOtherServiceInput] = useState("");
  const [isOtherModalVisible, setIsOtherModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const priorityOptions = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  const serviceOptions = [
    "Year Long Programme",
    "STEM Labs",
    "Training",
    "LMS",
    "Workshop",
    "Projects",
    "Website Development",
    "Internships",
    "Bootcamps",
    "Product Selling",
    "Other",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  // Fetch users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        message.error("Failed to load users.");
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (name, value) => {
    if (name.startsWith("description.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        description: {
          ...prev.description,
          [key]: value,
        },
      }));
      if (errors.description) setErrors({ ...errors, description: null });
      return;
    }

    if (name === "state") {
      const districts = stateDistrictMap[value]?.districts ?
        Object.keys(stateDistrictMap[value].districts) :
        [];
      setDistrictOptions(districts);
      setFormData((prev) => ({ ...prev, state: value, district: "" }));
      if (errors.state) setErrors({ ...errors, state: null });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleServiceSelection = (service) => {
    if (service === "Other") {
      setIsOtherModalVisible(true);
      return;
    }

    setFormData((prev) => {
      const exists = prev.services.includes(service);
      return {
        ...prev,
        services: exists ?
          prev.services.filter((s) => s !== service) :
          [...prev.services, service],
      };
    });
  };

  const handleAddOtherService = () => {
    if (!otherServiceInput.trim()) {
      message.error("Please enter a service name");
      return;
    }
    if (!formData.otherServices.includes(otherServiceInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        otherServices: [...prev.otherServices, otherServiceInput.trim()],
      }));
    }
    setOtherServiceInput("");
    setIsOtherModalVisible(false);
  };

  const handleCancelOtherModal = () => {
    setOtherServiceInput("");
    setIsOtherModalVisible(false);
  };

  const removeService = (service) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== service),
    }));
  };

  const removeOtherService = (service) => {
    setFormData((prev) => ({
      ...prev,
      otherServices: prev.otherServices.filter((s) => s !== service),
    }));
  };

  const handleFaqTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      description: {
        faqType: value,
        variant: "",
        customFaqType: "",
        customVariant: "",
      },
    }));
  };

  const handleVariantChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      description: {
        ...prev.description,
        variant: value,
        customVariant: value === "Custom" ? prev.description.customVariant : "",
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName) newErrors.customerName = "Customer name is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";
    else {
      const due = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (due < today) newErrors.dueDate = "Due date cannot be in the past";
    }

    if (formData.services.length === 0 && formData.otherServices.length === 0) {
      newErrors.services = "At least one service is required";
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
    setOtherServiceInput("");
    setDistrictOptions([]);
    form.resetFields();
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const allServices = [...formData.services, ...formData.otherServices].join(", ");
      const desc = formData.description;
      let descriptionToSend = null;

      const hasFaq =
        (desc.faqType && desc.faqType !== "") ||
        (desc.customFaqType && desc.customFaqType.trim() !== "") ||
        (desc.variant && desc.variant !== "") ||
        (desc.customVariant && desc.customVariant.trim() !== "");

      if (hasFaq) {
        descriptionToSend = {
          faqType: desc.faqType === "Custom" ? desc.customFaqType || null : desc.faqType || null,
          variant: desc.variant === "Custom" ? desc.customVariant || null : desc.variant || null,
          customFaqType: desc.customFaqType || null,
          customVariant: desc.customVariant || null,
        };
      }

      const payload = {
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email || null,
        source: allServices,
        dueDate: formData.dueDate || null,
        priority: formData.priority || "Medium",
        description: descriptionToSend,
        state: formData.state || null,
        district: formData.district || null,
        location: formData.location || null,
        assignedTo: formData.assignedTo,
      };

      await api.post("/leads", payload);

      toast.success("Lead created successfully!", { autoClose: 3000 });
      resetForm();
    } catch (err) {
      console.error("Create lead error:", err);
      toast.error(
        err.response?.data?.error || err.response?.data?.message || "Error creating lead",
        { autoClose: 4000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Service dropdown menu
  const serviceMenu = (
    <Menu>
      {serviceOptions.map((service) => (
        <Menu.Item
          key={service}
          onClick={(e) => {
            if (service === "Other") {
              e.domEvent.stopPropagation();
            }
            handleServiceSelection(service);
          }}
        >
          <div className="flex items-center">
            {formData.services.includes(service) ? (
              <span className="mr-2">✓</span>
            ) : null}
            {service}
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );

  // Assign To dropdown with user avatars
  const assignToMenu = (
    <Menu>
      {users.map((user) => (
        <Menu.Item
          key={user.id}
          onClick={() => {
            const current = formData.assignedTo;
            const updated = current.includes(user.id)
              ? current.filter(id => id !== user.id)
              : [...current, user.id];
            handleChange("assignedTo", updated);
          }}
        >
          <div className="flex items-center gap-2">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-md border border-gray-300 object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/32?text=U";
                  e.target.className = "w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center border border-gray-300";
                }}
              />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 border border-gray-300">
                <UserOutlined className="text-gray-500" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-gray-500">{user.email}</span>
            </div>
            {formData.assignedTo.includes(user.id) && (
              <span className="ml-auto text-green-500">✓</span>
            )}
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );

  // Show avatar + name + email below the email field
  const getAssignedUserCards = () => {
    return formData.assignedTo
      .map(id => {
        const user = users.find(u => u.id === id);
        return user ? (
          <div key={id} className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-md">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-md border border-gray-300 object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/32?text=U";
                  e.target.className = "w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center border border-gray-300";
                }}
              />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 border border-gray-300">
                <UserOutlined className="text-gray-500 text-xs" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
              <span className="text-xs text-gray-500">{user.email}</span>
            </div>
          </div>
        ) : null;
      })
      .filter(Boolean);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 bg-gray-50 rounded-3xl shadow-xl">
      <div className="mb-4 text-center md:mt-0 mt-16">
        <div className="inline-flex flex-col items-center relative ">
          <Title level={1} className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Create New Lead
          </Title>
          <Text className="text-base text-gray-600 max-w-md leading-relaxed">
            Fill in the details below to create a new lead for your business
          </Text>
        </div>  
      </div>

      <Card
        className=" border-0 rounded-lg bg-gray-50 "
        bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={initialFormState}
        >
          <Row gutter={isMobile ? 0 : 24}>
            {/* Left Column */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Customer Name"
                required
                validateStatus={errors.customerName ? "error" : ""}
                help={errors.customerName}
                className="mb-4"
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  size="large"
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                label="Phone"
                required
                validateStatus={errors.phone ? "error" : ""}
                help={errors.phone}
                className="mb-4"
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  size="large"
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                label="Email"
                validateStatus={errors.email ? "error" : ""}
                help={errors.email}
                className="mb-4"
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  size="large"
                  className="rounded-md"
                />
              </Form.Item>

              {/* Avatar + Name + Email below the Email field */}
              {formData.assignedTo.length > 0 && (
                <div className="mt-2 mb-4">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Assigned Users:</p>
                  <div className="space-y-2">
                    {getAssignedUserCards()}
                  </div>
                </div>
              )}

              <Form.Item label="Location" className="mb-4">
                <Input
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  size="large"
                  className="rounded-md"
                />
              </Form.Item>

              <Row gutter={isMobile ? 0 : 12} className={isMobile ? "space-y-4" : ""}>
                <Col xs={24} sm={12}>
                  <Form.Item label="State" className="mb-4">
                    <Select
                      value={formData.state}
                      onChange={(value) => handleChange("state", value)}
                      size="large"
                      placeholder="Select state"
                      className="rounded-md"
                    >
                      {Object.keys(stateDistrictMap).map((state) => (
                        <Option key={state} value={state}>
                          {state}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="District" className="mb-4">
                    <Select
                      value={formData.district}
                      onChange={(value) => handleChange("district", value)}
                      size="large"
                      placeholder="Select district"
                      disabled={!formData.state}
                      className="rounded-md"
                    >
                      {districtOptions.map((district) => (
                        <Option key={district} value={district}>
                          {district}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            {/* Right Column */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Services"
                required
                validateStatus={errors.services ? "error" : ""}
                help={errors.services}
                className="mb-4"
              >
                <div className="mb-2">
                  <Space wrap>
                    {formData.services.map((service, index) => (
                      <Tag
                        key={index}
                        closable
                        onClose={() => removeService(service)}
                        className="py-1 px-2 rounded-md text-xs border-gray-300 bg-gray-50"
                      >
                        {service}
                      </Tag>
                    ))}
                    {formData.otherServices.map((service, index) => (
                      <Tag
                        key={`other-${index}`}
                        closable
                        onClose={() => removeOtherService(service)}
                        className="py-1 px-2 rounded-md text-xs border-gray-300 bg-gray-50"
                      >
                        {service}
                      </Tag>
                    ))}
                  </Space>
                </div>

                <Dropdown overlay={serviceMenu} trigger={['click']} placement="bottomRight">
                  <Button
                    icon={<PlusOutlined />}
                    size="large"
                    className="w-full text-left rounded-md border-gray-300"
                  >
                    Add Services <DownOutlined />
                  </Button>
                </Dropdown>
              </Form.Item>

              <Form.Item
                label="Due Date"
                required
                validateStatus={errors.dueDate ? "error" : ""}
                help={errors.dueDate}
                className="mb-4"
              >
                <DatePicker
                  className="w-full rounded-md"
                  size="large"
                  placeholder="Select due date"
                  value={formData.dueDate ? dayjs(formData.dueDate) : null}
                  onChange={(date, dateString) => handleChange("dueDate", dateString)}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                  suffixIcon={<CalendarOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <Form.Item label="Priority" className="mb-4">
                <Select
                  value={formData.priority}
                  onChange={(value) => handleChange("priority", value)}
                  size="large"
                  className="rounded-md"
                >
                  {priorityOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Assign To Field */}
              <Form.Item label="Assign To" className="mb-4">
                <Dropdown overlay={assignToMenu} trigger={['click']} placement="bottomRight">
                  <Button
                    icon={<UserOutlined />}
                    size="large"
                    className="w-full text-left flex items-center justify-between rounded-md border-gray-300"
                  >
                    <span>
                      {formData.assignedTo.length > 0
                        ? `${formData.assignedTo.length} user${formData.assignedTo.length > 1 ? 's' : ''} selected`
                        : 'Assign Users'
                      }
                    </span>
                    <DownOutlined />
                  </Button>
                </Dropdown>
              </Form.Item>

              {/* Description */}
              <Form.Item label="Description" className="mb-4">
                <Select
                  value={formData.description.faqType}
                  onChange={handleFaqTypeChange}
                  size="large"
                  placeholder="Select FAQ type"
                  className="rounded-md"
                >
                  <Option value="Mail">Mail</Option>
                  <Option value="Call">Call</Option>
                  <Option value="Visit">Visit</Option>
                  <Option value="Custom">Custom</Option>
                </Select>
              </Form.Item>

              {formData.description.faqType && (
                <>
                  {formData.description.faqType === "Custom" ? (
                    <Form.Item label="Custom FAQ Type" className="mb-4">
                      <Input
                        placeholder="Enter custom FAQ type"
                        value={formData.description.customFaqType}
                        onChange={(e) => handleChange("description.customFaqType", e.target.value)}
                        size="large"
                        className="rounded-md"
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item label="Description Type" className="mb-4">
                      <Select
                        value={formData.description.variant}
                        onChange={handleVariantChange}
                        size="large"
                        placeholder="Select variant"
                        className="rounded-md"
                      >
                        {(faqVariants[formData.description.faqType] || []).map((variant) => (
                          <Option key={variant} value={variant}>
                            {variant}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}

                  {(formData.description.variant === "Custom" || formData.description.faqType === "Custom") && (
                    <Form.Item label="Custom Details" className="mb-4">
                      <TextArea
                        placeholder="Enter custom details"
                        value={formData.description.customVariant}
                        onChange={(e) => handleChange("description.customVariant", e.target.value)}
                        rows={3}
                        className="rounded-md"
                      />
                    </Form.Item>
                  )}
                </>
              )}
            </Col>
          </Row>

          <Divider className="my-6" />

          <Form.Item className="mb-0">
            <div className={`flex ${isMobile ? 'flex-col-reverse space-y-4 space-y-reverse' : 'justify-end space-x-4'}`}>
              <Button
                size="large"
                onClick={() => navigate("/dashboard")}
                disabled={isSubmitting}
                className={`rounded-md ${isMobile ? 'w-full' : ''}`}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isSubmitting}
                icon={<FileTextOutlined />}
                className={`rounded-md ${isMobile ? 'w-full' : ''}`}
              >
                {isSubmitting ? "Creating..." : "Create Lead"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>

      {/* Modal for "Other" service input */}
      <Modal
        title="Add Custom Service"
        open={isOtherModalVisible}
        onOk={handleAddOtherService}
        onCancel={handleCancelOtherModal}
        destroyOnClose={true}
        width={400}
        footer={[
          <Button key="cancel" onClick={handleCancelOtherModal} className="rounded-md">
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddOtherService} className="rounded-md">
            Add Service
          </Button>,
        ]}
      >
        <Input
          placeholder="Enter custom service name"
          value={otherServiceInput}
          onChange={(e) => setOtherServiceInput(e.target.value)}
          autoFocus
          className="rounded-md"
        />
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />
    </div>
  );
};

export default CreateLead;