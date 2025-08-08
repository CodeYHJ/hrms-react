import axios from 'axios'
import { message } from 'antd'

// 创建axios实例
const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? '/api' : '',
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