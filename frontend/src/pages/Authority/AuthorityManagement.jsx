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
  Select,
  Row,
  Col,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../components/Auth/AuthContext";
import { usePermission } from "../../components/Auth/usePermission";
import { USER_TYPES } from "../../utils/constants";
import { staffService } from "../../services/staff";

const AuthorityManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
  });

  const { user } = useAuth();
  const { isSuperAdmin } = usePermission();

  // 获取员工列表
  const fetchStaffList = async (params = {}) => {
    setLoading(true);
    const response = await staffService.getAllStaff();

    if (response.status) {
      setStaffList(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.length || 0,
      }));
    } else {
      message.error(response.message || "获取员工列表失败");
      setStaffList([]);
    }
    setLoading(false);
  };

  // 设置管理员
  const handleSetAdmin = async (record) => {
    const response = await staffService.authority.setAdmin(record.staff_id);

    if (response.status) {
      fetchStaffList();
    }
  };

  // 设置普通用户
  const handleSetNormal = async (record) => {
    const response = await staffService.authority.setNormal(record.staff_id);

    if (response.status) {
      fetchStaffList();
    }
  };

  // 搜索员工
  const handleSearch = async (values) => {
    const { keyword } = values;
    if (!keyword || keyword.trim() === "") {
      fetchStaffList();
      return;
    }

    setLoading(true);
    const response = await staffService.searchStaffByName(keyword.trim());

    if (response.status) {
      setStaffList(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.length || 0,
      }));
      message.success("搜索成功");
    } else {
      message.error(response.message || "搜索失败");
      setStaffList([]);
    }
    setLoading(false);
  };

  // 获取用户类型标签
  const getUserTypeTag = (userType) => {
    switch (userType) {
      case "超级管理员":
        return <Tag color="red">超级管理员</Tag>;
      case "系统管理员":
        return <Tag color="orange">系统管理员</Tag>;
      case "普通员工":
        return <Tag color="blue">普通员工</Tag>;
      default:
        return <Tag color="default">未知</Tag>;
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
      title: "所属部门",
      dataIndex: "dep_name",
      key: "dep_name",
      width: 150,
    },
    {
      title: "职级",
      dataIndex: "rank_name",
      key: "rank_name",
      width: 120,
    },
    {
      title: "用户类型",
      dataIndex: "user_type_name",
      key: "user_type_name",
      width: 120,
      render: (text, record) => getUserTypeTag(text),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      fixed: "right",
      render: (text, record) => (
        <Space size="small">
          {record.user_type_name !== "超级管理员" && (
            <>
              {record.user_type_name !== "系统管理员" && (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleSetAdmin(record)}
                >
                  设为管理员
                </Button>
              )}
              {record.user_type_name !== "普通员工" && (
                <Button
                  type="default"
                  size="small"
                  onClick={() => handleSetNormal(record)}
                >
                  设为普通员工
                </Button>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  // 组件挂载时获取数据
  useEffect(() => {
    fetchStaffList();
  }, []);

  return (
    <div className="authority-management">
      <Card title="管理员管理" style={{ marginBottom: 16 }}>
        {/* 搜索区域 */}
        <Card title="搜索信息" style={{ marginBottom: 16 }}>
          <Form form={searchForm} layout="inline" onFinish={handleSearch}>
            <Form.Item label="关键词" name="keyword">
              <Input placeholder="请输入员工姓名" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
              >
                搜索
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* 表格区域 */}
        <Card>
          <Table
            columns={columns}
            dataSource={staffList}
            loading={loading}
            rowKey="staff_id"
            pagination={pagination}
            onChange={(paginationInfo) => {
              setPagination(paginationInfo);
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </Card>
    </div>
  );
};

export default AuthorityManagement;
