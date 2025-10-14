import api from './api'

export const operationLogService = {
    // 获取操作日志列表
    getLogs: async (params = {}) => {
        const response = await api.get('/operation-log/query', { params })
        return response.data
    },

    // 根据ID获取操作日志详情
    getLogById: async (logId) => {
        const response = await api.get(`/operation-log/query/${logId}`)
        return response.data
    },

    // 删除操作日志
    deleteLog: async (logId) => {
        const response = await api.delete(`/operation-log/del/${logId}`)
        return response.data
    },

    // 批量删除操作日志（按时间）
    deleteLogsByTime: async (endTime) => {
        const response = await api.delete('/operation-log/del_batch', { 
            params: { end_time: endTime } 
        })
        return response.data
    },

    // 获取操作日志统计
    getStats: async (params = {}) => {
        const response = await api.get('/operation-log/stats', { params })
        return response.data
    },

    // 获取操作日志选项（下拉选项等）
    getOptions: async () => {
        const response = await api.get('/operation-log/options')
        return response.data
    }
}