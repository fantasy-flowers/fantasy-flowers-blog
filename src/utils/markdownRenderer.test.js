import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '@/utils/markdownRenderer'

// 样例覆盖：中文标题、相对图片、外链、代码块、注入脚本
const SAMPLE = [
  '## 你好 世界',
  '',
  '这是一段文字。',
  '',
  '![示例图片](/images/test.png)',
  '',
  '[外链](https://example.com)',
  '',
  '```javascript',
  'const x = 1;',
  '```',
  '',
  '<script>alert(\'xss\')</script>'
].join('\n')

describe('renderMarkdown 渲染管线', () => {
  const html = renderMarkdown(SAMPLE, 'https://cdn.example.com')

  it('h2 带 id，中文与空格处理与旧实现一致', () => {
    expect(html).toContain('<h2 id="你好-世界">你好 世界</h2>')
  })

  it('相对图片用 baseUrl 解析且 img 有 loading="lazy"', () => {
    expect(html).toContain('src="https://cdn.example.com/images/test.png"')
    expect(html).toContain('loading="lazy"')
  })

  it('外链带 target/rel', () => {
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('pre 内含 .copy-button 且按钮在 code 之前', () => {
    expect(html).toContain('<pre><button class="copy-button" type="button">复制</button><code')
  })

  it('<script> 被 DOMPurify 剥离', () => {
    expect(html).not.toContain('<script')
    expect(html).not.toContain('alert(')
  })

  it('复制按钮在净化之后注入，未被净化掉', () => {
    const buttonCount = (html.match(/class="copy-button"/g) || []).length
    expect(buttonCount).toBe(1)
    expect(html).toContain('复制</button>')
  })
})
