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
  Tabs,
  Tag,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { usePermission } from "../../components/Auth/usePermission";
import { attendanceService } from "../../services/attendance";
import { useNavigate } from "react-router-dom";
import ClockIn from "./ClockIn";
import LeaveForm from "./LeaveForm";
import PunchForm from "./PunchForm";

const { Search } = Input;
const { TabPane } = Tabs;

const AttendanceManagement = () => {
  const [data, setData] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [punchRequests, setPunchRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("attendance");
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

  // 表格列定义 - 严格按照views HTML结构
  const columns = [
    {
      title: "序号",
      width: 60,
      fixed: "left",
      render: (text, record, index) =>
        index + 1 + (pagination.current - 1) * pagination.pageSize,
      align: "center",
    },
    {
      title: "考勤ID",
      dataIndex: "attendance_id",
      key: "attendance_id",
      width: 10,
      hidden: true,
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
      title: "当月出勤(天)",
      dataIndex: "work_days",
      key: "work_days",
      width: 150,
    },
    {
      title: "当月请假(天)",
      dataIndex: "leave_days",
      key: "leave_days",
      width: 150,
    },
    {
      title: "当月加班(天)",
      dataIndex: "overtime_days",
      key: "overtime_days",
      width: 150,
    },
    {
      title: "月份",
      dataIndex: "date",
      key: "date",
      width: 150,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => {
        return <span>已发放</span>; // 按照views固定返回"已发放"
      },
    },
  ];

  // 加载请假申请数据
  const loadLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch("/leave_request/query/all");
      const result = await response.json();
      if (result.status === 2000) {
        setLeaveRequests(result.result || []);
      }
    } catch (error) {
      message.error("加载请假申请失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载补打卡申请数据
  const loadPunchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch("/punch_request/query/all");
      const result = await response.json();
      if (result.status === 2000) {
        setPunchRequests(result.result || []);
      }
    } catch (error) {
      message.error("加载补打卡申请失败");
    } finally {
      setLoading(false);
    }
  };

  // 审批请假申请
  const handleLeaveApprove = async (leaveId, action) => {
    try {
      const endpoint =
        action === "accept"
          ? "/api/leave_request/approve_accept/"
          : "/api/leave_request/approve_reject/";
      const response = await fetch(endpoint + leaveId);
      const result = await response.json();
      if (result.status === 2000) {
        message.success(`请假申请${action === "accept" ? "通过" : "拒绝"}成功`);
        loadLeaveRequests();
      } else {
        message.error(result.result || "操作失败");
      }
    } catch (error) {
      message.error("操作失败");
    }
  };

  // 审批补打卡申请
  const handlePunchApprove = async (punchId, action) => {
    try {
      const endpoint =
        action === "accept"
          ? "/api/punch_request/approve_accept/"
          : "/api/punch_request/approve_reject/";
      const response = await fetch(endpoint + punchId);
      const result = await response.json();
      if (result.status === 2000) {
        message.success(
          `补打卡申请${action === "accept" ? "通过" : "拒绝"}成功`
        );
        loadPunchRequests();
      } else {
        message.error(result.result || "操作失败");
      }
    } catch (error) {
      message.error("操作失败");
    }
  };

  // 请假申请表格列
  const leaveColumns = [
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
      title: "请假开始日期",
      dataIndex: "start_date",
      key: "start_date",
      width: 120,
    },
    {
      title: "请假结束日期",
      dataIndex: "end_date",
      key: "end_date",
      width: 120,
    },
    {
      title: "请假类型",
      dataIndex: "leave_type",
      key: "leave_type",
      width: 100,
      render: (type) => {
        const typeMap = { annual: "年假", sick: "病假", personal: "事假" };
        return typeMap[type] || type;
      },
    },
    {
      title: "请假原因",
      dataIndex: "reason",
      key: "reason",
      width: 200,
      ellipsis: true,
    },
    {
      title: "审批状态",
      dataIndex: "approve_status",
      key: "approve_status",
      width: 100,
      render: (status) => {
        const statusMap = { 0: "待审批", 1: "通过", 2: "拒绝" };
        const colorMap = { 0: "orange", 1: "green", 2: "red" };
        return <Tag color={colorMap[status]}>{statusMap[status]}</Tag>;
      },
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      render: (text, record) => (
        <Space>
          {record.approve_status === 0 && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleLeaveApprove(record.leave_id, "accept")}
              >
                通过
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleLeaveApprove(record.leave_id, "reject")}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // 补打卡申请表格列
  const punchColumns = [
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
      title: "补打卡日期",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "申请时间",
      dataIndex: "requested_time",
      key: "requested_time",
      width: 150,
    },
    {
      title: "补打卡原因",
      dataIndex: "reason",
      key: "reason",
      width: 200,
      ellipsis: true,
    },
    {
      title: "审批状态",
      dataIndex: "approve_status",
      key: "approve_status",
      width: 100,
      render: (status) => {
        const statusMap = { 0: "待审批", 1: "通过", 2: "拒绝" };
        const colorMap = { 0: "orange", 1: "green", 2: "red" };
        return <Tag color={colorMap[status]}>{statusMap[status]}</Tag>;
      },
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      render: (text, record) => (
        <Space>
          {record.approve_status === 0 && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handlePunchApprove(record.punch_id, "accept")}
              >
                通过
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handlePunchApprove(record.punch_id, "reject")}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // 加载考勤数据
  const loadAttendances = async (searchValue = "", page = 1) => {
    setLoading(true);
    let response;
    if (searchValue) {
      response = await attendanceService.searchAttendanceHistoryByStaffId(
        searchValue
      );
    } else {
      response = await attendanceService.getAllAttendance();
    }
    console.log(response, "response");
    const resp = response.data;
    if (response.status) {
      const listData = response.data || [];
      setData(Array.isArray(listData) ? listData : []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: Array.isArray(listData) ? listData.length : 0,
      }));
    } else {
      message.error(response.message || "数据加载失败");
      setData([]);
    }
    setLoading(false);
  };

  // 初始化加载
  useEffect(() => {
    loadAttendances();
    loadLeaveRequests();
    loadPunchRequests();
  }, []);

  // Tab切换处理
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "leave") {
      loadLeaveRequests();
    } else if (key === "punch") {
      loadPunchRequests();
    }
  };

  // 搜索功能
  const handleSearch = (value) => {
    setSearchValue(value);
    loadAttendances(value, 1);
  };

  // 跳转到添加考勤页面
  const handleAdd = () => {
    navigate("/attendance/add");
  };

  // 检查薪资状态
  const checkSalaryStatus = async (record) => {
    const response = await attendanceService.checkIsSalaryPaid(
      record.staff_id,
      record.date
    );
    if (response.status) {
      return response.data === true;
    }
    return false;
  };

  // 编辑考勤
  const handleEdit = async (record) => {
    const isPaid = await checkSalaryStatus(record);
    if (isPaid) {
      message.error("已发放薪资，无法编辑");
      return;
    }

    sessionStorage.setItem("attendance_edit_info", JSON.stringify(record));
    navigate("/attendance/edit");
  };

  // 删除考勤
  const handleDelete = async (record) => {
    const isPaid = await checkSalaryStatus(record);
    if (isPaid) {
      message.error("已发放薪资，无法删除");
      return;
    }

    Modal.confirm({
      title: "确认删除",
      content: `确认删除考勤记录 [${record.staff_name} - ${record.date}] 吗？`,
      onOk: async () => {
        const response = await attendanceService.deleteAttendanceRecord(
          record.attendance_id
        );
        if (response.status) {
          loadAttendances(searchValue, pagination.current);
        }
      },
    });
  };

  // 分页处理
  const handleTableChange = (paginationInfo) => {
    setPagination(paginationInfo);
  };

  return (
    <div>
      <div className="layuimini-container">
        <div className="layuimini-main">
          <Card>
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
              <TabPane tab="考勤记录" key="attendance">
                {hasPermission("query") && (
                  <div style={{ marginBottom: 16 }}>
                    <Form layout="inline">
                      <Form.Item label="员工工号">
                        <Search
                          placeholder="请输入员工工号"
                          allowClear
                          enterButton={<SearchOutlined />}
                          loading={searchLoading}
                          onSearch={handleSearch}
                          style={{ width: 250 }}
                        />
                      </Form.Item>
                    </Form>
                  </div>
                )}

                {hasPermission("create") && (
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAdd}
                    >
                      上报考勤
                    </Button>
                  </div>
                )}

                <Table
                  rowKey="attendance_id"
                  columns={columns.filter((col) => !col.hidden)}
                  dataSource={data}
                  loading={loading}
                  pagination={pagination}
                  onChange={handleTableChange}
                  scroll={{ x: "max-content" }}
                  bordered
                  size="middle"
                />
              </TabPane>

              <TabPane tab="打卡管理" key="clockin">
                <ClockIn />
              </TabPane>

              <TabPane tab="请假申请" key="leave">
                <div style={{ marginBottom: 16 }}>
                  <LeaveForm />
                </div>
                <Table
                  rowKey="leave_id"
                  columns={leaveColumns}
                  dataSource={leaveRequests}
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: "max-content" }}
                  bordered
                  size="middle"
                />
              </TabPane>

              <TabPane tab="补打卡申请" key="punch">
                <div style={{ marginBottom: 16 }}>
                  <PunchForm />
                </div>
                <Table
                  rowKey="punch_id"
                  columns={punchColumns}
                  dataSource={punchRequests}
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: "max-content" }}
                  bordered
                  size="middle"
                />
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
