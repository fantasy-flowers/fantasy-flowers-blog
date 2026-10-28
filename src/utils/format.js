/**
 * 日期格式化工具（单一实现）
 * formatDate(date, preset): preset = 'date' | 'month-day'
 * formatDateTime(date): 日期 + 时分
 * 空值/非法日期一律返回 ''
 */

const DATE_OPTIONS = { year: 'numeric', month: '2-digit', day: '2-digit' }
const MONTH_DAY_OPTIONS = { month: '2-digit', day: '2-digit' }
const TIME_OPTIONS = { hour: '2-digit', minute: '2-digit' }

/** 转为有效 Date；空值/非法值返回 null */
function toValidDate(date) {
  if (!date) return null
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return null
  return d
}

/**
 * 格式化日期
 * @param {string|number|Date} date - 日期对象、时间戳或日期字符串
 * @param {'date'|'month-day'} [preset='date'] - 'date' 含年份（如 2026/10/27），'month-day' 仅月日（如 10/27）
 * @returns {string} 格式化后的日期字符串；空值/非法日期返回 ''
 */
export function formatDate(date, preset = 'date') {
  const d = toValidDate(date)
  if (!d) return ''
  const options = preset === 'month-day' ? MONTH_DAY_OPTIONS : DATE_OPTIONS
  return new Intl.DateTimeFormat('zh-CN', options).format(d)
}

/**
 * 格式化日期时间（日期 + 空格 + 时分，如 2026/10/27 14:30）
 * @param {string|number|Date} date - 日期对象、时间戳或日期字符串
 * @returns {string} 格式化后的日期时间字符串；空值/非法日期返回 ''
 */
export function formatDateTime(date) {
  const d = toValidDate(date)
  if (!d) return ''
  return new Intl.DateTimeFormat('zh-CN', DATE_OPTIONS).format(d) + ' ' + d.toLocaleTimeString('zh-CN', TIME_OPTIONS)
}
