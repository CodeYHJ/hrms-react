import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

const { TextArea } = Input;

const CandidateDetail = () => {
    const [form] = Form.useForm();
    const [candidateData, setCandidateData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // 从sessionStorage获取候选人详情信息
        const candidateInfo = sessionStorage.getItem('candidate_detail_info');
        if (candidateInfo) {
            const candidateData = JSON.parse(candidateInfo);
            setCandidateData(candidateData);
            form.setFieldsValue({
                name: candidateData.name,
                job_name: candidateData.job_name,
                edu_level: candidateData.edu_level,
                major: candidateData.major,
                experience: candidateData.experience,
                describe: candidateData.describe,
                email: candidateData.email,
                staff_id: candidateData.staff_id || '',
                evaluation: candidateData.evaluation || '',
                status: candidateData.status !== undefined ? getStatusText(candidateData.status) : '',
            });
        } else {
            // 如果没有数据，返回列表页面
            navigate('/candidate/manage');
        }
    }, [form, navigate]);

    // 状态转换函数
    const getStatusText = (status) => {
        switch (status) {
            case 0: return '面试中';
            case 1: return '已拒绝';
            case 2: return '已录取';
            default: return '未知状态';
        }
    };

    // 返回列表
    const handleBack = () => {
        sessionStorage.removeItem('candidate_detail_info');
        navigate('/candidate/manage');
    };

    return (
        <div className="layui-container layuimini-container" style={{ backgroundColor: '#ffffff' }}>
            <div className="layui-main layuimini-main">
                <Card title="候选人详细信息">
                    <Form
                        form={form}
                        layout="horizontal"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 16 }}
                        className="layui-form layuimini-form"
                    >
                        <Form.Item label="候选人姓名" name="name">
                            <Input disabled bordered={false} />
                        </Form.Item>

                        <Form.Item label="应聘岗位" name="job_name">
                            <Input disabled bordered={false} />
                        </Form.Item>

                        <Form.Item label="最高学历" name="edu_level">
                            <Input disabled bordered={false} />
                        </Form.Item>

                        <Form.Item label="毕业专业" name="major">
                            <Input disabled bordered={false} />
                        </Form.Item>

                        <Form.Item label="工作经验" name="experience">
                            <Input disabled bordered={false} />
                        </Form.Item>

                        <Form.Item label="技能描述" name="describe">
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

                        <Form.Item label="面试官" name="staff_id">
                            <Input disabled bordered={false} />
                        </Form.Item>

                        <Form.Item label="面试评价" name="evaluation">
                            <TextArea 
                                disabled 
                                rows={8} 
                                style={{ height: 160 }}
                                bordered={false}
                            />
                        </Form.Item>

                        <Form.Item label="应聘状态" name="status">
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

export default CandidateDetail;