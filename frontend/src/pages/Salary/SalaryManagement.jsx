import React, { useState, useEffect } from "react";
import { salaryService } from "../../services/salary";
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
  Tabs,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  DollarOutlined,
  HistoryOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;

const SalaryManagement = () => {
  const [activeTab, setActiveTab] = useState("giving");
  const [salaryList, setSalaryList] = useState([]);
  const [salaryDetails, setSalaryDetails] = useState([]);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [currentSalary, setCurrentSalary] = useState(null);
  const [searchForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
  });

  // 获取工资发放列表
  const fetchSalaryGiving = async () => {
    setLoading(true);
    const response = await salaryService.getAllSalary();

    if (response.status) {
      setSalaryList(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.length || 0,
      }));
    } else {
      message.error(response.message || "获取工资发放列表失败");
      setSalaryList([]);
    }
    setLoading(false);
  };

  // 获取工资套账列表
  const fetchSalaryDetails = async () => {
    setLoading(true);
    const response = await salaryService.getAllSalary();

    if (response.status) {
      setSalaryDetails(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.length || 0,
      }));
    } else {
      message.error(response.message || "获取工资套账列表失败");
      setSalaryDetails([]);
    }
    setLoading(false);
  };

  // 获取工资历史记录
  const fetchSalaryHistory = async () => {
    setLoading(true);
    const response = await salaryService.getAllSalaryRecords();

    if (response.status) {
      setSalaryHistory(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.length || 0,
      }));
    } else {
      message.error(response.message || "获取工资历史记录失败");
      setSalaryHistory([]);
    }
    setLoading(false);
  };

  // 删除工资记录
  const handleDelete = async (record, type) => {
    const response = await salaryService.deleteSalary(record.salary_id);

    if (response.status) {
      if (activeTab === "giving") {
        fetchSalaryGiving();
      } else if (activeTab === "detail") {
        fetchSalaryDetails();
      } else if (activeTab === "history") {
        fetchSalaryHistory();
      }
    }
  };

  // 打开新增模态框
  const handleAdd = () => {
    setModalType("add");
    setCurrentSalary(null);
    setModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (record) => {
    setModalType("edit");
    setCurrentSalary(record);
    setModalVisible(true);
  };

  // 关闭模态框
  const handleModalClose = () => {
    setModalVisible(false);
    setCurrentSalary(null);
  };

  // 表单提交成功回调
  const handleFormSuccess = () => {
    setModalVisible(false);
    setCurrentSalary(null);
    if (activeTab === "giving") {
      fetchSalaryGiving();
    } else if (activeTab === "detail") {
      fetchSalaryDetails();
    } else if (activeTab === "history") {
      fetchSalaryHistory();
    }
  };

  // 工资发放表格列
  const givingColumns = [
    {
      title: "序号",
      key: "index",
      width: 60,
      render: (text, record, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: "员工工号",
      dataIndex: "staff_id",
      key: "staff_id",
      width: 120,
    },
    {
      title: "员工姓名",
      dataIndex: "staff_name",
      key: "staff_name",
      width: 120,
    },
    {
      title: "基本工资",
      dataIndex: "base_salary",
      key: "base_salary",
      width: 120,
      render: (text) => `¥${text}`,
    },
    {
      title: "发放日期",
      dataIndex: "pay_date",
      key: "pay_date",
      width: 150,
      render: (text) => (text ? text.slice(0, 10) : "-"),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (text) => (text === "paid" ? "已发放" : "未发放"),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right",
      render: (text, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除吗？"
            onConfirm={() => handleDelete(record, "giving")}
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

  // 工资套账表格列
  const detailColumns = [
    {
      title: "序号",
      key: "index",
      width: 60,
      render: (text, record, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: "员工工号",
      dataIndex: "staff_id",
      key: "staff_id",
      width: 120,
    },
    {
      title: "员工姓名",
      dataIndex: "staff_name",
      key: "staff_name",
      width: 120,
    },
    {
      title: "基本工资",
      dataIndex: "base_salary",
      key: "base_salary",
      width: 120,
      render: (text) => `¥${text}`,
    },
    {
      title: "绩效工资",
      dataIndex: "performance_salary",
      key: "performance_salary",
      width: 120,
      render: (text) => `¥${text}`,
    },
    {
      title: "创建时间",
      dataIndex: "CreatedAt",
      key: "CreatedAt",
      width: 150,
      render: (text) => (text ? text.slice(0, 10) : "-"),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right",
      render: (text, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除吗？"
            onConfirm={() => handleDelete(record, "detail")}
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

  // 工资历史表格列
  const historyColumns = [
    {
      title: "序号",
      key: "index",
      width: 60,
      render: (text, record, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: "员工工号",
      dataIndex: "staff_id",
      key: "staff_id",
      width: 120,
    },
    {
      title: "员工姓名",
      dataIndex: "staff_name",
      key: "staff_name",
      width: 120,
    },
    {
      title: "发放金额",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (text) => `¥${text}`,
    },
    {
      title: "发放日期",
      dataIndex: "pay_date",
      key: "pay_date",
      width: 150,
      render: (text) => (text ? text.slice(0, 10) : "-"),
    },
    {
      title: "发放类型",
      dataIndex: "pay_type",
      key: "pay_type",
      width: 120,
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      fixed: "right",
      render: (text, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            查看
          </Button>
        </Space>
      ),
    },
  ];

  // 标签页切换
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "giving") {
      fetchSalaryGiving();
    } else if (key === "detail") {
      fetchSalaryDetails();
    } else if (key === "history") {
      fetchSalaryHistory();
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchSalaryGiving();
  }, []);

  return (
    <div className="salary-management">
      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane
            tab={
              <span>
                <DollarOutlined />
                工资发放
              </span>
            }
            key="giving"
          >
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                添加发放记录
              </Button>
            </div>
            <Table
              columns={givingColumns}
              dataSource={salaryList}
              loading={loading}
              rowKey="salary_id"
              pagination={pagination}
              onChange={(paginationInfo) => {
                setPagination(paginationInfo);
              }}
              scroll={{ x: 800 }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined />
                工资套账
              </span>
            }
            key="detail"
          >
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                添加套账
              </Button>
            </div>
            <Table
              columns={detailColumns}
              dataSource={salaryDetails}
              loading={loading}
              rowKey="salary_id"
              pagination={pagination}
              onChange={(paginationInfo) => {
                setPagination(paginationInfo);
              }}
              scroll={{ x: 800 }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                工资历史
              </span>
            }
            key="history"
          >
            <Table
              columns={historyColumns}
              dataSource={salaryHistory}
              loading={loading}
              rowKey="record_id"
              pagination={pagination}
              onChange={(paginationInfo) => {
                setPagination(paginationInfo);
              }}
              scroll={{ x: 800 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={modalType === "add" ? "添加薪资记录" : "编辑薪资记录"}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <SalaryForm
          type={modalType}
          initialValues={currentSalary}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

// 薪资表单组件
const SalaryForm = ({ type, initialValues, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    let response;
    if (type === "add") {
      response = await salaryService.createSalary(values);
    } else {
      response = await salaryService.editSalary(values);
    }

    if (response.status) {
      onSuccess();
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
      <Form.Item
        label="员工工号"
        name="staff_id"
        rules={[{ required: true, message: "请输入员工工号" }]}
      >
        <Input placeholder="请输入员工工号" />
      </Form.Item>

      <Form.Item
        label="基本工资"
        name="base_salary"
        rules={[{ required: true, message: "请输入基本工资" }]}
      >
        <Input type="number" placeholder="请输入基本工资" />
      </Form.Item>

      <Form.Item label="绩效工资" name="performance_salary">
        <Input type="number" placeholder="请输入绩效工资" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {type === "add" ? "添加" : "保存"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default SalaryManagement;
