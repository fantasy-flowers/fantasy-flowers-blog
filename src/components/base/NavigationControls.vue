<template>
  <div class="navigation-controls animated-nav" :style="navigationControlsStyle">
    <button 
      @click="goBack"
      :disabled="!canGoBack"
      :aria-disabled="!canGoBack"
      class="nav-control-btn back-btn"
      aria-label="返回上一页"
    >
      <i class="fa fa-arrow-left"></i>
      <span>返回</span>
    </button>
    
    <button 
      @click="goToHome"
      class="nav-control-btn home-btn"
      aria-label="前往首页"
    >
      <i class="fa fa-home"></i>
      <span>首页</span>
    </button>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/modules/sidebar'
import { useThrottle } from '@/composables/useThrottle'

const router = useRouter()
const sidebarStore = useSidebarStore()

// 响应式窗口宽度
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

const updateWindowWidth = () => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth
  }
}

const throttledResize = useThrottle(updateWindowWidth, 200)

// 计算导航控件的样式
const navigationControlsStyle = computed(() => {
  const width = windowWidth.value
  
  if (width <= 768) {
    return { left: '80px' }
  }
  
  let leftPosition = '290px'
  
  // 依赖 sidebarStore.isCollapsed，当其变化时也会重新计算
  const isCollapsed = sidebarStore.isCollapsed
  
  if (width >= 3840) {
    const sidebarWidth = isCollapsed ? 170 : 330
    leftPosition = `calc(50vw - 700px + ${sidebarWidth}px + 40px)`
  } else if (width >= 2800) {
    const sidebarWidth = isCollapsed ? 170 : 330
    leftPosition = `calc(50vw - 700px + ${sidebarWidth}px + 40px)`
  } else if (width >= 1921) {
    const sidebarWidth = isCollapsed ? 88 : 250
    leftPosition = `calc(${sidebarWidth}px + 40px)`
  } else if (width >= 1200) {
    const sidebarWidth = isCollapsed ? 88 : 250
    leftPosition = `calc(${sidebarWidth}px + 40px)`
  } else {
    const sidebarWidth = isCollapsed ? 88 : 250
    leftPosition = `calc(${sidebarWidth}px + 40px)`
  }
  
  return { left: leftPosition }
})

const goBack = () => {
  if (canGoBack.value) {
    history.back()
  } else {
    router.push({ name: 'home' })
  }
}

const goToHome = () => {
  router.push({ name: 'home' })
}

const canGoBack = computed(() => {
  return history.length > 1
})

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', throttledResize)
    updateWindowWidth()
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', throttledResize)
  }
})
</script>

<style scoped>
.animated-nav {
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.navigation-controls {
  position: fixed;
  top: 20px;
  display: flex;
  gap: 12px;
  z-index: 100;
  transition: all 0.3s ease;
}

.nav-control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  min-width: 44px;
  height: 44px;
  border-radius: var(--blog-radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  background-color: var(--blog-bg-card);
  border: 1px solid var(--blog-border);
  color: #E2E8F0;
}

.nav-control-btn i {
  font-size: 1em;
  transition: transform 0.2s ease;
}

.nav-control-btn:hover:not(:disabled) {
  background-color: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: var(--blog-blue-light);
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.nav-control-btn:active:not(:disabled) {
  background-color: rgba(59, 130, 246, 0.3);
  border-color: var(--blog-blue-strong);
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.nav-control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

/* 响应式设计 */

/* 平板设备 */
@media (max-width: 1024px) {
  .navigation-controls {
    top: 15px;
  }
}

/* 移动设备 */
@media (max-width: 768px) {
  .navigation-controls {
    top: 15px;
    flex-direction: row;
    position: fixed;
    gap: 8px;
  }
  
  .nav-control-btn {
    padding: 8px 12px;
    min-width: 36px;
    height: 36px;
    font-size: 12px;
  }
  
  .nav-control-btn span {
    display: none;
  }
}

/* 超高分辨率 */
@media (min-width: 2800px) {
  .navigation-controls {
    top: 30px;
  }
  
  .nav-control-btn {
    padding: 14px 20px;
    min-width: 48px;
    height: 48px;
    font-size: 15px;
  }
}

/* 4K屏幕 */
@media (min-width: 3840px) {
  .navigation-controls {
    top: 40px;
    gap: 16px;
  }
  
  .nav-control-btn {
    padding: 16px 24px;
    min-width: 52px;
    height: 52px;
    font-size: 16px;
    border-radius: 10px;
  }
}
</style>
