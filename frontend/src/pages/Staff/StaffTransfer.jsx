import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Select, DatePicker } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { staffService } from "../../services/staff";

const StaffTransfer = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [ranks, setRanks] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedStaff = location.state?.staff;

  useEffect(() => {
    // 加载部门和职级列表
    const loadOptions = async () => {
      try {
        const depResponse = await staffService.getAllDepartments();
        if (depResponse.status) {
          setDepartments(depResponse.data || []);
        }

        const rankResponse = await staffService.getAllRanks();
        if (rankResponse.status) {
          setRanks(rankResponse.data || []);
        }
      } catch (error) {
        message.error("加载选项失败: " + error.message);
      }
    };

    loadOptions();
    
    // 如果有传递的员工信息，则预填表单
    if (selectedStaff) {
      form.setFieldsValue({ staff_id: selectedStaff.staff_id });
    }
  }, [form]);

  // 表单提交处理
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
       const response = await staffService.transferStaff({
         staff_id: selectedStaff?.staff_id,
         dep_id: values.dep_id,
         rank_id: values.rank_id,
       });

      if (response.status) {
        message.success("员工调岗成功");
        navigate("/staff/info");
      } else {
        message.error(response.message || "员工调岗失败");
      }
    } catch (error) {
      message.error("员工调岗失败: " + error.message);
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
        <Card title="员工调岗">
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
              name="dep_id"
              label="新部门"
              rules={[{ required: true, message: "请选择新部门" }]}
            >
              <Select placeholder="请选择新部门">
                {departments.map((dep) => (
                  <Select.Option key={dep.dep_id} value={dep.dep_id}>
                    {dep.dep_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="rank_id"
              label="新职级"
              rules={[{ required: true, message: "请选择新职级" }]}
            >
              <Select placeholder="请选择新职级">
                {ranks.map((rank) => (
                  <Select.Option key={rank.rank_id} value={rank.rank_id}>
                    {rank.rank_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                调岗
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

export default StaffTransfer;