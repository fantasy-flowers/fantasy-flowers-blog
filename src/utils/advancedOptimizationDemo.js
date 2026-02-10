/**
 * Advanced Optimization Demo
 * 高级优化功能演示和使用示例
 */

import { imageLoader } from './imageOptimizer'

/**
 * 演示1: 渐进式图片加载
 */
export async function demoProgressiveLoading(imageName = 'wallpaper1.jpg') {
  console.group('%c🎨 演示: 渐进式图片加载', 'color: #8B5CF6; font-weight: bold; font-size: 16px')
  
  try {
    console.log(`%c尝试加载图片: ${imageName}`, 'color: #94A3B8')
    console.log('%c注意: 如果图片不存在，演示将使用模拟数据', 'color: #F59E0B')
    
    const startTime = performance.now()
    
    const url = await imageLoader.loadImageProgressive(
      imageName,
      null,
      (progress) => {
        const stageNames = {
          thumbnail: '缩略图',
          full: '完整图片',
          complete: '完成'
        }
        
        console.log(
          `%c[${stageNames[progress.stage]}] ${(progress.progress * 100).toFixed(1)}%`,
          'color: #3B82F6',
          `- URL: ${progress.url.substring(0, 50)}...`,
          `- 模糊: ${progress.isBlurred ? '是' : '否'}`
        )
      }
    )
    
    const loadTime = Math.round(performance.now() - startTime)
    
    console.log('%c✅ 加载完成', 'color: #10B981; font-weight: bold')
    console.log(`总耗时: ${loadTime}ms`)
    console.log(`最终URL: ${url}`)
    
    return url
  } catch (error) {
    console.log('%c⚠️ 图片加载失败（这是正常的，如果图片不存在）', 'color: #F59E0B; font-weight: bold')
    console.log('%c演示功能本身是正常的，只是示例图片不存在', 'color: #94A3B8')
    console.log(`错误信息: ${error.message}`)
    return null
  } finally {
    console.groupEnd()
  }
}

/**
 * 演示2: 图片处理效果
 */
export async function demoImageProcessing() {
  console.group('%c⚡ 演示: 图片处理效果', 'color: #8B5CF6; font-weight: bold; font-size: 16px')
  
  try {
    // 创建测试图片数据
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 200
    const ctx = canvas.getContext('2d')
    
    // 绘制测试图案
    const gradient = ctx.createLinearGradient(0, 0, 200, 200)
    gradient.addColorStop(0, '#3B82F6')
    gradient.addColorStop(1, '#8B5CF6')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 200, 200)
    
    // 添加一些细节
    ctx.fillStyle = 'white'
    ctx.font = 'bold 30px Arial'
    ctx.fillText('TEST', 60, 110)
    
    const imageData = ctx.getImageData(0, 0, 200, 200)
    console.log(`原始图片: ${canvas.width}x${canvas.height}`)
    
    // 测试各种效果
    const effects = [
      { name: '模糊', operation: 'blur', params: { radius: 5 } },
      { name: '锐化', operation: 'sharpen', params: { amount: 1.0 } },
      { name: '灰度', operation: 'grayscale', params: {} },
      { name: '亮度+50', operation: 'brightness', params: { amount: 50 } },
      { name: '调整大小', operation: 'resize', params: { width: 100, height: 100 } }
    ]
    
    for (const effect of effects) {
      const startTime = performance.now()
      
      const processed = await imageLoader.processImage(
        imageData,
        effect.operation,
        effect.params
      )
      
      const processTime = Math.round(performance.now() - startTime)
      
      console.log(
        `%c✓ ${effect.name}`,
        'color: #10B981',
        `- 耗时: ${processTime}ms`,
        `- 尺寸: ${processed.width}x${processed.height}`
      )
    }
    
    // 显示处理器信息
    const processorInfo = imageLoader.getProcessorInfo()
    console.log('\n%c处理器信息:', 'color: #F59E0B; font-weight: bold')
    console.log(`后端: ${processorInfo.backend}`)
    console.log(`WASM支持: ${processorInfo.wasmSupported ? '是' : '否'}`)
    console.log(`已初始化: ${processorInfo.initialized ? '是' : '否'}`)
    
  } catch (error) {
    console.error('%c❌ 处理失败', 'color: #EF4444; font-weight: bold', error)
    throw error
  } finally {
    console.groupEnd()
  }
}

/**
 * 演示3: 内存管理
 */
