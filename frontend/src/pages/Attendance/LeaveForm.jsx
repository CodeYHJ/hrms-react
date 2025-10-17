import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, DatePicker, Select } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;
const { RangePicker } = DatePicker;

const LeaveForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const staffInfo = JSON.parse(localStorage.getItem('staffInfo') || '{}');
    form.setFieldsValue({
      staff_id: staffInfo.staffId,
      staff_name: staffInfo.staffName
    });
  }, [form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const leaveData = {
        staff_id: values.staff_id,
        staff_name: values.staff_name,
        start_date: values.date_range[0].format('YYYY-MM-DD'),
        end_date: values.date_range[1].format('YYYY-MM-DD'),
        leave_type: values.leave_type,
        reason: values.reason,
        approve_status: 0
      };

      await api.post('/leave_request/create', leaveData);
      message.success('请假申请提交成功');
      form.resetFields();
    } catch (error) {
      message.error('申请失败: ' + (error.response?.data?.result || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<><CalendarOutlined /> 请假申请</>} style={{ margin: 20 }}>
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
          label="请假日期"
          name="date_range"
          rules={[{ required: true, message: '请选择请假日期' }]}
        >
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="请假类型"
          name="leave_type"
          rules={[{ required: true, message: '请选择请假类型' }]}
        >
          <Select placeholder="请选择请假类型">
            <Option value="annual">年假</Option>
            <Option value="sick">病假</Option>
            <Option value="personal">事假</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="请假原因"
          name="reason"
          rules={[{ required: true, message: '请输入请假原因' }]}
        >
          <Input.TextArea rows={4} placeholder="请输入请假原因" />
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

export default LeaveForm;