import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

const { TextArea } = Input;

const RecruitmentDetail = () => {
    const [form] = Form.useForm();
    const [recruitmentData, setRecruitmentData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // 从sessionStorage获取招聘详情信息
        const recruitmentInfo = sessionStorage.getItem('recruitment_detail');
        if (recruitmentInfo) {
            const recruitmentData = JSON.parse(recruitmentInfo);
            setRecruitmentData(recruitmentData);
            form.setFieldsValue({
                job_name: recruitmentData.job_name,
                job_type: recruitmentData.job_type,
                base_location: recruitmentData.base_location,
                base_salary: recruitmentData.base_salary,
                edu_level: recruitmentData.edu_level,
                experience: recruitmentData.experience,
                describe: recruitmentData.describe,
                email: recruitmentData.email,
            });
        } else {
            // 如果没有数据，返回列表页面
            navigate('/recruitment/manage');
        }
    }, [form, navigate]);

    // 返回列表
    const handleBack = () => {
        sessionStorage.removeItem('recruitment_detail');
        navigate('/recruitment/manage');
    };

    return (
        <div className="layui-container layuimini-container" style={{ backgroundColor: '#ffffff' }}>
            <div className="layui-main layuimini-main">
                <Card title="招聘信息详细信息">
                    <Form
                        form={form}
                        layout="horizontal"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 16 }}
                        className="layui-form layuimini-form"
                    >
                        <Form.Item label="岗位名称" name="job_name">
                            <Input disabled bordered={false} />
                        </Form.Item>

                        <Form.Item label="岗位类别" name="job_type">
                            <Input disabled bordered={false} />
                        </Form.Item>

                        <Form.Item label="工作地点" name="base_location">
                            <Input disabled bordered={false} />
                        </Form.Item>

                        <Form.Item label="薪资范围" name="base_salary">
                            <Input disabled bordered={false} />
                        </Form.Item>

                        <Form.Item label="学历要求" name="edu_level">
                            <Input disabled bordered={false} />
                        </Form.Item>

                        <Form.Item label="工作经验" name="experience">
                            <Input disabled bordered={false} />
                        </Form.Item>

                        <Form.Item label="岗位要求" name="describe">
                            <TextArea 
                                disabled 
                                rows={8} 
                                style={{ height: 160 }}
                                bordered={false}
                            />
                        </Form.Item>

                        <Form.Item label="投递邮箱" name="email">
                            <Input disabled bordered={false} />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                            <Button onClick={handleBack}>
                                返回
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default RecruitmentDetail;