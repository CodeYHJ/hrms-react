import React, { useState, useEffect } from "react";
import { notificationService } from "../../services/notification";
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
  Tag,
  DatePicker,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  NotificationOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

const NotificationManagement = () => {
  const [notificationList, setNotificationList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [currentNotification, setCurrentNotification] = useState(null);
  const [searchForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
  });

  // 获取通知列表
  const fetchNotificationList = async (params = {}) => {
    setLoading(true);
    const response = await notificationService.getAllNotifications();

    if (response.status) {
      setNotificationList(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.length || 0,
      }));
    } else {
      message.error(response.message || "获取通知列表失败");
      setNotificationList([]);
    }
    setLoading(false);
  };

  // 搜索通知
  const handleSearch = async (values) => {
    const { title, status, date_range } = values;
    setLoading(true);
    // 这里应该根据搜索条件过滤数据
    let filteredList = [...notificationList];

    if (title) {
      filteredList = filteredList.filter((item) =>
        item.title?.toLowerCase().includes(title.toLowerCase())
      );
    }

    if (status) {
      filteredList = filteredList.filter((item) => item.status === status);
    }

    if (date_range && date_range.length === 2) {
      const [start, end] = date_range;
      filteredList = filteredList.filter((item) => {
        const itemDate = dayjs(item.CreatedAt);
        return itemDate.isAfter(start) && itemDate.isBefore(end);
      });
    }

    setNotificationList(filteredList);
    setPagination((prev) => ({
      ...prev,
      total: filteredList.length,
      current: 1,
    }));

    message.success("搜索成功");
    setLoading(false);
  };

  // 删除通知
  const handleDelete = async (record) => {
    const response = await notificationService.deleteNotification(
      record.notification_id
    );

    if (response.status) {
      fetchNotificationList(); // 重新加载列表
    }
  };

  // 查看通知详情
  const handleView = (record) => {
    Modal.info({
      title: "通知详情",
      width: 800,
      content: (
        <div style={{ marginTop: 16 }}>
          <h3>{record.title}</h3>
          <p style={{ color: "#666", marginBottom: 16 }}>
            发布时间:{" "}
            {record.CreatedAt
              ? dayjs(record.CreatedAt).format("YYYY-MM-DD HH:mm:ss")
              : "-"}
          </p>
          <div
            style={{
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {record.content}
          </div>
        </div>
      ),
    });
  };

  // 打开新增模态框
  const handleAdd = () => {
    setModalType("add");
    setCurrentNotification(null);
    setModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (record) => {
    setModalType("edit");
    setCurrentNotification(record);
    setModalVisible(true);
  };

  // 关闭模态框
  const handleModalClose = () => {
    setModalVisible(false);
    setCurrentNotification(null);
  };

  // 表单提交成功回调
  const handleFormSuccess = () => {
    setModalVisible(false);
    setCurrentNotification(null);
    fetchNotificationList(); // 重新加载列表
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    fetchNotificationList();
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
      title: "通知标题",
      dataIndex: "notice_title",
      key: "title",
      width: 250,
      ellipsis: true,
    },
    {
      title: "通知类型",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (text) => {
        const typeMap = {
          system: "系统通知",
          hr: "人事通知",
          company: "公司通知",
          other: "其他",
        };
        return typeMap[text] || text;
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (text) => (
        <Tag color={text === "published" ? "green" : "orange"}>
          {text === "published" ? "已发布" : "草稿"}
        </Tag>
      ),
    },
    {
      title: "发布时间",
      dataIndex: "CreatedAt",
      key: "CreatedAt",
      width: 180,
      render: (text) =>
        text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      fixed: "right",
      render: (text, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
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
            title="确认删除吗？"
            onConfirm={() => handleDelete(record)}
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
    fetchNotificationList();
  }, []);

  return (
    <div className="notification-management">
      {/* 搜索区域 */}
      <Card title="搜索信息" style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item label="通知标题" name="title">
            <Input placeholder="请输入通知标题" style={{ width: 200 }} />
          </Form.Item>

          <Form.Item label="状态" name="status">
            <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
              <Option value="published">已发布</Option>
              <Option value="draft">草稿</Option>
            </Select>
          </Form.Item>

          <Form.Item label="发布时间" name="date_range">
            <RangePicker style={{ width: 300 }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
              >
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 表格区域 */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加通知
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={notificationList}
          loading={loading}
          rowKey="notification_id"
          pagination={pagination}
          onChange={(paginationInfo) => {
            setPagination(paginationInfo);
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={modalType === "add" ? "添加通知" : "编辑通知"}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        destroyOnClose
      >
        <NotificationForm
          type={modalType}
          initialValues={currentNotification}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

// 通知表单组件
const NotificationForm = ({ type, initialValues, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        publish_date: initialValues.CreatedAt
          ? dayjs(initialValues.CreatedAt)
          : null,
      });
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    const response = await (type === "add"
      ? notificationService.createNotification(values)
      : notificationService.editNotification(values));

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
        label="通知标题"
        name="title"
        rules={[{ required: true, message: "请输入通知标题" }]}
      >
        <Input placeholder="请输入通知标题" />
      </Form.Item>

      <Form.Item
        label="通知类型"
        name="type"
        rules={[{ required: true, message: "请选择通知类型" }]}
        initialValue="company"
      >
        <Select placeholder="请选择通知类型">
          <Option value="system">系统通知</Option>
          <Option value="hr">人事通知</Option>
          <Option value="company">公司通知</Option>
          <Option value="other">其他</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="通知内容"
        name="content"
        rules={[{ required: true, message: "请输入通知内容" }]}
      >
        <Input.TextArea placeholder="请输入通知内容" rows={8} />
      </Form.Item>

      <Form.Item
        label="状态"
        name="status"
        rules={[{ required: true, message: "请选择状态" }]}
        initialValue="draft"
      >
        <Select placeholder="请选择状态">
          <Option value="draft">草稿</Option>
          <Option value="published">发布</Option>
        </Select>
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

export default NotificationManagement;
