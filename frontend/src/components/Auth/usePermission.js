import { useAuth } from './AuthContext'
import { USER_TYPES } from '../../utils/constants'

export const usePermission = () => {
    const { user } = useAuth()

    // 检查是否是管理员
    const isAdmin = () => {
        return user?.userType === USER_TYPES.ADMIN || user?.userType === USER_TYPES.SUPERSYS
    }

    // 检查是否是超级管理员
    const isSuperAdmin = () => {
        return user?.userType === USER_TYPES.SUPERSYS
    }

    // 检查是否有特定权限
    const hasPermission = (requiredPermission) => {
        if (!user) return false

        // 超级管理员和系统管理员拥有所有权限
        if (user.userType === USER_TYPES.SUPERSYS || user.userType === USER_TYPES.ADMIN) {
            return true
        }

        // 管理员权限检查
        if (user.userType === USER_TYPES.ADMIN) {
            const adminPermissions = [
                'staff.view',
                'staff.create',
                'staff.edit',
                'staff.delete',
                'department.view',
                'department.create',
                'department.edit',
                'department.delete',
                'rank.view',
                'rank.create',
                'rank.edit',
                'rank.delete',
                'attendance.view',
                'attendance.approve',
                'notification.view',
                'notification.create',
                'notification.edit',
                'notification.delete',
            ]
            return adminPermissions.includes(requiredPermission)
        }

        // 普通用户权限检查
        if (user.userType === USER_TYPES.NORMAL) {
            const normalPermissions = [
                'staff.view',
                'attendance.view',
                'attendance.create',
                'notification.view',
            ]
            return normalPermissions.includes(requiredPermission)
        }

        return false
    }

    // 检查是否可以访问某个模块
    const canAccessModule = (module) => {
        if (!user) return false

        // 超级管理员和系统管理员拥有所有权限
        if (user.userType === USER_TYPES.SUPERSYS || user.userType === USER_TYPES.ADMIN) {
            return true
        }

        // 管理员权限
        if (user.userType === USER_TYPES.ADMIN) {
            const adminModules = [
                'staff', 'department', 'rank', 'attendance', 
                'salary', 'recruitment', 'notification', 'exam', 'authority', 'system_config'
            ]
            return adminModules.includes(module)
        }

        // 普通用户权限
        if (user.userType === USER_TYPES.NORMAL) {
            const normalModules = [
                'staff', 'attendance', 'salary', 'recruitment', 
                'notification', 'exam'
            ]
            return normalModules.includes(module)
        }

        return false
    }

    return {
        user,
        isAdmin,
        isSuperAdmin,
        hasPermission,
        canAccessModule,
    }
}