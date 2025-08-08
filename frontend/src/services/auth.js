import api from './api'

export const authService = {
    // 用户登录 - 严格按照原有业务流程
    login: async (loginData) => {
        const response = await api.post('/account/login', {
            staff_id: loginData.staff_id,
            user_password: loginData.user_password,
            branch_id: loginData.branch_id // 使用用户选择的分公司ID
        })
        return response
    },

    // 用户登出
    logout: async () => {
        const response = await api.post('/account/quit')
        return response
    },

    // 检查认证状态
    checkAuth: () => {
        try {
            // 检查cookie中是否有用户信息
            const cookies = document.cookie.split(';')
            const userCookie = cookies.find(cookie => cookie.trim().startsWith('user_cookie='))

            if (userCookie) {
                const cookieValue = userCookie.split('=')[1]
                if (cookieValue && cookieValue !== '' && cookieValue !== 'null') {
                    // 解析cookie信息: 角色_工号_分公司ID_员工姓名(base64编码)
                    const userInfo = cookieValue.split('_')
                    if (userInfo.length >= 4) {
                        try {
                            const binary = atob(userInfo[3]); // 解码为原始二进制字符串
                            const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
                            const staffName = new TextDecoder().decode(bytes);
                            return {
                                isAuthenticated: true,
                                userType: userInfo[0],
                                staffId: userInfo[1],
                                branchId: userInfo[2],
                                staffName: staffName
                            }
                        } catch (decodeError) {
                            console.error('解码员工姓名失败:', decodeError)
                            return {
                                isAuthenticated: true,
                                userType: userInfo[0],
                                staffId: userInfo[1],
                                branchId: userInfo[2],
                                staffName: '未知用户'
                            }
                        }
                    }
                }
            }

            return {
                isAuthenticated: false,
                userType: null,
                staffId: null,
                branchId: null,
                staffName: null
            }
        } catch (error) {
            console.error('检查认证状态失败:', error)
            return {
                isAuthenticated: false,
                userType: null,
                staffId: null,
                branchId: null,
                staffName: null
            }
        }
    },

    // 清除认证信息
    clearAuth: () => {
        document.cookie = 'user_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    }
}