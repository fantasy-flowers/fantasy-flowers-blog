/**
 * @file useImageFallback.js
 * @description 图片加载失败多级回退组合函数
 *
 * 提供图片加载的多级回退逻辑：
 * 主图片 → 备用图片 → SVG 占位符 → CSS 渐变
 *
 * 供 EntryAvatar 等组件复用。
 */

import { ref, computed } from 'vue'

/** 默认 SVG 占位符（圆形渐变） */
const DEFAULT_SVG_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0' +
  'JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8y' +
  'MDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9InVybCgjZykiLz' +
  '48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIg' +
  'eTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzQjgyRjYiIHN0b3Atb3' +
  'BhY2l0eT0iMC44Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOTMzM0VBIiBz' +
  'dG9wLW9wYWNpdHk9IjAuOCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg=='

/** 默认 CSS 渐变背景 */
const DEFAULT_CSS_GRADIENT =
  'linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(147, 51, 234, 0.6))'

/**
 * 图片加载多级回退 composable
 *
 * @param {string} primarySrc - 主图片路径
 * @param {Object} [options]
 * @param {string[]} [options.fallbacks=[]] - 备用图片路径列表
 * @param {string} [options.svgPlaceholder] - SVG 占位符 data URI
 * @param {string} [options.cssGradient] - 最终 CSS 渐变背景
 * @returns {{
 *   currentSrc: import('vue').Ref<string>,
 *   isLoading: import('vue').Ref<boolean>,
 *   hasError: import('vue').Ref<boolean>,
 *   useCssGradient: import('vue').Ref<boolean>,
 *   cssGradientStyle: import('vue').ComputedRef<string>,
 *   handleError: () => void,
 *   handleLoad: () => void,
 *   reset: (newSrc?: string) => void
 * }}
 *
 * @example
 * const { currentSrc, isLoading, hasError, handleError, handleLoad } = useImageFallback(
 *   '/head/head.webp',
 *   { fallbacks: ['/background/12.webp'] }
 * )
 */
export function useImageFallback(primarySrc, options = {}) {
  const {
    fallbacks = [],
    svgPlaceholder = DEFAULT_SVG_PLACEHOLDER,
    cssGradient = DEFAULT_CSS_GRADIENT
  } = options

  // 构建完整的回退链：主图 → 备用图片列表 → SVG → CSS 渐变
  const buildChain = (src) => {
    const chain = [src, ...fallbacks]
    if (svgPlaceholder) chain.push(svgPlaceholder)
    return chain
  }

  let fallbackChain = buildChain(primarySrc)
  const fallbackIndex = ref(0)

  const currentSrc = ref(fallbackChain[0] || '')
  const isLoading = ref(true)
  const hasError = ref(false)
  const useCssGradient = ref(false)

  const cssGradientStyle = computed(() => (useCssGradient.value ? cssGradient : ''))

  /** 图片加载成功回调 */
  const handleLoad = () => {
    isLoading.value = false
    hasError.value = false
  }

  /** 图片加载失败回调，尝试下一个回退源 */
  const handleError = () => {
    const nextIndex = fallbackIndex.value + 1

    if (nextIndex < fallbackChain.length) {
      fallbackIndex.value = nextIndex
      currentSrc.value = fallbackChain[nextIndex]
      // isLoading 保持 true，等待下一个源加载
    } else {
      // 所有图片源均失败，启用 CSS 渐变
      isLoading.value = false
      hasError.value = true
      useCssGradient.value = true
      currentSrc.value = ''
    }
  }

  /**
   * 重置状态，可选传入新的主图片路径
   * @param {string} [newSrc]
   */
  const reset = (newSrc) => {
    const src = newSrc || primarySrc
    fallbackChain = buildChain(src)
    fallbackIndex.value = 0
    currentSrc.value = fallbackChain[0] || ''
    isLoading.value = true
    hasError.value = false
    useCssGradient.value = false
  }

  // 当 primarySrc 是响应式值时，外部可通过 watch + reset 来响应变化
  // 这里不自动 watch，保持 composable 的简洁性

  return {
    currentSrc,
    isLoading,
    hasError,
    useCssGradient,
    cssGradientStyle,
    handleError,
    handleLoad,
    reset
  }
}

// 导出常量供外部使用
export { DEFAULT_SVG_PLACEHOLDER, DEFAULT_CSS_GRADIENT }
