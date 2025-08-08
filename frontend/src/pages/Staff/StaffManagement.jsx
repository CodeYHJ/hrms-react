import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Space,
  Form,
  Input,
  Row,
  Col,
  message,
  Modal,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { staffService } from "../../services/staff";
import { usePermission } from "../../components/Auth/usePermission";
import { formatDate, formatGender } from "../../utils/helpers";
import { PAGINATION_CONFIG, TABLE_CONFIG } from "../../utils/constants";
import StaffForm from "./StaffForm";

const StaffManagement = () => {
  const [form] = Form.useForm();
  const { hasPermission } = usePermission();

  // 状态管理
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pagination, setPagination] = useState({
    ...PAGINATION_CONFIG,
    total: 0,
  });

  // 表单相关状态
  const [formVisible, setFormVisible] = useState(false);
  const [editData, setEditData] = useState(null);

  // 页面加载时获取员工列表
  useEffect(() => {
    fetchStaffList();
  }, []);

  // 获取员工列表
  const fetchStaffList = async (params = {}) => {
    setLoading(true);
    const response = await staffService.getAllStaff(params);
    if (response.status) {
      const data = Array.isArray(response.data) ? response.data : [];
      setStaffList(data);
      setPagination((prev) => ({
        ...prev,
        total: data.length,
      }));
    } else {
      // 错误已在拦截器中显示，这里不需要重复显示
    }
    setLoading(false);
  };

  // 搜索员工
  const handleSearch = async (values) => {
    if (!values.staff_name?.trim()) {
      // 如果搜索框为空，重新加载所有数据
      fetchStaffList();
      return;
    }

    setSearchLoading(true);
    const response = await staffService.searchStaffByName(
      values.staff_name.trim()
    );
    if (response.status) {
      const data = Array.isArray(response.data) ? response.data : [];
      setStaffList(data);
      setPagination((prev) => ({
        ...prev,
        total: data.length,
        current: 1,
      }));
    } else {
      // 错误已在拦截器中显示
      setStaffList([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
        current: 1,
      }));
    }
    setSearchLoading(false);
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    fetchStaffList();
  };

  // 查看员工详情
  const handleView = (record) => {
    Modal.info({
      title: "员工详情",
      width: 600,
      content: (
        <div style={{ marginTop: 16 }}>
          <Row gutter={[16, 8]}>
            <Col span={8}>
              <strong>员工工号:</strong>
            </Col>
            <Col span={16}>{record.staff_id}</Col>
            <Col span={8}>
              <strong>员工姓名:</strong>
            </Col>
            <Col span={16}>{record.staff_name}</Col>
            <Col span={8}>
              <strong>部门:</strong>
            </Col>
            <Col span={16}>{record.dep_name || "未分配"}</Col>
            <Col span={8}>
              <strong>职级:</strong>
            </Col>
            <Col span={16}>{record.rank_name || "未分配"}</Col>
            <Col span={8}>
              <strong>上级工号:</strong>
            </Col>
            <Col span={16}>{record.leader_staff_id || "无"}</Col>
            <Col span={8}>
              <strong>上级姓名:</strong>
            </Col>
            <Col span={16}>{record.leader_name || "无"}</Col>
            <Col span={8}>
              <strong>出生日期:</strong>
            </Col>
            <Col span={16}>{formatDate(record.birthday)}</Col>
            <Col span={8}>
              <strong>性别:</strong>
            </Col>
            <Col span={16}>{formatGender(record.sex)}</Col>
            <Col span={8}>
              <strong>身份证号:</strong>
            </Col>
            <Col span={16}>{record.identity_num}</Col>
            <Col span={8}>
              <strong>民族:</strong>
            </Col>
            <Col span={16}>{record.nation}</Col>
            <Col span={8}>
              <strong>学校:</strong>
            </Col>
            <Col span={16}>{record.school}</Col>
            <Col span={8}>
              <strong>专业:</strong>
            </Col>
            <Col span={16}>{record.major}</Col>
            <Col span={8}>
              <strong>学历:</strong>
            </Col>
            <Col span={16}>{record.edu_level}</Col>
            <Col span={8}>
              <strong>基本工资:</strong>
            </Col>
            <Col span={16}>¥{record.base_salary}</Col>
            <Col span={8}>
              <strong>银行卡号:</strong>
            </Col>
            <Col span={16}>{record.card_num}</Col>
            <Col span={8}>
              <strong>邮箱:</strong>
            </Col>
            <Col span={16}>{record.email}</Col>
            <Col span={8}>
              <strong>联系电话:</strong>
            </Col>
            <Col span={16}>{record.phone}</Col>
            <Col span={8}>
              <strong>入职日期:</strong>
            </Col>
            <Col span={16}>{formatDate(record.entry_date)}</Col>
          </Row>
        </div>
      ),
    });
  };

  // 编辑员工
  const handleEdit = (record) => {
    setEditData(record);
    setFormVisible(true);
  };

  // 删除员工
  const handleDelete = async (record) => {
    const response = await staffService.deleteStaff(record.staff_id);
    if (response.status) {
      fetchStaffList(); // 重新加载列表
    }
  };

  // 添加员工
  const handleAdd = () => {
    setEditData(null);
    setFormVisible(true);
  };

  // 表单操作成功回调
  const handleFormSuccess = () => {
    setFormVisible(false);
    setEditData(null);
    fetchStaffList(); // 重新加载列表
  };

  // 表单取消回调
  const handleFormCancel = () => {
    setFormVisible(false);
    setEditData(null);
  };

  // 导出Excel
  const handleExport = async () => {
    message.loading("正在导出...", 0);
    const response = await staffService.exportExcel();

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `员工列表_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    message.destroy();
    message.success("导出成功");
  };

  // 表格列配置 - 严格按照原有staff_manage.html的列配置
  const columns = [
    {
      title: "序号",
      key: "index",
      width: 60,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "员工工号",
      dataIndex: "staff_id",
      key: "staff_id",
      width: 100,
    },
    {
      title: "员工姓名",
      dataIndex: "staff_name",
      key: "staff_name",
      width: 100,
    },
    {
      title: "上级工号",
      dataIndex: "leader_staff_id",
      key: "leader_staff_id",
      width: 100,
      render: (text) => text || "",
    },
    {
      title: "上级姓名",
      dataIndex: "leader_name",
      key: "leader_name",
      width: 100,
      render: (text) => text || "",
    },
    {
      title: "出生日期",
      dataIndex: "birthday",
      key: "birthday",
      width: 150,
      render: (date) => (date ? date.slice(0, 10) : ""), // 严格按照原有逻辑
    },
    {
      title: "身份证号",
      dataIndex: "identity_num",
      key: "identity_num",
      width: 180,
    },
    {
      title: "性别",
      dataIndex: "sex",
      key: "sex",
      width: 60,
      render: (sex) => formatGender(sex),
    },
    {
      title: "民族",
      dataIndex: "nation",
      key: "nation",
      width: 60,
    },
    {
      title: "毕业院校",
      dataIndex: "school",
      key: "school",
      minWidth: 150,
      ellipsis: true,
    },
    {
      title: "毕业专业",
      dataIndex: "major",
      key: "major",
      minWidth: 150,
      ellipsis: true,
    },
    {
      title: "最高学历",
      dataIndex: "edu_level",
      key: "edu_level",
      minWidth: 150,
    },
    {
      title: "基本工资",
      dataIndex: "base_salary",
      key: "base_salary",
      minWidth: 150,
    },
    {
      title: "银行卡号",
      dataIndex: "card_num",
      key: "card_num",
      minWidth: 180,
      ellipsis: true,
    },
    {
      title: "职位名称",
      dataIndex: "rank_name",
      key: "rank_name",
      minWidth: 150,
      render: (text) => text || "",
    },
    {
      title: "部门名称",
      dataIndex: "dep_name",
      key: "dep_name",
      minWidth: 150,
      render: (text) => text || "",
    },
    {
      title: "电子邮箱",
      dataIndex: "email",
      key: "email",
      minWidth: 170,
      ellipsis: true,
    },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
      width: 150,
    },
    {
      title: "入职时间",
      dataIndex: "entry_date",
      key: "entry_date",
      minWidth: 150,
      render: (date) => (date ? date.slice(0, 10) : ""), // 严格按照原有逻辑
    },
    {
      title: "操作",
      key: "action",
      minWidth: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          {hasPermission("staff.edit") && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )}
          {hasPermission("staff.delete") && (
            <Popconfirm
              title="确认删除吗？"
              onConfirm={() => handleDelete(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 搜索区域 */}
      <Card className="search-form" style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="staff_name" label="员工姓名">
            <Input
              placeholder="请输入员工姓名"
              allowClear
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                loading={searchLoading}
              >
                搜 索
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重 置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 员工列表 */}
      <Card
        title="员工列表"
        extra={
          <Space>
            {hasPermission("staff.create") && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                添加
              </Button>
            )}
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出Excel
            </Button>
          </Space>
        }
      >
        <Table
          {...TABLE_CONFIG}
          columns={columns}
          dataSource={staffList}
          loading={loading}
          rowKey="staff_id"
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize: pageSize,
              }));
            },
          }}
        />
      </Card>

      {/* 员工表单弹窗 */}
      <StaffForm
        visible={formVisible}
        editData={editData}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    </div>
  );
};

export default StaffManagement;
