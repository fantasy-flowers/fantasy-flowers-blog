<template>
  <div class="container">
    <!-- 入场门户界面 - 未进入时显示在所有内容之上 -->
    <EntryGate 
      v-if="showEntryInterface" 
      @enter="handleEntryComplete"
    />
    
    <!-- 导航栏按钮组 -->
    <NavButtonsGroup />
    <!-- 移动端导航 -->
    <MobileNavigation />
    <!-- 桌面端侧边栏 -->
    <AppSidebar class="desktop-sidebar" />
    <div class="main-content" :style="mainContentStyle">
      <RouterView />
      <BackToTop />
      <SiteFooter />
    </div>
  </div>
</template>

<script setup>
/**
 * App - 应用根组件
 *
 * 负责整体布局管理、入场动画控制、侧边栏响应式适配
 * 包含桌面端侧边栏、移动端导航、主内容区域、页脚等核心布局
 *
 * @component
 */

// ==================== 导入依赖 ====================
// Vue 核心
import { ref, defineAsyncComponent, onMounted, onUnmounted, computed } from 'vue'
import { RouterView, useRouter } from 'vue-router'

// 布局组件
import AppSidebar from './components/layout/AppSidebar.vue'
import MobileNavigation from './components/layout/MobileNavigation.vue'
import BackToTop from './components/base/BackToTop.vue'
import NavButtonsGroup from './components/layout/NavButtonsGroup.vue'
import SiteFooter from './components/layout/SiteFooter.vue'

// 加载回退组件（同步导入，用于 defineAsyncComponent 配置）
import LoadingSpinner from './components/base/LoadingSpinner.vue'
import LoadError from './components/base/LoadError.vue'

