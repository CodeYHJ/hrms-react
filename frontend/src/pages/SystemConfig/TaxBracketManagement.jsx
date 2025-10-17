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
  DatePicker,
  Statistic,
  Typography,
  Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { getTaxBracketsV2, createTaxBracketV2, updateTaxBracketV2, deleteTaxBracketV2 } from '@/services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const { Option } = Select;
const { TextArea } = Input;

const TaxBracketManagement = () => {
  const [taxBrackets, setTaxBrackets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    maxRate: 0,
  });

  useEffect(() => {
    fetchTaxBrackets();
  }, [pagination.current, pagination.pageSize]);

  const fetchTaxBrackets = async () => {
    setLoading(true);
    try {
      const response = await getTaxBracketsV2({
        start: (pagination.current - 1) * pagination.pageSize,
        limit: pagination.pageSize,
      });
      const data = response.data.list;
      setTaxBrackets(data);
      setPagination({
        ...pagination,
        total: response.data.total,
      });
      
      // 计算统计数据
      const activeCount = data.filter(item => item.is_active).length;
      const maxRate = Math.max(...data.map(item => item.tax_rate * 100));
      setStats({
        total: response.data.total,
        active: activeCount,
        inactive: response.data.total - activeCount,
        maxRate: maxRate,
      });
    } catch (error) {
      message.error('获取税率区间失败');
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
      await deleteTaxBracketV2(id);
      message.success('删除成功');
      fetchTaxBrackets();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await updateTaxBracketV2({ ...values, id: editingRecord.id });
        message.success('更新成功');
      } else {
        await createTaxBracketV2(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchTaxBrackets();
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '最低收入',
      dataIndex: 'min_income',
      key: 'min_income',
      render: (value) => `¥${value.toLocaleString()}`,
    },
    {
      title: '最高收入',
      dataIndex: 'max_income',
      key: 'max_income',
      render: (value) => value ? `¥${value.toLocaleString()}` : '无限制',
    },
    {
      title: '税率',
      dataIndex: 'tax_rate',
      key: 'tax_rate',
      render: (value) => `${(value * 100).toFixed(2)}%`,
    },
    {
      title: '速算扣除数',
      dataIndex: 'quick_deduction',
      key: 'quick_deduction',
      render: (value) => `¥${value.toLocaleString()}`,
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
      render: (value) => value ? (
        <Tag icon={<CheckCircleOutlined />} color="success">启用</Tag>
      ) : (
        <Tag icon={<CloseCircleOutlined />} color="default">禁用</Tag>
      ),
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
            title="确定要删除这个税率区间吗？"
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
    <div>
      {/* 数据统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="税率区间总数"
              value={stats.total}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="启用区间"
              value={stats.active}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="禁用区间"
              value={stats.inactive}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最高税率"
              value={stats.maxRate}
              suffix="%"
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Row style={{ marginBottom: 16 }}>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新增税率区间
            </Button>
          </Col>
        </Row>

      <Table
        columns={columns}
        dataSource={taxBrackets}
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
        title={editingRecord ? '编辑税率区间' : '新增税率区间'}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="最低收入"
                name="min_income"
                rules={[{ required: true, message: '请输入最低收入' }]}
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
                label="最高收入"
                name="max_income"
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="税率 (%)"
                name="tax_rate"
                rules={[{ required: true, message: '请输入税率' }]}
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
                label="速算扣除数"
                name="quick_deduction"
                rules={[{ required: true, message: '请输入速算扣除数' }]}
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
    </div>
  );
};

export default TaxBracketManagement;