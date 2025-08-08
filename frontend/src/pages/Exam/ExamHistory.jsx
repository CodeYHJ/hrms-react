import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  message,
  Input,
  Form,
  Tag,
} from "antd";
import {
  SearchOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { examService } from "../../services/exam";

const { Search } = Input;

const ExamHistory = () => {
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
  });

  // 获取考试历史记录
  const fetchExamHistory = async (searchValue = "") => {
    setLoading(true);
    const response = await examService.getExamHistory(searchValue);
      
    if (response.status) {
      setExamHistory(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.length || 0,
      }));
    } else {
      message.error(response.message || "获取考试历史记录失败");
      setExamHistory([]);
    }
    setLoading(false);
  };

  // 考试历史表格列
  const historyColumns = [
    {
      title: "序号",
      key: "index",
      width: 60,
      render: (text, record, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    {
      title: "ID",
      dataIndex: "ID",
      key: "ID",
      width: 60,
      hidden: true,
    },
    {
      title: "考试名称",
      dataIndex: "name",
      key: "name",
      width: 250,
    },
    {
      title: "员工工号",
      dataIndex: "staff_id",
      key: "staff_id",
      width: 200,
    },
    {
      title: "员工姓名",
      dataIndex: "staff_name",
      key: "staff_name",
      width: 200,
    },
    {
      title: "考试成绩",
      dataIndex: "score",
      key: "score",
      width: 200,
      render: (text) => <Tag color="blue">{text}分</Tag>,
    },
    {
      title: "提交时间",
      dataIndex: "date",
      key: "date",
      width: 200,
      fixed: 'right',
      render: (text) => (text ? text.slice(0, 19) : "-"),
    },
  ];

  // 根据权限过滤列
  const filteredColumns = historyColumns.filter((col) => !col.hidden);

  // 搜索功能
  const handleSearch = (value) => {
    setSearchValue(value);
    fetchExamHistory(value);
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchExamHistory();
  }, []);

  // 分页处理
  const handleTableChange = (paginationInfo) => {
    setPagination(paginationInfo);
  };

  return (
    <div>
      <div className="layuimini-container">
        <div className="layuimini-main">
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Form layout="inline">
                <Form.Item label="考试名称">
                  <Search
                    placeholder="请输入考试名称"
                    allowClear
                    enterButton={<SearchOutlined />}
                    loading={searchLoading}
                    onSearch={handleSearch}
                    style={{ width: 250 }}
                  />
                </Form.Item>
              </Form>
            </div>

            <Table
              columns={filteredColumns}
              dataSource={examHistory}
              loading={loading}
              rowKey="ID"
              pagination={pagination}
              onChange={handleTableChange}
              scroll={{ x: 800 }}
              bordered
              size="middle"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExamHistory;