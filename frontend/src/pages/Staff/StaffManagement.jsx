import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  message,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { usePermission } from "../../components/Auth/usePermission";
import { staffService } from "../../services/staff";
import { useNavigate } from "react-router-dom";
import StaffForm from "./StaffForm";

const { Search } = Input;

const StaffManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
  });

  const { hasPermission } = usePermission();
  const navigate = useNavigate();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // 格式化性别
  const formatGender = (sex) => {
    switch (sex) {
      case 1:
        return "男";
      case 2:
        return "女";
      default:
        return "未知";
    }
  };

  // 初始化数据加载
  useEffect(() => {
    loadData();
  }, []);

  // 加载数据
  const loadData = async (params = {}) => {
    setLoading(true);
    const {
      current = pagination.current,
      pageSize = pagination.pageSize,
      search = searchValue,
    } = params;
    const response = await staffService.list({
      page: current,
      size: pageSize,
      search,
    });
    setData(response.data.data || []);
    setPagination((prev) => ({
      ...prev,
      current,
      pageSize,
      total: response.data.total || 0,
    }));
    setLoading(false);
  };
  // 处理表格变化
  const handleTableChange = (pagination, filters, sorter) => {
    loadData({ current: pagination.current, pageSize: pagination.pageSize });
  };

  // 搜索员工
  const handleSearch = (value) => {
    setSearchValue(value);
    loadData({ search: value });
  };

  // 编辑员工
  const handleEdit = (record) => {
    setSelectedStaff(record);
    setEditModalVisible(true);
  };

  // 查看详情
  const handleViewDetail = (record) => {
    setSelectedStaff(record);
    setDetailModalVisible(true);
  };

  // 转正
  const handlePromote = (record) => {
    Modal.confirm({
      title: "确认转正",
      content: `确定将员工 ${record.staff_name} 转为正式员工？`,
      onOk: async () => {
        try {
          await staffService.promote(record.staff_id);
          message.success("转正成功");
          loadData();
        } catch (error) {
          message.error("转正失败：" + error.message);
        }
      },
    });
  };

  // 调岗
  const handleTransfer = (record) => {
    navigate("/staff/transfer", { state: { staffId: record.staff_id } });
  };

  // 离职
  const handleResign = (record) => {
    Modal.confirm({
      title: "确认离职",
      content: `确定将员工 ${record.staff_name} 标记为离职？`,
      onOk: async () => {
        try {
          await staffService.resign(record.staff_id);
          message.success("离职成功");
          loadData();
        } catch (error) {
          message.error("离职失败：" + error.message);
        }
      },
    });
  };

  // 删除
  const handleDelete = (record) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定删除员工 ${record.staff_name}？此操作不可撤销。`,
      onOk: async () => {
        try {
          await staffService.deleteStaff(record.staff_id);
          message.success("删除成功");
          loadData();
        } catch (error) {
          message.error("删除失败：" + error.message);
        }
      },
    });
  };

  // 表格列定义
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
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {hasPermission("update") && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )}
          {hasPermission("update") && record.status === 0 && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handlePromote(record)}
            >
              转正
            </Button>
          )}
          {hasPermission("update") && record.status !== 2 && (
            <Button
              type="primary"
              size="small"
              icon={<SwapOutlined />}
              onClick={() => handleTransfer(record)}
            >
              调岗
            </Button>
          )}
          {hasPermission("update") && record.status !== 2 && (
            <Button
              type="danger"
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleResign(record)}
            >
              离职
            </Button>
          )}
          {hasPermission("delete") && (
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
  console.log(data, "data");
  return (
    <div className="layui-container layuimini-container">
      <div className="layui-main layuimini-main">
        <Card title="员工管理">
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Search
                placeholder="请输入员工姓名"
                onSearch={handleSearch}
                loading={searchLoading}
                style={{ width: 200 }}
              />
            </Space>
          </div>
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            rowKey="staff_id"
            scroll={{ x: "max-content" }}
          />
        </Card>

        <StaffForm
          visible={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onSuccess={() => {
            setEditModalVisible(false);
            loadData();
          }}
          editData={selectedStaff}
        />

        <StaffForm
          visible={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          onSuccess={() => setDetailModalVisible(false)}
          editData={selectedStaff}
          isReadOnly={true}
        />
      </div>
    </div>
  );
};

export default StaffManagement;
