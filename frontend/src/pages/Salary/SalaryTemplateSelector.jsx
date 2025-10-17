import React, { useState, useEffect } from "react";
import { 
  getRecommendedTemplatesV2,
  getSalaryTemplateByIdV2
} from "../../services/api";
import {
  Card,
  List,
  Button,
  Modal,
  Tag,
  Tooltip,
  Space,
  Typography,
  Divider,
  Alert
} from "antd";
import {
  CheckCircleOutlined,
  EyeOutlined,
  DollarOutlined,
  PercentageOutlined
} from "@ant-design/icons";

const { Text, Paragraph } = Typography;

const SalaryTemplateSelector = ({ 
  visible, 
  onCancel, 
  onSelect,
  staffInfo = {} 
}) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDetail, setTemplateDetail] = useState(null);

  // 获取推荐模板
  const fetchRecommendedTemplates = async () => {
    setLoading(true);
    try {
      const response = await getRecommendedTemplatesV2({
        rank_id: staffInfo.rank_id,
        department_id: staffInfo.department_id
      });

      if (response.status) {
        setTemplates(response.data?.templates || []);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      setTemplates([]);
    }
    setLoading(false);
  };

  // 获取模板详情
  const fetchTemplateDetail = async (templateId) => {
    try {
      const response = await getSalaryTemplateByIdV2(templateId);
      if (response.status) {
        setTemplateDetail(response.data);
      }
    } catch (error) {
      console.error("获取模板详情失败", error);
    }
  };

  // 选择模板
  const handleSelect = (template) => {
    setSelectedTemplate(template);
    fetchTemplateDetail(template.id);
  };

  // 确认选择
  const handleConfirm = () => {
    if (selectedTemplate && templateDetail) {
      onSelect(templateDetail);
      onCancel();
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    if (visible) {
      fetchRecommendedTemplates();
      setSelectedTemplate(null);
      setTemplateDetail(null);
    }
  }, [visible, staffInfo]);

  return (
    <Modal
      title="选择薪资模板"
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button 
          key="confirm" 
          type="primary" 
          onClick={handleConfirm}
          disabled={!selectedTemplate}
        >
          确认选择
        </Button>
      ]}
    >
      <div style={{ display: 'flex', gap: 16 }}>
        {/* 模板列表 */}
        <div style={{ flex: 1 }}>
          <Card 
            title="推荐模板" 
            size="small"
            extra={`共 ${templates.length} 个模板`}
          >
            <List
              loading={loading}
              dataSource={templates}
              renderItem={(template) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedTemplate?.id === template.id ? '#f0f7ff' : 'transparent',
                    border: selectedTemplate?.id === template.id ? '1px solid #1890ff' : '1px solid transparent',
                    borderRadius: 6,
                    padding: '8px 12px',
                    marginBottom: 8
                  }}
                  onClick={() => handleSelect(template)}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{template.name}</Text>
                        {template.is_active ? (
                          <Tag color="green" size="small">启用</Tag>
                        ) : (
                          <Tag color="red" size="small">禁用</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Paragraph 
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 0, fontSize: '12px' }}
                      >
                        {template.description}
                      </Paragraph>
                    }
                  />
                  <div style={{ textAlign: 'right', fontSize: '12px' }}>
                    <div>{template.items?.length || 0} 个项目</div>
                    <div style={{ color: '#999' }}>
                      {template.created_at?.slice(0, 10)}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </div>

        {/* 模板详情 */}
        <div style={{ flex: 1 }}>
          <Card 
            title="模板详情" 
            size="small"
            loading={!templateDetail && selectedTemplate}
          >
            {templateDetail ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ fontSize: '16px' }}>
                    {templateDetail.name}
                  </Text>
                  <div style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
                    {templateDetail.description}
                  </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* 适用条件 */}
                <div style={{ marginBottom: 16 }}>
                  <Text strong>适用条件：</Text>
                  <div style={{ marginTop: 8 }}>
                    {templateDetail.rank_ids && templateDetail.rank_ids.length > 0 ? (
                      <div>
                        <Text type="secondary">适用职级：</Text>
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {templateDetail.rank_ids.length} 个职级
                        </Tag>
                      </div>
                    ) : (
                      <Text type="secondary">不限职级</Text>
                    )}
                    {templateDetail.department_ids && templateDetail.department_ids.length > 0 ? (
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary">适用部门：</Text>
                        <Tag color="green" style={{ marginLeft: 8 }}>
                          {templateDetail.department_ids.length} 个部门
                        </Tag>
                      </div>
                    ) : (
                      <Text type="secondary">不限部门</Text>
                    )}
                  </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* 薪资项目 */}
                <div>
                  <Text strong>薪资项目：</Text>
                  {templateDetail.items?.map((item, index) => (
                    <div 
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: index < templateDetail.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}
                    >
                      <Space>
                        <Text>{item.name}</Text>
                        {item.calculation_type === 'percentage' ? (
                          <PercentageOutlined style={{ color: '#1890ff' }} />
                        ) : (
                          <DollarOutlined style={{ color: '#52c41a' }} />
                        )}
                        <Tag color={item.is_addition ? 'green' : 'red'} size="small">
                          {item.is_addition ? '加项' : '减项'}
                        </Tag>
                      </Space>
                      <Text strong type={item.is_addition ? 'success' : 'danger'}>
                        {item.calculation_type === 'percentage' 
                          ? `${item.value}%` 
                          : `¥${item.value}`}
                      </Text>
                    </div>
                  ))}
                </div>

                {/* 总计预览 */}
                {templateDetail.items && templateDetail.items.length > 0 && (
                  <div style={{ 
                    marginTop: 16, 
                    padding: '12px', 
                    backgroundColor: '#f6ffed', 
                    borderRadius: 6,
                    border: '1px solid #b7eb8f'
                  }}>
                    <Text strong>模板说明：</Text>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                      此模板包含 {templateDetail.items.length} 个薪资项目，
                      其中 {templateDetail.items.filter(item => item.is_addition).length} 个加项，
                      {templateDetail.items.filter(item => !item.is_addition).length} 个减项
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                <EyeOutlined style={{ fontSize: '24px', marginBottom: 8 }} />
                <div>请选择一个模板查看详情</div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 员工信息提示 */}
      {staffInfo.staff_name && (
        <Alert
          message={`正在为 ${staffInfo.staff_name} (${staffInfo.staff_id}) 选择薪资模板`}
          description={`职级: ${staffInfo.rank_name || '未知'} | 部门: ${staffInfo.department_name || '未知'}`}
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Modal>
  );
};

export default SalaryTemplateSelector;