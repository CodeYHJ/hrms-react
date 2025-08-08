import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const Dashboard = () => {
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>仪表板</h1>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总员工数"
              value={112}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="部门数量"
              value={8}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审批考勤"
              value={5}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月薪资总额"
              value={1128000}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="系统概览" style={{ minHeight: 400 }}>
            <p>欢迎使用人力资源管理系统！</p>
            <p>这是基于 React 18 和 Ant Design 构建的现代化 HRMS 系统。</p>
            <p>当前功能模块：</p>
            <ul>
              <li>✅ 用户认证和权限管理</li>
              <li>✅ 员工信息管理</li>
              <li>✅ 部门管理</li>
              <li>✅ 职级管理</li>
              <li>✅ 考勤管理（上报、历史、审批）</li>
              <li>✅ 薪资管理（发放、套账、历史）</li>
              <li>✅ 招聘管理（信息、候选人）</li>
              <li>✅ 考试管理（信息、历史）</li>
              <li>✅ 通知管理</li>
              <li>✅ 权限管理（管理员）</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
