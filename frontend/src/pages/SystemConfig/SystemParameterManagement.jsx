import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Space, 
  Popconfirm,
  Card,
  Row,
  Col,
  Switch,
  InputNumber
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getSystemParametersV2, createSystemParameterV2, updateSystemParameterV2, deleteSystemParameterV2 } from '@/services/api';

const { Option } = Select;
const { TextArea } = Input;

const SystemParameterManagement = () => {
  const [systemParameters, setSystemParameters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const parameterCategories = [
    { value: 'general', label: '通用参数' },
    { value: 'salary', label: '薪资参数' },
    { value: 'tax', label: '税务参数' },
    { value: 'insurance', label: '保险参数' },
    { value: 'attendance', label: '考勤参数' },
  ];

  const parameterTypes = [
    { value: 'string', label: '字符串' },
    { value: 'number', label: '数字' },
    { value: 'boolean', label: '布尔值' },
    { value: 'json', label: 'JSON' },
  ];

  useEffect(() => {
    fetchSystemParameters();
  }, [pagination.current, pagination.pageSize, selectedCategory]);

  const fetchSystemParameters = async () => {
    setLoading(true);
    try {
      const params = {
        start: (pagination.current - 1) * pagination.pageSize,
        limit: pagination.pageSize,
      };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      const response = await getSystemParametersV2(params);
      setSystemParameters(response.data.list);
      setPagination({
        ...pagination,
        total: response.data.total,
      });
    } catch (error) {
      message.error('获取系统参数失败');
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
    form.setFieldsValue(record);
  };

  const handleDelete = async (id) => {
    try {
      await deleteSystemParameterV2(id);
      message.success('删除成功');
      fetchSystemParameters();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await updateSystemParameterV2({ ...values, id: editingRecord.id });
        message.success('更新成功');
      } else {
        await createSystemParameterV2(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchSystemParameters();
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '创建失败');
    }
  };

  const renderParameterValue = (value, record) => {
    switch (record.parameter_type) {
      case 'boolean':
        return value === 'true' ? '是' : '否';
      case 'number':
        return parseFloat(value).toLocaleString();
      case 'json':
        try {
          const parsed = JSON.parse(value);
          return <pre>{JSON.stringify(parsed, null, 2)}</pre>;
        } catch {
          return value;
        }
      default:
        return value;
    }
  };

  const columns = [
    {
      title: '参数键',
      dataIndex: 'parameter_key',
      key: 'parameter_key',
    },
    {
      title: '参数值',
      dataIndex: 'parameter_value',
      key: 'parameter_value',
      render: (value, record) => renderParameterValue(value, record),
    },
    {
      title: '参数类型',
      dataIndex: 'parameter_type',
      key: 'parameter_type',
      render: (value) => {
        const type = parameterTypes.find(t => t.value === value);
        return type ? type.label : value;
      },
    },
    {
      title: '参数类别',
      dataIndex: 'parameter_category',
      key: 'parameter_category',
      render: (value) => {
        const category = parameterCategories.find(c => c.value === value);
        return category ? category.label : value;
      },
    },
    {
      title: '描述',
      dataIndex: 'parameter_description',
      key: 'parameter_description',
    },
    {
      title: '可编辑',
      dataIndex: 'is_editable',
      key: 'is_editable',
      render: (value) => value ? '是' : '否',
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
            disabled={!record.is_editable}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个系统参数吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              disabled={!record.is_editable}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderParameterValueInput = (parameterType) => {
    switch (parameterType) {
      case 'boolean':
        return (
          <Form.Item
            label="参数值"
            name="parameter_value"
            rules={[{ required: true, message: '请选择参数值' }]}
          >
            <Select>
              <Option value="true">是</Option>
              <Option value="false">否</Option>
            </Select>
          </Form.Item>
        );
      case 'number':
        return (
          <Form.Item
            label="参数值"
            name="parameter_value"
            rules={[{ required: true, message: '请输入参数值' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        );
      case 'json':
        return (
          <Form.Item
            label="参数值"
            name="parameter_value"
            rules={[
              { required: true, message: '请输入JSON格式的参数值' },
              {
                validator: (_, value) => {
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch {
                    return Promise.reject(new Error('请输入有效的JSON格式'));
                  }
                }
              }
            ]}
          >
            <TextArea rows={6} placeholder='请输入JSON格式的参数值，例如: {"key": "value"}' />
          </Form.Item>
        );
      default:
        return (
          <Form.Item
            label="参数值"
            name="parameter_value"
            rules={[{ required: true, message: '请输入参数值' }]}
          >
            <Input placeholder="请输入参数值" />
          </Form.Item>
        );
    }
  };

  return (
    <Card title="系统参数管理">
      <Row style={{ marginBottom: 16 }} gutter={16}>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增系统参数
          </Button>
        </Col>
        <Col>
          <Select
            style={{ width: 200 }}
            placeholder="选择参数类别"
            allowClear
            onChange={(value) => setSelectedCategory(value)}
          >
            {parameterCategories.map(category => (
              <Option key={category.value} value={category.value}>
                {category.label}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={systemParameters}
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
        title={editingRecord ? '编辑系统参数' : '新增系统参数'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="参数键"
                name="parameter_key"
                rules={[{ required: true, message: '请输入参数键' }]}
              >
                <Input placeholder="请输入参数键，例如: company_name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="参数类型"
                name="parameter_type"
                rules={[{ required: true, message: '请选择参数类型' }]}
              >
                <Select placeholder="请选择参数类型">
                  {parameterTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="参数类别"
                name="parameter_category"
                rules={[{ required: true, message: '请选择参数类别' }]}
              >
                <Select placeholder="请选择参数类别">
                  {parameterCategories.map(category => (
                    <Option key={category.value} value={category.value}>
                      {category.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="可编辑"
                name="is_editable"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>

          {renderParameterValueInput(form.getFieldValue('parameter_type'))}

          <Form.Item
            label="描述"
            name="parameter_description"
          >
            <TextArea rows={3} placeholder="请输入参数描述" />
          </Form.Item>

          {editingRecord && (
            <Form.Item
              label="状态"
              name="is_active"
              valuePropName="checked"
            >
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
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

export default SystemParameterManagement;