import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, DatePicker } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { staffService } from "../../services/staff";

const StaffPromotion = () => {
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
       const response = await staffService.promoteStaff({
         staff_id: selectedStaff?.staff_id,
         probation_end_date: values.probation_end_date,
       });

      if (response.status) {
        message.success("员工转正成功");
        navigate("/staff/info");
      } else {
        message.error(response.message || "员工转正失败");
      }
    } catch (error) {
      message.error("员工转正失败: " + error.message);
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
        <Card title="员工转正">
          <Form
            form={form}
            layout="horizontal"
            onFinish={handleSubmit}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            className="layui-form layuimini-form"
          >
             <Form.Item label="员工">
               <Input value={`${selectedStaff?.staff_name} (${selectedStaff?.staff_id})`} readOnly />
             </Form.Item>

            <Form.Item
              name="probation_end_date"
              label="试用期结束日期"
              rules={[{ required: true, message: "请输入试用期结束日期" }]}
            >
              <DatePicker style={{ width: "100%" }} placeholder="请选择试用期结束日期" />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                转正
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

export default StaffPromotion;