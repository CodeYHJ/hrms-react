import api from './api'

export const candidateService = {
    // 获取所有候选人列表
    getAllCandidates: async () => {
        const response = await api.get('/candidate/query_by_name/all')
        return response
    },

    // 根据候选人姓名查询
    searchCandidateByName: async (name) => {
        const response = await api.get(`/candidate/query_by_name/${encodeURIComponent(name)}`)
        return response
    },

    // 根据ID查询候选人详情
    getCandidateById: async (candidateId) => {
        const response = await api.get(`/candidate/query_by_id/${candidateId}`)
        return response
    },

    // 创建候选人
    createCandidate: async (candidateData) => {
        const response = await api.post('/candidate/create', candidateData)
        return response
    },

    // 编辑候选人
    editCandidate: async (candidateData) => {
        const response = await api.post('/candidate/edit', candidateData)
        return response
    },

    // 删除候选人
    deleteCandidate: async (candidateId) => {
        const response = await api.delete(`/candidate/delete/${candidateId}`)
        return response
    },

    // 安排面试 - 指定面试官
    assignInterviewer: async (data) => {
        const response = await api.post('/candidate/assign_interviewer', data)
        return response
    },

    // 面试评价
    interviewEvaluation: async (candidateId, evaluation) => {
        const response = await api.post(`/candidate/evaluation/${candidateId}`, evaluation)
        return response
    },

    // 更新候选人状态
    updateCandidateStatus: async (candidateId, status) => {
        const response = await api.post(`/candidate/update_status/${candidateId}`, {
            status: status
        })
        return response
    },

    // 拒绝候选人
    rejectCandidate: async (candidateId) => {
        const response = await api.get(`/candidate/reject/${candidateId}`)
        return response
    },

    // 录取候选人
    acceptCandidate: async (candidateId) => {
        const response = await api.get(`/candidate/accept/${candidateId}`)
        return response
    }
}