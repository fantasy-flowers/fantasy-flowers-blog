import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime } from '@/utils/format'

describe('formatDate', () => {
  const d = new Date(2026, 9, 27, 14, 30)

  it("preset 'date' 输出与原实现一致（含年份，如 2026/10/27）", () => {
    const original = d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    expect(formatDate(d, 'date')).toBe(original)
  })

  it("preset 'date' 为默认值", () => {
    expect(formatDate(d)).toBe(formatDate(d, 'date'))
  })

  it("preset 'month-day' 仅输出月日", () => {
    const monthDay = new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    }).format(d)
    expect(formatDate(d, 'month-day')).toBe(monthDay)
    expect(formatDate(d, 'month-day')).not.toContain('2026')
  })

  it('支持字符串与时间戳输入', () => {
    expect(formatDate('2026-10-27T14:30:00', 'date')).toBe(formatDate(d, 'date'))
    expect(formatDate(d.getTime(), 'date')).toBe(formatDate(d, 'date'))
  })

  it('空值返回空字符串', () => {
    expect(formatDate('', 'date')).toBe('')
    expect(formatDate(null, 'date')).toBe('')
    expect(formatDate(undefined, 'date')).toBe('')
  })

  it('非法日期返回空字符串', () => {
    expect(formatDate('not-a-date', 'date')).toBe('')
    expect(formatDate(new Date(NaN), 'date')).toBe('')
  })
})

describe('formatDateTime', () => {
  const d = new Date(2026, 9, 27, 14, 30)

  it('输出与原 detail.vue 实现一致（日期 + 空格 + 时分）', () => {
    const original =
      d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }) +
      ' ' +
      d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    expect(formatDateTime(d)).toBe(original)
  })

  it('格式形如 2026/10/27 14:30', () => {
    const out = formatDateTime(d)
    expect(out).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/)
  })

  it('空值/非法日期返回空字符串', () => {
    expect(formatDateTime('')).toBe('')
    expect(formatDateTime(null)).toBe('')
    expect(formatDateTime('bad-date')).toBe('')
  })
})
