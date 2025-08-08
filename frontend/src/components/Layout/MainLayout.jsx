import React, { useState, useMemo } from "react";
import { Layout, Menu, Button, Dropdown, Avatar, Space } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  TeamOutlined,
  DashboardOutlined,
  LogoutOutlined,
  SettingOutlined,
  ApartmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import { usePermission } from "../Auth/usePermission";

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { canAccessModule } = usePermission();

  // 根据权限动态生成菜单项
  const menuItems = useMemo(() => {
    const items = [
      {
        key: "/dashboard",
        icon: <DashboardOutlined />,
        label: "仪表板",
      },
    ];

    // 员工管理
    if (canAccessModule("staff")) {
      items.push({
        key: "/staff",
        icon: <TeamOutlined />,
        label: "员工管理",
        children: [
          {
            key: "/staff/info",
            label: "员工信息管理",
          },
          {
            key: "/staff/password",
            label: "登录密码管理",
          },
        ],
      });
    }

    // 部门管理
    if (canAccessModule("department")) {
      items.push({
        key: "/department",
        icon: <ApartmentOutlined />,
        label: "部门管理",
      });
    }

    // 职级管理
    if (canAccessModule("rank")) {
      items.push({
        key: "/rank",
        icon: <UserOutlined />,
        label: "职级管理",
      });
    }

    // 考勤管理
    if (canAccessModule("attendance")) {
      items.push({
        key: "/attendance",
        icon: <ClockCircleOutlined />,
        label: "考勤管理",
        children: [
          {
            key: "/attendance/record",
            label: "考勤上报",
          },
          {
            key: "/attendance/history",
            label: "考勤历史",
          },
          {
            key: "/attendance/approve",
            label: "考勤审批",
          },
        ],
      });
    }

    // 薪资管理
    if (canAccessModule("salary")) {
      items.push({
        key: "/salary",
        icon: <DollarOutlined />,
        label: "薪资管理",
        children: [
          {
            key: "/salary/giving",
            label: "工资发放",
          },
          {
            key: "/salary/detail",
            label: "工资套账",
          },
          {
            key: "/salary/history",
            label: "工资历史",
          },
        ],
      });
    }

    // 招聘管理
    if (canAccessModule("recruitment")) {
      items.push({
        key: "/recruitment",
        icon: <TeamOutlined />,
        label: "招聘管理",
        children: [
          {
            key: "/recruitment/manage",
            label: "信息管理",
          },
          {
            key: "/candidate/manage",
            label: "候选人管理",
          },
        ],
      });
    }

    // 考试管理
    if (canAccessModule("exam")) {
      items.push({
        key: "/exam",
        icon: <UserOutlined />,
        label: "考试管理",
        children: [
          {
            key: "/exam/manage",
            label: "考试信息",
          },
          {
            key: "/exam/history",
            label: "考试历史",
          },
        ],
      });
    }

    // 通知管理
    if (canAccessModule("notification")) {
      items.push({
        key: "/notification",
        icon: <NotificationOutlined />,
        label: "通知管理",
      });
    }

    // 权限管理（超级管理员和系统管理员）
    if (canAccessModule("authority")) {
      items.push({
        key: "/authority",
        icon: <SettingOutlined />,
        label: "权限管理",
        children: [
          {
            key: "/authority/admin",
            label: "管理员管理",
          },
          {
            key: "/authority/role",
            label: "角色权限管理",
          },
        ],
      });
    }

    return items;
  }, [canAccessModule]);

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人信息",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "系统设置",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: handleLogout,
    },
  ];

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout className="main-layout">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.3)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          {collapsed ? "HRMS" : "人力资源管理系统"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: "#fff" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "100%",
              paddingRight: 24,
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.staffName || "用户"}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
