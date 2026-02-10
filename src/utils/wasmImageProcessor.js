/**
 * WebAssembly Image Processor
 * High-performance image processing using WebAssembly
 * Falls back to JavaScript if WASM is not available
 */

export class WasmImageProcessor {
  constructor() {
    this.wasmSupported = this.checkWasmSupport()
    this.wasmModule = null
    this.initialized = false
    this.initPromise = null
  }

  /**
   * Check if WebAssembly is supported
   */
  checkWasmSupport() {
    try {
      if (typeof WebAssembly === 'object' &&
          typeof WebAssembly.instantiate === 'function') {
        // Test with a minimal module
        const module = new WebAssembly.Module(
          Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
        )
        return module instanceof WebAssembly.Module
      }
    } catch (e) {
      console.warn('[WASM Processor] WebAssembly not supported:', e)
    }
    return false
  }

  /**
   * Initialize WASM module (lazy loading)
   */
  async initialize() {
    if (this.initialized) return true
    if (this.initPromise) return this.initPromise

    if (!this.wasmSupported) {
      console.log('[WASM Processor] Using JavaScript fallback')
      this.initialized = true
      return true
    }

    this.initPromise = this.loadWasmModule()
    const result = await this.initPromise
    this.initialized = result
    return result
  }

  /**
   * Load WASM module
   * In production, this would load an actual .wasm file
   * For now, we'll use JavaScript fallback
   */
  async loadWasmModule() {
    try {
      // In a real implementation, you would:
      // const response = await fetch('/wasm/image-processor.wasm')
      // const buffer = await response.arrayBuffer()
      // this.wasmModule = await WebAssembly.instantiate(buffer, importObject)
      
      console.log('[WASM Processor] WASM module would be loaded here')
      console.log('[WASM Processor] Using optimized JavaScript implementation')
      return true
    } catch (error) {
      console.error('[WASM Processor] Failed to load WASM:', error)
      return false
    }
  }

  /**
   * Resize image using high-performance algorithm
   * @param {ImageData} imageData - Source image data
   * @param {number} targetWidth - Target width
   * @param {number} targetHeight - Target height
   * @returns {ImageData} - Resized image data
   */
  async resize(imageData, targetWidth, targetHeight) {
    await this.initialize()

    if (this.wasmModule && this.wasmModule.resize) {
      return this.wasmModule.resize(imageData, targetWidth, targetHeight)
    }

    // JavaScript fallback: Bilinear interpolation
    return this.resizeJS(imageData, targetWidth, targetHeight)
  }

