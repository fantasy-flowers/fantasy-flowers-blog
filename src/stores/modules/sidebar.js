import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

// localStorage键名常量
const SIDEBAR_COLLAPSED_KEY = 'blog_sidebar_collapsed'

// 从localStorage加载侧边栏状态的辅助函数
const loadFromStorage = () => {
  try {
    const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    return savedState !== null ? savedState === 'true' : false
  } catch (error) {
    console.warn('Failed to load sidebar state from localStorage:', error)
    return false // 出错时默认展开
  }
}

export const useSidebarStore = defineStore('sidebar', () => {
  // 侧边栏收起状态，直接从localStorage初始化
  const isCollapsed = ref(loadFromStorage())
  
  // 保存侧边栏状态到localStorage
  const saveSidebarState = () => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isCollapsed.value.toString())
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error)
    }
  }
  
  // 切换侧边栏状态
  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
  }
  
  // 设置侧边栏状态
  const setSidebarCollapsed = (collapsed) => {
    isCollapsed.value = collapsed
  }
  
  // 获取当前侧边栏宽度
  const getSidebarWidth = () => {
    return isCollapsed.value ? 88 : 250
  }
  
  // 监听状态变化，自动保存到localStorage
  watch(isCollapsed, () => {
    saveSidebarState()
  }, { deep: true }) // 深度监听，确保状态变化时能触发保存
  
  return {
    isCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
    getSidebarWidth
  }
})