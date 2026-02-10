// HTTP 请求封装
import { API_BASE_URL, REQUEST_TIMEOUT, TOKEN_KEY } from './config'

/**
 * 获取存储的 Token
 */
function getToken() {
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

/**
 * 创建请求配置
 */
function createRequestConfig(options = {}) {
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  // 添加 Token
  const token = getToken()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  // 添加请求体
  if (options.body) {
    if (options.body instanceof FormData) {
      // FormData 不需要设置 Content-Type
      delete config.headers['Content-Type']
      config.body = options.body
    } else {
      config.body = JSON.stringify(options.body)
    }
  }

  return config
}

/**
 * 处理响应
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type')
  
  // 解析 JSON 响应
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json()
    
    // 检查业务状态码
    if (data.code === 200 || data.code === 201) {
      return data.data
    } else {
      // 业务错误
      const error = new Error(data.message || '请求失败')
      error.code = data.code
      error.data = data.data
      throw error
    }
  }
  
  // 非 JSON 响应
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  return response
}

/**
 * 处理错误
 */
function handleError(error) {
  console.error('API Error:', error)
  
  // Token 过期或无效
  if (error.code === 401) {
    clearToken()
    // 可以在这里触发跳转到登录页
    // window.location.href = '/login'
  }
  
  throw error
}

/**
 * 发送 HTTP 请求
 */
export async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  const config = createRequestConfig(options)
  
  try {
    // 设置超时
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
    
    const response = await fetch(fullUrl, {
      ...config,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    return await handleResponse(response)
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时')
    }
    return handleError(error)
  }
}

/**
 * GET 请求
 */
export function get(url, params = {}) {
  const queryString = new URLSearchParams(params).toString()
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  return request(fullUrl, { method: 'GET' })
}

/**
 * POST 请求
 */
export function post(url, data) {
  return request(url, {
    method: 'POST',
    body: data
  })
}

/**
 * PUT 请求
 */
export function put(url, data) {
  return request(url, {
    method: 'PUT',
    body: data
  })
}

/**
 * DELETE 请求
 */
export function del(url) {
  return request(url, { method: 'DELETE' })
}

/**
 * 上传文件
 */
export function upload(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const xhr = new XMLHttpRequest()
    
    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          onProgress(percentComplete)
        }
      })
    }
    
    // 监听完成
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.code === 200 || response.code === 201) {
            resolve(response.data)
          } else {
            reject(new Error(response.message || '上传失败'))
          }
        } catch (error) {
          reject(new Error('响应解析失败'))
        }
      } else {
        reject(new Error(`上传失败: ${xhr.status}`))
      }
    })
    
    // 监听错误
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误'))
    })
    
    // 监听超时
    xhr.addEventListener('timeout', () => {
      reject(new Error('上传超时'))
    })
    
    // 设置请求
    const fullUrl = `${API_BASE_URL}${url}`
    xhr.open('POST', fullUrl)
    xhr.timeout = REQUEST_TIMEOUT
    
    // 添加 Token
    const token = getToken()
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    
    // 发送请求
    xhr.send(formData)
  })
}
