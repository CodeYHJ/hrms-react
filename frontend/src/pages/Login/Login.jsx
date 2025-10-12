import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Select, message } from "antd";
import { UserOutlined, LockOutlined, BankOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

import { companyService } from "../../services/company";
import { authService } from "../../services/auth";
import { useAuth } from "../../components/Auth/AuthContext";

const { Option } = Select;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);

  // 如果已经登录，重定向到目标页面
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // 页面加载时获取分公司列表
  useEffect(() => {
    loadBranchList();
  }, []);

  // 获取分公司列表 - 严格按照原有逻辑
  const loadBranchList = async () => {
    setBranchLoading(true);
    const response = await companyService.getAllBranches();
    const result = response.data; // 原有逻辑：var resp = JSON.parse(JSON.stringify(data));
    console.log(result, "result", response);
    if (response.status) {
      setBranchList(result); // 严格按照原有逻辑：$.each(resp.msg, ...)
    } else {
      message.error("获取分公司列表失败");
    }
    setBranchLoading(false);
  };

  // 登录提交 - 严格按照原有逻辑
  const handleSubmit = async (values) => {
    // 验证必填字段 - 严格按照原有逻辑
    if (values.staff_id == "") {
      message.error("员工账号不能为空");
      return;
    }
    if (values.user_password == "") {
      message.error("登陆密码不能为空");
      return;
    }
    if (values.branch_id == -1) {
      message.error("请选择分公司");
      return;
    }

    setLoading(true);
    // 构造登录数据 - 严格按照原有格式
    const loginData = {
      staff_id: values.staff_id,
      user_password: values.user_password,
      branch_id: values.branch_id,
    };

    // 使用配置的api实例
    const response = await authService.login(loginData);

    if (response.status) {
      // 登录成功后，立即更新认证状态
      checkAuthStatus();

      // 按照原有逻辑跳转到 /index，React版本跳转到dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } else {
      message.error("账号或密码错误,登陆失败");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <Card className="login-form">
        <div className="login-title">
          <h1>人力资源管理系统</h1>
        </div>
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
          initialValues={{
            staff_id: "3117000001",
            user_password: "admin1",
            branch_id: -1,
          }}
        >
          <Form.Item
            name="staff_id"
            rules={[{ required: true, message: "员工工号不能为空" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="员工工号"
              maxLength={20}
            />
          </Form.Item>

          <Form.Item
            name="user_password"
            rules={[{ required: true, message: "登陆密码不能为空" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="登陆密码"
              maxLength={50}
            />
          </Form.Item>

          <Form.Item
            name="branch_id"
            rules={[
              { required: true, message: "请选择分公司" },
              {
                validator: (_, value) => {
                  if (value === -1) {
                    return Promise.reject(new Error("请选择分公司"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              placeholder="请选择分公司"
              loading={branchLoading}
              suffixIcon={<BankOutlined />}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value={-1}>请选择分公司</Option>
              {branchList.map((branch) => (
                <Option key={branch.branch_id} value={branch.branch_id}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: "100%" }}
              size="large"
            >
              {loading ? "登陆中..." : "登 陆"}
            </Button>
          </Form.Item>
        </Form>

        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            color: "#999",
            fontSize: "12px",
          }}
        >
          <p>测试账号：3117000001 / admin1</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
