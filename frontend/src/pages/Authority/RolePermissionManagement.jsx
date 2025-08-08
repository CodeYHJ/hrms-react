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
  Tree,
  Switch,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../components/Auth/AuthContext";
import { usePermission } from "../../components/Auth/usePermission";
import { USER_TYPES } from "../../utils/constants";

const { TreeNode } = Tree;

const RolePermissionManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // 权限树结构
  const permissionTree = [
    {
      title: '员工管理',
      key: 'staff',
      children: [
        { title: '查看员工', key: 'staff.view' },
        { title: '添加员工', key: 'staff.create' },
        { title: '编辑员工', key: 'staff.edit' },
        { title: '删除员工', key: 'staff.delete' },
      ],
    },
    {
      title: '部门管理',
      key: 'department',
      children: [
        { title: '查看部门', key: 'department.view' },
        { title: '添加部门', key: 'department.create' },
        { title: '编辑部门', key: 'department.edit' },
        { title: '删除部门', key: 'department.delete' },
      ],
    },
    {
      title: '职级管理',
      key: 'rank',
      children: [
        { title: '查看职级', key: 'rank.view' },
        { title: '添加职级', key: 'rank.create' },
        { title: '编辑职级', key: 'rank.edit' },
        { title: '删除职级', key: 'rank.delete' },
      ],
    },
    {
      title: '考勤管理',
      key: 'attendance',
      children: [
        { title: '查看考勤', key: 'attendance.view' },
        { title: '上报考勤', key: 'attendance.create' },
        { title: '审批考勤', key: 'attendance.approve' },
      ],
    },
    {
      title: '薪资管理',
      key: 'salary',
      children: [
        { title: '查看薪资', key: 'salary.view' },
        { title: '发放薪资', key: 'salary.create' },
        { title: '编辑薪资', key: 'salary.edit' },
      ],
    },
    {
      title: '招聘管理',
      key: 'recruitment',
      children: [
        { title: '查看招聘', key: 'recruitment.view' },
        { title: '创建招聘', key: 'recruitment.create' },
        { title: '编辑招聘', key: 'recruitment.edit' },
      ],
    },
    {
      title: '考试管理',
      key: 'exam',
      children: [
        { title: '查看考试', key: 'exam.view' },
        { title: '创建考试', key: 'exam.create' },
        { title: '编辑考试', key: 'exam.edit' },
      ],
    },
    {
      title: '通知管理',
      key: 'notification',
      children: [
        { title: '查看通知', key: 'notification.view' },
        { title: '创建通知', key: 'notification.create' },
        { title: '编辑通知', key: 'notification.edit' },
        { title: '删除通知', key: 'notification.delete' },
      ],
    },
    {
      title: '权限管理',
      key: 'authority',
      children: [
        { title: '查看权限', key: 'authority.view' },
        { title: '管理角色', key: 'authority.role' },
        { title: '管理管理员', key: 'authority.admin' },
      ],
    },
  ];

  // 角色数据
  useEffect(() => {
    fetchRoles();
  }, []);

  // 获取角色列表
  const fetchRoles = async () => {
    setLoading(true);
    // 模拟数据，实际应该从后端获取
    const mockRoles = [
      {
        id: 1,
        name: '超级管理员',
        code: 'supersys',
        description: '系统最高权限管理员',
        permissions: ['staff.view', 'staff.create', 'staff.edit', 'staff.delete', 'department.view', 'department.create', 'department.edit', 'department.delete', 'rank.view', 'rank.create', 'rank.edit', 'rank.delete', 'attendance.view', 'attendance.create', 'attendance.approve', 'salary.view', 'salary.create', 'salary.edit', 'recruitment.view', 'recruitment.create', 'recruitment.edit', 'exam.view', 'exam.create', 'exam.edit', 'notification.view', 'notification.create', 'notification.edit', 'notification.delete', 'authority.view', 'authority.role', 'authority.admin'],
        status: true,
      },
      {
        id: 2,
        name: '系统管理员',
        code: 'sys',
        description: '系统管理员',
        permissions: ['staff.view', 'staff.create', 'staff.edit', 'department.view', 'department.create', 'department.edit', 'rank.view', 'rank.create', 'rank.edit', 'attendance.view', 'attendance.approve', 'salary.view', 'salary.create', 'recruitment.view', 'recruitment.create', 'exam.view', 'exam.create', 'notification.view', 'notification.create', 'notification.edit', 'authority.view'],
        status: true,
      },
      {
        id: 3,
        name: '普通员工',
        code: 'normal',
        description: '普通员工角色',
        permissions: ['staff.view', 'attendance.view', 'attendance.create', 'salary.view', 'notification.view'],
        status: true,
      },
    ];
    setRoles(mockRoles);
    setLoading(false);
  };

  // 打开权限配置弹窗
  const handleEditPermissions = (role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions || []);
    setModalVisible(true);
  };

  // 保存权限配置
  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    // 模拟保存操作
    const updatedRoles = roles.map(role => {
      if (role.id === selectedRole.id) {
        return {
          ...role,
          permissions: selectedPermissions,
        };
      }
      return role;
    });
    setRoles(updatedRoles);
    setModalVisible(false);
    message.success('权限配置保存成功');
  };

  // 树节点选择事件
  const onTreeCheck = (checkedKeys) => {
    setSelectedPermissions(checkedKeys);
  };

  // 表格列定义
  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '角色描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: '权限数量',
      key: 'permissionCount',
      width: 100,
      render: (text, record) => {
        return record.permissions ? record.permissions.length : 0;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (text, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditPermissions(record)}
          >
            配置权限
          </Button>
        </Space>
      ),
    },
  ];

  // 渲染权限树
  const renderPermissionTree = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} selectable={false}>
            {renderPermissionTree(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.title} key={item.key} selectable={false} />;
    });
  };

  return (
    <div className="role-permission-management">
      <Card title="角色权限管理" style={{ marginBottom: 16 }}>
        {/* 表格区域 */}
        <Card>
          <Table
            columns={columns}
            dataSource={roles}
            loading={loading}
            rowKey="id"
            scroll={{ x: 800 }}
          />
        </Card>
      </Card>

      {/* 权限配置弹窗 */}
      <Modal
        title={`配置角色权限 - ${selectedRole?.name || ''}`}
        visible={modalVisible}
        onOk={handleSavePermissions}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <p>选择该角色可以访问的权限：</p>
        </div>
        <Tree
          checkable
          checkedKeys={selectedPermissions}
          onCheck={onTreeCheck}
          defaultExpandAll
        >
          {renderPermissionTree(permissionTree)}
        </Tree>
        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Space>
            <span>已选择权限数量: {selectedPermissions.length}</span>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default RolePermissionManagement;