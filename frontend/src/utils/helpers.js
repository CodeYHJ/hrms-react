import { GENDER_MAP } from './constants'

// 格式化日期
export const formatDate = (dateString, format = 'YYYY-MM-DD') => {
    if (!dateString) return ''

    try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return ''

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds)
    } catch (error) {
        console.error('日期格式化错误:', error)
        return ''
    }
}

// 性别数字转文字
export const formatGender = (gender) => {
    return GENDER_MAP[gender] || '未知'
}

// 格式化手机号
export const formatPhone = (phone) => {
    if (!phone) return ''
    const phoneStr = String(phone)
    if (phoneStr.length === 11) {
        return phoneStr.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
    }
    return phoneStr
}

// 验证手机号
export const validatePhone = (phone) => {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
}

// 验证邮箱
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// 验证身份证号
export const validateIdCard = (idCard) => {
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return idCardRegex.test(idCard)
}

// 深拷贝对象
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(item => deepClone(item))
    if (typeof obj === 'object') {
        const clonedObj = {}
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clonedObj[key] = deepClone(obj[key])
            }
        }
        return clonedObj
    }
}

// 防抖函数
export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// 节流函数
export const throttle = (func, limit) => {
    let inThrottle
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}