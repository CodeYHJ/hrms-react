import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  message,
  Input,
  Form,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { examService } from "../../services/exam";

const { Search } = Input;

const ExamInfo = () => {
  const [examList, setExamList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [currentExam, setCurrentExam] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
  });

  // 获取考试列表
  const fetchExamList = async (searchValue = "") => {
    setLoading(true);
    const response = await (searchValue ? examService.searchExamByName(searchValue) : examService.getAllExams());
      
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

  // 删除考试
  const handleDelete = async (record) => {
    const response = await examService.deleteExam(record.example_id);
      
    if (response.status) {
      message.success("删除成功");
      fetchExamList(searchValue);
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
    fetchExamList(searchValue);
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
      title: "考试ID",
      dataIndex: "example_id",
      key: "example_id",
      width: 150,
      hidden: true,
    },
    {
      title: "考试名称",
      dataIndex: "name",
      key: "name",
      width: 250,
    },
    {
      title: "考试介绍",
      dataIndex: "describe",
      key: "describe",
      width: 250,
      ellipsis: true,
    },
    {
      title: "限制时间(分钟)",
      dataIndex: "limit",
      key: "limit",
      width: 130,
      fixed: 'right',
    },
    {
      title: "考试日期",
      dataIndex: "date",
      key: "date",
      width: 130,
      fixed: 'right',
      render: (text) => (text ? text.slice(0, 10) : "-"),
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
            onClick={() => handleStartExam(record)}
          >
            考试
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 根据权限过滤列
  const filteredColumns = examColumns.filter((col) => !col.hidden);

  // 搜索功能
  const handleSearch = (value) => {
    setSearchValue(value);
    fetchExamList(value);
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchExamList();
  }, []);

  return (
    <div>
      <div className="layuimini-container">
        <div className="layuimini-main">
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Form layout="inline">
                <Form.Item label="考试名称">
                  <Search
                    placeholder="请输入考试名称"
                    allowClear
                    enterButton={<SearchOutlined />}
                    loading={searchLoading}
                    onSearch={handleSearch}
                    style={{ width: 250 }}
                  />
                </Form.Item>
              </Form>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  添加考试
                </Button>
              </div>
            </div>

            <Table
              columns={filteredColumns}
              dataSource={examList}
              loading={loading}
              rowKey="example_id"
              pagination={pagination}
              onChange={(paginationInfo) => {
                setPagination(paginationInfo);
              }}
              scroll={{ x: 1000 }}
              bordered
              size="middle"
            />
          </Card>
        </div>
      </div>

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
    const response = await (type === "add" ? examService.createExam(values) : examService.editExam(values));
      
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
        name="name"
        rules={[{ required: true, message: "请输入考试名称" }]}
      >
        <Input placeholder="请输入考试名称" />
      </Form.Item>
      
      <Form.Item
        label="考试介绍"
        name="describe"
        rules={[{ required: true, message: "请输入考试介绍" }]}
      >
        <Input.TextArea placeholder="请输入考试介绍" rows={4} />
      </Form.Item>
      
      <Form.Item
        label="限制时间(分钟)"
        name="limit"
        rules={[{ required: true, message: "请输入限制时间" }]}
      >
        <Input type="number" placeholder="请输入限制时间" />
      </Form.Item>
      
      <Form.Item
        label="考试日期"
        name="date"
        rules={[{ required: true, message: "请输入考试日期" }]}
      >
        <Input type="date" placeholder="请输入考试日期" />
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

export default ExamInfo;