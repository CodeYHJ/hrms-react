import api from './api'

export const companyService = {
    // 获取所有分公司列表
    getAllBranches: async () => {
        const response = await api.get('/company/query')
        return response
    }
}