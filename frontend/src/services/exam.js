import api from './api'

export const examService = {
  // 获取所有考试
  getAllExams: () => api.get('/example/query/all'),
  
  // 根据名称搜索考试
  searchExamByName: (name) => api.get(`/example/query/${name}`),
  
  // 创建考试
  createExam: (values) => api.post('/example/create', values),
  
  // 编辑考试
  editExam: (values) => api.post('/example/edit', values),
  
  // 删除考试
  deleteExam: (examId) => api.delete(`/example/del/${examId}`),
  
  // 获取考试历史
  getExamHistory: (name = '') => {
    if (name) {
      return api.get(`/example_score/query_by_name/${name}`)
    }
    return api.get('/example_score/query_by_name/all')
  }
}