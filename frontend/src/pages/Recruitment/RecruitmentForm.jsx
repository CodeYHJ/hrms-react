import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { recruitmentService } from "../../services/recruitment";

const { TextArea } = Input;

const RecruitmentForm = () => {
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
      // 从sessionStorage获取招聘信息
      const recruitmentInfo = sessionStorage.getItem("recruitment_edit_info");
      if (recruitmentInfo) {
        const recruitmentData = JSON.parse(recruitmentInfo);
        form.setFieldsValue({
          job_name: recruitmentData.job_name,
          job_type: recruitmentData.job_type,
          base_location: recruitmentData.base_location,
          base_salary: recruitmentData.base_salary,
          edu_level: recruitmentData.edu_level,
          experience: recruitmentData.experience,
          describe: recruitmentData.describe,
          email: recruitmentData.email,
        });
      } else {
        message.error("未找到招聘信息");
        navigate("/recruitment/manage");
      }
    }
  }, [location.pathname, form, navigate]);

  // 表单提交处理
  const handleSubmit = async (values) => {
    setLoading(true);
    let response;

    if (isEdit) {
      // 获取存储的招聘信息
      const recruitmentInfo = JSON.parse(
        sessionStorage.getItem("recruitment_edit_info")
      );
      response = await recruitmentService.editRecruitment({
        recruitment_id: recruitmentInfo.recruitment_id,
        ...values,
      });
    } else {
      response = await recruitmentService.createRecruitment(values);
    }

    if (response.status) {
      if (isEdit) {
        sessionStorage.removeItem("recruitment_edit_info");
      }
      navigate("/recruitment/manage");
    }
    setLoading(false);
  };

  // 取消返回
  const handleCancel = () => {
    if (isEdit) {
      sessionStorage.removeItem("recruitment_edit_info");
    }
    navigate("/recruitment/manage");
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
              job_name: "",
              job_type: "",
              base_location: "",
              base_salary: "",
              edu_level: "",
              experience: "",
              describe: "",
              email: "",
            }}
          >
            <Form.Item
              name="job_name"
              label="岗位名称"
              rules={[{ required: true, message: "岗位名称不能为空" }]}
            >
              <Input placeholder="请输入岗位名称" />
            </Form.Item>

            <Form.Item
              name="job_type"
              label="岗位类别"
              rules={[{ required: true, message: "岗位类别不能为空" }]}
            >
              <Input placeholder="请输入岗位类别" />
            </Form.Item>

            <Form.Item
              name="base_location"
              label="工作地点"
              rules={[{ required: true, message: "工作地点不能为空" }]}
            >
              <Input placeholder="请输入工作地点" />
            </Form.Item>

            <Form.Item
              name="base_salary"
              label="薪资范围"
              rules={[{ required: true, message: "薪资范围不能为空" }]}
            >
              <Input placeholder="请输入薪资范围" />
            </Form.Item>

            <Form.Item
              name="edu_level"
              label="学历要求"
              rules={[{ required: true, message: "学历要求不能为空" }]}
            >
              <Input placeholder="请输入学历要求" />
            </Form.Item>

            <Form.Item
              name="experience"
              label="工作经验"
              rules={[{ required: true, message: "工作经验不能为空" }]}
            >
              <Input placeholder="请输入工作经验" />
            </Form.Item>

            <Form.Item
              name="describe"
              label="岗位要求"
              rules={[{ required: true, message: "岗位要求不能为空" }]}
            >
              <TextArea
                rows={6}
                style={{ height: 160 }}
                placeholder="请输入岗位要求"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="投递邮箱"
              rules={[{ required: true, message: "投递邮箱不能为空" }]}
            >
              <Input placeholder="请输入投递邮箱" />
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

export default RecruitmentForm;
