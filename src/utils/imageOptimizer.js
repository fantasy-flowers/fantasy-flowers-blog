/**
 * Image Optimizer Utility
 * Handles responsive image loading, caching, and performance monitoring
 * Enhanced with intelligent preloading, network adaptation, and priority queue
 */

import { imageLoadQueue, PRIORITY } from './imageLoadQueue'
import { smartPreloader } from './smartPreloader'
import { networkAdaptiveLoader } from './networkAdaptiveLoader'
import { responsiveImageLoader } from './responsiveImageLoader'
import { wasmImageProcessor } from './wasmImageProcessor'
import { memoryOptimizer } from './memoryOptimizer'
import { progressiveImageLoader } from './progressiveImageLoader'

// Image size configurations
export const IMAGE_SIZES = {
  small: { width: 640, path: '/images/small/' },
  medium: { width: 1024, path: '/images/medium/' },
  large: { width: 1920, path: '/images/large/' },
  xlarge: { width: 3840, path: '/images/xlarge/' }
}

// Export utilities for external use
export { 
  imageLoadQueue, 
  PRIORITY, 
  smartPreloader, 
  networkAdaptiveLoader, 
  responsiveImageLoader,
  wasmImageProcessor,
  memoryOptimizer,
  progressiveImageLoader
}

// Network quality detection
export class NetworkDetector {
  constructor() {
    this.quality = 'unknown'
    this.effectiveType = 'unknown'
    this.downlink = 0
    this.detectNetworkQuality()
  }

  detectNetworkQuality() {
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      if (connection) {
        this.effectiveType = connection.effectiveType || 'unknown'
        this.downlink = connection.downlink || 0
        
        // Classify network quality
        if (this.effectiveType === '4g' || this.downlink > 5) {
          this.quality = 'high'
        } else if (this.effectiveType === '3g' || this.downlink > 1.5) {
          this.quality = 'medium'
        } else {
          this.quality = 'low'
        }
      }
    }
    
    // Fallback: use screen size as indicator
    if (this.quality === 'unknown') {
      const screenWidth = window.innerWidth
      if (screenWidth >= 1920) {
        this.quality = 'high'
      } else if (screenWidth >= 1024) {
        this.quality = 'medium'
      } else {
        this.quality = 'low'
      }
    }
    
    return this.quality
  }

  getQuality() {
    return this.quality
  }
}

// LRU Cache implementation
export class LRUCache {
  constructor(maxSize = 20) {
    this.maxSize = maxSize
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) return null
    
    // Move to end (most recently used)
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key, value) {
    // Remove if exists
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    
    // Add to end
    this.cache.set(key, value)
    
    // Evict oldest if over size
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
  }

  has(key) {
    return this.cache.has(key)
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }
}

// Performance monitoring
export class ImagePerformanceMonitor {
  constructor() {
    this.metrics = []
  }

  recordLoad(imageName, size, loadTime, fromCache = false) {
    const metric = {
      imageName,
      size,
      loadTime,
      fromCache,
      timestamp: Date.now()
    }
    
    this.metrics.push(metric)
    
    // Keep only last 50 metrics
    if (this.metrics.length > 50) {
      this.metrics.shift()
    }
    
    // Console output with styling
    const style = fromCache ? 'color: #10B981; font-weight: bold' : 'color: #3B82F6'
    console.log(
      `%c[Wallpaper Optimizer] ${imageName} (${size}) - ${loadTime}ms ${fromCache ? '✓ cached' : ''}`,
      style
    )
    
    // Log summary every 10 loads
    if (this.metrics.length % 10 === 0) {
      this.logSummary()
    }
  }

  logSummary() {
    const metrics = this.getMetrics()
    console.group('%c📊 Wallpaper Performance Summary', 'color: #EC4899; font-weight: bold; font-size: 14px')
    console.log(`Total Loads: ${metrics.totalLoads}`)
    console.log(`Average Load Time: ${metrics.averageLoadTime}ms`)
    console.log(`Cache Hit Rate: ${metrics.cacheHitRate}%`)
    console.log(`Network Quality: ${this.networkDetector.getQuality()}`)
    console.log(`Cache Size: ${this.cache.size()}`)
    console.groupEnd()
  }

  getAverageLoadTime() {
    if (this.metrics.length === 0) return 0
    const total = this.metrics.reduce((sum, m) => sum + m.loadTime, 0)
    return Math.round(total / this.metrics.length)
  }

  getCacheHitRate() {
    if (this.metrics.length === 0) return 0
    const cached = this.metrics.filter(m => m.fromCache).length
    return Math.round((cached / this.metrics.length) * 100)
  }

