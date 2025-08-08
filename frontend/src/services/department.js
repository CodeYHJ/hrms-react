import api from './api'

export const departmentService = {
    // 获取所有部门
    getAllDepartments: async () => {
        const response = await api.get('/depart/query/all')
        console.log(response, 'response')
        return response
    },

    // 根据ID查询部门
    getDepartmentById: async (depId) => {
        const response = await api.get(`/depart/query/${depId}`)
        return response
    },

    // 创建部门
    createDepartment: async (departmentData) => {
        const response = await api.post('/depart/create', departmentData)
        return response
    },

    // 编辑部门
    editDepartment: async (departmentData) => {
        const response = await api.post('/depart/edit', departmentData)
        return response
    },

    // 删除部门
    deleteDepartment: async (depId) => {
        const response = await api.delete(`/depart/del/${depId}`)
        return response
    }
}

export const rankService = {
    // 获取所有职级
    getAllRanks: async () => {
        const response = await api.get('/rank/query/all')
        return response
    },

    // 根据ID查询职级
    getRankById: async (rankId) => {
        const response = await api.get(`/rank/query/${rankId}`)
        return response
    },

    // 创建职级
    createRank: async (rankData) => {
        const response = await api.post('/rank/create', rankData)
        return response
    },

    // 编辑职级
    editRank: async (rankData) => {
        const response = await api.post('/rank/edit', rankData)
        return response
    },

    // 删除职级
    deleteRank: async (rankId) => {
        const response = await api.delete(`/rank/del/${rankId}`)
        return response
    }
}