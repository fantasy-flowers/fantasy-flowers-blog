/**
 * Network Adaptive Image Loader
 * Adjusts image quality based on network conditions
 */

export class NetworkAdaptiveLoader {
  constructor() {
    this.connection = null
    this.quality = 'high'
    this.listeners = []
    this.init()
  }

  /**
   * Initialize network monitoring
   */
  init() {
    if ('connection' in navigator) {
      this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      
      if (this.connection) {
        this.updateQuality()
        
        // Listen for network changes
        this.connection.addEventListener('change', () => {
          this.updateQuality()
          this.notifyListeners()
        })
      }
    }
  }

  /**
   * Update quality based on network
   */
  updateQuality() {
    if (!this.connection) {
      this.quality = 'high'
      return
    }

    const { effectiveType, downlink, saveData } = this.connection

    // Honor data saver mode
    if (saveData) {
      this.quality = 'low'
      console.log('%c[Network Adaptive] Data saver mode detected', 'color: #F59E0B')
      return
    }

    // Determine quality based on connection
    if (effectiveType === '4g' && downlink > 5) {
      this.quality = 'high'
    } else if (effectiveType === '4g' || (effectiveType === '3g' && downlink > 2)) {
      this.quality = 'medium'
    } else if (effectiveType === '3g' || downlink > 0.5) {
      this.quality = 'low'
    } else {
      this.quality = 'very-low'
    }

    console.log(
      `%c[Network Adaptive] Quality: ${this.quality}`,
      'color: #3B82F6',
      `(${effectiveType}, ${downlink}Mbps)`
    )
  }

  /**
   * Get quality level (0-100)
   */
  getQualityLevel() {
    const qualityMap = {
      'very-low': 30,
      'low': 50,
      'medium': 70,
      'high': 85
    }
    return qualityMap[this.quality] || 80
  }

  /**
   * Get optimal image size based on network
   */
  getOptimalSize(screenWidth) {
    const baseSize = this.getBaseSizeForScreen(screenWidth)
    
    // Adjust based on network quality
    switch (this.quality) {
      case 'very-low':
        return this.downgradeSize(baseSize, 2)
      case 'low':
        return this.downgradeSize(baseSize, 1)
      case 'medium':
        return baseSize
      case 'high':
        return this.upgradeSize(baseSize)
      default:
        return baseSize
    }
  }

  /**
   * Get base size for screen width
   */
  getBaseSizeForScreen(screenWidth) {
    if (screenWidth >= 2560) return 'xlarge'
    if (screenWidth >= 1920) return 'large'
    if (screenWidth >= 1024) return 'medium'
    return 'small'
  }

  /**
   * Downgrade size
   */
  downgradeSize(size, levels = 1) {
    const sizes = ['small', 'medium', 'large', 'xlarge']
    const currentIndex = sizes.indexOf(size)
    const newIndex = Math.max(0, currentIndex - levels)
    return sizes[newIndex]
  }

  /**
   * Upgrade size
   */
  upgradeSize(size) {
    const sizes = ['small', 'medium', 'large', 'xlarge']
    const currentIndex = sizes.indexOf(size)
    const newIndex = Math.min(sizes.length - 1, currentIndex + 1)
    return sizes[newIndex]
  }

  /**
   * Should preload based on network
   */
  shouldPreload() {
    return this.quality === 'high' || this.quality === 'medium'
  }

  /**
   * Get max concurrent loads based on network
   */
  getMaxConcurrentLoads() {
    switch (this.quality) {
      case 'very-low': return 1
      case 'low': return 2
      case 'medium': return 3
      case 'high': return 4
      default: return 3
    }
  }

  /**
   * Add listener for network changes
   */
  addListener(callback) {
    this.listeners.push(callback)
  }

  /**
   * Remove listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback)
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.quality)
      } catch (error) {
        console.error('[Network Adaptive] Listener error:', error)
      }
    })
  }

  /**
   * Get network info
   */
  getNetworkInfo() {
    if (!this.connection) {
      return {
        quality: this.quality,
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0,
        saveData: false
      }
    }

    return {
      quality: this.quality,
      effectiveType: this.connection.effectiveType || 'unknown',
      downlink: this.connection.downlink || 0,
      rtt: this.connection.rtt || 0,
      saveData: this.connection.saveData || false
    }
  }
}

// Singleton instance
export const networkAdaptiveLoader = new NetworkAdaptiveLoader()
