import { describe, it, expect } from 'vitest'
// 导入渲染工具模块以触发与生产完全一致的按需注册副作用（markdownRenderer.js 模块级 registerLanguage）
import '@/utils/markdownRenderer'
import hljs from 'highlight.js/lib/core'

// 与 markdownRenderer.js highlight 回调逐字一致的逻辑，用于验证 '无 lang 返回空串' 路径
function highlightOrEmpty(str, lang) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(str, { language: lang }).value;
    } catch (__) { /* 与生产逻辑一致：高亮失败静默回退 */ }
  }
  return '';
}

const SAMPLES = {
  javascript: 'const x = 1;',
  typescript: 'const x: number = 1;',
  bash: 'echo hello',
  css: '.a { color: red; }',
  xml: '<div class="a"></div>',
  json: '{"a": 1}',
  markdown: '# 标题',
  yaml: 'key: value'
}

describe('highlight 按需注册子集', () => {
  it('8 种语言均已注册且高亮返回非空 .value', () => {
    for (const [lang, sample] of Object.entries(SAMPLES)) {
      expect(hljs.getLanguage(lang), `${lang} 应已注册`).toBeTruthy()
      const result = hljs.highlight(sample, { language: lang })
      expect(result.value, `${lang} 高亮结果非空`).not.toBe('')
    }
  })

  it('html 别名指向 xml 语法', () => {
    expect(hljs.getLanguage('html')).toBeTruthy()
    expect(hljs.highlight('<div></div>', { language: 'html' }).value).not.toBe('')
  })

  it('未注册语言（python）getLanguage 返回 undefined', () => {
    expect(hljs.getLanguage('python')).toBeUndefined()
  })

  it('无 lang 时走 return \'\' 路径且不抛错', () => {
    expect(() => highlightOrEmpty('const x = 1;', '')).not.toThrow()
    expect(highlightOrEmpty('const x = 1;', '')).toBe('')
    expect(highlightOrEmpty('const x = 1;', undefined)).toBe('')
  })

  it('已注册语言经 highlightOrEmpty 返回非空值', () => {
    expect(highlightOrEmpty('const x = 1;', 'javascript')).not.toBe('')
  })
})