  getMetrics() {
    return {
      totalLoads: this.metrics.length,
      averageLoadTime: this.getAverageLoadTime(),
      cacheHitRate: this.getCacheHitRate(),
      recentLoads: this.metrics.slice(-10)
    }
  }
}

// Image loader with optimization
export class ImageLoader {
  constructor() {
    this.cache = new LRUCache(20)
    this.monitor = new ImagePerformanceMonitor()
    this.networkDetector = new NetworkDetector()
    this.networkAdaptive = networkAdaptiveLoader
    this.responsiveLoader = responsiveImageLoader
    this.smartPreloader = smartPreloader
    this.wasmProcessor = wasmImageProcessor
    this.memoryOptimizer = memoryOptimizer
    this.progressiveLoader = progressiveImageLoader
    
    // Update queue concurrency based on network
    this.updateQueueConcurrency()
    this.networkAdaptive.addListener(() => this.updateQueueConcurrency())
  }

  /**
   * Update queue concurrency based on network
   */
  updateQueueConcurrency() {
    const maxConcurrent = this.networkAdaptive.getMaxConcurrentLoads()
    imageLoadQueue.maxConcurrent = maxConcurrent
    console.log(`[Image Loader] Queue concurrency: ${maxConcurrent}`)
  }

  /**
   * Get optimal image size based on screen and network
   */
  getOptimalSize(screenWidth = window.innerWidth) {
    // Use network adaptive loader for better quality detection
    return this.networkAdaptive.getOptimalSize(screenWidth)
  }

  /**
   * Load image with caching and performance monitoring
   * Enhanced with priority queue support and memory tracking
   */
  async loadImage(imageName, size = null, priority = PRIORITY.MEDIUM) {
    const optimalSize = size || this.getOptimalSize()
    const cacheKey = `${imageName}_${optimalSize}`
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.monitor.recordLoad(imageName, optimalSize, 0, true)
      return this.cache.get(cacheKey)
    }
    
    // Use priority queue for loading
    const imageUrl = `/${imageName}`
    const loadTask = async () => {
      const startTime = performance.now()
      const imagePath = `${IMAGE_SIZES[optimalSize].path}${imageName}`
      
      try {
        const response = await fetch(imagePath)
        if (!response.ok) throw new Error(`Failed to load ${imagePath}`)
        
        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        
        const loadTime = Math.round(performance.now() - startTime)
        
        // Track memory usage
        this.memoryOptimizer.trackObjectUrl(imageUrl, blob.size)
        
        // Cache the result
        this.cache.set(cacheKey, imageUrl)
        this.monitor.recordLoad(imageName, optimalSize, loadTime, false)
        
        return imageUrl
      } catch (error) {
        console.error(`Error loading image ${imagePath}:`, error)
        // Fallback to direct path
        return imagePath
      }
    }
    
    return imageLoadQueue.enqueue(imageUrl, loadTask, priority)
  }

  /**
   * Preload images with intelligent prioritization
   */
  async preloadImages(imageNames, size = null, priority = PRIORITY.LOW) {
    // Only preload if network allows
    if (!this.networkAdaptive.shouldPreload()) {
      console.log('[Image Loader] Skipping preload due to network conditions')
      return []
    }

    const promises = imageNames.map(name => this.loadImage(name, size, priority))
    return Promise.all(promises)
  }

  /**
   * Smart preload based on user behavior
   */
  async smartPreload(imageNames) {
    await this.smartPreloader.preloadPredicted(this, imageNames)
  }

  /**
   * Preload adjacent images
   */
  preloadAdjacent(currentIndex, imageNames, range = 2) {
    this.smartPreloader.preloadAdjacent(currentIndex, imageNames, this, range)
  }

  /**
   * Setup hover preload for an image
   */
  setupHoverPreload(imageUrl, imageName) {
    const loadTask = () => this.loadImage(imageName, null, PRIORITY.MEDIUM)
    return this.smartPreloader.preloadOnHover(imageUrl, loadTask)
  }

  /**
   * Record user selection
   */
  recordSelection(imageUrl) {
    this.smartPreloader.recordInteraction(imageUrl, 'select')
  }

  /**
   * Load image progressively with blur-up effect
   */
  async loadImageProgressive(imageName, size = null, onProgress = null) {
    const optimalSize = size || this.getOptimalSize()
    const fullImagePath = `${IMAGE_SIZES[optimalSize].path}${imageName}`
    const thumbnailPath = `${IMAGE_SIZES.small.path}${imageName}`

    return this.progressiveLoader.loadProgressive(
      fullImagePath,
      thumbnailPath,
      onProgress
    )
  }

  /**
   * Process image with WebAssembly
   */
  async processImage(imageData, operation, params = {}) {
    switch (operation) {
      case 'resize':
        return this.wasmProcessor.resize(imageData, params.width, params.height)
      case 'blur':
        return this.wasmProcessor.blur(imageData, params.radius)
      case 'sharpen':
        return this.wasmProcessor.sharpen(imageData, params.amount)
      case 'grayscale':
        return this.wasmProcessor.grayscale(imageData)
      case 'brightness':
        return this.wasmProcessor.adjustBrightness(imageData, params.amount)
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }

  /**
   * Get processor info
   */
  getProcessorInfo() {
    return this.wasmProcessor.getInfo()
  }

  /**
   * Get memory stats
   */
  getMemoryStats() {
    return this.memoryOptimizer.getStats()
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return this.monitor.getMetrics()
  }

  /**
   * Clear cache and cleanup memory
   */
  clearCache() {
    this.cache.clear()
    this.memoryOptimizer.forceCleanup()
  }

  /**
   * Cleanup all resources
   */
  cleanup() {
    this.clearCache()
    this.progressiveLoader.cleanup()
    this.memoryOptimizer.cleanup()
  }
}

