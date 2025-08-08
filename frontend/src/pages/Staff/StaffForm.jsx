import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  message,
} from "antd";
import { staffService } from "../../services/staff";
import { departmentService, rankService } from "../../services/department";
import {
  validatePhone,
  validateEmail,
  validateIdCard,
} from "../../utils/helpers";
import dayjs from "dayjs";

const { Option } = Select;

const StaffForm = ({ visible, onCancel, onSuccess, editData = null }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [rankLoading, setRankLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);

  const isEdit = !!editData;

  // 加载部门和职级数据
  useEffect(() => {
    if (visible) {
      loadDepartments();
      loadRanks();
      loadStaffList();

      // 如果是编辑模式，填充表单数据
      if (isEdit) {
        form.setFieldsValue({
          ...editData,
          birthday: editData.birthday ? dayjs(editData.birthday) : null,
          entry_date: editData.entry_date ? dayjs(editData.entry_date) : null,
          sex_str: editData.sex === 1 ? "男" : editData.sex === 2 ? "女" : "",
        });
      }
    }
  }, [visible, editData, isEdit, form]);

  // 加载部门列表
  const loadDepartments = async () => {
    setDepartmentLoading(true);
    const response = await departmentService.getAllDepartments();
    if (response.status) {
      setDepartments(Array.isArray(response.data) ? response.data : []);
    }
    setDepartmentLoading(false);
  };

  // 加载职级列表
  const loadRanks = async () => {
    setRankLoading(true);
    const response = await rankService.getAllRanks();
    if (response.status) {
      setRanks(Array.isArray(response.data) ? response.data : []);
    }
    setRankLoading(false);
  };

  // 加载员工列表
  const loadStaffList = async () => {
    setStaffLoading(true);
    const response = await staffService.getAllStaff();
    if (response.status) {
      setStaffList(Array.isArray(response.data) ? response.data : []);
    }
    setStaffLoading(false);
  };

  // 提交表单
  const handleSubmit = async (values) => {
    setLoading(true);
    // 格式化数据
    const formData = {
      ...values,
      birthday_str: values.birthday ? values.birthday.format("YYYY-MM-DD") : "",
      entry_date_str: values.entry_date
        ? values.entry_date.format("YYYY-MM-DD")
        : "",
      phone: parseInt(values.phone) || 0,
      base_salary: parseInt(values.base_salary) || 0,
    };

    // 移除不需要的字段
    delete formData.birthday;
    delete formData.entry_date;

    let response;
    if (isEdit) {
      // 编辑模式
      formData.staff_id = editData.staff_id;
      response = await staffService.editStaff(formData);
    } else {
      // 新增模式
      response = await staffService.createStaff(formData);
    }

    if (response.status) {
      form.resetFields();
      onSuccess();
    }
    setLoading(false);
  };

  // 取消操作
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={isEdit ? "编辑员工" : "添加员工"}
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          sex_str: "男",
          nation: "汉族",
          edu_level: "本科",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="staff_name"
              label="员工姓名"
              rules={[
                { required: true, message: "请输入员工姓名" },
                { max: 20, message: "姓名不能超过20个字符" },
              ]}
            >
              <Input placeholder="请输入员工姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="identity_num"
              label="身份证号"
              rules={[
                { required: true, message: "请输入身份证号" },
                {
                  validator: (_, value) => {
                    if (value && !validateIdCard(value)) {
                      return Promise.reject(new Error("请输入正确的身份证号"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="请输入身份证号" maxLength={18} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dep_id"
              label="所属部门"
              rules={[{ required: true, message: "请选择所属部门" }]}
            >
              <Select
                placeholder="请选择所属部门"
                loading={departmentLoading}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {departments.map((dept) => (
                  <Option key={dept.dep_id} value={dept.dep_id}>
                    {dept.dep_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="rank_id"
              label="职级"
              rules={[{ required: true, message: "请选择职级" }]}
            >
              <Select
                placeholder="请选择职级"
                loading={rankLoading}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {ranks.map((rank) => (
                  <Option key={rank.rank_id} value={rank.rank_id}>
                    {rank.rank_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="leader_staff_id" label="上级">
              <Select
                placeholder="请选择上级（可选）"
                loading={staffLoading}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                onChange={(value) => {
                  if (value) {
                    const selectedStaff = staffList.find(
                      (staff) => staff.staff_id === value
                    );
                    if (selectedStaff) {
                      form.setFieldsValue({
                        leader_name: selectedStaff.staff_name,
                      });
                    }
                  } else {
                    form.setFieldsValue({
                      leader_name: "",
                    });
                  }
                }}
              >
                {staffList.map((staff) => (
                  <Option key={staff.staff_id} value={staff.staff_id}>
                    {staff.staff_name} ({staff.staff_id})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="birthday"
              label="出生日期"
              rules={[{ required: true, message: "请选择出生日期" }]}
            >
              <DatePicker
                placeholder="请选择出生日期"
                style={{ width: "100%" }}
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="sex_str"
              label="性别"
              rules={[{ required: true, message: "请选择性别" }]}
            >
              <Select placeholder="请选择性别">
                <Option value="男">男</Option>
                <Option value="女">女</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="nation"
              label="民族"
              rules={[{ required: true, message: "请输入民族" }]}
            >
              <Input placeholder="请输入民族" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="edu_level"
              label="学历"
              rules={[{ required: true, message: "请选择学历" }]}
            >
              <Select placeholder="请选择学历">
                <Option value="高中">高中</Option>
                <Option value="大专">大专</Option>
                <Option value="本科">本科</Option>
                <Option value="硕士">硕士</Option>
                <Option value="博士">博士</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="school"
              label="毕业学校"
              rules={[{ required: true, message: "请输入毕业学校" }]}
            >
              <Input placeholder="请输入毕业学校" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="major"
              label="专业"
              rules={[{ required: true, message: "请输入专业" }]}
            >
              <Input placeholder="请输入专业" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="联系电话"
              rules={[
                { required: true, message: "请输入联系电话" },
                {
                  validator: (_, value) => {
                    if (value && !validatePhone(value)) {
                      return Promise.reject(new Error("请输入正确的手机号"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="请输入联系电话" maxLength={11} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: "请输入邮箱" },
                {
                  validator: (_, value) => {
                    if (value && !validateEmail(value)) {
                      return Promise.reject(new Error("请输入正确的邮箱地址"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="base_salary"
              label="基本工资"
              rules={[{ required: true, message: "请输入基本工资" }]}
            >
              <InputNumber
                placeholder="请输入基本工资"
                style={{ width: "100%" }}
                min={0}
                max={999999}
                formatter={(value) =>
                  `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/¥\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="card_num"
              label="银行卡号"
              rules={[
                { required: true, message: "请输入银行卡号" },
                { pattern: /^\d{16,19}$/, message: "请输入正确的银行卡号" },
              ]}
            >
              <Input placeholder="请输入银行卡号" maxLength={19} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="entry_date"
              label="入职日期"
              rules={[{ required: true, message: "请选择入职日期" }]}
            >
              <DatePicker
                placeholder="请选择入职日期"
                style={{ width: "100%" }}
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default StaffForm;
