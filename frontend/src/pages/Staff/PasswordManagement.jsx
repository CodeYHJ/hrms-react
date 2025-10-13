import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Form,
  Input,
  message,
  Modal,
  Tag,
} from "antd";
import {
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { usePermission } from "../../components/Auth/usePermission";
import { PAGINATION_CONFIG, TABLE_CONFIG } from "../../utils/constants";
import { staffService } from "../../services/staff";

const PasswordManagement = () => {
  const [form] = Form.useForm();
  const { hasPermission } = usePermission();

  // 状态管理
  const [passwordList, setPasswordList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pagination, setPagination] = useState({
    ...PAGINATION_CONFIG,
    total: 0,
  });

  // 编辑弹窗状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editingStaff, setEditingStaff] = useState(null);

  // 页面加载时获取密码列表
  useEffect(() => {
    fetchPasswordList();
  }, []);

  // 获取密码列表
  const fetchPasswordList = async (params = {}) => {
    setLoading(true);
    const response = await staffService.password.getAllPasswords(params);

    if (response.status) {
      const data = Array.isArray(response.data) ? response.data : [];
      setPasswordList(data);
      setPagination((prev) => ({
        ...prev,
        total: response.total || data.length,
      }));
    } else {
      message.error(response.message || "获取密码列表失败");
      setPasswordList([]);
    }
    setLoading(false);
  };

  // 搜索密码
  const handleSearch = async (values) => {
    if (!values.staff_id?.trim()) {
      fetchPasswordList();
      return;
    }

    setSearchLoading(true);
    const response = await staffService.password.getPasswordByStaffId(
      values.staff_id.trim()
    );

    if (response.status) {
      const data = Array.isArray(response.data) ? response.data : [];
      setPasswordList(data);
      setPagination((prev) => ({
        ...prev,
        total: response.total || data.length,
        current: 1,
      }));
      message.success("搜索成功");
    } else {
      message.warning(response.message || "未找到相关员工");
      setPasswordList([]);
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
    fetchPasswordList();
  };

  // 编辑密码
  const handleEdit = (record) => {
    setEditingStaff(record);
    editForm.resetFields();
    setEditModalVisible(true);
  };

  // 保存密码修改
  const handleSavePassword = async () => {
    const values = await editForm.validateFields();

    const response = await staffService.password.updatePassword({
      staff_id: editingStaff.staff_id,
      password: values.new_password,
    });

    if (response.status) {
      setEditModalVisible(false);
      setEditingStaff(null);
      fetchPasswordList(); // 重新加载列表
    } else {
      message.error(response.message || "密码修改失败");
    }
  };

  // 表格列配置
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
      width: 150,
    },
    {
      title: "员工姓名",
      dataIndex: "staff_name",
      key: "staff_name",
      width: 150,
    },
    {
      title: "登录密码",
      dataIndex: "Password",
      key: "password",
      width: 150,
      render: () => "*******",
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          {hasPermission("staff.edit") && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              修改密码
            </Button>
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
          <Form.Item name="staff_id" label="员工工号">
            <Input
              placeholder="请输入员工工号"
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
                搜索
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 密码列表 */}
      <Card title="登录密码管理">
        <Table
          {...TABLE_CONFIG}
          columns={columns}
          dataSource={passwordList}
          loading={loading}
          rowKey="id"
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

      {/* 编辑密码弹窗 */}
      <Modal
        title="修改登录密码"
        open={editModalVisible}
        onOk={handleSavePassword}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingStaff(null);
          editForm.resetFields();
        }}
        okText="保存"
        cancelText="取消"
        width={500}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="员工工号">
            <Input value={editingStaff?.staff_id} disabled />
          </Form.Item>
          <Form.Item label="员工姓名">
            <Input value={editingStaff?.staff_name} disabled />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="new_password"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 6, message: "密码长度至少6位" },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="confirm_password"
            dependencies={["new_password"]}
            rules={[
              { required: true, message: "请确认密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("new_password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PasswordManagement;