// Singleton instance
export const imageLoader = new ImageLoader()

// Global console helper for debugging
if (typeof window !== 'undefined') {
  window.wallpaperOptimizer = {
    getMetrics: () => {
      const metrics = imageLoader.getMetrics()
      console.group('%c📊 Wallpaper Performance Metrics', 'color: #EC4899; font-weight: bold; font-size: 16px')
      console.log(`%cTotal Loads: %c${metrics.totalLoads}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
      console.log(`%cAverage Load Time: %c${metrics.averageLoadTime}ms`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
      console.log(`%cCache Hit Rate: %c${metrics.cacheHitRate}%`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
      console.log(`%cNetwork Quality: %c${imageLoader.networkDetector.getQuality()}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
      console.log(`%cCache Size: %c${imageLoader.cache.size()}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
      console.log(`%cRecommended Size: %c${imageLoader.getOptimalSize()}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
      
      if (metrics.recentLoads && metrics.recentLoads.length > 0) {
        console.log('\n%cRecent Loads:', 'color: #8B5CF6; font-weight: bold')
        console.table(metrics.recentLoads.slice(-10).map(load => ({
          Image: load.imageName,
          Size: load.size,
          'Load Time': `${load.loadTime}ms`,
          Cached: load.fromCache ? '✓' : '✗',
          Time: new Date(load.timestamp).toLocaleTimeString()
        })))
      }
      
      console.groupEnd()
      return metrics
    },
    
    clearCache: () => {
      imageLoader.clearCache()
      console.log('%c✓ Memory cache cleared', 'color: #10B981; font-weight: bold')
    },

    getProcessorInfo: () => {
      const info = imageLoader.getProcessorInfo()
      console.group('%c⚡ Image Processor Info', 'color: #8B5CF6; font-weight: bold; font-size: 16px')
      console.log(`%cBackend: %c${info.backend}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
      console.log(`%cWASM Supported: %c${info.wasmSupported ? '✓' : '✗'}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
      console.log(`%cInitialized: %c${info.initialized ? '✓' : '✗'}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
      console.groupEnd()
      return info
    },

    getMemoryStats: () => {
      return imageLoader.getMemoryStats()
    },
    
    help: () => {
      console.group('%c🎨 Wallpaper Optimizer - Console Commands', 'color: #8B5CF6; font-weight: bold; font-size: 16px')
      console.log('%cwallpaperOptimizer.getMetrics()', 'color: #3B82F6', '- Show performance metrics')
      console.log('%cwallpaperOptimizer.getProcessorInfo()', 'color: #3B82F6', '- Show processor info')
      console.log('%cwallpaperOptimizer.getMemoryStats()', 'color: #3B82F6', '- Show memory statistics')
      console.log('%cwallpaperOptimizer.memory.getStats()', 'color: #3B82F6', '- Detailed memory stats')
      console.log('%cwallpaperOptimizer.memory.forceCleanup()', 'color: #3B82F6', '- Force memory cleanup')
      console.log('%cwallpaperOptimizer.clearCache()', 'color: #3B82F6', '- Clear memory cache')
      console.log('%cwallpaperOptimizer.help()', 'color: #3B82F6', '- Show this help')
      console.groupEnd()
    }
  }
  
  // Show help on load
  console.log(
    '%c💡 Tip: Type %cwallpaperOptimizer.help()%c in console for optimization commands',
    'color: #94A3B8',
    'color: #3B82F6; font-weight: bold',
    'color: #94A3B8'
  )
}
