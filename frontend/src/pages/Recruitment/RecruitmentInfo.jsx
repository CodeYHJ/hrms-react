import React, { useState, useEffect } from "react";
import { Table, Button, Space, message, Card, Form, Input, Modal } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { usePermission } from "../../components/Auth/usePermission";
import { recruitmentService } from "../../services/recruitment";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

const RecruitmentInfo = () => {
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
      title: "招聘ID",
      dataIndex: "recruitment_id",
      key: "recruitment_id",
      width: 150,
      hidden: true,
    },
    {
      title: "职位",
      dataIndex: "job_name",
      key: "job_name",
      width: 130,
    },
    {
      title: "类别",
      dataIndex: "job_type",
      key: "job_type",
      width: 100,
    },
    {
      title: "地点",
      dataIndex: "base_location",
      key: "base_location",
      width: 70,
    },
    {
      title: "薪资",
      dataIndex: "base_salary",
      key: "base_salary",
      width: 100,
    },
    {
      title: "学历",
      dataIndex: "edu_level",
      key: "edu_level",
      width: 100,
    },
    {
      title: "工作经验",
      dataIndex: "experience",
      key: "experience",
      width: 100,
    },
    {
      title: "岗位描述",
      dataIndex: "describe",
      key: "describe",
      width: 100,
      hidden: true,
    },
    {
      title: "投递邮箱",
      dataIndex: "email",
      key: "email",
      width: 120,
    },
    {
      title: "发布时间",
      dataIndex: "CreatedAt",
      key: "CreatedAt",
      width: 150,
      render: (text) => {
        return text ? text.slice(0, 10) : "";
      },
    },
    {
      title: "操作",
      key: "action",
      width: 170,
      fixed: "right",
      render: (_, record) => {
        return (
          <Space size="middle">
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

  // 加载招聘数据
  const loadRecruitments = async (searchValue = "", page = 1) => {
    setLoading(true);
    let response;
    if (searchValue) {
      response = await recruitmentService.searchRecruitmentByJobName(
        searchValue
      );
    } else {
      response = await recruitmentService.getAllRecruitment();
    }
    // const resp = response.data;
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
    loadRecruitments();
  }, []);

  // 搜索功能
  const handleSearch = (value) => {
    setSearchValue(value);
    loadRecruitments(value, 1);
  };

  // 跳转到添加页面
  const handleAdd = () => {
    navigate("/recruitment/add");
  };

  // 编辑职位
  const handleEdit = (record) => {
    sessionStorage.setItem("recruitment_edit_info", JSON.stringify(record));
    navigate("/recruitment/edit");
  };

  // 查看详情
  const handleViewDetail = (record) => {
    sessionStorage.setItem("recruitment_detail", JSON.stringify(record));
    navigate("/recruitment/detail");
  };

  // 删除职位
  const handleDelete = (record) => {
    const { recruitment_id, job_name } = record;

    Modal.confirm({
      title: "确认删除",
      content: `确认删除招聘职位 [${job_name}] 吗？`,
      onOk: async () => {
        const response = await recruitmentService.deleteRecruitment(
          recruitment_id
        );
        if (response.status) {
          loadRecruitments(searchValue, pagination.current);
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
                  <Form.Item label="岗位名称">
                    <Search
                      placeholder="请输入岗位名称"
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
                    添加招聘信息
                  </Button>
                )}
              </div>
            </div>

            <Table
              rowKey="recruitment_id"
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

export default RecruitmentInfo;