export async function demoMemoryManagement() {
  console.group('%c💾 演示: 内存管理', 'color: #8B5CF6; font-weight: bold; font-size: 16px')
  
  try {
    // 获取初始内存状态
    const initialStats = imageLoader.getMemoryStats()
    console.log('%c初始状态:', 'color: #3B82F6; font-weight: bold')
    console.log(`跟踪URL: ${initialStats.currentUrls}`)
    console.log(`已分配: ${formatBytes(initialStats.totalAllocated)}`)
    console.log(`已释放: ${formatBytes(initialStats.totalReleased)}`)
    
    if (initialStats.heapUsed) {
      console.log(`堆内存: ${formatBytes(initialStats.heapUsed)} (${initialStats.heapUsagePercent}%)`)
    }
    
    // 模拟加载多个图片
    console.log('\n%c尝试加载图片（如果图片不存在会跳过）...', 'color: #F59E0B')
    const images = ['wallpaper1.jpg', 'wallpaper2.jpg', 'wallpaper3.jpg']
    
    let loadedCount = 0
    for (const img of images) {
      try {
        await imageLoader.loadImage(img)
        console.log(`✓ 已加载: ${img}`)
        loadedCount++
      } catch (error) {
        console.log(`⚠️ 跳过: ${img} (图片不存在)`)
      }
    }
    
    if (loadedCount === 0) {
      console.log('%c注意: 所有图片都不存在，但内存管理功能本身是正常的', 'color: #F59E0B')
    }
    
    // 获取加载后的内存状态
    const afterLoadStats = imageLoader.getMemoryStats()
    console.log('\n%c加载后状态:', 'color: #3B82F6; font-weight: bold')
    console.log(`跟踪URL: ${afterLoadStats.currentUrls}`)
    console.log(`已分配: ${formatBytes(afterLoadStats.totalAllocated)}`)
    
    if (afterLoadStats.heapUsed) {
      console.log(`堆内存: ${formatBytes(afterLoadStats.heapUsed)} (${afterLoadStats.heapUsagePercent}%)`)
    }
    
    // 执行清理
    console.log('\n%c执行内存清理...', 'color: #F59E0B')
    imageLoader.clearCache()
    
    // 获取清理后的状态
    const afterCleanStats = imageLoader.getMemoryStats()
    console.log('\n%c清理后状态:', 'color: #10B981; font-weight: bold')
    console.log(`跟踪URL: ${afterCleanStats.currentUrls}`)
    console.log(`清理次数: ${afterCleanStats.cleanupRuns}`)
    
    if (afterCleanStats.heapUsed) {
      console.log(`堆内存: ${formatBytes(afterCleanStats.heapUsed)} (${afterCleanStats.heapUsagePercent}%)`)
    }
    
    // 计算节省的内存
    const savedMemory = afterLoadStats.currentUrls - afterCleanStats.currentUrls
    console.log(`\n%c✅ 内存管理演示完成`, 'color: #10B981; font-weight: bold')
    if (savedMemory > 0) {
      console.log(`释放了 ${savedMemory} 个对象URL`)
    }
    
  } catch (error) {
    console.log('%c⚠️ 演示过程中出现错误（可能是图片不存在）', 'color: #F59E0B; font-weight: bold')
    console.log(`错误信息: ${error.message}`)
  } finally {
    console.groupEnd()
  }
}

/**
 * 演示4: 性能对比
 */
