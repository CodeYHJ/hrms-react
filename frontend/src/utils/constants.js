// API响应状态码
export const API_STATUS = {
    SUCCESS: 2000,
    ERROR: 5001,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
}

// 用户类型
export const USER_TYPES = {
    ADMIN: 'sys',
    NORMAL: 'normal',
    SUPERSYS: 'supersys'
}

// 性别映射
export const GENDER_MAP = {
    1: '男',
    2: '女'
}

// 分页默认配置
export const PAGINATION_CONFIG = {
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100']
}

// 表格默认配置
export const TABLE_CONFIG = {
    size: 'middle',
    bordered: true,
    scroll: { x: 'max-content' }
}

// 日期格式
export const DATE_FORMAT = 'YYYY-MM-DD'
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'