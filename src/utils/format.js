/**
 * 日期格式化工具
 * @param {string|number|Date} date - 日期对象、时间戳或日期字符串
 * @param {Object} options - Intl.DateTimeFormat 选项
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, options = {}) {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false
  }
  
  return new Intl.DateTimeFormat('zh-CN', { ...defaultOptions, ...options }).format(d)
}
