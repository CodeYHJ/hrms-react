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
  FileTextOutlined,
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
  const { canAccessModule, isAdmin } = usePermission();
  console.log(user, "user");
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
      const staffChildren = [
        {
          key: "/staff/info",
          label: "员工信息管理",
        },
      ];
      
      // 只有管理员才能看到密码管理
      if (isAdmin()) {
        staffChildren.push({
          key: "/staff/password",
          label: "登录密码管理",
        });
      }
      
      items.push({
        key: "/staff",
        icon: <TeamOutlined />,
        label: "员工管理",
        children: staffChildren,
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
          {
            key: "/salary/template",
            label: "薪资模板",
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

    // 操作日志（超级管理员和系统管理员）
    if (canAccessModule("operation_log")) {
      items.push({
        key: "/operation-log",
        icon: <FileTextOutlined />,
        label: "操作日志",
      });
    }

    // 系统配置（超级管理员和系统管理员）
    if (canAccessModule("system_config")) {
      items.push({
        key: "/system-config",
        icon: <SettingOutlined />,
        label: "参数配置",
        children: [
          {
            key: "/system-config/overview",
            label: "配置概览",
          },
          {
            key: "/system-config/tax-bracket",
            label: "税率配置",
          },
          {
            key: "/system-config/insurance-rate",
            label: "社保费率",
          },
          {
            key: "/system-config/calculation-rule",
            label: "计算规则",
          },
          {
            key: "/system-config/system-parameter",
            label: "系统参数",
          },
          {
            key: "/system-config/parameter-history",
            label: "变更历史",
          },
        ],
      });
    }

    return items;
  }, [canAccessModule]);

  // 用户下拉菜单
  const userMenuItems = [
    // {
    //   key: "profile",
    //   icon: <UserOutlined />,
    //   label: "个人信息",
    // },
    // {
    //   key: "settings",
    //   icon: <SettingOutlined />,
    //   label: "系统设置",
    // },
    // {
    //   type: "divider",
    // },
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

  // 获取默认展开的菜单key
  const getDefaultOpenKeys = () => {
    const pathname = location.pathname;
    const openKeys = [];
    
    // 根据当前路径确定需要展开的父级菜单
    if (pathname.startsWith('/staff/')) {
      openKeys.push('/staff');
    }
    if (pathname.startsWith('/attendance/')) {
      openKeys.push('/attendance');
    }
    if (pathname.startsWith('/salary/')) {
      openKeys.push('/salary');
    }
    if (pathname.startsWith('/recruitment/') || pathname.startsWith('/candidate/')) {
      openKeys.push('/recruitment');
    }
    if (pathname.startsWith('/exam/')) {
      openKeys.push('/exam');
    }
    if (pathname.startsWith('/authority/')) {
      openKeys.push('/authority');
    }
    if (pathname.startsWith('/system-config/')) {
      openKeys.push('/system-config');
    }
    
    return openKeys;
  };

  // 获取正确的选中key，处理子路由情况
  const getSelectedKey = () => {
    const pathname = location.pathname;
    
    // 精确匹配
    const exactMatch = menuItems.find(item => 
      item.key === pathname || 
      (item.children && item.children.some(child => child.key === pathname))
    );
    
    if (exactMatch) {
      if (exactMatch.children) {
        const childMatch = exactMatch.children.find(child => child.key === pathname);
        return childMatch ? [childMatch.key] : [pathname];
      }
      return [exactMatch.key];
    }
    
    // 处理动态路由和子路由
    if (pathname.startsWith('/staff/')) {
      if (pathname.startsWith('/staff/info')) return ['/staff/info'];
      if (pathname.startsWith('/staff/password')) return ['/staff/password'];
    }
    if (pathname.startsWith('/attendance/')) {
      if (pathname.startsWith('/attendance/record')) return ['/attendance/record'];
      if (pathname.startsWith('/attendance/history')) return ['/attendance/history'];
      if (pathname.startsWith('/attendance/approve')) return ['/attendance/approve'];
    }
    if (pathname.startsWith('/salary/')) {
      if (pathname.startsWith('/salary/giving')) return ['/salary/giving'];
      if (pathname.startsWith('/salary/detail')) return ['/salary/detail'];
      if (pathname.startsWith('/salary/history')) return ['/salary/history'];
    }
    if (pathname.startsWith('/recruitment/')) {
      if (pathname.startsWith('/recruitment/manage')) return ['/recruitment/manage'];
      if (pathname.startsWith('/recruitment/add')) return ['/recruitment/manage'];
      if (pathname.startsWith('/recruitment/edit')) return ['/recruitment/manage'];
      if (pathname.startsWith('/recruitment/detail')) return ['/recruitment/manage'];
    }
    if (pathname.startsWith('/candidate/')) {
      return ['/candidate/manage'];
    }
    if (pathname.startsWith('/exam/')) {
      if (pathname.startsWith('/exam/manage')) return ['/exam/manage'];
      if (pathname.startsWith('/exam/history')) return ['/exam/history'];
    }
    if (pathname.startsWith('/authority/')) {
      if (pathname.startsWith('/authority/admin')) return ['/authority/admin'];
      if (pathname.startsWith('/authority/role')) return ['/authority/role'];
    }
    if (pathname.startsWith('/system-config/')) {
      if (pathname.startsWith('/system-config/overview')) return ['/system-config/overview'];
      if (pathname.startsWith('/system-config/tax-bracket')) return ['/system-config/tax-bracket'];
      if (pathname.startsWith('/system-config/insurance-rate')) return ['/system-config/insurance-rate'];
      if (pathname.startsWith('/system-config/calculation-rule')) return ['/system-config/calculation-rule'];
      if (pathname.startsWith('/system-config/system-parameter')) return ['/system-config/system-parameter'];
      if (pathname.startsWith('/system-config/parameter-history')) return ['/system-config/parameter-history'];
    }
    
    return [pathname];
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
        <div style={{ 
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={getSelectedKey()}
            defaultOpenKeys={getDefaultOpenKeys()}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ border: 'none' }}
          />
        </div>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: "#fff" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
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
