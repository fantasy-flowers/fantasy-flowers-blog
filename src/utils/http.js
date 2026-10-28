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

// ==================== C3：并发请求去重 + 竞态取消 ====================

/**
 * 短时并发合并窗口：同一 requestKey 在该窗口内到达的并发请求共享同一个 Promise；
 * 超过窗口的新请求视为「新一次」，取消上一笔
 */
const DEDUP_WINDOW_MS = 100

/**
 * 在途请求表：requestKey -> { promise, controller, startedAt }
 * 请求结束（成功 / 失败 / 被取消）后从表中移除
 */
const inFlightMap = new Map()

/**
 * 组内最近一次请求的控制器：group -> AbortController
 * group 取 requestKey 第一个 ':' 之前的前缀段（如 'article' / 'articles'），
 * 用于路由参数变化（key 必然不同）时取消同组旧请求
 */
const latestControllerByGroup = new Map()

/**
 * 由 requestKey 推导所属请求组（取第一个 ':' 之前的段）
 * @param {string} requestKey
 * @returns {string} group
 */
function getRequestGroup(requestKey) {
  const idx = requestKey.indexOf(':')
  return idx === -1 ? requestKey : requestKey.slice(0, idx)
}

/**
 * 判断是否为请求取消错误（axios CanceledError / AbortController 取消 / 兼容 isCancel）
 * @param {any} error
 * @returns {boolean}
 */
export function isCancelError(error) {
  return !!error && (
    error.name === 'CanceledError' ||
    error.code === 'ERR_CANCELED' ||
    axios.isCancel(error)
  )
}

/**
 * 参数键排序后序列化：保证同一组参数无论键序如何都得到同一个字符串
 * （用于 requestKey 与 C4 缓存键）
 * @param {Object} [params]
 * @returns {string}
 */
export function serializeParams(params) {
  if (!params || typeof params !== 'object') {
    return '{}'
  }
  const sorted = {}
  Object.keys(params).sort().forEach((key) => {
    sorted[key] = params[key]
  })
  return JSON.stringify(sorted)
}

/**
 * 取消某 requestKey 所属请求组的在途请求（本身不发新请求）。
 * 缓存命中路径不会走 get()，需要显式调用它取消组内旧请求，
 * 防止旧请求稍后回填覆盖当前上下文的数据
 * @param {string} requestKey
 */
export function abortRequestGroup(requestKey) {
  const group = getRequestGroup(requestKey)
  const controller = latestControllerByGroup.get(group)
  if (controller) {
    controller.abort()
  }
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
    // C3：被取消的请求（去重取消 / 竞态取消）不作为错误浮出——
    // 不打印 console.error、不包装成 ApiError，原样拒绝交由调用方静默吞掉。
    // 该分支位于最前，不影响真实错误（含 404）的既有处理链路
    if (isCancelError(error)) {
      return Promise.reject(error)
    }

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
 * 通用 GET 请求（C3：支持并发去重与竞态取消）
 * @template T
 * @param {string} url
 * @param {Object} [params]
 * @param {Object} [options] - 可选配置（不传时与旧两参调用完全一致）
 * @param {string} [options.requestKey] - 请求去重/取消键，含组前缀（如 `article:5` / `articles:{...}`）
 * @param {AbortSignal} [options.signal] - 外部取消信号
 * @returns {Promise<T>}
 */
export function get(url, params, options = {}) {
  const { requestKey, signal } = options || {}

  // 无 requestKey：保持原有两参调用行为（api/modules 及所有旧调用不受影响）
  if (!requestKey) {
    return http.get(url, { params, signal })
  }

  const group = getRequestGroup(requestKey)
  const now = Date.now()
  const existing = inFlightMap.get(requestKey)

  if (existing) {
    // 短时并发合并：窗口内同 key 并发请求直接复用同一个 Promise
    if (now - existing.startedAt < DEDUP_WINDOW_MS) {
      return existing.promise
    }
    // 同一 requestKey 的新请求到来：取消上一笔
    existing.controller.abort()
  } else {
    // 不同 key 但同组（路由参数变化导致 key 必然不同）：取消组内上一笔
    const prevController = latestControllerByGroup.get(group)
    if (prevController) {
      prevController.abort()
    }
  }

  const controller = new AbortController()

  // 外部取消信号联动内部 controller
  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', () => controller.abort(), { once: true })
    }
  }

  const entry = { controller, startedAt: now }
  const promise = http.get(url, { params, signal: controller.signal }).finally(() => {
    // 仅当自身仍是最新登记项时才清理，避免误删后续请求的登记
    if (inFlightMap.get(requestKey) === entry) {
      inFlightMap.delete(requestKey)
    }
    if (latestControllerByGroup.get(group) === controller) {
      latestControllerByGroup.delete(group)
    }
  })
  entry.promise = promise

  inFlightMap.set(requestKey, entry)
  latestControllerByGroup.set(group, controller)

  return promise
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
