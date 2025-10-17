import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  message, 
  Space, 
  Popconfirm,
  Card,
  Row,
  Col,
  DatePicker
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCalculationRulesV2, createCalculationRuleV2, updateCalculationRuleV2, deleteCalculationRuleV2 } from '@/services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const CalculationRuleManagement = () => {
  const [calculationRules, setCalculationRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const ruleTypes = [
    { value: 'overtime', label: '加班费计算' },
    { value: 'bonus_deduction', label: '奖金扣除规则' },
    { value: 'attendance_base', label: '考勤基数计算' },
    { value: 'tax_threshold', label: '税收起征点' },
    { value: 'monthly_workdays', label: '月工作日数' },
    { value: 'leave_deduction_rate', label: '请假扣除率' },
  ];

  useEffect(() => {
    fetchCalculationRules();
  }, [pagination.current, pagination.pageSize, selectedType]);

  const fetchCalculationRules = async () => {
    setLoading(true);
    try {
      const params = {
        start: (pagination.current - 1) * pagination.pageSize,
        limit: pagination.pageSize,
      };
      if (selectedType) {
        params.rule_type = selectedType;
      }
      
      const response = await getCalculationRulesV2(params);
      setCalculationRules(response.data.list);
      setPagination({
        ...pagination,
        total: response.data.total,
      });
    } catch (error) {
      message.error('获取计算规则失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRecord(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setModalVisible(true);
    form.setFieldsValue({
      ...record,
      effective_date: record.effective_date ? dayjs(record.effective_date) : null
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteCalculationRuleV2(id);
      message.success('删除成功');
      fetchCalculationRules();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await updateCalculationRuleV2({ ...values, id: editingRecord.id });
        message.success('更新成功');
      } else {
        await createCalculationRuleV2(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchCalculationRules();
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '规则类型',
      dataIndex: 'rule_type',
      key: 'rule_type',
      render: (value) => {
        const type = ruleTypes.find(t => t.value === value);
        return type ? type.label : value;
      },
    },
    {
      title: '规则名称',
      dataIndex: 'rule_name',
      key: 'rule_name',
    },
    {
      title: '规则值',
      dataIndex: 'rule_value',
      key: 'rule_value',
      render: (value, record) => {
        switch (record.rule_type) {
          case 'overtime':
            return `${value} 倍`;
          case 'bonus_deduction':
          case 'leave_deduction_rate':
            return `${(value * 100).toFixed(2)}%`;
          case 'tax_threshold':
            return `¥${value.toLocaleString()}`;
          case 'monthly_workdays':
            return `${value} 天`;
          default:
            return value;
        }
      },
    },
    {
      title: '描述',
      dataIndex: 'rule_description',
      key: 'rule_description',
    },
    {
      title: '生效日期',
      dataIndex: 'effective_date',
      key: 'effective_date',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (value) => value ? '启用' : '禁用',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个计算规则吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const getRuleValueLabel = (ruleType) => {
    switch (ruleType) {
      case 'overtime':
        return '倍数';
      case 'bonus_deduction':
      case 'leave_deduction_rate':
        return '百分比 (%)';
      case 'tax_threshold':
        return '金额 (¥)';
      case 'monthly_workdays':
        return '天数';
      default:
        return '数值';
    }
  };

  const getRuleValueStep = (ruleType) => {
    switch (ruleType) {
      case 'overtime':
        return 0.1;
      case 'bonus_deduction':
      case 'leave_deduction_rate':
        return 0.01;
      case 'tax_threshold':
        return 100;
      case 'monthly_workdays':
        return 0.5;
      default:
        return 0.01;
    }
  };

  return (
    <Card title="计算规则管理">
      <Row style={{ marginBottom: 16 }} gutter={16}>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增计算规则
          </Button>
        </Col>
        <Col>
          <Select
            style={{ width: 200 }}
            placeholder="选择规则类型"
            allowClear
            onChange={(value) => setSelectedType(value)}
          >
            {ruleTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={calculationRules}
        loading={loading}
        rowKey="id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        }}
        onChange={(newPagination) => {
          setPagination(newPagination);
        }}
      />

      <Modal
        title={editingRecord ? '编辑计算规则' : '新增计算规则'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="规则类型"
            name="rule_type"
            rules={[{ required: true, message: '请选择规则类型' }]}
          >
            <Select placeholder="请选择规则类型">
              {ruleTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="规则名称"
            name="rule_name"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="请输入规则名称" />
          </Form.Item>

          <Form.Item
            label="规则值"
            name="rule_value"
            rules={[{ required: true, message: '请输入规则值' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={getRuleValueStep(form.getFieldValue('rule_type'))}
              placeholder={`请输入${getRuleValueLabel(form.getFieldValue('rule_type'))}`}
            />
          </Form.Item>

          <Form.Item
            label="生效日期"
            name="effective_date"
            rules={[{ required: true, message: '请选择生效日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="描述"
            name="rule_description"
          >
            <TextArea rows={3} placeholder="请输入规则描述" />
          </Form.Item>

          {editingRecord && (
            <Form.Item
              label="状态"
              name="is_active"
              valuePropName="checked"
            >
              <Select>
                <Option value={true}>启用</Option>
                <Option value={false}>禁用</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRecord ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CalculationRuleManagement;