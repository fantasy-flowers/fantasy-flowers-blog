import { describe, it, expect } from 'vitest'
import { useImageFallback, DEFAULT_SVG_PLACEHOLDER, DEFAULT_CSS_GRADIENT } from './useImageFallback.js'

describe('useImageFallback', () => {
  it('initializes with primary source', () => {
    const { currentSrc, isLoading, hasError, useCssGradient } = useImageFallback('/img/main.webp')

    expect(currentSrc.value).toBe('/img/main.webp')
    expect(isLoading.value).toBe(true)
    expect(hasError.value).toBe(false)
    expect(useCssGradient.value).toBe(false)
  })

  it('sets loaded state on handleLoad', () => {
    const { handleLoad, isLoading, hasError } = useImageFallback('/img/main.webp')

    handleLoad()

    expect(isLoading.value).toBe(false)
    expect(hasError.value).toBe(false)
  })

  it('falls back to next source on handleError', () => {
    const { currentSrc, handleError, isLoading } = useImageFallback('/img/main.webp', {
      fallbacks: ['/img/backup.webp']
    })

    handleError()

    expect(currentSrc.value).toBe('/img/backup.webp')
    expect(isLoading.value).toBe(true) // still loading next source
  })

  it('falls back through entire chain: primary → backup → SVG', () => {
    const { currentSrc, handleError } = useImageFallback('/img/main.webp', {
      fallbacks: ['/img/backup.webp']
    })

    // primary fails
    handleError()
    expect(currentSrc.value).toBe('/img/backup.webp')

    // backup fails
    handleError()
    expect(currentSrc.value).toBe(DEFAULT_SVG_PLACEHOLDER)
  })

  it('enables CSS gradient when all sources fail', () => {
    const { currentSrc, handleError, hasError, useCssGradient, isLoading, cssGradientStyle } =
      useImageFallback('/img/main.webp', { fallbacks: [] })

    // primary fails
    handleError()
    // SVG fails
    handleError()

    expect(currentSrc.value).toBe('')
    expect(hasError.value).toBe(true)
    expect(useCssGradient.value).toBe(true)
    expect(isLoading.value).toBe(false)
    expect(cssGradientStyle.value).toBe(DEFAULT_CSS_GRADIENT)
  })

  it('returns empty cssGradientStyle when not in gradient mode', () => {
    const { cssGradientStyle } = useImageFallback('/img/main.webp')
    expect(cssGradientStyle.value).toBe('')
  })

  it('uses custom SVG placeholder', () => {
    const customSvg = 'data:image/svg+xml;base64,custom'
    const { currentSrc, handleError } = useImageFallback('/img/main.webp', {
      fallbacks: [],
      svgPlaceholder: customSvg
    })

    handleError() // primary fails → custom SVG
    expect(currentSrc.value).toBe(customSvg)
  })

  it('uses custom CSS gradient', () => {
    const customGradient = 'linear-gradient(red, blue)'
    const { handleError, cssGradientStyle } = useImageFallback('/img/main.webp', {
      fallbacks: [],
      svgPlaceholder: null,
      cssGradient: customGradient
    })

    handleError() // primary fails → CSS gradient (no SVG in chain)

    expect(cssGradientStyle.value).toBe(customGradient)
  })

  it('resets state correctly', () => {
    const { currentSrc, handleError, reset, isLoading, hasError, useCssGradient } =
      useImageFallback('/img/main.webp', { fallbacks: [] })

    // Exhaust all fallbacks
    handleError()
    handleError()
    expect(hasError.value).toBe(true)

    // Reset
    reset()
    expect(currentSrc.value).toBe('/img/main.webp')
    expect(isLoading.value).toBe(true)
    expect(hasError.value).toBe(false)
    expect(useCssGradient.value).toBe(false)
  })

  it('resets with a new source', () => {
    const { currentSrc, reset } = useImageFallback('/img/main.webp')

    reset('/img/new.webp')
    expect(currentSrc.value).toBe('/img/new.webp')
  })

  it('skips SVG placeholder when set to null', () => {
    const { currentSrc, handleError, useCssGradient } = useImageFallback('/img/main.webp', {
      fallbacks: [],
      svgPlaceholder: null
    })

    // primary fails → CSS gradient directly (no SVG in chain)
    handleError()
    expect(currentSrc.value).toBe('')
    expect(useCssGradient.value).toBe(true)
  })
})
