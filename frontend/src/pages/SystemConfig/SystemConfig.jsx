import React, { useState } from 'react';
import { Layout, Menu, Card, Row, Col, Typography, Space } from 'antd';
import { 
  SettingOutlined, 
  DollarOutlined, 
  InsuranceOutlined, 
  CalculatorOutlined, 
  DatabaseOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import TaxBracketManagement from './TaxBracketManagement';
import InsuranceRateManagement from './InsuranceRateManagement';
import CalculationRuleManagement from './CalculationRuleManagement';
import SystemParameterManagement from './SystemParameterManagement';
import ParameterHistoryManagement from './ParameterHistoryManagement';

const { Title, Text } = Typography;

const { Sider, Content } = Layout;

const SystemConfig = () => {
  const [selectedKey, setSelectedKey] = useState('tax');

  const menuItems = [
    {
      key: 'tax',
      icon: <DollarOutlined />,
      label: '税率区间管理',
    },
    {
      key: 'insurance',
      icon: <InsuranceOutlined />,
      label: '保险费率管理',
    },
    {
      key: 'calculation',
      icon: <CalculatorOutlined />,
      label: '计算规则管理',
    },
    {
      key: 'parameter',
      icon: <DatabaseOutlined />,
      label: '系统参数管理',
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: '参数变更历史',
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'tax':
        return <TaxBracketManagement />;
      case 'insurance':
        return <InsuranceRateManagement />;
      case 'calculation':
        return <CalculationRuleManagement />;
      case 'parameter':
        return <SystemParameterManagement />;
      case 'history':
        return <ParameterHistoryManagement />;
      default:
        return <TaxBracketManagement />;
    }
  };

  const getPageTitle = () => {
    const titles = {
      tax: '税率区间管理',
      insurance: '保险费率管理', 
      calculation: '计算规则管理',
      parameter: '系统参数管理',
      history: '参数变更历史'
    };
    return titles[selectedKey] || '参数配置';
  };

  const getPageDescription = () => {
    const descriptions = {
      tax: '管理个人所得税税率区间和速算扣除数',
      insurance: '配置五险一金缴费比例和基数范围',
      calculation: '设置加班、请假、奖金等计算规则',
      parameter: '管理系统运行参数和业务规则',
      history: '查看所有参数配置的变更记录'
    };
    return descriptions[selectedKey] || '薪资计算参数化配置';
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sider 
        width={250} 
        style={{ background: '#fff' }}
        breakpoint="lg"
        collapsedWidth="0"
      >
        <div style={{ 
          height: '64px', 
          padding: '16px', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <SettingOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
           <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
             参数配置
           </span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ padding: '24px' }}>
        <Content style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '24px' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Title level={3} style={{ margin: 0 }}>
                {getPageTitle()}
              </Title>
              <Text type="secondary">
                {getPageDescription()}
              </Text>
            </Space>
          </div>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SystemConfig;