import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, Card, message } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { candidateService } from "../../services/candidate";

const { TextArea } = Input;

const CandidateForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  useEffect(() => {
    // 判断是否为编辑模式
    const editMode = location.pathname.includes("/edit");
    setIsEdit(editMode);

    if (editMode) {
      // 从sessionStorage获取候选人信息
      const candidateInfo = sessionStorage.getItem("candidate_edit_info");
      if (candidateInfo) {
        const candidateData = JSON.parse(candidateInfo);
        form.setFieldsValue({
          name: candidateData.name,
          job_name: candidateData.job_name,
          edu_level: candidateData.edu_level,
          major: candidateData.major,
          experience: candidateData.experience,
          describe: candidateData.describe,
          email: candidateData.email,
        });
      } else {
        message.error("未找到候选人信息");
        navigate("/candidate/manage");
      }
    }
  }, [location.pathname, form, navigate]);

  // 表单提交处理
  const handleSubmit = async (values) => {
    setLoading(true);
    let response;

    if (isEdit) {
      // 获取存储的候选人信息
      const candidateInfo = JSON.parse(
        sessionStorage.getItem("candidate_edit_info")
      );
      response = await candidateService.editCandidate({
        candidate_id: candidateInfo.candidate_id,
        ...values,
      });
    } else {
      response = await candidateService.createCandidate(values);
    }

    if (response.status) {
      if (isEdit) {
        sessionStorage.removeItem("candidate_edit_info");
      }
      navigate("/candidate/manage");
    }
    setLoading(false);
  };

  // 取消返回
  const handleCancel = () => {
    if (isEdit) {
      sessionStorage.removeItem("candidate_edit_info");
    }
    navigate("/candidate/manage");
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
              name: "",
              job_name: "",
              edu_level: "",
              major: "",
              experience: "",
              describe: "",
              email: "",
            }}
          >
            <Form.Item
              name="name"
              label="候选人姓名"
              rules={[{ required: true, message: "候选人姓名不能为空" }]}
            >
              <Input placeholder="请输入候选人姓名" />
            </Form.Item>

            <Form.Item
              name="job_name"
              label="应聘岗位"
              rules={[{ required: true, message: "应聘岗位不能为空" }]}
            >
              <Input placeholder="请输入应聘岗位" />
            </Form.Item>

            <Form.Item name="edu_level" label="最高学历">
              <Input placeholder="请输入最高学历" />
            </Form.Item>

            <Form.Item name="major" label="毕业专业">
              <Input placeholder="请输入毕业专业" />
            </Form.Item>

            <Form.Item name="experience" label="工作经验">
              <Input placeholder="请输入工作经验" />
            </Form.Item>

            <Form.Item name="describe" label="技能描述">
              <TextArea
                rows={6}
                placeholder="请输入技能描述"
                style={{ height: 120 }}
              />
            </Form.Item>

            <Form.Item name="email" label="投递邮箱">
              <Input placeholder="请输入投递邮箱" />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {isEdit ? "编辑" : "添加"}
                </Button>
                <Button onClick={handleCancel}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default CandidateForm;
