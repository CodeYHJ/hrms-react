import React, { useState, useEffect } from "react";
import { Table, Card, Form, Input, Button, message, Space } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { usePermission } from "../../components/Auth/usePermission";
import { attendanceService } from "../../services/attendance";
import { PAGINATION_CONFIG, TABLE_CONFIG } from "../../utils/constants";

const { Search } = Input;

const AttendanceHistory = () => {
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
      width: 120,
    },
    {
      title: "员工姓名",
      dataIndex: "staff_name",
      key: "staff_name",
      width: 120,
    },
    {
      title: "当月出勤(天)",
      dataIndex: "work_days",
      key: "work_days",
      width: 120,
    },
    {
      title: "当月请假(天)",
      dataIndex: "leave_days",
      key: "leave_days",
      width: 120,
    },
    {
      title: "当月加班(天)",
      dataIndex: "overtime_days",
      key: "overtime_days",
      width: 120,
    },
    {
      title: "月份",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: () => <span>已发放</span>,
    },
  ];

  // 加载考勤历史数据
  const loadData = async (staffId = null) => {
    setLoading(true);
    let response;
    if (staffId) {
      response = await attendanceService.searchAttendanceHistoryByStaffId(staffId);
    } else {
      response = await attendanceService.getAllAttendanceHistory();
    }

    if (response.status) {
      const listData = Array.isArray(response.data) ? response.data : [];
      setData(listData);
      setPagination((prev) => ({
        ...prev,
        total: response.total || listData.length,
      }));
    } else {
      message.error(response.message || "数据加载失败");
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

      {/* 考勤历史列表 */}
      <Card title="考勤历史">
        <Table
          {...TABLE_CONFIG}
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="attendance_id"
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
        />
      </Card>
    </div>
  );
};

export default AttendanceHistory;