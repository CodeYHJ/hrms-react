import api from './api';

export const attendanceService = {
    // 获取所有考勤记录
    getAllAttendance: async () => {
        const response = await api.get('/attendance_record/query/all');
        return response;
    },

    // 获取所有考勤历史
    getAllAttendanceHistory: async () => {
        const response = await api.get('/attendance_record/query_history/all');
        return response;
    },

    // 根据员工工号搜索考勤历史
    searchAttendanceHistoryByStaffId: async (staffId) => {
        const response = await api.get(`/attendance_record/query_history/${staffId}`);
        return response;

    },

    // 创建考勤记录
    createAttendanceRecord: async (attendanceData) => {
        // 转换数据类型以确保与后端兼容
        const processedData = {
            ...attendanceData,
            work_days: parseInt(attendanceData.work_days),
            leave_days: parseInt(attendanceData.leave_days) || 0,
            overtime_days: parseInt(attendanceData.overtime_days) || 0,
        };

        const response = await api.post('/attendance_record/create', processedData);
        return response;

    },

    // 编辑考勤记录
    editAttendanceRecord: async (attendanceData) => {
        const processedData = {
            ...attendanceData,
            work_days: parseInt(attendanceData.work_days),
            leave_days: parseInt(attendanceData.leave_days) || 0,
            overtime_days: parseInt(attendanceData.overtime_days) || 0,
        };

        const response = await api.post('/attendance_record/edit', processedData);
        return response;

    },

    // 删除考勤记录
    deleteAttendanceRecord: async (attendanceId) => {
        const response = await api.delete(`/attendance_record/delete/${attendanceId}`);
        return response;

    },

    // 检查薪资是否已发放
    checkIsSalaryPaid: async (staffId, date) => {
        const response = await api.get(`/attendance_record/get_attend_record_is_pay/${staffId}/${date}`);
        return response;

    },

    // 获取所有待审批考勤记录
    getAllAttendanceForApproval: async () => {
        const response = await api.get('/attendance_record/approve/query/all');
        return response;
    },

    // 审批通过考勤记录
    approveAttendance: async (attendanceId) => {
        const response = await api.get(`/attendance_record/approve_accept/${attendanceId}`);
        return response;
    },

    // 审批拒绝考勤记录
    rejectAttendance: async (attendanceId) => {
        const response = await api.get(`/attendance_record/approve_reject/${attendanceId}`);
        return response;
    }
};