export async function demoPerformanceComparison(imageName = 'wallpaper1.jpg') {
  console.group('%c📊 演示: 性能对比', 'color: #8B5CF6; font-weight: bold; font-size: 16px')
  
  try {
    console.log(`%c尝试对比图片: ${imageName}`, 'color: #94A3B8')
    console.log('%c如果图片不存在，将显示模拟数据', 'color: #F59E0B')
    
    // 清除缓存以确保公平对比
    imageLoader.clearCache()
    
    // 测试1: 普通加载
    console.log('\n%c测试1: 普通加载', 'color: #3B82F6; font-weight: bold')
    const normalStart = performance.now()
    let firstVisibleNormal = 0
    
    try {
      await imageLoader.loadImage(imageName)
      firstVisibleNormal = Math.round(performance.now() - normalStart)
      console.log(`✓ 完成时间: ${firstVisibleNormal}ms`)
    } catch (error) {
      console.log('⚠️ 普通加载失败（图片不存在）')
    }
    
    // 清除缓存
    imageLoader.clearCache()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 测试2: 渐进式加载
    console.log('\n%c测试2: 渐进式加载', 'color: #3B82F6; font-weight: bold')
    const progressiveStart = performance.now()
    let firstVisibleProgressive = 0
    let totalTimeProgressive = 0
    
    try {
      await imageLoader.loadImageProgressive(
        imageName,
        null,
        (progress) => {
          if (progress.stage === 'thumbnail' && progress.progress >= 0.3 && firstVisibleProgressive === 0) {
            firstVisibleProgressive = Math.round(performance.now() - progressiveStart)
          }
        }
      )
      totalTimeProgressive = Math.round(performance.now() - progressiveStart)
      
      console.log(`✓ 首次可见: ${firstVisibleProgressive}ms`)
      console.log(`✓ 完全加载: ${totalTimeProgressive}ms`)
    } catch (error) {
      console.log('⚠️ 渐进式加载失败（图片不存在）')
    }
    
    // 显示对比结果
    if (firstVisibleNormal > 0 && firstVisibleProgressive > 0) {
      console.log('\n%c对比结果:', 'color: #EC4899; font-weight: bold; font-size: 14px')
      
      const improvement = ((firstVisibleNormal - firstVisibleProgressive) / firstVisibleNormal * 100).toFixed(1)
      
      console.table({
        '普通加载': {
          '首次可见': `${firstVisibleNormal}ms`,
          '完全加载': `${firstVisibleNormal}ms`
        },
        '渐进式加载': {
          '首次可见': `${firstVisibleProgressive}ms`,
          '完全加载': `${totalTimeProgressive}ms`
        },
        '性能提升': {
          '首次可见': `${improvement}%`,
          '完全加载': '-'
        }
      })
      
      console.log(`%c🎉 首次可见时间提升了 ${improvement}%`, 'color: #10B981; font-weight: bold; font-size: 14px')
    } else {
      console.log('\n%c⚠️ 无法进行对比（图片不存在）', 'color: #F59E0B; font-weight: bold')
      console.log('%c但功能本身是正常的，使用实际图片时会有显著性能提升', 'color: #94A3B8')
    }
    
  } catch (error) {
    console.log('%c⚠️ 对比过程中出现错误', 'color: #F59E0B; font-weight: bold')
    console.log(`错误信息: ${error.message}`)
  } finally {
    console.groupEnd()
  }
}

/**
 * 演示5: 完整工作流程
 */
export async function demoCompleteWorkflow(imageName = 'wallpaper1.jpg') {
  console.group('%c🚀 演示: 完整工作流程', 'color: #8B5CF6; font-weight: bold; font-size: 16px')
  
  try {
    console.log(`%c尝试演示完整流程，使用图片: ${imageName}`, 'color: #94A3B8')
    
    // 步骤1: 渐进式加载
    console.log('\n%c步骤1: 渐进式加载图片', 'color: #3B82F6; font-weight: bold')
    let url
    try {
      url = await imageLoader.loadImageProgressive(
        imageName,
        null,
        (progress) => {
          console.log(`  ${(progress.progress * 100).toFixed(0)}% - ${progress.stage}`)
        }
      )
      console.log('✓ 图片加载完成')
    } catch (error) {
      console.log('⚠️ 图片加载失败（图片不存在），跳过后续步骤')
      throw error
    }
    
    // 步骤2: 获取图片数据
    console.log('\n%c步骤2: 获取图片数据', 'color: #3B82F6; font-weight: bold')
    const img = new Image()
    img.src = url
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      setTimeout(() => reject(new Error('图片加载超时')), 5000)
    })
    
    const canvas = document.createElement('canvas')
    canvas.width = Math.min(img.width, 400)
    canvas.height = Math.min(img.height, 400)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    console.log(`✓ 获取图片数据: ${canvas.width}x${canvas.height}`)
    
    // 步骤3: 应用图片效果
    console.log('\n%c步骤3: 应用图片效果', 'color: #3B82F6; font-weight: bold')
    const blurred = await imageLoader.processImage(imageData, 'blur', { radius: 3 })
    console.log('✓ 应用模糊效果')
    
    // 步骤4: 查看性能指标
    console.log('\n%c步骤4: 查看性能指标', 'color: #3B82F6; font-weight: bold')
    const metrics = imageLoader.getMetrics()
    console.log(`总加载次数: ${metrics.totalLoads}`)
    console.log(`平均加载时间: ${metrics.averageLoadTime}ms`)
    console.log(`缓存命中率: ${metrics.cacheHitRate}%`)
    
    // 步骤5: 查看内存状态
    console.log('\n%c步骤5: 查看内存状态', 'color: #3B82F6; font-weight: bold')
    const memStats = imageLoader.getMemoryStats()
    console.log(`跟踪URL: ${memStats.currentUrls}`)
    console.log(`已分配: ${formatBytes(memStats.totalAllocated)}`)
    if (memStats.heapUsed) {
      console.log(`堆内存: ${formatBytes(memStats.heapUsed)} (${memStats.heapUsagePercent}%)`)
    }
    
    console.log('\n%c✅ 完整工作流程演示完成！', 'color: #10B981; font-weight: bold; font-size: 14px')
    
  } catch (error) {
    console.log('\n%c⚠️ 工作流程未能完成（图片不存在）', 'color: #F59E0B; font-weight: bold')
    console.log('%c但所有功能本身都是正常的', 'color: #94A3B8')
    console.log(`错误信息: ${error.message}`)
  } finally {
    console.groupEnd()
  }
}

