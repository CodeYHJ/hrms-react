import axios from 'axios'
import { message } from 'antd'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true, // 支持cookie
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 严格按照原有JavaScript代码设置Content-Type
    if (config.method === 'post') {
      config.headers['Content-Type'] = 'application/json;charset=utf-8'
    }

    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 处理标准响应格式
    const { status, message: msg } = response.data
    const hasMesage = msg !== ''
    if (status) {
      if (hasMesage) {
        message.info(msg)
      }
    } else {
      if (hasMesage) {
        message.error(msg)
      }
    }

    return response.data

  },
  (error) => {
    // 网络错误或HTTP状态码错误
    let errorMessage = '网络错误，请稍后重试'

    if (error.response) {
      const { code, data } = error.response

      switch (code) {
        case 401:
          errorMessage = '未授权，请重新登录'
          // 清除认证信息并跳转到登录页
          document.cookie = 'user_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          window.location.href = '/login'
          break
        case 403:
          errorMessage = '权限不足'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = data?.message || `请求失败 (${code})`
      }
    } else if (error.request) {
      errorMessage = '网络连接失败，请检查网络'
    } else {
      errorMessage = error.message || '请求配置错误'
    }

    message.error(errorMessage)

    return Promise.reject({
      code: 0,
      status: false,
      message: errorMessage,
      data: null,
      error: error
    })
  }
)

export default api

// V2 API Functions - System Configuration

// Tax Bracket APIs
export const getTaxBracketsV2 = (params = {}) => {
  return api.get('/v2/tax/bracket/query', { params })
}

export const createTaxBracketV2 = (data) => {
  return api.post('/v2/tax/bracket/create', data)
}

export const updateTaxBracketV2 = (data) => {
  return api.post('/v2/tax/bracket/edit', data)
}

export const deleteTaxBracketV2 = (id) => {
  return api.delete(`/v2/tax/bracket/delete/${id}`)
}

export const calculateTaxV2 = (data) => {
  return api.post('/v2/tax/calculate', data)
}

// Insurance Rate APIs
export const getInsuranceRatesV2 = (params = {}) => {
  return api.get('/v2/insurance/rate/query', { params })
}

export const createInsuranceRateV2 = (data) => {
  return api.post('/v2/insurance/rate/create', data)
}

export const updateInsuranceRateV2 = (data) => {
  return api.post('/v2/insurance/rate/edit', data)
}

export const deleteInsuranceRateV2 = (id) => {
  return api.delete(`/v2/insurance/rate/delete/${id}`)
}

export const calculateInsuranceV2 = (data) => {
  return api.post('/v2/insurance/calculate', data)
}

// Calculation Rule APIs
export const getCalculationRulesV2 = (params = {}) => {
  return api.get('/v2/calculation/rule/query', { params })
}

export const createCalculationRuleV2 = (data) => {
  return api.post('/v2/calculation/rule/create', data)
}

export const updateCalculationRuleV2 = (data) => {
  return api.post('/v2/calculation/rule/edit', data)
}

export const deleteCalculationRuleV2 = (id) => {
  return api.delete(`/v2/calculation/rule/delete/${id}`)
}

export const getCalculationRuleValueV2 = (ruleType) => {
  return api.get(`/v2/calculation/rule/value/${ruleType}`)
}

// System Parameter APIs
export const getSystemParametersV2 = (params = {}) => {
  return api.get('/v2/system/parameter/query', { params })
}

export const createSystemParameterV2 = (data) => {
  return api.post('/v2/system/parameter/create', data)
}

export const updateSystemParameterV2 = (data) => {
  return api.post('/v2/system/parameter/edit', data)
}

export const deleteSystemParameterV2 = (id) => {
  return api.delete(`/v2/system/parameter/delete/${id}`)
}

export const getSystemParameterValueV2 = (parameterKey) => {
  return api.get(`/v2/system/parameter/value/${parameterKey}`)
}

// Parameter History APIs
export const getParameterHistoryV2 = (params = {}) => {
  return api.get('/v2/history/parameter/query', { params })
}

// Salary Template APIs
export const getSalaryTemplatesV2 = (params = {}) => {
  return api.get('/v2/template/query', { params })
}

export const createSalaryTemplateV2 = (data) => {
  return api.post('/v2/salary/template/create', data)
}

export const updateSalaryTemplateV2 = (data) => {
  return api.post('/v2/salary/template/edit', data)
}

export const deleteSalaryTemplateV2 = (id) => {
  return api.delete(`/v2/salary/template/delete/${id}`)
}

export const getSalaryTemplateByIdV2 = (id) => {
  return api.get(`/v2/salary/template/query/${id}`)
}

export const getRecommendedTemplatesV2 = (params = {}) => {
  return api.get('/v2/salary/template/recommend', { params })
}

export const toggleTemplateStatusV2 = (id) => {
  return api.post(`/v2/salary/template/toggle/${id}`)
}