import React, { useState, useEffect } from "react";
import { Table, Button, Space, message, Card, Form, Input, Modal } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { usePermission } from "../../components/Auth/usePermission";
import { candidateService } from "../../services/candidate";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

const CandidateManagement = () => {
  const [data, setData] = useState([]);
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

  const { hasPermission } = usePermission();
  const navigate = useNavigate();

  // 表格列定义 - 严格按照views HTML结构
  const columns = [
    {
      title: "序号",
      width: 60,
      fixed: "left",
      render: (text, record, index) =>
        index + 1 + (pagination.current - 1) * pagination.pageSize,
      align: "center",
    },
    {
      title: "候选人ID",
      dataIndex: "candidate_id",
      key: "candidate_id",
      width: 150,
      hidden: true,
    },
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      width: 100,
    },
    {
      title: "应聘职位",
      dataIndex: "job_name",
      key: "job_name",
      width: 130,
    },
    {
      title: "学历",
      dataIndex: "edu_level",
      key: "edu_level",
      width: 80,
    },
    {
      title: "专业",
      dataIndex: "major",
      key: "major",
      width: 120,
    },
    {
      title: "工作经验",
      dataIndex: "experience",
      key: "experience",
      width: 100,
    },
    {
      title: "投递邮箱",
      dataIndex: "email",
      key: "email",
      width: 120,
    },
    {
      title: "面试官",
      dataIndex: "staff_id",
      key: "staff_id",
      width: 260,
      render: (staffId) => {
        return staffId ? `${staffId}` : "未指定面试官";
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      fixed: "right",
      render: (status) => {
        switch (status) {
          case 0:
            return <span style={{ color: "blue" }}>面试中</span>;
          case 1:
            return <span style={{ color: "red" }}>已拒绝</span>;
          case 2:
            return <span style={{ color: "green" }}>已录取</span>;
          default:
            return "未知状态";
        }
      },
    },
    {
      title: "操作",
      key: "action",
      width: 210,
      fixed: "right",
      render: (_, record) => {
        const { status } = record;
        const isHired = status === 2;

        return (
          <Space size="middle">
            {hasPermission("interview") && status === 0 && (
              <Button
                type="primary"
                size="small"
                icon={<UserOutlined />}
                onClick={() => handleInterview(record)}
              >
                面试
              </Button>
            )}

            {hasPermission("query") && (
              <Button
                type="default"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              >
                查看
              </Button>
            )}

            {hasPermission("update") && (
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
            )}

            {hasPermission("delete") && (
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                disabled={isHired}
                onClick={() => handleDelete(record)}
              >
                删除
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  // 根据权限过滤列
  const filteredColumns = columns.filter((col) => !col.hidden);

  // 加载候选人数据
  const loadCandidates = async (searchValue = "", page = 1) => {
    setLoading(true);
    let response;
    if (searchValue) {
      response = await candidateService.searchCandidateByName(searchValue);
    } else {
      response = await candidateService.getAllCandidates();
    }
    console.log(response, "213");
    if (response.status) {
      const listData = response.data || [];
      setData(Array.isArray(listData) ? listData : []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: Array.isArray(listData) ? listData.length : 0,
      }));
    } else {
      message.error(response.message || "数据加载失败");
      setData([]);
    }
    setLoading(false);
  };

  // 初始化加载
  useEffect(() => {
    loadCandidates();
  }, []);

  // 搜索功能
  const handleSearch = (value) => {
    setSearchValue(value);
    loadCandidates(value, 1);
  };

  // 跳转到添加候选人页面
  const handleAdd = () => {
    navigate("/candidate/add");
  };

  // 编辑候选人
  const handleEdit = (record) => {
    sessionStorage.setItem("candidate_edit_info", JSON.stringify(record));
    navigate("/candidate/edit");
  };

  // 查看详情
  const handleViewDetail = (record) => {
    sessionStorage.setItem("candidate_detail_info", JSON.stringify(record));
    navigate("/candidate/detail");
  };

  // 指定面试官
  const handleInterview = (record) => {
    sessionStorage.setItem("candidate_interview_info", JSON.stringify(record));
    navigate("/candidate/interview");
  };

  // 删除候选人
  const handleDelete = (record) => {
    const { candidate_id, name, status } = record;

    if (status === 2) {
      message.error("已经录取，无法删除");
      return;
    }

    Modal.confirm({
      title: "确认删除",
      content: `确认删除候选人 [${name}] 吗？`,
      onOk: async () => {
        const response = await candidateService.deleteCandidate(candidate_id);
        if (response.status) {
          loadCandidates(searchValue, pagination.current);
        }
      },
    });
  };

  // 分页处理
  const handleTableChange = (paginationInfo) => {
    setPagination(paginationInfo);
  };

  return (
    <div>
      <div className="layuimini-container">
        <div className="layuimini-main">
          <Card>
            {hasPermission("query") && (
              <div style={{ marginBottom: 16 }}>
                <Form layout="inline">
                  <Form.Item label="候选人姓名">
                    <Search
                      placeholder="请输入候选人姓名"
                      allowClear
                      enterButton={<SearchOutlined />}
                      loading={searchLoading}
                      onSearch={handleSearch}
                      style={{ width: 250 }}
                    />
                  </Form.Item>
                </Form>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div>
                {hasPermission("create") && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                  >
                    添加候选人
                  </Button>
                )}
              </div>
            </div>

            <Table
              rowKey="candidate_id"
              columns={filteredColumns}
              dataSource={data}
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
              scroll={{ x: "max-content" }}
              bordered
              size="middle"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateManagement;
