import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Select } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { salaryService } from "../../services/salary";

const { Option } = Select;

const SalaryDetailForm = () => {
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
      // 从localStorage获取薪资信息
      const salaryInfo = localStorage.getItem("salary_edit_info");
      if (salaryInfo) {
        const salaryData = JSON.parse(salaryInfo);
        form.setFieldsValue({
          staff_id: salaryData.staff_id,
          staff_name: salaryData.staff_name,
          base: salaryData.base,
          subsidy: salaryData.subsidy,
          bonus: salaryData.bonus,
          commission: salaryData.commission,
          other: salaryData.other,
          fund: salaryData.fund,
        });
      } else {
        message.error("未找到薪资信息");
        navigate("/salary/detail");
      }
    }
  }, [location.pathname, form, navigate]);

  // 表单提交处理
  const handleSubmit = async (values) => {
    setLoading(true);

    // 格式化数据，确保数值字段为数字
    const formData = {
      ...values,
      base: parseInt(values.base) || 0,
      subsidy: parseInt(values.subsidy) || 0,
      bonus: parseInt(values.bonus) || 0,
      commission: parseInt(values.commission) || 0,
      other: parseInt(values.other) || 0,
      fund: parseInt(values.fund) || 0,
    };

    const serviceCall = isEdit
      ? salaryService.editSalary({
          id: JSON.parse(localStorage.getItem("salary_edit_info")).id,
          ...formData,
        })
      : salaryService.createSalary(formData);

    serviceCall.then(response => {
      if (response.status) {
        message.success(response.message || "操作成功");
        if (isEdit) {
          localStorage.removeItem("salary_edit_info");
        }
        navigate("/salary/detail");
      } else {
        message.error(response.message || "系统异常,操作失败");
      }
    }).catch(error => {
      message.error("系统异常,操作失败: " + error.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  // 取消返回
  const handleCancel = () => {
    if (isEdit) {
      localStorage.removeItem("salary_edit_info");
    }
    navigate("/salary/detail");
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
              base: "",
              subsidy: 0,
              bonus: 0,
              commission: 0,
              other: 0,
              fund: 1,
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
              name="base"
              label="基本工资"
              rules={[{ required: true, message: "基本工资不能为空" }]}
            >
              <Input
                type="number"
                placeholder="请输入基本工资"
                min={0}
              />
            </Form.Item>

            <Form.Item name="subsidy" label="住房补贴">
              <Input
                type="number"
                placeholder="请输入住房补贴"
                min={0}
                defaultValue={0}
              />
            </Form.Item>

            <Form.Item name="bonus" label="绩效奖金">
              <Input
                type="number"
                placeholder="请输入绩效奖金"
                min={0}
                defaultValue={0}
              />
            </Form.Item>

            <Form.Item name="commission" label="提成薪资">
              <Input
                type="number"
                placeholder="请输入提成薪资"
                min={0}
                defaultValue={0}
              />
            </Form.Item>

            <Form.Item name="other" label="其他薪资">
              <Input
                type="number"
                placeholder="请输入其他薪资"
                min={0}
                defaultValue={0}
              />
            </Form.Item>

            <Form.Item
              name="fund"
              label="五险一金"
              rules={[{ required: true, message: "请选择是否缴纳五险一金" }]}
            >
              <Select placeholder="请选择是否缴纳五险一金">
                <Option value={1}>缴纳</Option>
                <Option value={0}>不缴纳</Option>
              </Select>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? "编辑" : "添加"}
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

export default SalaryDetailForm;