// 业务组件 - 懒加载大型组件
const EntryGate = defineAsyncComponent({
  loader: () => import('./components/business/EntryGate.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: LoadError,
  delay: 200,
  timeout: 10000
})

// 状态管理
import { useSidebarStore } from '@/stores/modules/sidebar'
import { useBlogStore } from '@/stores/modules/blog'

// 组合式函数
import { initBackgroundSettings } from '@/composables/useBackgroundSettings'
import { useThrottle } from '@/composables/useThrottle'

// ==================== 初始化 ====================
// 从 localStorage 初始化背景设置
// 确保背景图片和透明度在用户看到页面之前应用
initBackgroundSettings()

// ==================== 响应式状态 ====================
// 入场界面状态 - 从 sessionStorage 同步初始化
// 在组件创建时（挂载前）执行
// 状态由 index.html 中的初始化脚本决定
const showEntryInterface = ref((() => {
  try {
    const shouldShow = sessionStorage.getItem('blog_show_entry')
    console.log('App: 入场界面状态初始化:', { shouldShow })
    return shouldShow === 'true'
  } catch (error) {
    console.error('App: 初始化入场状态出错', error)
    return true // 出错时默认显示
  }
})())

const router = useRouter()
const sidebarStore = useSidebarStore()
const blogStore = useBlogStore()

// 窗口宽度状态
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

// ==================== 计算属性 ====================
// 计算主内容区域的样式
const mainContentStyle = computed(() => {
  // 基础样式对象，统一应用所有过渡属性
  const style = {
    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }
  
  // 在移动端不需要左边距
  if (windowWidth.value <= 768) {
    style.marginLeft = '0px'
  } else {
    // 根据屏幕宽度和侧边栏状态设置不同的布局
    // 为所有分辨率添加侧边栏宽度计算
    const sidebarWidth = sidebarStore.isCollapsed ? 88 : 250
    // 高分辨率屏幕下增加侧边栏宽度
    const highResSidebarWidth = sidebarStore.isCollapsed ? 100 : 270
    
    if (windowWidth.value >= 1921) {
      // 超大屏幕上使用固定左边距，将内容区向左移动60px（减少左边距）
      style.marginLeft = `${highResSidebarWidth - 40}px`
      style.width = `calc(100vw - ${highResSidebarWidth - 20}px)`
      style.marginRight = '20px'
    } else if (windowWidth.value >= 1200) {
      // 大屏幕上使用固定宽度布局，也适当向左移动
      style.marginLeft = `${sidebarWidth - 45}px`
      style.width = `calc(100vw - ${sidebarWidth - 30}px)`
      style.marginRight = '15px'
    } else {
      // 中等屏幕使用固定左边距
      style.marginLeft = `${sidebarWidth + 10}px` // 增加10px额外间距
      style.marginRight = '10px'
    }
  }
  
  return style
})

// ==================== 方法 ====================
/**
 * 监听窗口大小变化
 */
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

/** 节流后的 resize 处理（每 150ms 最多执行一次） */
const throttledResize = useThrottle(handleResize, 150)

/**
 * 处理入场完成事件
 */
const handleEntryComplete = () => {
  showEntryInterface.value = false
  console.log('App: 用户完成入场，隐藏入场界面')
}

/**
 * 监听存储变化，更新入场界面可见性（多标签页同步）
 * @param {StorageEvent} event - 存储事件对象
 */
const handleStorageChange = (event) => {
  if (event.key === 'blog_show_entry') {
    showEntryInterface.value = event.newValue === 'true'
    console.log('App: 入场界面状态通过存储事件变更:', showEntryInterface.value)
  }
}

// ==================== 生命周期 ====================
onMounted(async () => {
  console.log('App: 组件已挂载，入场门户可见:', showEntryInterface.value)
  
  // 初始化博客数据（分类、标签等）和系统配置
  try {
    await blogStore.initializeData()
    console.log('App: 博客数据初始化成功')
  } catch (error) {
    console.error('App: 加载初始数据失败:', error)
  }
  
  // 监听存储变化（用于多标签页场景）
  window.addEventListener('storage', handleStorageChange)
  
  // 监听窗口大小变化
  window.addEventListener('resize', throttledResize)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('resize', throttledResize)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* body样式在main.css中定义，这里不再重复定义 */

/* 主容器：响应式布局基础 */
.container {
  min-height: 100vh;
  display: flex;
  background-color: transparent; /* 透明背景，让星空背景完全显示 */
  width: 100%; /* 使用全宽度 */
  margin: 0; /* 移除自动居中，使用全宽度 */
  padding: 0; /* 移除容器内边距，由内容区域控制 */
}

/* 主内容区域：响应式宽度和居中 */
.main-content {
  flex: 1;
  min-height: 100vh;
  background-color: transparent;
  padding: 20px;
  width: 100%; /* 使用全宽度 */
  max-width: none; /* 移除最大宽度限制 */
  margin: 0; /* 移除自动居中 */
  overflow-x: hidden; /* 防止内容横向滚动 */
  box-sizing: border-box;
  /* 为所有响应式状态添加统一的padding过渡 */
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* 添加flex布局以确保页脚位于底部 */
  display: flex;
  flex-direction: column;
}



/* 响应式设计：大型平板设备 (1024px - 1200px) */
@media (max-width: 1200px) and (min-width: 1025px) {
  .main-content {
    padding: 20px 30px;
  }
}

/* 响应式设计：标准平板设备 (768px - 1024px) */
@media (max-width: 1024px) and (min-width: 769px) {
  .main-content {
    padding: 18px 25px;
  }
}

/* 桌面端侧边栏样式 */
.desktop-sidebar {
  display: block; /* 桌面端正常显示 */
}

/* 响应式设计：小型平板和大型手机 (481px - 768px) */
@media (max-width: 768px) and (min-width: 481px) {
  .container {
    flex-direction: row;
  }
  
  /* 移动端隐藏桌面端侧边栏 */
  .desktop-sidebar {
    display: none !important;
    visibility: hidden;
    width: 0;
    min-width: 0;
    overflow: hidden;
  }
  
  .main-content {
    width: 100%;
    margin-left: 0; /* 移动端不需要为侧边栏留出空间 */
    padding: 16px 20px;
  }
}

/* 响应式设计：标准手机设备 (321px - 480px) */
@media (max-width: 480px) and (min-width: 321px) {
  .container {
    flex-direction: row;
  }
  
  /* 移动端隐藏桌面端侧边栏 */
  .desktop-sidebar {
    display: none !important;
    visibility: hidden;
    width: 0;
    min-width: 0;
    overflow: hidden;
  }
  
  .main-content {
    width: 100%;
    margin-left: 0;
    padding: 12px 16px;
  }
  

}

/* 响应式设计：小屏手机设备 (≤320px) */
@media (max-width: 320px) {
  .container {
    flex-direction: row;
  }
  
  /* 移动端隐藏桌面端侧边栏 */
  .desktop-sidebar {
    display: none !important;
    visibility: hidden;
    width: 0;
    min-width: 0;
    overflow: hidden;
  }
  
  .main-content {
    width: 100%;
    margin-left: 0;
    padding: 10px 12px;
  }
  

}

/* 响应式设计：大屏桌面 (1201px - 1440px) */
@media (min-width: 1201px) and (max-width: 1440px) {
  .main-content {
    padding: 24px 40px;
  }
}

/* 响应式设计：超大屏桌面 (1441px - 1920px) */
@media (min-width: 1441px) and (max-width: 1920px) {
  .main-content {
    padding: 28px 60px;
  }
  

}

/* 响应式设计：4K及超高分辨率屏幕 (≥1921px) */
@media (min-width: 1921px) {
  .main-content {
    padding: 32px 80px;
    /* 移除这里的margin设置，由计算属性统一管理 */
  }
  

}


</style>