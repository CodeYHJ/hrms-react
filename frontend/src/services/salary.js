import api from './api'

export const salaryService = {
    // 获取所有工资套账
    getAllSalary: async (staffId = null) => {
        let url = '/salary/query/all'
        if (staffId) {
            url = `/salary/query/${staffId}`
        }
        const response = await api.get(url)
        return response
    },

    // 根据ID查询工资套账
    getSalaryById: async (salaryId) => {
        const response = await api.get(`/salary/query/${salaryId}`)
        return response
    },

    // 创建工资套账
    createSalary: async (salaryData) => {
        const response = await api.post('/salary/create', salaryData)
        return response
    },

    // 编辑工资套账
    editSalary: async (salaryData) => {
        const response = await api.post('/salary/edit', salaryData)
        return response
    },

    // 删除工资套账
    deleteSalary: async (salaryId) => {
        const response = await api.delete(`/salary/delete/${salaryId}`)
        return response
    },

    // 获取所有工资发放记录
    getAllSalaryRecords: async (staffId = null) => {
        let url = '/salary_record/query/all'
        if (staffId) {
            url = `/salary_record/query/${staffId}`
        }
        const response = await api.get(url)
        return response
    },

    // 获取所有工资历史记录
    getAllSalaryHistory: async (staffId = null) => {
        let url = '/salary_record/query_history/all'
        if (staffId) {
            url = `/salary_record/query_history/${staffId}`
        }
        const response = await api.get(url)
        return response
    },

    // 发放薪资
    paySalary: async (salaryRecordId) => {
        const response = await api.get(`/salary_record/pay_salary_record_by_id/${salaryRecordId}`)
        return response
    }
}