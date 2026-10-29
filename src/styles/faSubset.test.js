import { describe, it, expect } from 'vitest'
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Font Awesome 子集守卫（A4）。
 * 目的：CSS 里每加一个图标，都必须重跑 `npm run fonts:subset`，
 * 否则字体里没有对应字形，线上会显示成空白方块。这里把漂移在测试阶段拦下来。
 */
const cssPath = resolve(process.cwd(), 'src/styles/fa-subset.css')
const manifestPath = resolve(process.cwd(), 'src/assets/fonts/fa-subset.manifest.json')
const fontDir = resolve(process.cwd(), 'src/assets/fonts') + '/'

const css = readFileSync(cssPath, 'utf8')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

const cssCodepoints = new Set(
  [...css.matchAll(/--fa\s*:\s*"\\([0-9a-fA-F]{4,6})"/g)].map(m => parseInt(m[1], 16))
)

describe('FontAwesome 字体子集', () => {
  it('CSS 中的图标码点非空', () => {
    expect(cssCodepoints.size).toBeGreaterThan(0)
  })

  it('清单码点与 CSS 完全一致（新增图标必须重跑子集脚本）', () => {
    const manifestCodepoints = new Set(manifest.codepoints.map(cp => parseInt(cp.replace('U+', ''), 16)))
    const missing = [...cssCodepoints].filter(cp => !manifestCodepoints.has(cp))
    expect(missing.map(cp => `U+${cp.toString(16).toUpperCase()}`)).toEqual([])
    expect(manifestCodepoints.size).toBe(cssCodepoints.size)
  })

  it('每个码点至少被一个字体覆盖', () => {
    const covered = new Set()
    for (const font of manifest.fonts) {
      for (const cp of font.codepoints) covered.add(parseInt(cp.replace('U+', ''), 16))
    }
    const uncovered = [...cssCodepoints].filter(cp => !covered.has(cp))
    expect(uncovered.map(cp => `U+${cp.toString(16).toUpperCase()}`)).toEqual([])
  })

  it('字体文件存在且体积在预算内', () => {
    for (const font of manifest.fonts) {
      const size = statSync(fontDir + font.file).size
      expect(size).toBe(font.bytes)
      expect(size, `${font.file} 超出 6KB 预算`).toBeLessThan(6 * 1024)
    }
    const total = manifest.fonts.reduce((sum, f) => sum + statSync(fontDir + f.file).size, 0)
    expect(total, '字体总体积超出 10KB 预算').toBeLessThan(10 * 1024)
  })

  it('@font-face 指向子集文件而非 node_modules 源字体', () => {
    const faces = [...css.matchAll(/@font-face\{[^}]*\}/g)].map(m => m[0])
    expect(faces.length).toBe(3)
    for (const face of faces) {
      expect(face).toMatch(/url\(\.\.\/assets\/fonts\/fa-[a-z]+-\d+\.subset\.woff2\)/)
      expect(face).not.toMatch(/node_modules/)
    }
  })
})
