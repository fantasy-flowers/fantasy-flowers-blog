/**
 * 应用主入口文件
 * 初始化 Vue 应用、路由、状态管理和性能优化工具
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { swManager } from './utils/serviceWorkerManager'

// 开发环境导入调试工具
if (import.meta.env.DEV) {
  import('./utils/wallpaperDebugger')
  import('./utils/advancedOptimizationDemo')
}

// 导入优化工具
import { responsiveImageLoader } from './utils/responsiveImageLoader'
import { touchOptimizer } from './utils/touchOptimizer'

// 创建 Vue 应用实例
const app = createApp(App)

// 注册插件
app.use(createPinia())
app.use(router)

// 挂载应用
app.mount('#app')

// 生产环境注册 Service Worker
if (import.meta.env.PROD) {
  swManager.register().then(success => {
    if (success && import.meta.env.DEV) {
      console.log('[App] Service Worker registered successfully')
    }
  }).catch(error => {
    console.error('[App] Service Worker registration failed:', error)
  })
}

// 开发环境输出优化信息
if (import.meta.env.DEV) {
  console.log('[App] Performance optimizations initialized')
  console.log('[ResponsiveImageLoader]', responsiveImageLoader.getDeviceInfo())
  console.log('[TouchOptimizer]', touchOptimizer.getOptimizationInfo())
}