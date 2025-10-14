import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Select, Modal, Space } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { usePermission } from "../../components/Auth/usePermission";
import { useAuth } from "../../components/Auth/AuthContext";
import { candidateService } from "../../services/candidate";
import { staffService } from "../../services/staff";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const CandidateInterview = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [staffOptions, setStaffOptions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermission();
  const { user } = useAuth(); // 获取当前登录用户信息

  useEffect(() => {
    // 从sessionStorage获取候选人信息
    const candidateInfo = sessionStorage.getItem("candidate_interview_info");
    if (candidateInfo) {
      const candidateData = JSON.parse(candidateInfo);
      form.setFieldsValue({
        candidate_id: candidateData.candidate_id,
        staff_id: candidateData.staff_id || "",
        evaluation: candidateData.evaluation || "",
      });
    } else {
      message.error("未找到候选人信息");
      navigate("/candidate/manage");
    }

    // 加载员工列表用于下拉选择
    const loadStaffList = async () => {
      try {
        const response = await staffService.getAllStaff();
        if (response.status) {
          setStaffOptions(response.data || []);
        } else {
          message.error(response.message || "获取员工列表失败");
        }
      } catch (error) {
        message.error("获取员工列表失败: " + error.message);
      }
    };

    loadStaffList();
  }, [form, navigate]);

  // 拒绝候选人
  const handleReject = async (values) => {
    const candidateInfo = sessionStorage.getItem("candidate_interview_info");
    if (!candidateInfo) {
      message.error("未找到候选人信息");
      return;
    }
    const candidateData = JSON.parse(candidateInfo);
    try {
      // 先更新面试官和评价
      const updateResponse = await candidateService.editCandidate({
        candidate_id: candidateData.candidate_id,
        staff_id: values.staff_id,
        evaluation: values.evaluation,
      });
      
      if (!updateResponse.status) {
        message.error(updateResponse.message || "更新面试信息失败");
        return;
      }
      
      // 再更新状态
      const statusResponse = await candidateService.rejectCandidate(
        candidateData.candidate_id
      );
      
      if (statusResponse.status) {
        message.success("拒绝候选人成功");
        sessionStorage.removeItem("candidate_interview_info");
        navigate("/candidate/manage");
      } else {
        message.error(statusResponse.message || "拒绝候选人失败");
      }
    } catch (error) {
      message.error("拒绝候选人失败: " + error.message);
    }
  };

  // 录取候选人
  const handleAccept = async (values) => {
    const candidateInfo = sessionStorage.getItem("candidate_interview_info");
    if (!candidateInfo) {
      message.error("未找到候选人信息");
      return;
    }
    const candidateData = JSON.parse(candidateInfo);
    try {
      // 先更新面试官和评价
      const updateResponse = await candidateService.editCandidate({
        candidate_id: candidateData.candidate_id,
        staff_id: values.staff_id,
        evaluation: values.evaluation,
      });
      
      if (!updateResponse.status) {
        message.error(updateResponse.message || "更新面试信息失败");
        return;
      }
      
      // 再更新状态
      const statusResponse = await candidateService.acceptCandidate(
        candidateData.candidate_id
      );
      
      if (statusResponse.status) {
        message.success("录取候选人成功");
        sessionStorage.removeItem("candidate_interview_info");
        navigate("/candidate/manage");
      } else {
        message.error(statusResponse.message || "录取候选人失败");
      }
    } catch (error) {
      message.error("录取候选人失败: " + error.message);
    }
  };

  // 处理拒绝按钮点击
  const confirmReject = () => {
    form.validateFields().then((values) => {
      Modal.confirm({
        title: '确认拒绝',
        content: '确认拒绝该候选人吗？',
        onOk: () => handleReject(values),
        onCancel: () => {},
      });
    }).catch((info) => {
      console.log('Validate Failed:', info);
    });
  };

  // 处理录取按钮点击
  const confirmAccept = () => {
    form.validateFields().then((values) => {
      Modal.confirm({
        title: '确认录取',
        content: '确认录取该候选人吗？',
        onOk: () => handleAccept(values),
        onCancel: () => {},
      });
    }).catch((info) => {
      console.log('Validate Failed:', info);
    });
  };

  return (
    <div
      className="layui-container layuimini-container"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="layui-main layuimini-main">
        <Card title="候选人面试决策">
          <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            className="layui-form layuimini-form"
            initialValues={{
              candidate_id: "",
              staff_id: user?.staffId || "", // 默认选中当前登录用户
              evaluation: "",
            }}
          >
            <Form.Item
              name="candidate_id"
              label="候选人ID"
              hidden
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="staff_id"
              label="面试官"
              rules={[{ required: true, message: "请选择面试官" }]}
            >
              <Select placeholder="请选择面试官">
                <Option value="">不指定面试官</Option>
                {staffOptions.map((staff) => (
                  <Option
                    key={staff.staff_id}
                    value={staff.staff_id}
                  >
                    {staff.staff_name}-{staff.dep_name}-{staff.rank_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="evaluation"
              label="面试评价"
            >
              <TextArea
                rows={6}
                style={{ height: 160 }}
                placeholder="请输入面试评价"
              />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              {hasPermission("interview") && (
                <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
                  <Button
                    type="primary"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={confirmReject}
                  >
                    拒绝
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    onClick={confirmAccept}
                  >
                    录取
                  </Button>
                </Space>
              )}
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default CandidateInterview;