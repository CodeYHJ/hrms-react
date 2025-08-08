import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { usePermission } from "../../components/Auth/usePermission";
import { PAGINATION_CONFIG, TABLE_CONFIG } from "../../utils/constants";
import { salaryService } from "../../services/salary";

const { Search } = Input;

const SalaryDetail = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pagination, setPagination] = useState({
    ...PAGINATION_CONFIG,
    total: 0,
  });

  const { hasPermission } = usePermission();

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
      title: "基本工资",
      dataIndex: "base",
      key: "base",
      width: 100,
      render: (text) => `¥${text}`,
    },
    {
      title: "住房补贴",
      dataIndex: "subsidy",
      key: "subsidy",
      width: 100,
      render: (text) => `¥${text}`,
    },
    {
      title: "绩效奖金",
      dataIndex: "bonus",
      key: "bonus",
      width: 100,
      render: (text) => `¥${text}`,
    },
    {
      title: "提成薪资",
      dataIndex: "commission",
      key: "commission",
      width: 100,
      render: (text) => `¥${text}`,
    },
    {
      title: "其他薪资",
      dataIndex: "other",
      key: "other",
      width: 100,
      render: (text) => `¥${text}`,
    },
    {
      title: "五险一金",
      dataIndex: "fund",
      key: "fund",
      width: 100,
      render: (fund) => {
        if (fund === 1) {
          return <span style={{ color: "green" }}>缴纳</span>;
        }
        return <span style={{ color: "red" }}>不缴纳</span>;
      },
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          {hasPermission("salary.update") && (
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )}
          {hasPermission("salary.delete") && (
            <Popconfirm
              title="确认删除吗？"
              onConfirm={() => handleDelete(record.salary_id)}
              okText="确定"
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
          )}
        </Space>
      ),
    },
  ];

  // 加载工资套账数据
  const loadData = async (staffId = null) => {
    setLoading(true);
    const response = await salaryService.getAllSalary(staffId);

    if (response.status) {
      const listData = Array.isArray(response.data) ? response.data : [];
      setData(listData);
      setPagination((prev) => ({
        ...prev,
        total: response.total || listData.length,
      }));
    } else {
      message.error(response.data || "数据加载失败");
      setData([]);
    }
    setLoading(false);
  };

  // 初始化加载
  useEffect(() => {
    loadData();
  }, []);

  // 搜索
  const handleSearch = async (values) => {
    const { staff_id } = values;
    setSearchLoading(true);
    await loadData(staff_id);
    if (staff_id) {
      message.success("搜索成功");
    }
    setSearchLoading(false);
  };

  // 重置
  const handleReset = () => {
    form.resetFields();
    loadData();
  };

  // 编辑
  const handleEdit = (record) => {
    localStorage.setItem("salary_edit_info", JSON.stringify(record));
    window.open("/views/salary_detail_edit.html", "_blank");
  };

  // 删除
  const handleDelete = async (salaryId) => {
    const response = await salaryService.deleteSalary(salaryId);

    if (response.status) {
      loadData(); // 重新加载数据
    }
  };

  // 添加
  const handleAdd = () => {
    window.open("/views/salary_detail_add.html", "_blank");
  };

  // 刷新数据
  const handleRefresh = () => {
    loadData();
  };

  // 分页变化
  const handleTableChange = (paginationInfo) => {
    setPagination(paginationInfo);
  };

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

      {/* 工资套账列表 */}
      <Card
        title="工资套账管理"
        extra={
          <Space>
            {hasPermission("salary.create") && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                添加套账
              </Button>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          {...TABLE_CONFIG}
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="salary_id"
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
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default SalaryDetail;
