/**
 * 第2周优化测试脚本
 * 验证Service Worker、移动端优化、性能监控等功能
 */

console.log('🧪 开始测试第2周优化...\n')

// 测试1: Service Worker
console.log('📦 测试1: Service Worker')
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    if (registrations.length > 0) {
      console.log('✅ Service Worker已注册:', registrations.length, '个')
      
      // 测试缓存统计
      if (navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel()
        
        messageChannel.port1.onmessage = (event) => {
          const stats = event.data
          console.log('📊 缓存统计:')
          console.log('  - 图片缓存:', stats.imageItems || 0, '项')
          console.log('  - 静态缓存:', stats.staticItems || 0, '项')
          console.log('  - 总缓存:', stats.totalItems || 0, '/', stats.maxSize || 0)
          console.log('  - 设备内存:', stats.deviceMemory || 'unknown', 'GB')
        }
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_CACHE_STATS' },
          [messageChannel.port2]
        )
      } else {
        console.log('⚠️  Service Worker未激活')
      }
    } else {
      console.log('❌ Service Worker未注册')
    }
  })
} else {
  console.log('❌ 浏览器不支持Service Worker')
}

// 测试2: 响应式图片加载器
console.log('\n📱 测试2: 响应式图片加载器')
try {
  // 动态导入（如果在浏览器环境）
  if (typeof window !== 'undefined') {
    import('../src/utils/responsiveImageLoader.js').then(module => {
      const { responsiveImageLoader } = module
      const deviceInfo = responsiveImageLoader.getDeviceInfo()
      
      console.log('✅ 响应式图片加载器已加载')
      console.log('📊 设备信息:')
      console.log('  - 设备类型:', deviceInfo.deviceType)
      console.log('  - 屏幕宽度:', deviceInfo.screenWidth, 'px')
      console.log('  - 设备像素比:', deviceInfo.dpr)
      console.log('  - 网络质量:', deviceInfo.networkQuality)
      console.log('  - 推荐尺寸:', deviceInfo.recommendedSize)
      
      // 测试图片URL生成
      const testUrl = responsiveImageLoader.getImageUrl('/youno.webp')
      console.log('  - 测试URL:', testUrl)
    }).catch(err => {
      console.log('❌ 加载失败:', err.message)
    })
  }
} catch (error) {
  console.log('❌ 测试失败:', error.message)
}

// 测试3: 触摸优化器
console.log('\n👆 测试3: 触摸优化器')
try {
  if (typeof window !== 'undefined') {
    import('../src/utils/touchOptimizer.js').then(module => {
      const { touchOptimizer } = module
      const info = touchOptimizer.getOptimizationInfo()
      
      console.log('✅ 触摸优化器已加载')
      console.log('📊 优化信息:')
      console.log('  - 是否移动设备:', info.isMobile)
      console.log('  - Passive支持:', info.passiveSupported)
      console.log('  - 设备像素比:', info.devicePixelRatio)
      console.log('  - 屏幕尺寸:', info.screenWidth, 'x', info.screenHeight)
    }).catch(err => {
      console.log('❌ 加载失败:', err.message)
    })
  }
} catch (error) {
  console.log('❌ 测试失败:', error.message)
}

// 测试4: 性能指标
console.log('\n📊 测试4: 性能指标')
if (typeof window !== 'undefined' && window.performance) {
  // FCP
  const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
  if (fcpEntry) {
    const fcp = fcpEntry.startTime
    const fcpStatus = fcp < 1800 ? '✅' : '⚠️'
    console.log(`${fcpStatus} FCP: ${fcp.toFixed(0)}ms (目标: <1800ms)`)
  } else {
    console.log('⏳ FCP: 等待测量...')
  }
  
  // 内存
  if (performance.memory) {
    const memoryMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
    const limitMB = (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
    const percentage = ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1)
    const memoryStatus = percentage < 50 ? '✅' : percentage < 80 ? '⚠️' : '❌'
    console.log(`${memoryStatus} 内存: ${memoryMB}MB / ${limitMB}MB (${percentage}%)`)
  }
  
  // DOM节点
  const domNodes = document.getElementsByTagName('*').length
  const domStatus = domNodes < 1000 ? '✅' : domNodes < 1500 ? '⚠️' : '❌'
  console.log(`${domStatus} DOM节点: ${domNodes}`)
  
  // 网络信息
  if (navigator.connection) {
    const conn = navigator.connection
    console.log('📡 网络信息:')
    console.log('  - 类型:', conn.effectiveType || 'unknown')
    console.log('  - 下行速度:', conn.downlink || 0, 'Mbps')
    console.log('  - RTT:', conn.rtt || 0, 'ms')
    console.log('  - 省流模式:', conn.saveData ? '是' : '否')
  }
  
  // 设备信息
  console.log('💻 设备信息:')
  console.log('  - 设备内存:', navigator.deviceMemory || 'unknown', 'GB')
  console.log('  - CPU核心:', navigator.hardwareConcurrency || 'unknown')
  console.log('  - 设备像素比:', window.devicePixelRatio || 1)
} else {
  console.log('❌ Performance API不可用')
}

// 测试5: CSS优化验证
console.log('\n🎨 测试5: CSS优化验证')
if (typeof window !== 'undefined') {
  // 检查backdrop-filter使用情况
  const elementsWithBackdrop = document.querySelectorAll('[style*="backdrop-filter"]')
  console.log('📊 backdrop-filter使用:')
  console.log('  - 内联样式:', elementsWithBackdrop.length, '个元素')
  
  // 检查透明度
  const elementsWithOpacity = document.querySelectorAll('[style*="rgba(30, 42, 58"]')
  console.log('  - 统一透明度:', elementsWithOpacity.length, '个元素')
  
  // 检查动画
  const animatedElements = document.querySelectorAll('[style*="animation"], [style*="transition"]')
  console.log('  - 动画元素:', animatedElements.length, '个')
}

// 测试6: 移动端优化验证
console.log('\n📱 测试6: 移动端优化验证')
if (typeof window !== 'undefined') {
  const isMobile = window.innerWidth <= 768
  console.log('📊 移动端检测:')
  console.log('  - 是否移动端:', isMobile)
  console.log('  - 屏幕宽度:', window.innerWidth, 'px')
  
  if (isMobile) {
    // 检查触摸优化样式
    const touchStyles = document.querySelector('style[data-touch-optimizer]')
    console.log('  - 触摸优化样式:', touchStyles ? '✅ 已应用' : '⚠️ 未应用')
    
    // 检查滚动优化
    const scrollableElements = document.querySelectorAll('.scrollable, .scroll-container')
    console.log('  - 滚动优化元素:', scrollableElements.length, '个')
  }
}

// 测试总结
console.log('\n' + '='.repeat(50))
console.log('🎉 测试完成！')
console.log('='.repeat(50))
console.log('\n💡 提示:')
console.log('1. 在浏览器控制台运行此脚本以查看完整结果')
console.log('2. 使用Chrome DevTools的Performance Monitor监控GPU使用率')
console.log('3. 使用Lighthouse生成完整的性能报告')
console.log('4. 在移动设备或设备模拟器上测试移动端优化')
console.log('\n📚 相关文档:')
console.log('- 第2周中优先级优化完成报告.md')
console.log('- 第2周优化快速参考.md')
console.log('- GPU优化实施报告-统一透明度0.6.md')

// 导出测试函数供浏览器使用
if (typeof window !== 'undefined') {
  window.testOptimizations = () => {
    console.log('🔄 重新运行测试...\n')
    location.reload()
  }
  
  console.log('\n💡 在控制台输入 testOptimizations() 可重新运行测试')
}
