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
  EyeOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { usePermission } from "../../components/Auth/usePermission";
import { PAGINATION_CONFIG, TABLE_CONFIG } from "../../utils/constants";
import { salaryService } from "../../services/salary";

const { Search } = Input;

const SalaryGiving = () => {
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
      width: 120,
    },
    {
      title: "基本薪资",
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
      title: "加班薪资",
      dataIndex: "overtime",
      key: "overtime",
      width: 100,
      render: (text) => `¥${text}`,
    },
    {
      title: "养老保险",
      dataIndex: "pension_insurance",
      key: "pension_insurance",
      width: 100,
      render: (text) => `¥${text}`,
    },
    {
      title: "失业保险",
      dataIndex: "unemployment_insurance",
      key: "unemployment_insurance",
      width: 100,
      render: (text) => `¥${text}`,
    },
    {
      title: "医疗保险",
      dataIndex: "medical_insurance",
      key: "medical_insurance",
      width: 100,
      render: (text) => `¥${text}`,
    },
    {
      title: "住房公积金",
      dataIndex: "housing_fund",
      key: "housing_fund",
      width: 100,
      render: (text) => `¥${text}`,
    },
    {
      title: "个人所得税",
      dataIndex: "tax",
      key: "tax",
      width: 100,
      render: (text) => `¥${text}`,
    },
    {
      title: "税后薪资",
      dataIndex: "total",
      key: "total",
      width: 100,
      render: (text) => `¥${text}`,
    },
    {
      title: "月份",
      dataIndex: "salary_date",
      key: "salary_date",
      width: 100,
      fixed: "right",
    },
    {
      title: "状态",
      dataIndex: "is_pay",
      key: "is_pay",
      width: 100,
      fixed: "right",
      render: (isPay) => {
        if (isPay === 1) {
          return <span style={{ color: "orange" }}>未发放</span>;
        } else if (isPay === 2) {
          return <span style={{ color: "green" }}>已发放</span>;
        }
        return <span>未知</span>;
      },
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          {record.is_pay === 1 && hasPermission("salary.pay") && (
            <Popconfirm
              title="确认发放该月薪资吗？"
              onConfirm={() => handlePay(record.ID, record.salary_record_id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="primary"
                size="small"
                icon={<DollarOutlined />}
                style={{ backgroundColor: "#fa8c16", borderColor: "#fa8c16" }}
              >
                发放
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 加载工资发放数据
  const loadData = async (staffId = null) => {
    setLoading(true);
    const response = await salaryService.getAllSalaryRecords(staffId);

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

  // 查看详情
  const handleView = (record) => {
    // 存储数据到localStorage供详情页面使用
    localStorage.setItem("salary_giving_info", JSON.stringify(record));
    // 打开新窗口显示详情
    window.open("/views/salary_giving_detail.html", "_blank");
  };

  // 发放薪资
  const handlePay = async (id, _salaryRecordId) => {
    const response = await salaryService.paySalary(id);

    if (response.status) {
      loadData(); // 重新加载数据
    }
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

      {/* 工资发放列表 */}
      <Card
        title="工资发放管理"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        <Table
          {...TABLE_CONFIG}
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="salary_record_id"
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
          scroll={{ x: 1500 }}
        />
      </Card>
    </div>
  );
};

export default SalaryGiving;
