import React, { useState, useEffect } from "react";
import { Form, Button, Card, message, DatePicker, Select } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import api from "../../services/api";
import dayjs from "dayjs";

const ClockIn = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = async (values) => {
    setLoading(true);
    try {
      const staffInfo = JSON.parse(localStorage.getItem("staffInfo") || "{}");
      const clockInData = {
        staff_id: staffInfo.staffId,
        staff_name: staffInfo.staffName,
        date: values.date
          ? values.date.format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        check_in_time: values.check_in_time
          ? values.check_in_time.format("YYYY-MM-DD HH:mm:ss")
          : dayjs().format("YYYY-MM-DD HH:mm:ss"),
        check_out_time: values.check_out_time
          ? values.check_out_time.format("YYYY-MM-DD HH:mm:ss")
          : null,
        status: 0,
      };

      await api.post("/clock_in/create", clockInData);
      message.success("打卡成功");
      form.resetFields();
    } catch (error) {
      message.error(
        "打卡失败: " + (error.response?.data?.result || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <>
          <ClockCircleOutlined /> 考勤打卡
        </>
      }
      style={{ margin: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleClockIn}
        initialValues={{
          date: currentTime,
          check_in_time: currentTime,
        }}
      >
        <Form.Item
          label="打卡日期"
          name="date"
          rules={[{ required: true, message: "请选择打卡日期" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="上班打卡时间"
          name="check_in_time"
          rules={[{ required: true, message: "请选择上班打卡时间" }]}
        >
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="下班打卡时间" name="check_out_time">
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            确认打卡
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ClockIn;
