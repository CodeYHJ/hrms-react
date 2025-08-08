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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { rankService } from "../../services/rank";

const RankManagement = () => {
  const [ranks, setRanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [currentRank, setCurrentRank] = useState(null);
  const [searchForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
  });

  // 获取职级列表
  const fetchRanks = async (params = {}) => {
    setLoading(true);
    const response = await rankService.getAllRanks();

    if (response.status) {
      setRanks(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.length || 0,
      }));
    } else {
      setRanks([]);
    }
    setLoading(false);
  };

  // 搜索职级
  const handleSearch = async (values) => {
    const { rank_id } = values;
    if (!rank_id || rank_id.trim() === "") {
      fetchRanks();
      return;
    }

    setLoading(true);
    const response = await rankService.getRankById(rank_id.trim());

    if (response.status) {
      setRanks(response.data ? [response.data] : []);
      setPagination((prev) => ({
        ...prev,
        total: response.data ? 1 : 0,
      }));
    } else {
      setRanks([]);
    }
    setLoading(false);
  };

  // 删除职级
  const handleDelete = async (record) => {
    const response = await rankService.deleteRank(record.rank_id);

    if (response.status) {
      fetchRanks(); // 重新加载列表
    }
  };

  // 打开新增模态框
  const handleAdd = () => {
    setModalType("add");
    setCurrentRank(null);
    setModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (record) => {
    setModalType("edit");
    setCurrentRank(record);
    setModalVisible(true);
  };

  // 关闭模态框
  const handleModalClose = () => {
    setModalVisible(false);
    setCurrentRank(null);
  };

  // 表单提交成功回调
  const handleFormSuccess = () => {
    setModalVisible(false);
    setCurrentRank(null);
    fetchRanks(); // 重新加载列表
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
      title: "职级ID",
      dataIndex: "rank_id",
      key: "rank_id",
      width: 150,
    },
    {
      title: "职级名称",
      dataIndex: "rank_name",
      key: "rank_name",
      width: 250,
    },
    {
      title: "创建时间",
      dataIndex: "CreatedAt",
      key: "CreatedAt",
      width: 150,
      render: (text) => (text ? text.slice(0, 10) : "-"),
    },
    {
      title: "更新时间",
      dataIndex: "UpdatedAt",
      key: "UpdatedAt",
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
    fetchRanks();
  }, []);

  return (
    <div className="rank-management">
      {/* 搜索区域 */}
      <Card title="搜索信息" style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item label="职级ID" name="rank_id">
            <Input placeholder="请输入职级ID" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              搜索
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 表格区域 */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={ranks}
          loading={loading}
          rowKey="rank_id"
          pagination={pagination}
          onChange={(paginationInfo) => {
            setPagination(paginationInfo);
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={modalType === "add" ? "添加职级" : "编辑职级"}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <RankForm
          type={modalType}
          initialValues={currentRank}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

// 职级表单组件
const RankForm = ({ type, initialValues, onSuccess, onCancel }) => {
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
      response = await rankService.createRank(values);
    } else {
      response = await rankService.editRank(values);
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
        label="职级ID"
        name="rank_id"
        rules={[{ required: true, message: "请输入职级ID" }]}
      >
        <Input placeholder="请输入职级ID" disabled={type === "edit"} />
      </Form.Item>

      <Form.Item
        label="职级名称"
        name="rank_name"
        rules={[{ required: true, message: "请输入职级名称" }]}
      >
        <Input placeholder="请输入职级名称" />
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

export default RankManagement;
