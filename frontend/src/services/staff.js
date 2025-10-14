import api from './api'

export const staffService = {
    // 获取所有员工列表
    getAllStaff: async (params = {}) => {
        const response = await api.get('/staff/query/all', { params })
        return response

    },

    // 根据ID查询员工
    getStaffById: async (staffId) => {
        const response = await api.get(`/staff/query/${staffId}`)
        return response

    },

    // 根据姓名搜索员工
    searchStaffByName: async (staffName) => {
        const response = await api.get(`/staff/query_by_name/${encodeURIComponent(staffName)}`)
        return response

    },

    // 根据部门搜索员工
    searchStaffByDepartment: async (depName) => {
        const response = await api.get(`/staff/query_by_dep/${encodeURIComponent(depName)}`)
        return response

    },

    // 根据员工工号搜索
    searchStaffByStaffId: async (staffId) => {
        const response = await api.get(`/staff/query_by_staff_id/${staffId}`)
        return response

    },

    // 创建员工
    createStaff: async (staffData) => {
        const response = await api.post('/staff/create', staffData)
        return response

    },

    // 编辑员工
    editStaff: async (staffData) => {
        const response = await api.post('/staff/edit', staffData)
        return response

    },

    // 删除员工
    deleteStaff: async (staffId) => {
        const response = await api.delete(`/staff/del/${staffId}`)
        return response

    },

    // 导出Excel
    exportExcel: async (data = {}) => {
        const response = await api.post('/staff/excel_export', data, {
            responseType: 'blob'
        })
        return response

    },

    // 员工入职
    onboardStaff: async (staffData) => {
        const response = await api.post('/staff/onboard', staffData)
        return response
    },

    // 员工转正
    promoteStaff: async (staffData) => {
        const response = await api.post('/staff/promote', staffData)
        return response
    },

    // 员工调岗
    transferStaff: async (staffData) => {
        const response = await api.post('/staff/transfer', staffData)
        return response
    },

    // 员工离职
    resignStaff: async (staffData) => {
        const response = await api.post('/staff/resign', staffData)
        return response
    },

    // 获取所有部门
    getAllDepartments: async () => {
        const response = await api.get('/depart/list')
        return response
    },

    // 获取所有职级
    getAllRanks: async () => {
        const response = await api.get('/rank/list')
        return response
    },

    // 密码管理相关
    password: {
        // 获取密码列表
        getAllPasswords: async (params = {}) => {
            const response = await api.get('/password/query/all', { params })
            return response
        },

        // 根据员工ID查询密码
        getPasswordByStaffId: async (staffId) => {
            const response = await api.get(`/password/query/${staffId}`)
            return response
        },

        // 修改密码
        updatePassword: async (passwordData) => {
            const response = await api.post('/password/edit', passwordData)
            return response
        }
    },

    // 权限管理相关
    authority: {
        // 设置管理员
        setAdmin: async (staffId) => {
            const response = await api.post(`/authority/set_admin/${staffId}`)
            return response
        },

        // 设置普通用户
        setNormal: async (staffId) => {
            const response = await api.post(`/authority/set_normal/${staffId}`)
            return response
        }
    },

    // 分页查询员工列表
    list: async (params = {}) => {
        const response = await api.get('/staff/list', { params })
        return response
    }
}