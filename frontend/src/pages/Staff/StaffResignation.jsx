import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, DatePicker } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { staffService } from "../../services/staff";

const StaffResignation = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedStaff = location.state?.staff;

  useEffect(() => {
    // 如果有传递的员工信息，则预填表单
    if (selectedStaff) {
      form.setFieldsValue({ staff_id: selectedStaff.staff_id });
    }
  }, [selectedStaff, form]);

  // 表单提交处理
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await staffService.resignStaff({
        staff_id: selectedStaff?.staff_id,
        resignation_date: values.resignation_date,
        resignation_reason: values.resignation_reason,
      });

      if (response.status) {
        message.success("员工离职成功");
        navigate("/staff/info");
      } else {
        message.error(response.message || "员工离职失败");
      }
    } catch (error) {
      message.error("员工离职失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 取消返回
  const handleCancel = () => {
    navigate("/staff/info");
  };

  return (
    <div
      className="layui-container layuimini-container"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="layui-main layuimini-main">
        <Card title="员工离职">
          <Form
            form={form}
            layout="horizontal"
            onFinish={handleSubmit}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            className="layui-form layuimini-form"
          >
            <Form.Item label="员工">
              <Input
                value={`${selectedStaff?.staff_name} (${selectedStaff?.staff_id})`}
                readOnly
              />
            </Form.Item>

            <Form.Item
              name="resignation_date"
              label="离职日期"
              rules={[{ required: true, message: "请输入离职日期" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="请选择离职日期"
              />
            </Form.Item>

            <Form.Item
              name="resignation_reason"
              label="离职原因"
              rules={[{ required: true, message: "请输入离职原因" }]}
            >
              <Input.TextArea placeholder="请输入离职原因" rows={4} />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                离职
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

export default StaffResignation;
