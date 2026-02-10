/**
 * Memory Optimizer
 * Manages memory usage and garbage collection for image loading
 */

export class MemoryOptimizer {
  constructor() {
    this.objectUrls = new Set()
    this.imageElements = new WeakMap()
    this.memoryThreshold = this.getMemoryThreshold()
    this.cleanupInterval = null
    this.stats = {
      totalAllocated: 0,
      totalReleased: 0,
      currentUrls: 0,
      cleanupRuns: 0
    }
  }

  /**
   * Get memory threshold based on device
   */
  getMemoryThreshold() {
    // Try to get device memory
    if ('deviceMemory' in navigator) {
      const deviceMemory = navigator.deviceMemory // in GB
      
      if (deviceMemory <= 2) return 50 * 1024 * 1024 // 50MB for low-end
      if (deviceMemory <= 4) return 100 * 1024 * 1024 // 100MB for mid-range
      return 200 * 1024 * 1024 // 200MB for high-end
    }

    // Fallback: 100MB
    return 100 * 1024 * 1024
  }

  /**
   * Track object URL
   */
  trackObjectUrl(url, sizeEstimate = 0) {
    this.objectUrls.add(url)
    this.stats.totalAllocated += sizeEstimate
    this.stats.currentUrls = this.objectUrls.size

    console.log(
      `[Memory Optimizer] Tracked URL (${this.objectUrls.size} total, ~${this.formatBytes(this.stats.totalAllocated)})`
    )

    // Check if cleanup needed
    this.checkMemoryPressure()
  }

  /**
   * Release object URL
   */
  releaseObjectUrl(url, sizeEstimate = 0) {
    if (this.objectUrls.has(url)) {
      URL.revokeObjectURL(url)
      this.objectUrls.delete(url)
      this.stats.totalReleased += sizeEstimate
      this.stats.currentUrls = this.objectUrls.size

      console.log(
        `[Memory Optimizer] Released URL (${this.objectUrls.size} remaining)`
      )
    }
  }

  /**
   * Release multiple URLs
   */
  releaseMultiple(urls) {
    urls.forEach(url => this.releaseObjectUrl(url))
  }

  /**
   * Check memory pressure and cleanup if needed
   */
  checkMemoryPressure() {
    // Check if we have performance.memory (Chrome only)
    if (performance.memory) {
      const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory
      const usageRatio = usedJSHeapSize / jsHeapSizeLimit

      if (usageRatio > 0.9) {
        console.warn('[Memory Optimizer] High memory pressure detected, forcing cleanup')
        this.forceCleanup()
      } else if (usageRatio > 0.7) {
        console.warn('[Memory Optimizer] Moderate memory pressure, scheduling cleanup')
        this.scheduleCleanup()
      }
    } else {
      // Fallback: cleanup based on URL count
      if (this.objectUrls.size > 50) {
        this.scheduleCleanup()
      }
    }
  }

  /**
   * Schedule cleanup
   */
  scheduleCleanup() {
    if (this.cleanupInterval) return

    this.cleanupInterval = setTimeout(() => {
      this.forceCleanup()
      this.cleanupInterval = null
    }, 5000)
  }

  /**
   * Force garbage collection and cleanup
   */
  forceCleanup() {
    console.group('%c🧹 Memory Optimizer - Cleanup', 'color: #F59E0B; font-weight: bold')
    
    const before = this.objectUrls.size

    // Release old object URLs (keep only recent ones)
    const urlsArray = Array.from(this.objectUrls)
    const toRelease = urlsArray.slice(0, Math.floor(urlsArray.length / 2))
    
    toRelease.forEach(url => {
      URL.revokeObjectURL(url)
      this.objectUrls.delete(url)
    })

    this.stats.cleanupRuns++
    this.stats.currentUrls = this.objectUrls.size

    console.log(`Released ${before - this.objectUrls.size} URLs`)
    console.log(`Remaining: ${this.objectUrls.size} URLs`)
    
    if (performance.memory) {
      console.log(`Heap: ${this.formatBytes(performance.memory.usedJSHeapSize)}`)
    }

    console.groupEnd()

    // Suggest garbage collection (if available)
    this.suggestGC()
  }

