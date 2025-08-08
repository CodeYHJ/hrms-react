import React, { useState, useEffect } from "react";
import { Table, Card, Button, Space, message, Tag, Popconfirm } from "antd";
import { CheckOutlined, CloseOutlined, ReloadOutlined } from "@ant-design/icons";
import { usePermission } from "../../components/Auth/usePermission";
import { attendanceService } from "../../services/attendance";
import { PAGINATION_CONFIG, TABLE_CONFIG } from "../../utils/constants";

const AttendanceApproval = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
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
      title: "考勤ID",
      dataIndex: "attendance_id",
      key: "attendance_id",
      width: 100,
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
      title: "审批状态",
      dataIndex: "approve",
      key: "approve",
      width: 120,
      render: (approve) => {
        if (approve === 0) {
          return <Tag color="orange">待审批</Tag>;
        } else if (approve === 1) {
          return <Tag color="green">已通过</Tag>;
        } else if (approve === 2) {
          return <Tag color="red">已拒绝</Tag>;
        }
        return <Tag color="default">未知</Tag>;
      },
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          {record.approve === 0 && hasPermission("attendance.approve") && (
            <>
              <Popconfirm
                title="确认通过该考勤记录吗？"
                onConfirm={() => handleApprove(record.attendance_id, true)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                >
                  通过
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确认拒绝该考勤记录吗？"
                onConfirm={() => handleApprove(record.attendance_id, false)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                >
                  拒绝
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  // 加载待审批考勤数据
  const loadData = async () => {
    setLoading(true);
    const response = await attendanceService.getAllAttendanceForApproval();
    
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

  // 审批操作
  const handleApprove = async (attendanceId, isApprove) => {
    let response;
    if (isApprove) {
      response = await attendanceService.approveAttendance(attendanceId);
    } else {
      response = await attendanceService.rejectAttendance(attendanceId);
    }
    
    if (response.status) {
      message.success(isApprove ? "审批通过成功" : "审批拒绝成功");
      loadData(); // 重新加载数据
    } else {
      message.error(response.data || "审批操作失败");
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
      {/* 考勤审批列表 */}
      <Card 
        title="考勤审批" 
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

export default AttendanceApproval;