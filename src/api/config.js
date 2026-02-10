// API 配置文件
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/'

// API 端点
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    UPDATE_PASSWORD: '/auth/password'
  },
  
  // 文章相关
  ARTICLES: {
    LIST: '/articles',
    DETAIL: (id) => `/articles/${id}`,
    CREATE: '/articles',
    UPDATE: (id) => `/articles/${id}`,
    DELETE: (id) => `/articles/${id}`,
    UPDATE_STATUS: (id) => `/articles/${id}/status`
  },
  
  // 分类相关
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`
  },
  
  // 标签相关
  TAGS: {
    LIST: '/tags',
    DETAIL: (id) => `/tags/${id}`,
    CREATE: '/tags',
    UPDATE: (id) => `/tags/${id}`,
    DELETE: (id) => `/tags/${id}`
  },
  
  // 友情链接相关
  FRIEND_LINKS: {
    LIST: '/friend-links',
    DETAIL: (id) => `/friend-links/${id}`,
    CREATE: '/friend-links',
    UPDATE: (id) => `/friend-links/${id}`,
    DELETE: (id) => `/friend-links/${id}`,
    UPDATE_STATUS: (id) => `/friend-links/${id}/status`
  },
  
  // 媒体文件相关
  MEDIA: {
    LIST: '/media',
    UPLOAD: '/media/upload',
    DELETE: (id) => `/media/${id}`,
    REFERENCES: (id) => `/media/${id}/references`
  },
  
  // 页面内容相关
  PAGES: {
    GET: (type) => `/pages/${type}`,
    UPDATE: (type) => `/pages/${type}`
  },
  
  // 系统配置相关
  CONFIGS: {
    GET: '/configs',
    UPDATE: '/configs'
  }
}

// 请求超时时间（毫秒）
export const REQUEST_TIMEOUT = 10000

// Token 存储键名
export const TOKEN_KEY = 'blog_token'

// 用户信息存储键名
export const USER_KEY = 'blog_user'
