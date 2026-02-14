
import { useBlogStore } from '@/stores/modules/blog'

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
  version: "1.0.0",
  meta: {
    siteName: "Vue Blog",
    beianNumber: "",
    legal: {
      company: "",
      address: "",
      license: ""
    }
  },
  seo: {
    titleTemplate: "%s - Vue Blog",
    defaultDescription: "A high performance blog system built with Vue 3 and Vite",
    keywords: "vue3, vite, blog, pinia, tailwindcss"
  },
  contact: {
    email: "",
    phone: "",
    wechat: ""
  }
}

/**
 * 加载站点配置
 * @returns {Promise<Object>} 配置对象
 */
export async function loadSiteConfig() {
  try {
    // 添加时间戳防止缓存，确保获取最新配置
    // 实际生产环境可以根据 version 字段做更智能的缓存策略
    const timestamp = new Date().getTime()
    const response = await fetch(`/config/site.json?t=${timestamp}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const config = await response.json()
    console.log('Site config loaded successfully:', config)
    return config
  } catch (error) {
    console.error('Failed to load site config, using default config:', error)
    // 可以在这里上报错误到监控平台
    return DEFAULT_CONFIG
  }
}

/**
 * 初始化应用配置
 * 在应用挂载前调用
 */
export async function initAppConfig() {
  const blogStore = useBlogStore()
  const config = await loadSiteConfig()
  
  // 更新 Store 中的配置
  // 这里我们需要在 Store 中添加一个 action 来处理整个配置对象的更新
  // 或者分别更新各个字段
  blogStore.setSystemConfig(config)
  
  return config
}
