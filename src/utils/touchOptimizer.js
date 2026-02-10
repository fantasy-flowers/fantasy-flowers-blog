/**
 * 移动端触摸优化工具
 * 优化触摸事件性能，减少延迟和卡顿
 */

export class TouchOptimizer {
  constructor() {
    this.isMobile = this.detectMobile()
    this.passiveSupported = this.detectPassiveSupport()
    this.touchStartTime = 0
    this.touchMoveDistance = 0

    if (this.isMobile) {
      this.init()
    }
  }

  /**
   * 检测是否为移动设备
   */
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || window.innerWidth <= 768
  }

  /**
   * 检测是否支持 passive 事件监听
   */
  detectPassiveSupport() {
    let passiveSupported = false

    try {
      const options = {
        get passive() {
          passiveSupported = true
          return false
        }
      }

      window.addEventListener('test', null, options)
      window.removeEventListener('test', null, options)
    } catch (err) {
      passiveSupported = false
    }

    return passiveSupported
  }

  /**
   * 初始化触摸优化
   */
  init() {
    // 禁用双击缩放
    this.disableDoubleTapZoom()

    // 优化滚动性能
    this.optimizeScrolling()

    // 添加触摸反馈
    this.addTouchFeedback()

    console.log('[TouchOptimizer] Mobile touch optimization enabled')
  }

  /**
   * 禁用双击缩放（保持单指缩放）
   */
  disableDoubleTapZoom() {
    let lastTouchEnd = 0

    document.addEventListener('touchend', (event) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }, false)
  }

  /**
   * 优化滚动性能
   */
  optimizeScrolling() {
    const options = this.passiveSupported ? { passive: true } : false

    // 为滚动容器添加 passive 监听
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), options)
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), options)
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), options)

    // 添加 CSS 优化
    this.addScrollOptimizationCSS()
  }

  /**
   * 处理触摸开始
   */
  handleTouchStart(event) {
    this.touchStartTime = Date.now()
    this.touchMoveDistance = 0

    const touch = event.touches[0]
    this.startX = touch.clientX
    this.startY = touch.clientY
  }

  /**
   * 处理触摸移动
   */
  handleTouchMove(event) {
    if (!this.startX || !this.startY) return

    const touch = event.touches[0]
    const deltaX = Math.abs(touch.clientX - this.startX)
    const deltaY = Math.abs(touch.clientY - this.startY)

    this.touchMoveDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }

  /**
   * 处理触摸结束
   */
  handleTouchEnd() {
    const touchDuration = Date.now() - this.touchStartTime

    // 判断是否为快速点击
    if (touchDuration < 200 && this.touchMoveDistance < 10) {
      // 这是一个点击事件，可以添加快速反馈
      this.triggerTapFeedback()
    }

    this.startX = null
    this.startY = null
  }

  /**
   * 添加触摸反馈
   */
  addTouchFeedback() {
    // 为可点击元素添加触摸反馈类
    const style = document.createElement('style')
    style.textContent = `
      .touch-feedback {
        -webkit-tap-highlight-color: rgba(59, 130, 246, 0.2);
      }
      
      .touch-feedback:active {
        opacity: 0.8;
        transform: scale(0.98);
        transition: all 0.1s ease;
      }
      
      /* 移除默认的触摸高亮 */
      * {
        -webkit-tap-highlight-color: transparent;
      }
      
      /* 为按钮和链接添加触摸反馈 */
      button, a, .clickable {
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 添加滚动优化CSS
   */
  addScrollOptimizationCSS() {
    const style = document.createElement('style')
    style.textContent = `
      /* iOS 平滑滚动 */
      .scrollable, .scroll-container {
        -webkit-overflow-scrolling: touch;
      }
      
      /* 优化触摸动作 */
      .touch-action-pan-y {
        touch-action: pan-y;
      }
      
      .touch-action-pan-x {
        touch-action: pan-x;
      }
      
      .touch-action-none {
        touch-action: none;
      }
      
      /* 防止文本选择 */
      .no-select {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      /* 移动端优化 */
      @media (max-width: 768px) {
        /* 移除 hover 效果 */
        .card-hover:hover {
          transform: none !important;
        }
        
        /* 优化字体渲染 */
        body {
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 触发点击反馈
   */
  triggerTapFeedback() {
    // 可以添加触觉反馈（如果支持）
    if (navigator.vibrate) {
      navigator.vibrate(10) // 轻微震动 10ms
    }
  }

  /**
   * 为元素添加触摸优化
   */
  optimizeElement(element, options = {}) {
    const {
      preventScroll = false,
      addFeedback = true,
      touchAction = 'auto'
    } = options

    if (preventScroll) {
      element.addEventListener('touchmove', (e) => {
        e.preventDefault()
      }, { passive: false })
    }

    if (addFeedback) {
      element.classList.add('touch-feedback')
    }

    if (touchAction !== 'auto') {
      element.style.touchAction = touchAction
    }
  }

  /**
   * 获取优化信息
   */
  getOptimizationInfo() {
    return {
      isMobile: this.isMobile,
      passiveSupported: this.passiveSupported,
      devicePixelRatio: window.devicePixelRatio,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    }
  }
}

// 创建单例
export const touchOptimizer = new TouchOptimizer()

// 导出工具函数
export const addPassiveListener = (element, event, handler) => {
  const options = touchOptimizer.passiveSupported ? { passive: true } : false
  element.addEventListener(event, handler, options)
}

export const addNonPassiveListener = (element, event, handler) => {
  element.addEventListener(event, handler, { passive: false })
}
