import React, { useState, useEffect } from "react";
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
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BookOutlined,
  HistoryOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { TabPane } = Tabs;

const ExamManagement = () => {
  const [activeTab, setActiveTab] = useState("manage");
  const [examList, setExamList] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [currentExam, setCurrentExam] = useState(null);
  const [searchForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
  });

  // 获取考试列表
  const fetchExamList = async () => {
    setLoading(true);
    const response = await api.get('/example/query/all');
    
    if (response.status) {
      setExamList(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.length || 0,
      }));
    } else {
      message.error(response.message || "获取考试列表失败");
      setExamList([]);
    }
    setLoading(false);
  };

  // 获取考试历史记录
  const fetchExamHistory = async () => {
    setLoading(true);
    const response = await api.get('/example_score/query_by_name/all');
    
    if (response.status) {
      setExamHistory(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.length || 0,
      }));
    } else {
      message.error(response.message || "获取考试历史记录失败");
      setExamHistory([]);
    }
    setLoading(false);
  };

  // 删除考试
  const handleDelete = async (record, type) => {
    const response = await api.delete(`/example/delete/${record.example_id}`);
    
    if (response.status) {
      message.success("删除成功");
      if (activeTab === "manage") {
        fetchExamList();
      } else if (activeTab === "history") {
        fetchExamHistory();
      }
    } else {
      message.error(response.message || "删除失败");
    }
  };

  // 开始考试
  const handleStartExam = (record) => {
    window.open(`/example/render_example/${record.example_id}`, '_blank');
  };

  // 打开新增模态框
  const handleAdd = () => {
    setModalType("add");
    setCurrentExam(null);
    setModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (record) => {
    setModalType("edit");
    setCurrentExam(record);
    setModalVisible(true);
  };

  // 关闭模态框
  const handleModalClose = () => {
    setModalVisible(false);
    setCurrentExam(null);
  };

  // 表单提交成功回调
  const handleFormSuccess = () => {
    setModalVisible(false);
    setCurrentExam(null);
    if (activeTab === "manage") {
      fetchExamList();
    } else if (activeTab === "history") {
      fetchExamHistory();
    }
  };

  // 考试管理表格列
  const examColumns = [
    {
      title: "序号",
      key: "index",
      width: 60,
      render: (text, record, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: "考试名称",
      dataIndex: "example_name",
      key: "example_name",
      width: 200,
    },
    {
      title: "考试描述",
      dataIndex: "example_describe",
      key: "example_describe",
      width: 300,
      ellipsis: true,
    },
    {
      title: "创建时间",
      dataIndex: "CreatedAt",
      key: "CreatedAt",
      width: 150,
      render: (text) => (text ? text.slice(0, 10) : "-"),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (text) => (
        <Tag color={text === "active" ? "green" : "orange"}>
          {text === "active" ? "启用" : "禁用"}
        </Tag>
      ),
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
            icon={<PlayCircleOutlined />}
            onClick={() => handleStartExam(record)}
          >
            开始考试
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
            onConfirm={() => handleDelete(record, "manage")}
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

  // 考试历史表格列
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
      title: "考试名称",
      dataIndex: "example_name",
      key: "example_name",
      width: 200,
    },
    {
      title: "考生姓名",
      dataIndex: "staff_name",
      key: "staff_name",
      width: 120,
    },
    {
      title: "得分",
      dataIndex: "score",
      key: "score",
      width: 100,
      render: (text) => <Tag color="blue">{text}分</Tag>,
    },
    {
      title: "考试时间",
      dataIndex: "exam_time",
      key: "exam_time",
      width: 150,
      render: (text) => (text ? text.slice(0, 19) : "-"),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (text) => (
        <Tag color={text === "completed" ? "green" : "orange"}>
          {text === "completed" ? "已完成" : "进行中"}
        </Tag>
      ),
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
    if (key === "manage") {
      fetchExamList();
    } else if (key === "history") {
      fetchExamHistory();
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchExamList();
  }, []);

  return (
    <div className="exam-management">
      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane
            tab={
              <span>
                <BookOutlined />
                考试信息
              </span>
            }
            key="manage"
          >
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                添加考试
              </Button>
            </div>
            <Table
              columns={examColumns}
              dataSource={examList}
              loading={loading}
              rowKey="example_id"
              pagination={pagination}
              onChange={(paginationInfo) => {
                setPagination(paginationInfo);
              }}
              scroll={{ x: 1000 }}
            />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                考试历史
              </span>
            }
            key="history"
          >
            <Table
              columns={historyColumns}
              dataSource={examHistory}
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
        title={modalType === "add" ? "添加考试" : "编辑考试"}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <ExamForm
          type={modalType}
          initialValues={currentExam}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

// 考试表单组件
const ExamForm = ({ type, initialValues, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    const response = await api.post(`/example/${type === "add" ? "create" : "edit"}`, values);
    
    if (response.status) {
      message.success(type === "add" ? "添加成功" : "编辑成功");
      onSuccess();
    } else {
      message.error(response.message || "操作失败");
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
        label="考试名称"
        name="example_name"
        rules={[{ required: true, message: "请输入考试名称" }]}
      >
        <Input placeholder="请输入考试名称" />
      </Form.Item>
      
      <Form.Item
        label="考试描述"
        name="example_describe"
        rules={[{ required: true, message: "请输入考试描述" }]}
      >
        <Input.TextArea placeholder="请输入考试描述" rows={4} />
      </Form.Item>
      
      <Form.Item
        label="考试内容"
        name="example_content"
        rules={[{ required: true, message: "请输入考试内容" }]}
      >
        <Input.TextArea placeholder="请输入考试内容（JSON格式）" rows={6} />
      </Form.Item>
      
      <Form.Item
        label="状态"
        name="status"
        initialValue="active"
      >
        <select>
          <option value="active">启用</option>
          <option value="inactive">禁用</option>
        </select>
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

export default ExamManagement;