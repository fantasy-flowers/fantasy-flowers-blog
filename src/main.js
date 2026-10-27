/**
 * 应用主入口文件
 * 初始化 Vue 应用、路由和状态管理
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { swManager } from './utils/serviceWorkerManager'
import { initAppConfig } from './utils/configLoader'

// 初始化应用函数
async function initApp() {
  // 创建 Vue 应用实例
  const app = createApp(App)
  
  // 注册插件
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)
  
  // 在挂载前加载配置
  try {
    await initAppConfig()
    console.log('[App] System configuration loaded')
  } catch (error) {
    console.error('[App] Failed to load system configuration:', error)
  }

  // 挂载应用
  app.mount('#app')

  // Service Worker 注册：由 VITE_ENABLE_SERVICE_WORKER 控制
  // 生产环境默认启用（显式 false 才关闭）；开发环境设为 true 可测试 SW
  const serviceWorkerEnabled = import.meta.env.PROD
    ? import.meta.env.VITE_ENABLE_SERVICE_WORKER !== 'false'
    : import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true'
  if (serviceWorkerEnabled) {
    swManager.register().then(success => {
      if (success && import.meta.env.DEV) {
        console.log('[App] Service Worker registered successfully')
      }
    }).catch(error => {
      console.error('[App] Service Worker registration failed:', error)
    })
  }
}

// 启动应用
initApp()