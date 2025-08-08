import React, { useEffect } from "react";
import { Form, Input, Button, Space } from "antd";
import { departmentService } from "../../services/department";

const DepartmentForm = ({ type, initialValues, onSuccess, onCancel }) => {
  const [form] = Form.useForm();

  // 表单提交
  const handleSubmit = async (values) => {
    let response;
    if (type === "add") {
      // 新增部门
      response = await departmentService.createDepartment(values);
    } else {
      // 编辑部门 - 需要包含 dep_id
      const editData = {
        ...values,
        dep_id: initialValues.dep_id,
      };
      response = await departmentService.editDepartment(editData);
    }

    if (response.status) {
      onSuccess();
    }
  };

  // 初始化表单数据
  useEffect(() => {
    if (type === "edit" && initialValues) {
      form.setFieldsValue({
        dep_name: initialValues.dep_name,
        dep_describe: initialValues.dep_describe,
      });
    } else {
      form.resetFields();
    }
  }, [type, initialValues, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      preserve={false}
    >
      <Form.Item
        label="部门名称"
        name="dep_name"
        rules={[
          { required: true, message: "部门名称不能为空" },
          { max: 50, message: "部门名称不能超过50个字符" },
        ]}
      >
        <Input placeholder="请输入部门名称" />
      </Form.Item>

      <Form.Item
        label="部门描述"
        name="dep_describe"
        rules={[
          { required: true, message: "部门描述不能为空" },
          { max: 200, message: "部门描述不能超过200个字符" },
        ]}
      >
        <Input placeholder="请输入部门描述" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit">
            {type === "add" ? "添加" : "保存"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default DepartmentForm;
