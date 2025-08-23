import React, { useEffect, useState } from "react";
import { Form, Input, Button, Space, Select, message } from "antd";
import { departmentService } from "../../services/department";

const DepartmentForm = ({ type, initialValues, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取部门列表用于上级部门选择
  const fetchDepartmentOptions = async () => {
    try {
      const response = await departmentService.getDepartmentList();
      if (response.status) {
        // 过滤掉当前编辑的部门（防止选择自己作为上级）
        let options = response.data || [];
        if (type === "edit" && initialValues) {
          options = options.filter(
            (dept) => dept.dep_id !== initialValues.DepId
          );
        }
        setDepartmentOptions(options);
      }
    } catch (error) {
      message.error("获取部门列表失败");
    }
  };

  // 表单提交
  const handleSubmit = async (values) => {
    setLoading(true);
    
    // 确保parent_dep_id默认为'0'
    const submitData = {
      ...values,
      parent_dep_id: values.parent_dep_id || '0'
    };
    
    let response;
    if (type === "add") {
      // 新增部门
      response = await departmentService.createDepartment(submitData);
    } else {
      // 编辑部门 - 需要包含 dep_id
      const editData = {
        ...submitData,
        dep_id: initialValues.DepId,
      };
      response = await departmentService.editDepartment(editData);
    }

    setLoading(false);
    if (response.status) {
      onSuccess();
    }
  };

  // 初始化表单数据
  useEffect(() => {
    fetchDepartmentOptions();

    if (type === "edit" && initialValues) {
      form.setFieldsValue({
        dep_name: initialValues.DepName,
        dep_describe: initialValues.DepDescribe,
        // 如果ParentDepId为'0'，则不设置选中值（显示为未选择）
        parent_dep_id: initialValues.ParentDepId === '0' ? undefined : initialValues.ParentDepId,
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

      <Form.Item
        label="上级部门"
        name="parent_dep_id"
        rules={[
          {
            validator: (_, value) => {
              if (type === "edit" && value === initialValues?.DepId) {
                return Promise.reject(new Error("不能选择自己作为上级部门"));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Select
          placeholder="请选择上级部门（可不选）"
          allowClear
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {departmentOptions.map((dept) => (
            <Select.Option key={dept.dep_id} value={dept.dep_id}>
              {dept.dep_name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {type === "add" ? "添加" : "保存"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default DepartmentForm;
