import api from './api';

export const recruitmentService = {
    // 获取所有招聘信息
    getAllRecruitment: async () => {
        const response = await api.get('/recruitment/query/all');
        return response;
    },

    // 根据岗位名称搜索
    searchRecruitmentByJobName: async (jobName) => {
        const response = await api.get(`/recruitment/query/${encodeURIComponent(jobName)}`);
        return response;
    },

    // 创建招聘信息
    createRecruitment: async (recruitmentData) => {
        const response = await api.post('/recruitment/create', recruitmentData);
        return response;
    },

    // 编辑招聘信息
    editRecruitment: async (recruitmentData) => {
        const response = await api.post('/recruitment/edit', recruitmentData);
        return response;
    },

    // 删除招聘信息
    deleteRecruitment: async (recruitmentId) => {
        const response = await api.delete(`/recruitment/delete/${recruitmentId}`);
        return response;
    },

    // 根据ID获取招聘详情
    getRecruitmentById: async (recruitmentId) => {
        const response = await api.get(`/recruitment/query/${recruitmentId}`);
        return response;
    }
};