  /**
   * Suggest garbage collection
   */
  suggestGC() {
    // Request idle callback for GC hint
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Create and release temporary objects to hint GC
        const temp = new Array(1000).fill(null)
        temp.length = 0
      }, { timeout: 1000 })
    }
  }

  /**
   * Create managed image element
   */
  createManagedImage(url) {
    const img = new Image()
    
    // Track in WeakMap
    this.imageElements.set(img, {
      url,
      created: Date.now()
    })

    // Auto-cleanup on load
    img.addEventListener('load', () => {
      // Image is loaded, can release blob URL if it's one
      if (url.startsWith('blob:')) {
        setTimeout(() => {
          this.releaseObjectUrl(url)
        }, 1000)
      }
    })

    img.src = url
    return img
  }

  /**
   * Estimate image size
   */
  estimateImageSize(width, height, hasAlpha = true) {
    // Rough estimate: width * height * bytes per pixel
    const bytesPerPixel = hasAlpha ? 4 : 3
    return width * height * bytesPerPixel
  }

  /**
   * Get memory stats
   */
  getStats() {
    const stats = {
      ...this.stats,
      memoryThreshold: this.memoryThreshold,
      memoryThresholdFormatted: this.formatBytes(this.memoryThreshold)
    }

    if (performance.memory) {
      stats.heapUsed = performance.memory.usedJSHeapSize
      stats.heapTotal = performance.memory.totalJSHeapSize
      stats.heapLimit = performance.memory.jsHeapSizeLimit
      stats.heapUsedFormatted = this.formatBytes(stats.heapUsed)
      stats.heapUsagePercent = ((stats.heapUsed / stats.heapLimit) * 100).toFixed(1)
    }

    return stats
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Start automatic monitoring
   */
  startMonitoring(interval = 30000) {
    this.stopMonitoring()

    this.monitoringInterval = setInterval(() => {
      const stats = this.getStats()
      
      if (stats.heapUsagePercent && parseFloat(stats.heapUsagePercent) > 70) {
        console.warn('[Memory Optimizer] High memory usage detected:', stats.heapUsagePercent + '%')
        this.checkMemoryPressure()
      }
    }, interval)

    console.log('[Memory Optimizer] Monitoring started')
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }

  /**
   * Cleanup all resources
   */
  cleanup() {
    this.stopMonitoring()
    
    if (this.cleanupInterval) {
      clearTimeout(this.cleanupInterval)
      this.cleanupInterval = null
    }

    // Release all tracked URLs
    this.objectUrls.forEach(url => URL.revokeObjectURL(url))
    this.objectUrls.clear()

    console.log('[Memory Optimizer] Cleanup complete')
  }
}

// Singleton instance
export const memoryOptimizer = new MemoryOptimizer()

// Auto-start monitoring
if (typeof window !== 'undefined') {
  memoryOptimizer.startMonitoring()

  // Add to global debug object (with delay to ensure wallpaperOptimizer exists)
  const initMemoryDebug = () => {
    if (window.wallpaperOptimizer) {
      window.wallpaperOptimizer.memory = {
        getStats: () => {
          const stats = memoryOptimizer.getStats()
          console.group('%c💾 Memory Statistics', 'color: #F59E0B; font-weight: bold; font-size: 16px')
          console.log(`%cTracked URLs: %c${stats.currentUrls}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
          console.log(`%cTotal Allocated: %c${memoryOptimizer.formatBytes(stats.totalAllocated)}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
          console.log(`%cTotal Released: %c${memoryOptimizer.formatBytes(stats.totalReleased)}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
          console.log(`%cCleanup Runs: %c${stats.cleanupRuns}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
          
          if (stats.heapUsed) {
            console.log(`%cHeap Used: %c${stats.heapUsedFormatted} (${stats.heapUsagePercent}%)`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
          }
          
          console.groupEnd()
          return stats
        },
        
        forceCleanup: () => {
          memoryOptimizer.forceCleanup()
        },
        
        help: () => {
          console.group('%c💾 Memory Optimizer - Console Commands', 'color: #F59E0B; font-weight: bold; font-size: 16px')
          console.log('%cwallpaperOptimizer.memory.getStats()', 'color: #3B82F6', '- Show memory statistics')
          console.log('%cwallpaperOptimizer.memory.forceCleanup()', 'color: #3B82F6', '- Force memory cleanup')
          console.log('%cwallpaperOptimizer.memory.help()', 'color: #3B82F6', '- Show this help')
          console.groupEnd()
        }
      }
    } else {
      // Retry after a short delay
      setTimeout(initMemoryDebug, 100)
    }
  }
  
  // Try to initialize immediately, or wait for wallpaperOptimizer
  if (window.wallpaperOptimizer) {
    initMemoryDebug()
  } else {
    setTimeout(initMemoryDebug, 100)
  }
}
