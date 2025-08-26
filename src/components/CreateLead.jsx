import { useState, useEffect } from "react";
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

const { Title } = Typography;
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
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [otherServiceInput, setOtherServiceInput] = useState("");
  const [isOtherModalVisible, setIsOtherModalVisible] = useState(false);

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
      const districts = stateDistrictMap[value]?.districts
        ? Object.keys(stateDistrictMap[value].districts)
        : [];
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
        services: exists
          ? prev.services.filter((s) => s !== service)
          : [...prev.services, service],
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

  return (
    <div className="max-w-6xl mx-auto">
      <Card
        className="rounded-xl shadow-md"
      >
        <Title level={2} className="text-center mb-8">
          Create New Lead
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={initialFormState}
        >
          <Row gutter={24}>
            {/* Left Column */}
            <Col xs={24} md={12}>
              {/* Customer Name */}
              <Form.Item
                label="Customer Name"
                required
                validateStatus={errors.customerName ? "error" : ""}
                help={errors.customerName}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Customer Name"
                  value={formData.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  size="large"
                />
              </Form.Item>

              {/* Phone */}
              <Form.Item
                label="Phone"
                required
                validateStatus={errors.phone ? "error" : ""}
                help={errors.phone}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  size="large"
                />
              </Form.Item>

              {/* Email */}
              <Form.Item
                label="Email"
                validateStatus={errors.email ? "error" : ""}
                help={errors.email}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  size="large"
                />
              </Form.Item>

              {/* Services */}
              <Form.Item
                label="Services"
                required
                validateStatus={errors.services ? "error" : ""}
                help={errors.services}
              >
                <div className="mb-2">
                  <Space wrap>
                    {formData.services.map((service, index) => (
                      <Tag
                        key={index}
                        closable
                        onClose={() => removeService(service)}
                        color="blue"
                        className="py-1 px-2 rounded-2xl"
                      >
                        {service}
                      </Tag>
                    ))}
                    {formData.otherServices.map((service, index) => (
                      <Tag
                        key={`other-${index}`}
                        closable
                        onClose={() => removeOtherService(service)}
                        color="purple"
                        className="py-1 px-2 rounded-2xl"
                      >
                        {service}
                      </Tag>
                    ))}
                  </Space>
                </div>

                <Dropdown
                  overlay={serviceMenu}
                  trigger={['click']}
                  open={isOtherModalVisible ? false : undefined}
                >
                  <Button
                    icon={<PlusOutlined />}
                    size="large"
                    className="w-full text-left"
                  >
                    Select Services <DownOutlined />
                  </Button>
                </Dropdown>
              </Form.Item>
            </Col>

            {/* Right Column */}
            <Col xs={24} md={12}>
              {/* Due Date */}
              <Form.Item
                label="Due Date"
                required
                validateStatus={errors.dueDate ? "error" : ""}
                help={errors.dueDate}
              >
                <DatePicker
                  className="w-full"
                  size="large"
                  placeholder="Select due date"
                  value={formData.dueDate ? dayjs(formData.dueDate) : null}
                  onChange={(date, dateString) => handleChange("dueDate", dateString)}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                  suffixIcon={<CalendarOutlined />}
                />
              </Form.Item>

              {/* Priority */}
              <Form.Item label="Priority">
                <Select
                  value={formData.priority}
                  onChange={(value) => handleChange("priority", value)}
                  size="large"
                >
                  {priorityOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* State and District */}
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="State">
                    <Select
                      value={formData.state}
                      onChange={(value) => handleChange("state", value)}
                      size="large"
                      placeholder="Select state"
                    >
                      {Object.keys(stateDistrictMap).map((state) => (
                        <Option key={state} value={state}>
                          {state}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="District">
                    <Select
                      value={formData.district}
                      onChange={(value) => handleChange("district", value)}
                      size="large"
                      placeholder="Select district"
                      disabled={!formData.state}
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

              {/* Location */}
              <Form.Item label="Location">
                <Input
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  size="large"
                />
              </Form.Item>

              {/* FAQ Type */}
              <Form.Item label="Description">
                <Select
                  value={formData.description.faqType}
                  onChange={handleFaqTypeChange}
                  size="large"
                  placeholder="Select FAQ type"
                >
                  <Option value="Mail">Mail</Option>
                  <Option value="Call">Call</Option>
                  <Option value="Visit">Visit</Option>
                  <Option value="Custom">Custom</Option>
                </Select>
              </Form.Item>

              {/* FAQ Variant or Custom Inputs */}
              {formData.description.faqType && (
                <>
                  {formData.description.faqType === "Custom" ? (
                    <Form.Item label="Custom FAQ Type">
                      <Input
                        placeholder="Enter custom FAQ type"
                        value={formData.description.customFaqType}
                        onChange={(e) => handleChange("description.customFaqType", e.target.value)}
                        size="large"
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item label="Description type">
                      <Select
                        value={formData.description.variant}
                        onChange={handleVariantChange}
                        size="large"
                        placeholder="Select variant"
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
                    <Form.Item label="Custom Details">
                      <TextArea
                        placeholder="Enter custom details"
                        value={formData.description.customVariant}
                        onChange={(e) => handleChange("description.customVariant", e.target.value)}
                        rows={3}
                      />
                    </Form.Item>
                  )}
                </>
              )}
            </Col>
          </Row>

          <Divider />

          {/* Buttons */}
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button
                size="large"
                onClick={() => navigate("/dashboard")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isSubmitting}
                icon={<FileTextOutlined />}
              >
                {isSubmitting ? "Creating..." : "Create Lead"}
              </Button>
            </Space>
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
      >
        <Input
          placeholder="Enter custom service name"
          value={otherServiceInput}
          onChange={(e) => setOtherServiceInput(e.target.value)}
        />
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />
    </div>
  );
};

export default CreateLead;