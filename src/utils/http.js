import axios from 'axios'

/**
 * @typedef {Object} ApiResponse
 * @property {number} code - 状态码
 * @property {any} data - 数据
 * @property {string} message - 消息
 */

// 常量定义
export const TOKEN_KEY = 'blog_token'
export const REQUEST_TIMEOUT = 10000

/**
 * 统一错误对象：code/message/status 三要素
 * code 为业务码或网络错误码（TIMEOUT/NETWORK_ERROR），status 为 HTTP 状态码
 */
export class ApiError extends Error {
  constructor(code, message, status) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.message = message
    this.status = status
  }
}

/**
 * 创建统一错误对象
 * @param {string|number} code - 错误码
 * @param {string} message - 错误提示
 * @param {number|null} status - HTTP 状态码
 * @returns {ApiError}
 */
export function createApiError(code, message, status = null) {
  return new ApiError(code, message, status)
}

/**
 * 获取存储的 Token
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 保存 Token
 */
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 清除 Token
 */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// 创建 Axios 实例
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/',
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    const { data } = response
    
    // 如果是二进制数据，直接返回
    if (response.request.responseType === 'blob' || response.request.responseType === 'arraybuffer') {
      return data
    }

    // 业务状态码处理
    if (data.code === 200 || data.code === 201) {
      return data.data
    } else {
      // 业务错误：统一为 code/message/status 错误对象
      const message = data.message || '请求失败'
      console.error(message)

      // 特殊状态码处理
      if (data.code === 401) {
        localStorage.removeItem(TOKEN_KEY)
        // 可以在这里处理路由跳转
        // window.location.href = '/login'
      }

      return Promise.reject(createApiError(data.code, message, response.status))
    }
  },
  (error) => {
    let message = '网络请求失败'
    let code = 'NETWORK_ERROR'
    let status = null

    if (error.response) {
      status = error.response.status
      code = status
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          localStorage.removeItem(TOKEN_KEY)
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `请求失败: ${error.response.status}`
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时'
      code = 'TIMEOUT'
    } else if (error.message && error.message.includes('Network Error')) {
      message = '网络连接异常'
    }

    console.error(message)
    const apiError = createApiError(code, message, status)
    // 向后兼容：保留原始 response/config 引用，便于按 HTTP 状态码判断
    apiError.response = error.response
    apiError.config = error.config
    return Promise.reject(apiError)
  }
)

/**
 * 通用 GET 请求
 * @template T
 * @param {string} url
 * @param {Object} [params]
 * @returns {Promise<T>}
 */
export function get(url, params) {
  return http.get(url, { params })
}

/**
 * 通用 POST 请求
 * @template T
 * @param {string} url
 * @param {any} data
 * @returns {Promise<T>}
 */
export function post(url, data) {
  return http.post(url, data)
}

/**
 * 通用 PUT 请求
 * @template T
 * @param {string} url
 * @param {any} data
 * @returns {Promise<T>}
 */
export function put(url, data) {
  return http.put(url, data)
}

/**
 * 通用 DELETE 请求
 * @template T
 * @param {string} url
 * @returns {Promise<T>}
 */
export function del(url) {
  return http.delete(url)
}

/**
 * 上传文件
 * @template T
 * @param {string} url
 * @param {File} file
 * @param {(progress: number) => void} [onProgress]
 * @returns {Promise<T>}
 */
export function upload(url, file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  
  return http.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    }
  })
}

export default http
