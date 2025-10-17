import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, List, Button, Modal, message, Spin } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { notificationService } from "../../services/notification";
import dayjs from "dayjs";

const Dashboard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // 获取已发布通知
  const fetchPublishedNotices = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getPublishedNotifications({ limit: 10 });
      if (response.status) {
        setNotices(response.data || []);
      } else {
        message.error(response.message || "获取公告失败");
      }
    } catch (error) {
      message.error("获取公告失败");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPublishedNotices();
  }, []);

  const handleViewMore = (notice) => {
    setSelectedNotice(notice);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedNotice(null);
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>仪表板</h1>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总员工数"
              value={112}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="部门数量"
              value={8}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审批考勤"
              value={5}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月薪资总额"
              value={1128000}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card 
            title={
              <span>
                <NotificationOutlined style={{ marginRight: 8 }} />
                公告栏
              </span>
            } 
            style={{ minHeight: 400 }}
          >
            <Spin spinning={loading}>
              {notices.length > 0 ? (
                <List
                  dataSource={notices}
                  renderItem={(item) => (
                    <List.Item
                      key={item.notice_id}
                      actions={[
                        <Button 
                          key={`view-${item.notice_id}`}
                          type="link" 
                          onClick={() => handleViewMore(item)}
                        >
                          查看更多
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={item.notice_title}
                        description={
                          <div>
                            <div style={{ marginBottom: 8 }}>
                              {item.notice_content?.length > 100 
                                ? `${item.notice_content.substring(0, 100)}...` 
                                : item.notice_content}
                            </div>
                            <small style={{ color: "#999" }}>
                              发布时间: {item.date ? dayjs(item.date).format("YYYY-MM-DD HH:mm") : "-"}
                            </small>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                  暂无公告
                </div>
              )}
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* 公告详情Modal */}
      <Modal
        title="公告详情"
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedNotice && (
          <div>
            <h3>{selectedNotice.notice_title}</h3>
            <p style={{ color: "#666", marginBottom: 16 }}>
              发布时间: {selectedNotice.date ? dayjs(selectedNotice.date).format("YYYY-MM-DD HH:mm:ss") : "-"}
            </p>
            <div
              style={{
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              {selectedNotice.notice_content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
