import React, { useState, useEffect } from "react";
import { Table, Button, Space, message, Card, Form, Input, Modal } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { usePermission } from "../../components/Auth/usePermission";
import { attendanceService } from "../../services/attendance";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

const AttendanceManagement = () => {
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

  // 根据权限过滤列
  const filteredColumns = columns.filter((col) => !col.hidden);

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
  }, []);

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
              columns={filteredColumns}
              dataSource={data}
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
              scroll={{ x: "max-content" }}
              bordered
              size="middle"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
