/**
 * 图片 URL 处理工具
 */

// 获取 API 基础 URL（去掉 /api/ 后缀）
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api/', '') || 'http://localhost:3000'

// 缓存版本控制（当图片更新时，通过修改版本号强制刷新缓存）
const CACHE_VERSION = import.meta.env.VITE_IMAGE_CACHE_VERSION || 'v1'

// 是否启用缓存版本控制
const ENABLE_CACHE_VERSION = import.meta.env.VITE_ENABLE_IMAGE_CACHE_VERSION !== 'false'

/**
 * 给 URL 添加缓存版本参数
 * @param {string} url - 原始 URL
 * @returns {string} 添加版本参数后的 URL
 */
function addCacheVersion(url) {
  if (!ENABLE_CACHE_VERSION) return url

  // 如果 URL 已经包含版本参数，直接返回
  if (url.includes('v=')) return url

  // 添加版本参数
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}v=${CACHE_VERSION}`
}

/**
 * 获取完整的图片 URL
 * @param {string} path - 图片路径
 * @returns {string} 完整的图片 URL
 */
export function getImageUrl(path) {
  if (!path) return ''

  // 如果已经是完整 URL，直接返回（不添加版本号，避免破坏外部链接）
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // 如果是相对路径，拼接完整 URL 并添加版本号
  if (path.startsWith('/')) {
    return addCacheVersion(`${API_BASE}${path}`)
  }

  // 其他情况，添加前缀斜杠并添加版本号
  return addCacheVersion(`${API_BASE}/${path}`)
}

/**
 * 获取缩略图 URL
 * @param {string} path - 原图路径
 * @param {string} size - 尺寸 (small/medium/large)
 * @returns {string} 缩略图 URL
 */
export function getThumbnailUrl(path, size = 'medium') {
  if (!path) return ''

  const fullUrl = getImageUrl(path)

  // 如果后端支持缩略图，可以在这里添加参数
  // 例如：return `${fullUrl}?size=${size}`

  return fullUrl
}

/**
 * 预加载图片
 * @param {string} url - 图片 URL
 * @returns {Promise} 加载完成的 Promise
 */
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * 批量预加载图片
 * @param {Array<string>} urls - 图片 URL 数组
 * @returns {Promise<Array>} 所有图片加载完成的 Promise
 */
export function preloadImages(urls) {
  return Promise.all(urls.map(url => preloadImage(url)))
}

/**
 * 获取图片的 Base64 编码（用于占位符）
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @param {string} color - 颜色
 * @returns {string} Base64 编码的图片
 */
export function getPlaceholderImage(width = 400, height = 300, color = '#f0f0f0') {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)

  return canvas.toDataURL()
}
