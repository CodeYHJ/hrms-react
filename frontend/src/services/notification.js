import api from './api'

export const notificationService = {
  // 获取所有通知
  getAllNotifications: () => api.get('/notification/query/all'),
  
  // 删除通知
  deleteNotification: (notificationId) => api.delete(`/notification/delete/${notificationId}`),
  
  // 创建通知
  createNotification: (values) => api.post('/notification/create', values),
  
  // 编辑通知
  editNotification: (values) => api.post('/notification/edit', values)
}