import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Space,
  Form,
  Input,
  Row,
  Col,
  Select,
  DatePicker,
  message,
  Modal,
  Popconfirm,
  Tag,
  Statistic,
  Row as AntRow,
  Col as AntCol,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClearOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { operationLogService } from "../../services/operationLog";
import { usePermission } from "../../components/Auth/usePermission";
import { formatDate } from "../../utils/helpers";
import { PAGINATION_CONFIG, TABLE_CONFIG } from "../../utils/constants";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

const OperationLogManagement = () => {
  const [form] = Form.useForm();
  const { hasPermission } = usePermission();

  // 状态管理
  const [logList, setLogList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pagination, setPagination] = useState({
    ...PAGINATION_CONFIG,
    total: 0,
  });

  // 表格高度状态
  const [tableHeight, setTableHeight] = useState(400);

  // 详情相关状态
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // 统计数据
  const [stats, setStats] = useState({});

  // 操作类型选项
  const operationTypes = [
    { value: "CREATE", label: "创建" },
    { value: "UPDATE", label: "更新" },
    { value: "DELETE", label: "删除" },
    { value: "QUERY", label: "查询" },
    { value: "LOGIN", label: "登录" },
    { value: "LOGOUT", label: "登出" },
    { value: "EXPORT", label: "导出" },
    { value: "IMPORT", label: "导入" },
  ];

  // 操作模块选项
  const operationModules = [
    { value: "STAFF", label: "员工管理" },
    { value: "DEPARTMENT", label: "部门管理" },
    { value: "ATTENDANCE", label: "考勤管理" },
    { value: "SALARY", label: "薪资管理" },
    { value: "RECRUITMENT", label: "招聘管理" },
    { value: "CANDIDATE", label: "应聘者管理" },
    { value: "EXAM", label: "考试管理" },
    { value: "RANK", label: "职级管理" },
    { value: "AUTHORITY", label: "权限管理" },
    { value: "NOTIFICATION", label: "通知管理" },
  ];

  // 页面加载时获取日志列表和统计数据
  useEffect(() => {
    fetchLogList();
    fetchStats();
  }, []);

  // 计算表格高度的函数
  const calculateTableHeight = () => {
    // 获取ant-layout-content容器高度
    const contentElement = document.querySelector(".ant-layout-content");
    const containerHeight = contentElement
      ? contentElement.clientHeight
      : window.innerHeight;

    // ant-layout-content有24px margin和24px padding，总共48px
    const contentPadding = 48;

    // 统计卡片高度: 120px
    // 搜索表单高度: 80px
    // 表格标题和边距: 100px (增加Card内边距和表格空白)
    // 分页组件高度: 80px (增加分页组件占位)
    // 底部预留空间: 100px
    // 额外预留空间: 80px (Table组件内边距、行间距、滚动条等)
    const reservedHeight = contentPadding + 120 + 80 + 100 + 80 + 100 + 80 + 20;
    const calculatedHeight = containerHeight - reservedHeight;
    // 设置最小高度300px，最大高度800px
    const finalHeight = Math.max(250, Math.min(calculatedHeight, 800));
    setTableHeight(finalHeight);
  };
  // 获取操作日志列表
  const fetchLogList = async (params = {}) => {
    setLoading(true);
    const searchParams = form.getFieldsValue();

    // 处理时间范围
    if (searchParams.operationTime && searchParams.operationTime.length === 2) {
      searchParams.start_time = searchParams.operationTime[0].format(
        "YYYY-MM-DD HH:mm:ss"
      );
      searchParams.end_time = searchParams.operationTime[1].format(
        "YYYY-MM-DD HH:mm:ss"
      );
    }
    delete searchParams.operationTime;

    // 合并搜索参数和表格过滤器参数
    // 表格过滤器参数优先级高于搜索表单参数
    const finalParams = {
      ...searchParams,
      ...params,
    };

    const response = await operationLogService.getLogs({
      ...finalParams,
      page: params.page || pagination.current,
      page_size: params.page_size || pagination.pageSize,
    });

    if (response && response.logs) {
      setLogList(response.logs || []);
      setPagination((prev) => ({
        ...prev,
        total: response.total || 0,
        current: params.page || prev.current,
        pageSize: params.page_size || prev.pageSize,
      }));
    }
    setLoading(false);
  };

  // 监听窗口大小变化
  useEffect(() => {
    calculateTableHeight();

    const handleResize = () => {
      calculateTableHeight();
    };

    window.addEventListener("resize", handleResize);

    // 清理事件监听器
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [logList]);

  // 获取统计数据
  const fetchStats = async () => {
    const response = await operationLogService.getStats();
    if (response) {
      setStats(response);
    }
  };

  // 搜索
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchLogList({ page: 1 });
  };

  // 重置搜索条件
  const handleReset = () => {
    form.resetFields();
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchLogList({ page: 1 });
  };

  // 分页变化
  const handleTableChange = (newPagination, filters) => {
    const filterParams = {};
    
    // 处理表格过滤器
    if (filters.operation_type && filters.operation_type.length > 0) {
      filterParams.operation_type = filters.operation_type[0];
    }
    if (filters.operation_module && filters.operation_module.length > 0) {
      filterParams.operation_module = filters.operation_module[0];
    }
    if (filters.operation_status && filters.operation_status.length > 0) {
      filterParams.operation_status = filters.operation_status[0];
    }
    
    fetchLogList({
      page: newPagination.current,
      page_size: newPagination.pageSize,
      ...filterParams,
    });
  };

  // 查看详情
  const handleViewDetail = (record) => {
    setDetailData(record);
    setDetailVisible(true);
  };

  // 删除日志
  const handleDelete = async (logId) => {
    await operationLogService.deleteLog(logId);
    message.success("删除成功");
    fetchLogList();
    fetchStats();
  };

  // 批量删除
  const handleBatchDelete = async () => {
    Modal.confirm({
      title: "批量删除确认",
      content: "确定要删除30天前的操作日志吗？此操作不可恢复。",
      onOk: async () => {
        const endTime = dayjs()
          .subtract(30, "days")
          .format("YYYY-MM-DD HH:mm:ss");
        await operationLogService.deleteLogsByTime(endTime);
        message.success("批量删除成功");
        fetchLogList();
        fetchStats();
      },
    });
  };

  // 表格列定义
  const columns = [
    {
      title: "日志ID",
      dataIndex: "log_id",
      key: "log_id",
      width: 100,
      ...TABLE_CONFIG,
    },
    {
      title: "操作人员",
      dataIndex: "staff_name",
      key: "staff_name",
      width: 120,
      ...TABLE_CONFIG,
    },
    {
      title: "操作类型",
      dataIndex: "operation_type",
      key: "operation_type",
      width: 100,
      filters: operationTypes.map(type => ({
        text: type.label,
        value: type.value,
      })),
      filterMultiple: false,
      render: (type) => {
        const typeMap = {
          CREATE: { color: "green", text: "创建" },
          UPDATE: { color: "blue", text: "更新" },
          DELETE: { color: "red", text: "删除" },
          QUERY: { color: "default", text: "查询" },
          LOGIN: { color: "purple", text: "登录" },
          LOGOUT: { color: "orange", text: "登出" },
          EXPORT: { color: "cyan", text: "导出" },
          IMPORT: { color: "magenta", text: "导入" },
        };
        const config = typeMap[type] || { color: "default", text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      ...TABLE_CONFIG,
    },
    {
      title: "操作模块",
      dataIndex: "operation_module",
      key: "operation_module",
      width: 120,
      filters: operationModules.map(module => ({
        text: module.label,
        value: module.value,
      })),
      filterMultiple: false,
      render: (module) => {
        const moduleMap = {
          STAFF: "员工管理",
          DEPARTMENT: "部门管理",
          ATTENDANCE: "考勤管理",
          SALARY: "薪资管理",
          RECRUITMENT: "招聘管理",
          CANDIDATE: "应聘者管理",
          EXAM: "考试管理",
          RANK: "职级管理",
          AUTHORITY: "权限管理",
          NOTIFICATION: "通知管理",
        };
        return moduleMap[module] || module;
      },
      ...TABLE_CONFIG,
    },
    {
      title: "操作描述",
      dataIndex: "operation_desc",
      key: "operation_desc",
      width: 200,
      ellipsis: true,
      ...TABLE_CONFIG,
    },
    {
      title: "操作状态",
      dataIndex: "operation_status",
      key: "operation_status",
      width: 100,
      filters: [
        { text: "成功", value: 1 },
        { text: "失败", value: 0 },
      ],
      filterMultiple: false,
      render: (status) => (
        <Tag color={status === 1 ? "success" : "error"}>
          {status === 1 ? "成功" : "失败"}
        </Tag>
      ),
      ...TABLE_CONFIG,
    },
    {
      title: "IP地址",
      dataIndex: "ip_address",
      key: "ip_address",
      width: 120,
      ...TABLE_CONFIG,
    },
    {
      title: "操作时间",
      dataIndex: "operation_time",
      key: "operation_time",
      width: 160,
      render: (time) => formatDate(time),
      ...TABLE_CONFIG,
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {hasPermission("operation_log_delete") && (
            <Popconfirm
              title="确定删除这条日志吗？"
              onConfirm={() => handleDelete(record.log_id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <AntRow gutter={16} style={{ marginBottom: 16 }}>
        <AntCol span={6}>
          <Card>
            <Statistic
              title="总日志数"
              value={stats.total_logs || 0}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </AntCol>
        <AntCol span={6}>
          <Card>
            <Statistic
              title="成功操作"
              value={stats.success_logs || 0}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </AntCol>
        <AntCol span={6}>
          <Card>
            <Statistic
              title="失败操作"
              value={stats.failed_logs || 0}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </AntCol>
        <AntCol span={6}>
          <Card>
            <Statistic
              title="成功率"
              value={
                stats.total_logs
                  ? (
                      ((stats.success_logs || 0) / stats.total_logs) *
                      100
                    ).toFixed(2)
                  : 0
              }
              suffix="%"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </AntCol>
      </AntRow>

      {/* 搜索表单 */}
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline">
          <Form.Item name="staff_name" label="操作人员">
            <Input.Search 
              placeholder="请输入操作人员姓名" 
              allowClear 
              onSearch={handleSearch}
            />
          </Form.Item>
          <Form.Item name="operation_time" label="操作时间">
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder={["开始时间", "结束时间"]}
              onChange={handleSearch}
            />
          </Form.Item>
        </Form>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={logList}
          rowKey="log_id"
          loading={loading}
          pagination={{
            ...pagination,
            ...PAGINATION_CONFIG,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200, y: tableHeight }}
          size="middle"
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="操作日志详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {detailData && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p>
                  <strong>日志ID：</strong>
                  {detailData.log_id}
                </p>
                <p>
                  <strong>操作人员：</strong>
                  {detailData.staff_name}
                </p>
                <p>
                  <strong>操作类型：</strong>
                  {detailData.operation_type}
                </p>
                <p>
                  <strong>操作模块：</strong>
                  {detailData.operation_module}
                </p>
                <p>
                  <strong>操作状态：</strong>
                  <Tag
                    color={
                      detailData.operation_status === 1 ? "success" : "error"
                    }
                  >
                    {detailData.operation_status === 1 ? "成功" : "失败"}
                  </Tag>
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>IP地址：</strong>
                  {detailData.ip_address}
                </p>
                <p>
                  <strong>请求方法：</strong>
                  {detailData.request_method}
                </p>
                <p>
                  <strong>请求URL：</strong>
                  {detailData.request_url}
                </p>
                <p>
                  <strong>操作时间：</strong>
                  {formatDate(detailData.operation_time)}
                </p>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <p>
                  <strong>操作描述：</strong>
                  {detailData.operation_desc}
                </p>
                <p>
                  <strong>请求参数：</strong>
                  <pre
                    style={{
                      background: "#f5f5f5",
                      padding: "8px",
                      borderRadius: "4px",
                      maxHeight: "200px",
                      overflow: "auto",
                    }}
                  >
                    {detailData.request_params || "无"}
                  </pre>
                </p>
                {detailData.error_message && (
                  <p>
                    <strong>错误信息：</strong>
                    <pre
                      style={{
                        background: "#fff2f0",
                        padding: "8px",
                        borderRadius: "4px",
                        color: "#ff4d4f",
                        maxHeight: "200px",
                        overflow: "auto",
                      }}
                    >
                      {detailData.error_message}
                    </pre>
                  </p>
                )}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OperationLogManagement;
