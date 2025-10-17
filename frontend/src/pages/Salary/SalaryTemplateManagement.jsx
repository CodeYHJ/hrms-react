import React, { useState, useEffect } from "react";
import { 
  getSalaryTemplatesV2, 
  createSalaryTemplateV2, 
  updateSalaryTemplateV2, 
  deleteSalaryTemplateV2,
  toggleTemplateStatusV2
} from "../../services/api";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  message,
  Popconfirm,
  Input,
  Form,
  Select,
  Tag,
  Switch,
  Divider,
  Row,
  Col,
  InputNumber,
  Tooltip
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PercentageOutlined,
  DollarOutlined,
  MinusOutlined
} from "@ant-design/icons";

const { Option } = Select;

const SalaryTemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
  });

  // 获取薪资模板列表
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await getSalaryTemplatesV2({
        page: pagination.current,
        page_size: pagination.pageSize
      });

      if (response.status) {
        setTemplates(response.data?.templates || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data?.total || 0,
        }));
      } else {
        message.error(response.message || "获取薪资模板列表失败");
        setTemplates([]);
      }
    } catch (error) {
      message.error("获取薪资模板列表失败");
      setTemplates([]);
    }
    setLoading(false);
  };

  // 删除薪资模板
  const handleDelete = async (templateId) => {
    try {
      const response = await deleteSalaryTemplateV2(templateId);
      if (response.status) {
        message.success("删除成功");
        fetchTemplates();
      } else {
        message.error(response.message || "删除失败");
      }
    } catch (error) {
      message.error("删除失败");
    }
  };

  // 切换模板状态
  const handleToggleStatus = async (templateId) => {
    try {
      const response = await toggleTemplateStatusV2(templateId);
      if (response.status) {
        message.success("状态切换成功");
        fetchTemplates();
      } else {
        message.error(response.message || "状态切换失败");
      }
    } catch (error) {
      message.error("状态切换失败");
    }
  };

  // 打开新增模态框
  const handleAdd = () => {
    setModalType("add");
    setCurrentTemplate(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (template) => {
    setModalType("edit");
    setCurrentTemplate(template);
    form.setFieldsValue({
      ...template,
      items: template.items || []
    });
    setModalVisible(true);
  };

  // 关闭模态框
  const handleModalClose = () => {
    setModalVisible(false);
    setCurrentTemplate(null);
    form.resetFields();
  };

  // 表单提交
  const handleFormSubmit = async (values) => {
    try {
      let response;
      if (modalType === "add") {
        response = await createSalaryTemplateV2(values);
      } else {
        response = await updateSalaryTemplateV2({
          ...values,
          id: currentTemplate.id
        });
      }

      if (response.status) {
        message.success(modalType === "add" ? "创建成功" : "更新成功");
        handleModalClose();
        fetchTemplates();
      } else {
        message.error(response.message || "操作失败");
      }
    } catch (error) {
      message.error("操作失败");
    }
  };

  // 表格列定义
  const columns = [
    {
      title: "序号",
      key: "index",
      width: 60,
      render: (text, record, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: "模板名称",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "模板描述",
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: true,
    },
    {
      title: "适用职级",
      dataIndex: "rank_ids",
      key: "rank_ids",
      width: 120,
      render: (rankIds) => (
        <span>
          {rankIds && rankIds.length > 0 
            ? `适用${rankIds.length}个职级` 
            : "不限职级"}
        </span>
      ),
    },
    {
      title: "适用部门",
      dataIndex: "department_ids",
      key: "department_ids",
      width: 120,
      render: (departmentIds) => (
        <span>
          {departmentIds && departmentIds.length > 0 
            ? `适用${departmentIds.length}个部门` 
            : "不限部门"}
        </span>
      ),
    },
    {
      title: "模板项目",
      dataIndex: "items",
      key: "items",
      width: 150,
      render: (items) => (
        <Tooltip 
          title={items?.map(item => `${item.name}: ${item.calculation_type === 'percentage' ? item.value + '%' : '¥' + item.value}`).join(', ')}
        >
          <span>{items?.length || 0} 个项目</span>
        </Tooltip>
      ),
    },
    {
      title: "状态",
      dataIndex: "is_active",
      key: "is_active",
      width: 100,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record.id)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (text) => (text ? text.slice(0, 10) : "-"),
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      fixed: "right",
      render: (text, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleEdit(record)}
          >
            查看
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除该模板吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 组件挂载时获取数据
  useEffect(() => {
    fetchTemplates();
  }, [pagination.current, pagination.pageSize]);

  return (
    <div className="salary-template-management">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新建模板
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={templates}
          loading={loading}
          rowKey="id"
          pagination={pagination}
          onChange={(paginationInfo) => {
            setPagination(paginationInfo);
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={modalType === "add" ? "新建薪资模板" : "编辑薪资模板"}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        destroyOnClose
      >
        <SalaryTemplateForm
          form={form}
          type={modalType}
          onFinish={handleFormSubmit}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

// 薪资模板表单组件
const SalaryTemplateForm = ({ form, type, onFinish, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  // 添加模板项目
  const addItem = () => {
    setItems([...items, {
      id: Date.now(),
      name: "",
      calculation_type: "fixed",
      value: 0,
      is_addition: true
    }]);
  };

  // 删除模板项目
  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // 更新模板项目
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // 表单提交
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = {
        ...values,
        items: items.filter(item => item.name && item.value > 0)
      };
      await onFinish(formData);
    } catch (error) {
      message.error("提交失败");
    }
    setLoading(false);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="模板名称"
            name="name"
            rules={[{ required: true, message: "请输入模板名称" }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="模板描述"
            name="description"
            rules={[{ required: true, message: "请输入模板描述" }]}
          >
            <Input placeholder="请输入模板描述" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="适用职级"
            name="rank_ids"
          >
            <Select
              mode="multiple"
              placeholder="请选择适用职级（不选表示不限）"
              allowClear
            >
              {/* 职级选项将在实际使用时从API获取 */}
              <Option value="1">初级员工</Option>
              <Option value="2">中级员工</Option>
              <Option value="3">高级员工</Option>
              <Option value="4">经理</Option>
              <Option value="5">总监</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="适用部门"
            name="department_ids"
          >
            <Select
              mode="multiple"
              placeholder="请选择适用部门（不选表示不限）"
              allowClear
            >
              {/* 部门选项将在实际使用时从API获取 */}
              <Option value="1">技术部</Option>
              <Option value="2">销售部</Option>
              <Option value="3">市场部</Option>
              <Option value="4">人事部</Option>
              <Option value="5">财务部</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">模板项目配置</Divider>
      
      <div style={{ marginBottom: 16 }}>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addItem}
          block
        >
          添加薪资项目
        </Button>
      </div>

      {items.map((item, index) => (
        <Row key={item.id} gutter={8} style={{ marginBottom: 12 }}>
          <Col span={6}>
            <Input
              placeholder="项目名称"
              value={item.name}
              onChange={(e) => updateItem(index, 'name', e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Select
              value={item.calculation_type}
              onChange={(value) => updateItem(index, 'calculation_type', value)}
            >
              <Option value="fixed">固定金额</Option>
              <Option value="percentage">百分比</Option>
            </Select>
          </Col>
          <Col span={4}>
            <InputNumber
              placeholder="数值"
              value={item.value}
              onChange={(value) => updateItem(index, 'value', value)}
              min={0}
              max={item.calculation_type === 'percentage' ? 100 : 999999}
              style={{ width: '100%' }}
              addonAfter={item.calculation_type === 'percentage' ? '%' : '¥'}
            />
          </Col>
          <Col span={4}>
            <Select
              value={item.is_addition}
              onChange={(value) => updateItem(index, 'is_addition', value)}
            >
              <Option value={true}>
                <PlusOutlined /> 加项
              </Option>
              <Option value={false}>
                <MinusOutlined /> 减项
              </Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              danger
              onClick={() => removeItem(index)}
              block
            >
              删除
            </Button>
          </Col>
        </Row>
      ))}

      <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {type === "add" ? "创建" : "保存"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default SalaryTemplateManagement;