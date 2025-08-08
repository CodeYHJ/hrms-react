import React, { useState, useEffect } from "react";
import { Form, Input, DatePicker, Button, Card, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { attendanceService } from "../../services/attendance";

const { TextArea } = Input;
const { MonthPicker } = DatePicker;

const AttendanceForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 判断是否为编辑模式
    const editMode = location.pathname.includes("/edit");
    setIsEdit(editMode);

    if (editMode) {
      // 从sessionStorage获取考勤信息
      const attendanceInfo = sessionStorage.getItem("attendance_edit_info");
      if (attendanceInfo) {
        const attendanceData = JSON.parse(attendanceInfo);
        form.setFieldsValue({
          staff_id: attendanceData.staff_id,
          staff_name: attendanceData.staff_name,
          work_days: attendanceData.work_days,
          leave_days: attendanceData.leave_days || 0,
          overtime_days: attendanceData.overtime_days || 0,
          date: attendanceData.date,
        });
      } else {
        message.error("未找到考勤信息");
        navigate("/attendance/manage");
      }
    }
  }, [location.pathname, form, navigate]);

  // 表单提交处理
  const handleSubmit = async (values) => {
    setLoading(true);
    let response;

    if (isEdit) {
      // 获取存储的考勤信息
      const attendanceInfo = JSON.parse(
        sessionStorage.getItem("attendance_edit_info")
      );
      response = await attendanceService.editAttendanceRecord({
        attendance_id: attendanceInfo.attendance_id,
        ...values,
      });
    } else {
      response = await attendanceService.createAttendanceRecord(values);
    }

    if (response.status) {
      if (isEdit) {
        sessionStorage.removeItem("attendance_edit_info");
      }
      navigate("/attendance/manage");
    }
    setLoading(false);
  };

  // 取消返回
  const handleCancel = () => {
    if (isEdit) {
      sessionStorage.removeItem("attendance_edit_info");
    }
    navigate("/attendance/manage");
  };

  return (
    <div
      className="layui-container layuimini-container"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="layui-main layuimini-main">
        <Card>
          <Form
            form={form}
            layout="horizontal"
            onFinish={handleSubmit}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            className="layui-form layuimini-form"
            initialValues={{
              staff_id: "",
              staff_name: "",
              work_days: "",
              leave_days: 0,
              overtime_days: 0,
              date: "",
            }}
          >
            <Form.Item
              name="staff_id"
              label="员工工号"
              rules={[{ required: true, message: "员工工号不能为空" }]}
            >
              <Input placeholder="请输入员工工号" />
            </Form.Item>

            <Form.Item
              name="staff_name"
              label="员工姓名"
              rules={[{ required: true, message: "员工姓名不能为空" }]}
            >
              <Input placeholder="请输入员工姓名" />
            </Form.Item>

            <Form.Item
              name="work_days"
              label="当月出勤(天)"
              rules={[{ required: true, message: "当月出勤不能为空" }]}
            >
              <Input
                type="number"
                placeholder="请输入当月出勤"
                min={0}
                max={31}
              />
            </Form.Item>

            <Form.Item name="leave_days" label="当月缺勤(天)">
              <Input
                type="number"
                placeholder="请输入缺勤"
                min={0}
                max={31}
                defaultValue={0}
              />
            </Form.Item>

            <Form.Item name="overtime_days" label="当月加班(天)">
              <Input
                type="number"
                placeholder="请输入加班"
                min={0}
                max={31}
                defaultValue={0}
              />
            </Form.Item>

            <Form.Item
              name="date"
              label="月份"
              rules={[{ required: true, message: "月份不能为空" }]}
            >
              <MonthPicker
                placeholder="请选择月份"
                format="YYYY-MM"
                picker="month"
              />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? "上报" : "上报"}
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={handleCancel}>
                取消
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceForm;
