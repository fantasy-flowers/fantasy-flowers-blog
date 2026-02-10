/**
 * Progressive Image Loader
 * Implements progressive/interlaced image loading for better UX
 */

export class ProgressiveImageLoader {
  constructor() {
    this.loadingImages = new Map()
    this.canvas = null
    this.ctx = null
  }

  /**
   * Initialize canvas for image processing
   */
  initCanvas() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d', { 
        alpha: false,
        desynchronized: true 
      })
    }
  }

  /**
   * Load image progressively with blur-up technique
   * @param {string} imageUrl - Full resolution image URL
   * @param {string} thumbnailUrl - Low resolution thumbnail URL
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<string>} - Final image URL
   */
  async loadProgressive(imageUrl, thumbnailUrl, onProgress = null) {
    const loadId = `${imageUrl}_${Date.now()}`
    
    try {
      // Step 1: Load and display blurred thumbnail immediately
      const thumbnailBlob = await this.loadWithProgress(thumbnailUrl, (progress) => {
        if (onProgress) onProgress({ stage: 'thumbnail', progress: progress * 0.3 })
      })
      
      const thumbnailObjectUrl = URL.createObjectURL(thumbnailBlob)
      
      if (onProgress) {
        onProgress({ 
          stage: 'thumbnail', 
          progress: 0.3, 
          url: thumbnailObjectUrl,
          isBlurred: true 
        })
      }

      // Step 2: Load full resolution image
      const fullBlob = await this.loadWithProgress(imageUrl, (progress) => {
        if (onProgress) onProgress({ 
          stage: 'full', 
          progress: 0.3 + (progress * 0.7),
          url: thumbnailObjectUrl,
          isBlurred: true
        })
      })

      const fullObjectUrl = URL.createObjectURL(fullBlob)

      // Step 3: Cleanup thumbnail
      URL.revokeObjectURL(thumbnailObjectUrl)

      if (onProgress) {
        onProgress({ 
          stage: 'complete', 
          progress: 1, 
          url: fullObjectUrl,
          isBlurred: false
        })
      }

      return fullObjectUrl
    } catch (error) {
      console.error('[Progressive Loader] Error:', error)
      throw error
    } finally {
      this.loadingImages.delete(loadId)
    }
  }

  /**
   * Load image with progress tracking
   */
  async loadWithProgress(url, onProgress = null) {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.statusText}`)
    }

    const contentLength = response.headers.get('content-length')
    const total = parseInt(contentLength, 10)
    
    if (!contentLength || !total) {
      // No content-length, just load normally
      return await response.blob()
    }

    const reader = response.body.getReader()
    const chunks = []
    let receivedLength = 0

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break

      chunks.push(value)
      receivedLength += value.length

      if (onProgress) {
        onProgress(receivedLength / total)
      }
    }

    // Combine chunks into single blob
    return new Blob(chunks)
  }

  /**
   * Create progressive JPEG-like effect using canvas
   * Loads image in multiple passes with increasing quality
   */
  async loadMultiPass(imageUrl, passes = 3, onProgress = null) {
    this.initCanvas()

    try {
      // Load full image
      const img = await this.loadImageElement(imageUrl)
      
      this.canvas.width = img.naturalWidth
      this.canvas.height = img.naturalHeight

      // Render multiple passes with increasing quality
      for (let pass = 1; pass <= passes; pass++) {
        const quality = pass / passes
        
        // Simulate progressive rendering by drawing at different scales
        const scale = 0.2 + (quality * 0.8)
        const tempWidth = Math.floor(img.naturalWidth * scale)
        const tempHeight = Math.floor(img.naturalHeight * scale)

        // Clear and draw scaled
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.imageSmoothingEnabled = true
        this.ctx.imageSmoothingQuality = pass === passes ? 'high' : 'low'
        
        // Draw scaled down then up for progressive effect
        this.ctx.drawImage(img, 0, 0, tempWidth, tempHeight)
        this.ctx.drawImage(
          this.canvas, 
          0, 0, tempWidth, tempHeight,
          0, 0, this.canvas.width, this.canvas.height
        )

        if (onProgress) {
          const blob = await this.canvasToBlob(this.canvas, quality)
          const url = URL.createObjectURL(blob)
          
          onProgress({
            stage: 'rendering',
            pass,
            totalPasses: passes,
            progress: pass / passes,
            url,
            isBlurred: pass < passes
          })

          // Small delay between passes for visual effect
          if (pass < passes) {
            await new Promise(resolve => setTimeout(resolve, 50))
          }
        }
      }

      // Return final high-quality blob
      const finalBlob = await this.canvasToBlob(this.canvas, 1.0)
      return URL.createObjectURL(finalBlob)

    } catch (error) {
      console.error('[Progressive Loader] Multi-pass error:', error)
      throw error
    }
  }

  /**
   * Load image element
   */
  loadImageElement(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * Convert canvas to blob
   */
  canvasToBlob(canvas, quality = 0.92) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        },
        'image/jpeg',
        quality
      )
    })
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.loadingImages.clear()
    if (this.canvas) {
      this.canvas.width = 0
      this.canvas.height = 0
      this.canvas = null
      this.ctx = null
    }
  }
}

// Singleton instance
export const progressiveImageLoader = new ProgressiveImageLoader()
