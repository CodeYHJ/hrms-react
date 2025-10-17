import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card,
  Row,
  Col,
  Select,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  Descriptions,
  Modal
} from 'antd';
import { HistoryOutlined, EyeOutlined } from '@ant-design/icons';
import { getParameterHistoryV2 } from '@/services/api';

const { Option } = Select;
const { Text } = Typography;
const { Search } = Input;

const ParameterHistoryManagement = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filters, setFilters] = useState({
    parameter_type: '',
    parameter_id: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const parameterTypes = [
    { value: 'tax_bracket', label: '税率区间', color: 'blue' },
    { value: 'insurance_rate', label: '保险费率', color: 'green' },
    { value: 'calculation_rule', label: '计算规则', color: 'orange' },
    { value: 'system_parameter', label: '系统参数', color: 'purple' },
  ];

  useEffect(() => {
    fetchHistory();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {
        start: (pagination.current - 1) * pagination.pageSize,
        limit: pagination.pageSize,
      };
      if (filters.parameter_type) {
        params.parameter_type = filters.parameter_type;
      }
      if (filters.parameter_id) {
        params.parameter_id = filters.parameter_id;
      }
      
      const response = await getParameterHistoryV2(params);
      
      // Filter by search term if provided
      let filteredData = response.data.list;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(record => 
          record.parameter_id.toLowerCase().includes(searchLower) ||
          record.changed_by.toLowerCase().includes(searchLower) ||
          record.change_reason.toLowerCase().includes(searchLower)
        );
      }
      
      setHistory(filteredData);
      setPagination({
        ...pagination,
        total: filteredData.length,
      });
    } catch (error) {
      console.error('获取参数历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const formatJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const getParameterTypeLabel = (type) => {
    const paramType = parameterTypes.find(t => t.value === type);
    return paramType ? paramType.label : type;
  };

  const getParameterTypeColor = (type) => {
    const paramType = parameterTypes.find(t => t.value === type);
    return paramType ? paramType.color : 'default';
  };

  const columns = [
    {
      title: '参数类型',
      dataIndex: 'parameter_type',
      key: 'parameter_type',
      render: (value) => (
        <Tag color={getParameterTypeColor(value)}>
          {getParameterTypeLabel(value)}
        </Tag>
      ),
    },
    {
      title: '参数ID',
      dataIndex: 'parameter_id',
      key: 'parameter_id',
      render: (value) => (
        <Text code>{value}</Text>
      ),
    },
    {
      title: '变更原因',
      dataIndex: 'change_reason',
      key: 'change_reason',
      ellipsis: true,
    },
    {
      title: '操作人',
      dataIndex: 'changed_by',
      key: 'changed_by',
    },
    {
      title: '变更时间',
      dataIndex: 'change_date',
      key: 'change_date',
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <Card title="参数变更历史">
      <Row style={{ marginBottom: 16 }} gutter={16}>
        <Col>
          <Select
            style={{ width: 150 }}
            placeholder="选择参数类型"
            allowClear
            value={filters.parameter_type}
            onChange={(value) => setFilters({ ...filters, parameter_type: value })}
          >
            {parameterTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Search
            placeholder="搜索参数ID、操作人或变更原因"
            style={{ width: 300 }}
            onSearch={(value) => setFilters({ ...filters, search: value })}
            allowClear
          />
        </Col>
        <Col>
          <Button onClick={fetchHistory}>刷新</Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={history}
        loading={loading}
        rowKey="history_id"
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
        title="变更详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="参数类型">
              <Tag color={getParameterTypeColor(selectedRecord.parameter_type)}>
                {getParameterTypeLabel(selectedRecord.parameter_type)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="参数ID">
              <Text code>{selectedRecord.parameter_id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="变更原因">
              {selectedRecord.change_reason}
            </Descriptions.Item>
            <Descriptions.Item label="操作人">
              {selectedRecord.changed_by}
            </Descriptions.Item>
            <Descriptions.Item label="变更时间">
              {new Date(selectedRecord.change_date).toLocaleString()}
            </Descriptions.Item>
            
            {selectedRecord.old_value && (
              <Descriptions.Item label="变更前值">
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '8px', 
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  {formatJSON(selectedRecord.old_value)}
                </pre>
              </Descriptions.Item>
            )}
            
            {selectedRecord.new_value && (
              <Descriptions.Item label="变更后值">
                <pre style={{ 
                  backgroundColor: '#f0f9ff', 
                  padding: '8px', 
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  {formatJSON(selectedRecord.new_value)}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
};

export default ParameterHistoryManagement;