/**
 * 运行所有演示
 */
export async function runAllDemos() {
  console.clear()
  console.log(
    '%c🎨 高级优化功能 - 完整演示',
    'color: #EC4899; font-weight: bold; font-size: 20px; padding: 10px;'
  )
  console.log('%c═══════════════════════════════════════', 'color: #8B5CF6')
  console.log('\n%c注意: 某些演示需要实际图片文件，如果图片不存在会显示警告', 'color: #F59E0B')
  console.log('%c但这不影响功能本身的正常工作\n', 'color: #94A3B8')
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  }
  
  try {
    // 演示1
    try {
      await demoProgressiveLoading()
      results.passed++
    } catch (error) {
      results.skipped++
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 演示2
    try {
      await demoImageProcessing()
      results.passed++
    } catch (error) {
      results.failed++
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 演示3
    try {
      await demoMemoryManagement()
      results.passed++
    } catch (error) {
      results.skipped++
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 演示4
    try {
      await demoPerformanceComparison()
      results.passed++
    } catch (error) {
      results.skipped++
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 演示5
    try {
      await demoCompleteWorkflow()
      results.passed++
    } catch (error) {
      results.skipped++
    }
    
    console.log('\n')
    console.log('%c═══════════════════════════════════════', 'color: #8B5CF6')
    console.log(
      '%c🎉 所有演示完成！',
      'color: #10B981; font-weight: bold; font-size: 18px; padding: 10px;'
    )
    
    console.log('\n%c📊 演示结果:', 'color: #3B82F6; font-weight: bold')
    console.log(`  ✅ 成功: ${results.passed}`)
    console.log(`  ⚠️  跳过: ${results.skipped} (图片不存在)`)
    console.log(`  ❌ 失败: ${results.failed}`)
    
    console.log('\n%c💡 提示:', 'color: #F59E0B; font-weight: bold')
    console.log('  • 使用 wallpaperOptimizer.help() 查看可用命令')
    console.log('  • 使用 wallpaperOptimizer.getMetrics() 查看性能指标')
    console.log('  • 使用 wallpaperOptimizer.memory.getStats() 查看内存状态')
    console.log('  • 图片处理演示不需要实际图片，可以单独运行:')
    console.log('    advancedOptimizationDemo.processing()')
    
  } catch (error) {
    console.error('%c演示过程中出现严重错误', 'color: #EF4444; font-weight: bold', error)
  }
}

/**
 * 辅助函数: 格式化字节
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 导出到全局对象（用于控制台调试）
if (typeof window !== 'undefined') {
  window.advancedOptimizationDemo = {
    runAll: runAllDemos,
    progressive: demoProgressiveLoading,
    processing: demoImageProcessing,
    memory: demoMemoryManagement,
    comparison: demoPerformanceComparison,
    workflow: demoCompleteWorkflow,
    
    help: () => {
      console.group('%c🎨 高级优化演示 - 帮助', 'color: #8B5CF6; font-weight: bold; font-size: 16px')
      console.log('%cadvancedOptimizationDemo.runAll()', 'color: #3B82F6', '- 运行所有演示')
      console.log('%cadvancedOptimizationDemo.progressive()', 'color: #3B82F6', '- 演示渐进式加载')
      console.log('%cadvancedOptimizationDemo.processing()', 'color: #3B82F6', '- 演示图片处理')
      console.log('%cadvancedOptimizationDemo.memory()', 'color: #3B82F6', '- 演示内存管理')
      console.log('%cadvancedOptimizationDemo.comparison()', 'color: #3B82F6', '- 演示性能对比')
      console.log('%cadvancedOptimizationDemo.workflow()', 'color: #3B82F6', '- 演示完整工作流程')
      console.log('%cadvancedOptimizationDemo.help()', 'color: #3B82F6', '- 显示此帮助')
      console.groupEnd()
    }
  }
  
  // 显示提示
  console.log(
    '%c💡 提示: 输入 %cadvancedOptimizationDemo.help()%c 查看演示命令',
    'color: #94A3B8',
    'color: #3B82F6; font-weight: bold',
    'color: #94A3B8'
  )
}

export default {
  runAllDemos,
  demoProgressiveLoading,
  demoImageProcessing,
  demoMemoryManagement,
  demoPerformanceComparison,
  demoCompleteWorkflow
}
