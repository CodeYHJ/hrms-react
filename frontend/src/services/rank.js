import api from './api'

export const rankService = {
  // 获取所有职级
  getAllRanks: () => api.get('/rank/query/all'),
  
  // 根据ID获取职级
  getRankById: (rankId) => api.get(`/rank/query/${rankId}`),
  
  // 删除职级
  deleteRank: (rankId) => api.delete(`/rank/del/${rankId}`),
  
  // 创建职级
  createRank: (values) => api.post('/rank/create', values),
  
  // 编辑职级
  editRank: (values) => api.post('/rank/edit', values)
}