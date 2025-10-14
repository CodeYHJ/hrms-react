import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Select, DatePicker } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { staffService } from "../../services/staff";
import { candidateService } from "../../services/candidate";

const { Option } = Select;

const StaffOnboard = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [ranks, setRanks] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 从location.state获取候选人信息
    if (location.state && location.state.candidate) {
      const candidate = location.state.candidate;
      setCandidateInfo(candidate);
      form.setFieldsValue({
        candidate_id: candidate.candidate_id,
        staff_name: candidate.name,
        job_name: candidate.job_name,
        edu_level: candidate.edu_level,
        major: candidate.major,
        experience: candidate.experience,
        email: candidate.email,
        // 以下字段需要从候选人数据映射到员工字段
        staff_id: "",
        leader_staff_id: "",
        leader_name: "",
        birthday: "",
        identity_num: "",
        sex: "",
        nation: "",
        school: "",
        base_salary: "",
        card_num: "",
        rank_id: "",
        dep_id: "",
        phone: "",
        entry_date: "",
      });
    } else {
      message.error("未找到候选人信息");
      navigate("/candidate/manage");
    }

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
        message.error("加载部门和职级列表失败: " + error.message);
      }
    };

    loadOptions();
  }, [form, navigate, location.state]);

  // 表单提交处理
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await staffService.onboardStaff({
        candidate_id: values.candidate_id,
        staff_id: values.staff_id,
        staff_name: values.staff_name,
        leader_staff_id: values.leader_staff_id,
        leader_name: values.leader_name,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : '',
        identity_num: values.identity_num,
        sex: values.sex,
        nation: values.nation,
        school: values.school,
        major: values.major,
        edu_level: values.edu_level,
        base_salary: parseInt(values.base_salary, 10),
        card_num: values.card_num,
        rank_id: values.rank_id,
        dep_id: values.dep_id,
        email: values.email,
        phone: parseInt(values.phone, 10),
        entry_date: values.entry_date ? values.entry_date.format('YYYY-MM-DD') : '',
        probation_end_date: values.probation_end_date ? values.probation_end_date.format('YYYY-MM-DD') : '',
      });

      if (response.status) {
        message.success("员工入职成功");
        navigate("/staff/info");
      } else {
        message.error(response.message || "员工入职失败");
      }
    } catch (error) {
      message.error("员工入职失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 取消返回
  const handleCancel = () => {
    navigate("/candidate/manage");
  };

  return (
    <div
      className="layui-container layuimini-container"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="layui-main layuimini-main">
        <Card title="员工入职" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          <Form
            form={form}
            layout="horizontal"
            onFinish={handleSubmit}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            className="layui-form layuimini-form"
          >
            <Form.Item
              name="candidate_id"
              label="候选人ID"
              hidden
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="staff_name"
              label="员工姓名"
              rules={[{ required: true, message: "请输入员工姓名" }]}
            >
              <Input placeholder="请输入员工姓名" />
            </Form.Item>

            <Form.Item
              name="job_name"
              label="应聘岗位"
              rules={[{ required: true, message: "请输入应聘岗位" }]}
            >
              <Input placeholder="请输入应聘岗位" disabled />
            </Form.Item>

            <Form.Item
              name="edu_level"
              label="学历"
              rules={[{ required: true, message: "请输入学历" }]}
            >
              <Input placeholder="请输入学历" disabled />
            </Form.Item>

            <Form.Item
              name="major"
              label="专业"
              rules={[{ required: true, message: "请输入专业" }]}
            >
              <Input placeholder="请输入专业" disabled />
            </Form.Item>

            <Form.Item
              name="experience"
              label="工作经验"
              rules={[{ required: true, message: "请输入工作经验" }]}
            >
              <Input placeholder="请输入工作经验" disabled />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[{ required: true, message: "请输入邮箱" }]}
            >
              <Input placeholder="请输入邮箱" disabled />
            </Form.Item>

            <Form.Item
              name="staff_id"
              label="员工工号"
              rules={[{ required: true, message: "请输入员工工号" }]}
            >
              <Input placeholder="请输入员工工号" />
            </Form.Item>

            <Form.Item
              name="leader_staff_id"
              label="直属领导工号"
            >
              <Input placeholder="请输入直属领导工号" />
            </Form.Item>

            <Form.Item
              name="leader_name"
              label="直属领导姓名"
            >
              <Input placeholder="请输入直属领导姓名" />
            </Form.Item>

            <Form.Item
              name="birthday"
              label="出生日期"
              rules={[{ required: true, message: "请输入出生日期" }]}
            >
              <DatePicker style={{ width: "100%" }} placeholder="请选择出生日期" />
            </Form.Item>

            <Form.Item
              name="identity_num"
              label="身份证号"
              rules={[{ required: true, message: "请输入身份证号" }]}
            >
              <Input placeholder="请输入身份证号" />
            </Form.Item>

            <Form.Item
              name="sex"
              label="性别"
              rules={[{ required: true, message: "请选择性别" }]}
            >
              <Select placeholder="请选择性别">
                <Option value={1}>男</Option>
                <Option value={2}>女</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="nation"
              label="民族"
              rules={[{ required: true, message: "请输入民族" }]}
            >
              <Input placeholder="请输入民族" />
            </Form.Item>

            <Form.Item
              name="school"
              label="毕业院校"
              rules={[{ required: true, message: "请输入毕业院校" }]}
            >
              <Input placeholder="请输入毕业院校" />
            </Form.Item>

            <Form.Item
              name="base_salary"
              label="基本工资"
              rules={[
                { required: true, message: "请输入基本工资" },
                { pattern: /^\d+$/, message: "基本工资必须是正整数" },
                { validator: (_, value) => value > 0 ? Promise.resolve() : Promise.reject(new Error("基本工资必须大于0")) }
              ]}
            >
              <Input placeholder="请输入基本工资" />
            </Form.Item>

            <Form.Item
              name="card_num"
              label="银行卡号"
              rules={[{ required: true, message: "请输入银行卡号" }]}
            >
              <Input placeholder="请输入银行卡号" />
            </Form.Item>

            <Form.Item
              name="rank_id"
              label="职级"
              rules={[{ required: true, message: "请选择职级" }]}
            >
              <Select placeholder="请选择职级">
                {ranks.map((rank) => (
                  <Option key={rank.rank_id} value={rank.rank_id}>
                    {rank.rank_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="dep_id"
              label="部门"
              rules={[{ required: true, message: "请选择部门" }]}
            >
              <Select placeholder="请选择部门">
                {departments.map((dep) => (
                  <Option key={dep.dep_id} value={dep.dep_id}>
                    {dep.dep_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: "请输入手机号" },
                { pattern: /^\d{11}$/, message: "手机号必须是11位数字" }
              ]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>

            <Form.Item
              name="entry_date"
              label="入职日期"
              rules={[{ required: true, message: "请输入入职日期" }]}
            >
              <DatePicker style={{ width: "100%" }} placeholder="请选择入职日期" />
            </Form.Item>

            <Form.Item
              name="probation_end_date"
              label="试用期结束日期"
            >
              <DatePicker style={{ width: "100%" }} placeholder="请选择试用期结束日期" />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                入职
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

export default StaffOnboard;