  /**
   * JavaScript implementation of bilinear resize
   */
  resizeJS(imageData, targetWidth, targetHeight) {
    const { width: srcWidth, height: srcHeight, data: srcData } = imageData
    const destData = new Uint8ClampedArray(targetWidth * targetHeight * 4)

    const xRatio = srcWidth / targetWidth
    const yRatio = srcHeight / targetHeight

    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const srcX = x * xRatio
        const srcY = y * yRatio

        const x1 = Math.floor(srcX)
        const y1 = Math.floor(srcY)
        const x2 = Math.min(x1 + 1, srcWidth - 1)
        const y2 = Math.min(y1 + 1, srcHeight - 1)

        const xWeight = srcX - x1
        const yWeight = srcY - y1

        const destIndex = (y * targetWidth + x) * 4

        // Bilinear interpolation for each channel
        for (let c = 0; c < 4; c++) {
          const p1 = srcData[(y1 * srcWidth + x1) * 4 + c]
          const p2 = srcData[(y1 * srcWidth + x2) * 4 + c]
          const p3 = srcData[(y2 * srcWidth + x1) * 4 + c]
          const p4 = srcData[(y2 * srcWidth + x2) * 4 + c]

          const top = p1 * (1 - xWeight) + p2 * xWeight
          const bottom = p3 * (1 - xWeight) + p4 * xWeight
          destData[destIndex + c] = top * (1 - yWeight) + bottom * yWeight
        }
      }
    }

    return new ImageData(destData, targetWidth, targetHeight)
  }

  /**
   * Apply blur effect
   * @param {ImageData} imageData - Source image data
   * @param {number} radius - Blur radius
   * @returns {ImageData} - Blurred image data
   */
  async blur(imageData, radius = 5) {
    await this.initialize()

    if (this.wasmModule && this.wasmModule.blur) {
      return this.wasmModule.blur(imageData, radius)
    }

    // JavaScript fallback: Box blur
    return this.boxBlurJS(imageData, radius)
  }

  /**
   * JavaScript implementation of box blur
   */
  boxBlurJS(imageData, radius) {
    const { width, height, data } = imageData
    const output = new Uint8ClampedArray(data)

    const kernelSize = radius * 2 + 1
    const kernelArea = kernelSize * kernelSize

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0

        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const px = Math.min(Math.max(x + kx, 0), width - 1)
            const py = Math.min(Math.max(y + ky, 0), height - 1)
            const index = (py * width + px) * 4

            r += data[index]
            g += data[index + 1]
            b += data[index + 2]
            a += data[index + 3]
          }
        }

        const outIndex = (y * width + x) * 4
        output[outIndex] = r / kernelArea
        output[outIndex + 1] = g / kernelArea
        output[outIndex + 2] = b / kernelArea
        output[outIndex + 3] = a / kernelArea
      }
    }

    return new ImageData(output, width, height)
  }

  /**
   * Sharpen image
   */
  async sharpen(imageData, amount = 1.0) {
    await this.initialize()

    if (this.wasmModule && this.wasmModule.sharpen) {
      return this.wasmModule.sharpen(imageData, amount)
    }

    return this.sharpenJS(imageData, amount)
  }

  /**
   * JavaScript implementation of sharpen
   */
  sharpenJS(imageData, amount) {
    const { width, height, data } = imageData
    const output = new Uint8ClampedArray(data.length)

    // Sharpen kernel
    const kernel = [
      0, -amount, 0,
      -amount, 1 + 4 * amount, -amount,
      0, -amount, 0
    ]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const index = ((y + ky) * width + (x + kx)) * 4 + c
              const kernelIndex = (ky + 1) * 3 + (kx + 1)
              sum += data[index] * kernel[kernelIndex]
            }
          }
          const outIndex = (y * width + x) * 4 + c
          output[outIndex] = Math.max(0, Math.min(255, sum))
        }
        // Copy alpha
        output[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3]
      }
    }

    return new ImageData(output, width, height)
  }

  /**
   * Convert image to grayscale
   */
  async grayscale(imageData) {
    await this.initialize()

    const { width, height, data } = imageData
    const output = new Uint8ClampedArray(data.length)

    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      output[i] = output[i + 1] = output[i + 2] = gray
      output[i + 3] = data[i + 3]
    }

    return new ImageData(output, width, height)
  }

  /**
   * Adjust brightness
   */
  async adjustBrightness(imageData, amount = 0) {
    await this.initialize()

    const { width, height, data } = imageData
    const output = new Uint8ClampedArray(data.length)

    for (let i = 0; i < data.length; i += 4) {
      output[i] = Math.max(0, Math.min(255, data[i] + amount))
      output[i + 1] = Math.max(0, Math.min(255, data[i + 1] + amount))
      output[i + 2] = Math.max(0, Math.min(255, data[i + 2] + amount))
      output[i + 3] = data[i + 3]
    }

    return new ImageData(output, width, height)
  }

  /**
   * Get processor info
   */
  getInfo() {
    return {
      wasmSupported: this.wasmSupported,
      initialized: this.initialized,
      usingWasm: this.wasmSupported && this.initialized && !!this.wasmModule,
      backend: this.wasmSupported && this.wasmModule ? 'WebAssembly' : 'JavaScript'
    }
  }
}

// Singleton instance
export const wasmImageProcessor = new WasmImageProcessor()
