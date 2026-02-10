/**
 * 响应式图片加载器
 * 根据设备屏幕尺寸和网络状况加载合适的图片
 */

export class ResponsiveImageLoader {
  constructor() {
    this.deviceType = this.detectDeviceType()
    this.screenWidth = window.innerWidth
    this.dpr = window.devicePixelRatio || 1
    this.networkQuality = this.detectNetworkQuality()
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this))
  }

  /**
   * 检测设备类型
   */
  detectDeviceType() {
    const width = window.innerWidth
    
    if (width <= 480) return 'mobile-small'
    if (width <= 768) return 'mobile'
    if (width <= 1024) return 'tablet'
    if (width <= 1440) return 'desktop'
    if (width <= 2560) return 'desktop-large'
    return 'desktop-ultra'
  }

  /**
   * 检测网络质量
   */
  detectNetworkQuality() {
    if (!navigator.connection) return 'unknown'
    
    const { effectiveType, downlink, saveData } = navigator.connection
    
    if (saveData) return 'save-data'
    if (effectiveType === '4g' && downlink > 10) return 'excellent'
    if (effectiveType === '4g' && downlink > 5) return 'good'
    if (effectiveType === '3g' || downlink > 1) return 'fair'
    return 'poor'
  }

  /**
   * 获取推荐的图片尺寸
   */
  getRecommendedSize() {
    const { deviceType, networkQuality } = this
    
    // 省流模式或网络差时使用小图
    if (networkQuality === 'save-data' || networkQuality === 'poor') {
      return 'small'
    }
    
    // 根据设备类型和网络质量决定
    const sizeMap = {
      'mobile-small': {
        'excellent': 'medium',
        'good': 'small',
        'fair': 'small',
        'poor': 'thumbnail',
        'unknown': 'small'
      },
      'mobile': {
        'excellent': 'medium',
        'good': 'medium',
        'fair': 'small',
        'poor': 'small',
        'unknown': 'small'
      },
      'tablet': {
        'excellent': 'large',
        'good': 'medium',
        'fair': 'medium',
        'poor': 'small',
        'unknown': 'medium'
      },
      'desktop': {
        'excellent': 'large',
        'good': 'large',
        'fair': 'medium',
        'poor': 'medium',
        'unknown': 'large'
      },
      'desktop-large': {
        'excellent': 'xlarge',
        'good': 'large',
        'fair': 'large',
        'poor': 'medium',
        'unknown': 'large'
      },
      'desktop-ultra': {
        'excellent': 'xlarge',
        'good': 'xlarge',
        'fair': 'large',
        'poor': 'large',
        'unknown': 'xlarge'
      }
    }
    
    return sizeMap[deviceType]?.[networkQuality] || 'medium'
  }

  /**
   * 获取图片URL（根据尺寸）
   */
  getImageUrl(basePath, size = null) {
    const recommendedSize = size || this.getRecommendedSize()
    
    // 尺寸映射
    const sizeMap = {
      'thumbnail': '/thumbnails/',
      'small': '/images/small/',
      'medium': '/images/medium/',
      'large': '/images/large/',
      'xlarge': '/images/xlarge/'
    }
    
    const folder = sizeMap[recommendedSize] || '/images/medium/'
    const filename = basePath.split('/').pop()
    
    return `${folder}${filename}`
  }

  /**
   * 获取srcset属性值
   */
  getSrcSet(basePath) {
    const filename = basePath.split('/').pop()
    
    return [
      `/thumbnails/${filename} 200w`,
      `/images/small/${filename} 640w`,
      `/images/medium/${filename} 1024w`,
      `/images/large/${filename} 1920w`,
      `/images/xlarge/${filename} 2560w`
    ].join(', ')
  }

  /**
   * 获取sizes属性值
   */
  getSizes() {
    return [
      '(max-width: 480px) 100vw',
      '(max-width: 768px) 100vw',
      '(max-width: 1024px) 50vw',
      '(max-width: 1440px) 33vw',
      '25vw'
    ].join(', ')
  }

  /**
   * 处理窗口大小变化
   */
  handleResize() {
    const newDeviceType = this.detectDeviceType()
    if (newDeviceType !== this.deviceType) {
      this.deviceType = newDeviceType
      this.screenWidth = window.innerWidth
      
      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('deviceTypeChanged', {
        detail: { deviceType: newDeviceType }
      }))
    }
  }

  /**
   * 预加载图片
   */
  preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    return {
      deviceType: this.deviceType,
      screenWidth: this.screenWidth,
      dpr: this.dpr,
      networkQuality: this.networkQuality,
      recommendedSize: this.getRecommendedSize()
    }
  }
}

// 创建单例
export const responsiveImageLoader = new ResponsiveImageLoader()

// 监听网络变化
if (navigator.connection) {
  navigator.connection.addEventListener('change', () => {
    responsiveImageLoader.networkQuality = responsiveImageLoader.detectNetworkQuality()
    console.log('[ResponsiveImageLoader] Network quality changed:', responsiveImageLoader.networkQuality)
  })
}
