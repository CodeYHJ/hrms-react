import React, { useEffect } from "react";
import { Form, Input, Card } from "antd";

const SalaryGivingDetail = () => {
  const [form] = Form.useForm();

  useEffect(() => {
    const salaryGivingInfo = localStorage.getItem("salary_giving_info");
    if (salaryGivingInfo) {
      const record = JSON.parse(salaryGivingInfo);
      form.setFieldsValue({
        staff_id: record.staff_id,
        staff_name: record.staff_name,
        base: record.base,
        subsidy: record.subsidy,
        bonus: record.bonus,
        commission: record.commission,
        other: record.other,
        overtime: record.overtime,
        pension_insurance: record.pension_insurance,
        unemployment_insurance: record.unemployment_insurance,
        medical_insurance: record.medical_insurance,
        housing_fund: record.housing_fund,
        tax: record.tax,
        total: record.total,
        salary_date: record.salary_date,
      });
    }
  }, [form]);

  return (
    <div
      className="layui-container layuimini-container"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="layui-main layuimini-main">
        <Card title="薪资发放详情">
          <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            className="layui-form layuimini-form"
          >
            <Form.Item name="staff_id" label="员工工号">
              <Input disabled />
            </Form.Item>

            <Form.Item name="staff_name" label="员工姓名">
              <Input disabled />
            </Form.Item>

            <Form.Item name="base" label="基础薪资">
              <Input disabled />
            </Form.Item>

            <Form.Item name="subsidy" label="住房补贴">
              <Input disabled />
            </Form.Item>

            <Form.Item name="bonus" label="绩效奖金">
              <Input disabled />
            </Form.Item>

            <Form.Item name="commission" label="提成薪资">
              <Input disabled />
            </Form.Item>

            <Form.Item name="other" label="其他薪资">
              <Input disabled />
            </Form.Item>

            <Form.Item name="overtime" label="加班薪资">
              <Input disabled />
            </Form.Item>

            <Form.Item name="pension_insurance" label="养老保险">
              <Input disabled />
            </Form.Item>

            <Form.Item name="unemployment_insurance" label="失业保险">
              <Input disabled />
            </Form.Item>

            <Form.Item name="medical_insurance" label="医疗保险">
              <Input disabled />
            </Form.Item>

            <Form.Item name="housing_fund" label="住房公积金">
              <Input disabled />
            </Form.Item>

            <Form.Item name="tax" label="个人所得税">
              <Input disabled />
            </Form.Item>

            <Form.Item name="total" label="税后薪资">
              <Input disabled />
            </Form.Item>

            <Form.Item name="salary_date" label="月份">
              <Input disabled />
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default SalaryGivingDetail;