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
import { getInsuranceRatesV2, createInsuranceRateV2, updateInsuranceRateV2, deleteInsuranceRateV2 } from '@/services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const InsuranceRateManagement = () => {
  const [insuranceRates, setInsuranceRates] = useState([]);
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

  const insuranceTypes = [
    { value: 'pension', label: '养老保险' },
    { value: 'medical', label: '医疗保险' },
    { value: 'unemployment', label: '失业保险' },
    { value: 'housing', label: '住房公积金' },
    { value: 'injury', label: '工伤保险' },
    { value: 'maternity', label: '生育保险' },
  ];

  useEffect(() => {
    fetchInsuranceRates();
  }, [pagination.current, pagination.pageSize, selectedType]);

  const fetchInsuranceRates = async () => {
    setLoading(true);
    try {
      const params = {
        start: (pagination.current - 1) * pagination.pageSize,
        limit: pagination.pageSize,
      };
      if (selectedType) {
        params.insurance_type = selectedType;
      }
      
      const response = await getInsuranceRatesV2(params);
      setInsuranceRates(response.data.list);
      setPagination({
        ...pagination,
        total: response.data.total,
      });
    } catch (error) {
      message.error('获取保险费率失败');
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
      await deleteInsuranceRateV2(id);
      message.success('删除成功');
      fetchInsuranceRates();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await updateInsuranceRateV2({ ...values, id: editingRecord.id });
        message.success('更新成功');
      } else {
        await createInsuranceRateV2(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchInsuranceRates();
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '保险类型',
      dataIndex: 'insurance_type',
      key: 'insurance_type',
      render: (value) => {
        const type = insuranceTypes.find(t => t.value === value);
        return type ? type.label : value;
      },
    },
    {
      title: '个人费率',
      dataIndex: 'employee_rate',
      key: 'employee_rate',
      render: (value) => `${(value * 100).toFixed(2)}%`,
    },
    {
      title: '企业费率',
      dataIndex: 'employer_rate',
      key: 'employer_rate',
      render: (value) => `${(value * 100).toFixed(2)}%`,
    },
    {
      title: '缴费基数下限',
      dataIndex: 'min_base',
      key: 'min_base',
      render: (value) => value ? `¥${value.toLocaleString()}` : '无限制',
    },
    {
      title: '缴费基数上限',
      dataIndex: 'max_base',
      key: 'max_base',
      render: (value) => value ? `¥${value.toLocaleString()}` : '无限制',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
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
            title="确定要删除这个保险费率吗？"
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

  return (
    <Card title="保险费率管理">
      <Row style={{ marginBottom: 16 }} gutter={16}>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增保险费率
          </Button>
        </Col>
        <Col>
          <Select
            style={{ width: 200 }}
            placeholder="选择保险类型"
            allowClear
            onChange={(value) => setSelectedType(value)}
          >
            {insuranceTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={insuranceRates}
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
        title={editingRecord ? '编辑保险费率' : '新增保险费率'}
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
            label="保险类型"
            name="insurance_type"
            rules={[{ required: true, message: '请选择保险类型' }]}
          >
            <Select placeholder="请选择保险类型">
              {insuranceTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="个人费率 (%)"
                name="employee_rate"
                rules={[{ required: true, message: '请输入个人费率' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  step={0.01}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="企业费率 (%)"
                name="employer_rate"
                rules={[{ required: true, message: '请输入企业费率' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  step={0.01}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="缴费基数下限"
                name="min_base"
                help="留空表示无限制"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/¥\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="缴费基数上限"
                name="max_base"
                help="留空表示无限制"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/¥\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="生效日期"
            name="effective_date"
            rules={[{ required: true, message: '请选择生效日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea rows={3} placeholder="请输入描述信息" />
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

export default InsuranceRateManagement;