/**
 * Wallpaper Optimizer Debugger
 * Console utilities for monitoring and debugging wallpaper loading
 */

import { imageLoader, smartPreloader, networkAdaptiveLoader, imageLoadQueue } from './imageOptimizer'
import { swManager } from './serviceWorkerManager'

export class WallpaperDebugger {
  /**
   * Show comprehensive performance metrics
   */
  static showMetrics() {
    const metrics = imageLoader.getMetrics()
    const networkInfo = networkAdaptiveLoader.getNetworkInfo()
    const queueStatus = imageLoadQueue.getStatus()
    const smartStats = smartPreloader.getStats()

    console.group('%c📊 Wallpaper Performance Dashboard', 'color: #EC4899; font-weight: bold; font-size: 16px')
    
    // Loading metrics
    console.group('%c⚡ Loading Performance', 'color: #3B82F6; font-weight: bold')
    console.log(`%cTotal Loads: %c${metrics.totalLoads}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
    console.log(`%cAverage Load Time: %c${metrics.averageLoadTime}ms`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
    console.log(`%cCache Hit Rate: %c${metrics.cacheHitRate}%`, 'color: #94A3B8', 'color: #10B981; font-weight: bold')
    console.groupEnd()

    // Network info
    console.group('%c🌐 Network Status', 'color: #8B5CF6; font-weight: bold')
    console.log(`%cQuality: %c${networkInfo.quality}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
    console.log(`%cConnection: %c${networkInfo.effectiveType}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
    console.log(`%cDownlink: %c${networkInfo.downlink}Mbps`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
    console.log(`%cRTT: %c${networkInfo.rtt}ms`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
    console.log(`%cData Saver: %c${networkInfo.saveData ? 'ON' : 'OFF'}`, 'color: #94A3B8', networkInfo.saveData ? 'color: #F59E0B; font-weight: bold' : 'color: #10B981')
    console.groupEnd()

    // Queue status
    console.group('%c📋 Load Queue', 'color: #F59E0B; font-weight: bold')
    console.log(`%cQueued: %c${queueStatus.queued}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
    console.log(`%cActive: %c${queueStatus.active}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
    console.log(`%cCompleted: %c${queueStatus.completed}`, 'color: #94A3B8', 'color: #10B981; font-weight: bold')
    console.groupEnd()

    // Smart preloader stats
    console.group('%c🔮 Smart Preloader', 'color: #EC4899; font-weight: bold')
    console.log(`%cTotal Interactions: %c${smartStats.totalInteractions}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
    console.log(`%cUnique Images: %c${smartStats.uniqueImages}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
    console.log('%cTop Predictions:', 'color: #94A3B8')
    smartStats.topPredictions.forEach((pred, i) => {
      console.log(`  ${i + 1}. ${pred.imageUrl} (score: ${pred.score})`)
    })
    console.groupEnd()

    // Recent loads
    if (metrics.recentLoads && metrics.recentLoads.length > 0) {
      console.group('%c📜 Recent Loads', 'color: #10B981; font-weight: bold')
      console.table(metrics.recentLoads.slice(-10).map(load => ({
        Image: load.imageName,
        Size: load.size,
        'Load Time': `${load.loadTime}ms`,
        Cached: load.fromCache ? '✓' : '✗',
        Time: new Date(load.timestamp).toLocaleTimeString()
      })))
      console.groupEnd()
    }

    console.groupEnd()
  }

  /**
   * Show cache statistics
   */
  static async showCacheStats() {
    const cacheSize = await swManager.getCacheSize()
    
    console.group('%c💾 Cache Statistics', 'color: #8B5CF6; font-weight: bold; font-size: 14px')
    console.log(`%cMemory Cache Size: %c${imageLoader.cache.size()}`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
    console.log(`%cService Worker Cache: %c${cacheSize} items`, 'color: #94A3B8', 'color: #F8FAFC; font-weight: bold')
    console.groupEnd()
  }

  /**
   * Clear all caches
   */
  static async clearAllCaches() {
    imageLoader.clearCache()
    await swManager.clearCache()
    console.log('%c✓ All caches cleared', 'color: #10B981; font-weight: bold')
  }

  /**
   * Test network adaptation
   */
  static testNetworkAdaptation() {
    const screenWidths = [375, 768, 1024, 1920, 2560]
    
    console.group('%c🧪 Network Adaptation Test', 'color: #F59E0B; font-weight: bold; font-size: 14px')
    console.log(`Current Network Quality: ${networkAdaptiveLoader.getNetworkInfo().quality}`)
    console.log('\nRecommended sizes for different screens:')
    
    screenWidths.forEach(width => {
      const size = networkAdaptiveLoader.getOptimalSize(width)
      console.log(`  ${width}px → ${size}`)
    })
    
    console.log(`\nMax Concurrent Loads: ${networkAdaptiveLoader.getMaxConcurrentLoads()}`)
    console.log(`Should Preload: ${networkAdaptiveLoader.shouldPreload()}`)
    console.groupEnd()
  }

  /**
   * Show user preferences
   */
  static showUserPreferences() {
    const prefs = smartPreloader.userPreferences
    
    console.group('%c👤 User Preferences', 'color: #EC4899; font-weight: bold; font-size: 14px')
    
    if (Object.keys(prefs).length === 0) {
      console.log('No user preferences recorded yet')
    } else {
      const sorted = Object.entries(prefs)
        .map(([url, data]) => ({
          Image: url.split('/').pop(),
          Views: data.views,
          Selections: data.selections,
          'Last Used': data.lastUsed ? new Date(data.lastUsed).toLocaleString() : 'Never',
          Score: smartPreloader.getPredictionScore(url)
        }))
        .sort((a, b) => b.Score - a.Score)
      
      console.table(sorted)
    }
    
    console.groupEnd()
  }

  /**
   * Monitor real-time loading
   */
  static startMonitoring() {
    console.log('%c🔍 Starting real-time monitoring...', 'color: #3B82F6; font-weight: bold')
    
    const interval = setInterval(() => {
      const queueStatus = imageLoadQueue.getStatus()
      if (queueStatus.queued > 0 || queueStatus.active > 0) {
        console.log(
          `%c[Monitor] Queue: ${queueStatus.queued} | Active: ${queueStatus.active} | Completed: ${queueStatus.completed}`,
          'color: #8B5CF6'
        )
      }
    }, 1000)

    // Store interval ID for stopping
    this._monitorInterval = interval
    
    console.log('%c💡 Use WallpaperDebugger.stopMonitoring() to stop', 'color: #94A3B8')
  }

  /**
   * Stop monitoring
   */
  static stopMonitoring() {
    if (this._monitorInterval) {
      clearInterval(this._monitorInterval)
      this._monitorInterval = null
      console.log('%c✓ Monitoring stopped', 'color: #10B981; font-weight: bold')
    }
  }

  /**
   * Show help
   */
  static help() {
    console.group('%c🎨 Wallpaper Optimizer - Debug Commands', 'color: #8B5CF6; font-weight: bold; font-size: 16px')
    console.log('%cWallpaperDebugger.showMetrics()', 'color: #3B82F6', '- Show comprehensive performance metrics')
    console.log('%cWallpaperDebugger.showCacheStats()', 'color: #3B82F6', '- Show cache statistics')
    console.log('%cWallpaperDebugger.clearAllCaches()', 'color: #3B82F6', '- Clear all caches')
    console.log('%cWallpaperDebugger.testNetworkAdaptation()', 'color: #3B82F6', '- Test network adaptation')
    console.log('%cWallpaperDebugger.showUserPreferences()', 'color: #3B82F6', '- Show user preferences and predictions')
    console.log('%cWallpaperDebugger.startMonitoring()', 'color: #3B82F6', '- Start real-time queue monitoring')
    console.log('%cWallpaperDebugger.stopMonitoring()', 'color: #3B82F6', '- Stop real-time monitoring')
    console.log('%cWallpaperDebugger.help()', 'color: #3B82F6', '- Show this help')
    console.groupEnd()
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.WallpaperDebugger = WallpaperDebugger
  
  // Show welcome message
  console.log(
    '%c💡 Tip: Type %cWallpaperDebugger.help()%c in console for debug commands',
    'color: #94A3B8',
    'color: #3B82F6; font-weight: bold',
    'color: #94A3B8'
  )
}
