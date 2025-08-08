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
import { departmentService } from "../../services/department";
import DepartmentForm from "./DepartmentForm";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [searchForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
  });

  // 获取部门列表
  const fetchDepartments = async (params = {}) => {
    setLoading(true);
    const response = await departmentService.getAllDepartments();
    console.log(response, "response");
    if (response.status) {
      setDepartments(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } else {
      message.error(response.message || "获取部门列表失败");
      setDepartments([]);
    }
    setLoading(false);
  };

  // 搜索部门
  const handleSearch = async (values) => {
    const { dep_id } = values;
    if (!dep_id || dep_id.trim() === "") {
      // 如果搜索条件为空，获取所有部门
      fetchDepartments();
      return;
    }

    setLoading(true);
    const response = await departmentService.getDepartmentById(dep_id.trim());
    if (response.status) {
      setDepartments(response.data ? [response.data] : []);
      setPagination((prev) => ({
        ...prev,
        total: response.data ? 1 : 0,
      }));
      message.success("搜索成功");
    } else {
      message.error(response.message || "搜索失败");
      setDepartments([]);
    }
    setLoading(false);
  };

  // 删除部门
  const handleDelete = async (record) => {
    const response = await departmentService.deleteDepartment(record.dep_id);
    if (response.status) {
      message.success("删除部门成功");
      fetchDepartments(); // 重新加载列表
    } else {
      message.error(response.message || "删除失败");
    }
  };

  // 打开新增模态框
  const handleAdd = () => {
    setModalType("add");
    setCurrentDepartment(null);
    setModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (record) => {
    setModalType("edit");
    setCurrentDepartment(record);
    setModalVisible(true);
  };

  // 关闭模态框
  const handleModalClose = () => {
    setModalVisible(false);
    setCurrentDepartment(null);
  };

  // 表单提交成功回调
  const handleFormSuccess = () => {
    setModalVisible(false);
    setCurrentDepartment(null);
    fetchDepartments(); // 重新加载列表
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
      title: "部门名称",
      dataIndex: "dep_name",
      key: "dep_name",
      width: 150,
    },
    {
      title: "部门描述",
      dataIndex: "dep_describe",
      key: "dep_describe",
      width: 300,
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
    fetchDepartments();
  }, []);

  return (
    <div className="department-management">
      {/* 搜索区域 */}
      <Card title="搜索信息" style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item label="部门ID" name="dep_id">
            <Input placeholder="请输入部门ID" style={{ width: 200 }} />
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
          dataSource={departments}
          loading={loading}
          rowKey="dep_id"
          pagination={pagination}
          onChange={(paginationInfo) => {
            setPagination(paginationInfo);
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={modalType === "add" ? "添加部门" : "编辑部门"}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <DepartmentForm
          type={modalType}
          initialValues={currentDepartment}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default DepartmentManagement;
