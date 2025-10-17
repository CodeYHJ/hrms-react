import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, DatePicker } from 'antd';
import {EditOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';

const PunchForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const staffInfo = JSON.parse(localStorage.getItem('staffInfo') || '{}');
    form.setFieldsValue({
      staff_id: staffInfo.staffId,
      staff_name: staffInfo.staffName,
      date: dayjs(),
      requested_time: dayjs()
    });
  }, [form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const punchData = {
        staff_id: values.staff_id,
        staff_name: values.staff_name,
        date: values.date.format('YYYY-MM-DD'),
        requested_time: values.requested_time.format('YYYY-MM-DD HH:mm:ss'),
        reason: values.reason,
        approve_status: 0
      };

      await api.post('/punch_request/create', punchData);
      message.success('补打卡申请提交成功');
      form.resetFields();
    } catch (error) {
      message.error('申请失败: ' + (error.response?.data?.result || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<><EditOutlined /> 补打卡申请</>} style={{ margin: 20 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="员工工号"
          name="staff_id"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="员工姓名"
          name="staff_name"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="补打卡日期"
          name="date"
          rules={[{ required: true, message: '请选择补打卡日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="申请补打卡时间"
          name="requested_time"
          rules={[{ required: true, message: '请选择申请补打卡时间' }]}
        >
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="补打卡原因"
          name="reason"
          rules={[{ required: true, message: '请输入补打卡原因' }]}
        >
          <Input.TextArea rows={4} placeholder="请输入补打卡原因" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            提交申请
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PunchForm;