import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Select, Space, Tag, Row, Col } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { salaryService } from "../../services/salary";
import { getSystemParameterValueV2 } from "../../services/api";
import SalaryTemplateSelector from "./SalaryTemplateSelector";

const { Option } = Select;

const SalaryDetailForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [showDefaults, setShowDefaults] = useState(false);
  const [templateSelectorVisible, setTemplateSelectorVisible] = useState(false);
  const [staffInfo, setStaffInfo] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // 获取系统参数默认值
  const fetchDefaultValues = async () => {
    try {
      const params = [
        'default_subsidy',
        'default_bonus', 
        'default_commission',
        'default_other',
        'default_fund_enabled'
      ];
      
      const values = {};
      for (const param of params) {
        const response = await getSystemParameterValueV2(param);
        if (response.status && response.data) {
          values[param] = response.data.value;
        }
      }
      
      setDefaultValues(values);
      return values;
    } catch (error) {
      console.error('获取系统参数失败:', error);
      return {};
    }
  };

  // 应用默认值到表单
  const applyDefaultValues = (values) => {
    if (Object.keys(values).length > 0) {
      const formValues = {
        subsidy: parseInt(values.default_subsidy) || 0,
        bonus: parseInt(values.default_bonus) || 0,
        commission: parseInt(values.default_commission) || 0,
        other: parseInt(values.default_other) || 0,
        fund: values.default_fund_enabled === '1' ? 1 : 0,
      };
      
      form.setFieldsValue(formValues);
      setShowDefaults(true);
    }
  };

  // 重置为默认值
  const resetToDefaults = async () => {
    const values = await fetchDefaultValues();
    applyDefaultValues(values);
    message.info('已重置为系统默认值');
  };

  // 打开模板选择器
  const handleOpenTemplateSelector = () => {
    const formValues = form.getFieldsValue();
    if (!formValues.staff_id || !formValues.staff_name) {
      message.warning('请先填写员工工号和姓名');
      return;
    }
    
    setStaffInfo({
      staff_id: formValues.staff_id,
      staff_name: formValues.staff_name,
      rank_id: formValues.rank_id,
      department_id: formValues.department_id,
      rank_name: formValues.rank_name,
      department_name: formValues.department_name
    });
    setTemplateSelectorVisible(true);
  };

  // 选择模板后的回调
  const handleTemplateSelect = (template) => {
    if (template && template.items) {
      // 计算各项薪资
      const baseSalary = form.getFieldValue('base') || 0;
      let calculatedValues = {
        subsidy: 0,
        bonus: 0,
        commission: 0,
        other: 0
      };

      template.items.forEach(item => {
        let value = item.value;
        if (item.calculation_type === 'percentage') {
          value = Math.round(baseSalary * (value / 100));
        }

        // 根据项目名称映射到对应的字段
        if (item.name.includes('补贴') || item.name.includes('津贴')) {
          calculatedValues.subsidy += item.is_addition ? value : -value;
        } else if (item.name.includes('绩效') || item.name.includes('奖金')) {
          calculatedValues.bonus += item.is_addition ? value : -value;
        } else if (item.name.includes('提成') || item.name.includes('佣金')) {
          calculatedValues.commission += item.is_addition ? value : -value;
        } else {
          calculatedValues.other += item.is_addition ? value : -value;
        }
      });

      // 确保数值不为负数
      Object.keys(calculatedValues).forEach(key => {
        if (calculatedValues[key] < 0) calculatedValues[key] = 0;
      });

      // 更新表单
      form.setFieldsValue(calculatedValues);
      message.success(`已应用模板 "${template.name}" 的配置`);
    }
  };

  useEffect(() => {
    // 判断是否为编辑模式
    const editMode = location.pathname.includes("/edit");
    setIsEdit(editMode);

    if (editMode) {
      // 从localStorage获取薪资信息
      const salaryInfo = localStorage.getItem("salary_edit_info");
      if (salaryInfo) {
        const salaryData = JSON.parse(salaryInfo);
        form.setFieldsValue({
          staff_id: salaryData.staff_id,
          staff_name: salaryData.staff_name,
          base: salaryData.base,
          subsidy: salaryData.subsidy,
          bonus: salaryData.bonus,
          commission: salaryData.commission,
          other: salaryData.other,
          fund: salaryData.fund,
        });
      } else {
        message.error("未找到薪资信息");
        navigate("/salary/detail");
      }
    } else {
      // 新增模式下获取并应用默认值
      fetchDefaultValues().then(values => {
        applyDefaultValues(values);
      });
    }
  }, [location.pathname, form, navigate]);

  // 表单提交处理
  const handleSubmit = async (values) => {
    setLoading(true);

    // 格式化数据，确保数值字段为数字
    const formData = {
      ...values,
      base: parseInt(values.base) || 0,
      subsidy: parseInt(values.subsidy) || 0,
      bonus: parseInt(values.bonus) || 0,
      commission: parseInt(values.commission) || 0,
      other: parseInt(values.other) || 0,
      fund: parseInt(values.fund) || 0,
    };

    const serviceCall = isEdit
      ? salaryService.editSalary({
          id: JSON.parse(localStorage.getItem("salary_edit_info")).id,
          ...formData,
        })
      : salaryService.createSalary(formData);

    serviceCall.then(response => {
      if (response.status) {
        message.success(response.message || "操作成功");
        if (isEdit) {
          localStorage.removeItem("salary_edit_info");
        }
        navigate("/salary/detail");
      } else {
        message.error(response.message || "系统异常,操作失败");
      }
    }).catch(error => {
      message.error("系统异常,操作失败: " + error.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  // 取消返回
  const handleCancel = () => {
    if (isEdit) {
      localStorage.removeItem("salary_edit_info");
    }
    navigate("/salary/detail");
  };

  return (
    <div
      className="layui-container layuimini-container"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="layui-main layuimini-main">
           <Card
           title={
             <Space>
               薪资信息{isEdit ? '编辑' : '添加'}
               {showDefaults && !isEdit && (
                 <Tag color="blue">已应用系统默认值</Tag>
               )}
             </Space>
           }
           extra={
             !isEdit && (
               <Space>
                 <Button type="dashed" onClick={handleOpenTemplateSelector}>
                   选择薪资模板
                 </Button>
                 <Button type="link" onClick={resetToDefaults}>
                   重置为默认值
                 </Button>
               </Space>
             )
           }
         >
          <Form
            form={form}
            layout="horizontal"
            onFinish={handleSubmit}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            className="layui-form layuimini-form"
            initialValues={{
              staff_id: "",
              staff_name: "",
              base: "",
              subsidy: "",
              bonus: "",
              commission: "",
              other: "",
              fund: "",
            }}
          >
            <Form.Item
              name="staff_id"
              label="员工工号"
              rules={[{ required: true, message: "员工工号不能为空" }]}
            >
              <Input placeholder="请输入员工工号" />
            </Form.Item>

            <Form.Item
              name="staff_name"
              label="员工姓名"
              rules={[{ required: true, message: "员工姓名不能为空" }]}
            >
              <Input placeholder="请输入员工姓名" />
            </Form.Item>

            <Form.Item
              name="base"
              label="基本工资"
              rules={[{ required: true, message: "基本工资不能为空" }]}
            >
              <Input
                type="number"
                placeholder="请输入基本工资"
                min={0}
              />
            </Form.Item>

            <Form.Item name="subsidy" label="住房补贴">
              <Input
                type="number"
                placeholder="请输入住房补贴"
                min={0}
              />
            </Form.Item>

            <Form.Item name="bonus" label="绩效奖金">
              <Input
                type="number"
                placeholder="请输入绩效奖金"
                min={0}
              />
            </Form.Item>

            <Form.Item name="commission" label="提成薪资">
              <Input
                type="number"
                placeholder="请输入提成薪资"
                min={0}
              />
            </Form.Item>

            <Form.Item name="other" label="其他薪资">
              <Input
                type="number"
                placeholder="请输入其他薪资"
                min={0}
              />
            </Form.Item>

            <Form.Item
              name="fund"
              label="五险一金"
              rules={[{ required: true, message: "请选择是否缴纳五险一金" }]}
            >
              <Select placeholder="请选择是否缴纳五险一金">
                <Option value={1}>缴纳</Option>
                <Option value={0}>不缴纳</Option>
              </Select>
            </Form.Item>

             <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
               <Button type="primary" htmlType="submit" loading={loading}>
                 {isEdit ? "编辑" : "添加"}
               </Button>
               <Button style={{ marginLeft: 8 }} onClick={handleCancel}>
                 取消
               </Button>
             </Form.Item>
           </Form>
         </Card>

         {/* 薪资模板选择器 */}
         <SalaryTemplateSelector
           visible={templateSelectorVisible}
           onCancel={() => setTemplateSelectorVisible(false)}
           onSelect={handleTemplateSelect}
           staffInfo={staffInfo}
         />
       </div>
     </div>
   );
 };

export default SalaryDetailForm;