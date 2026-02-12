<template>
  <div class="background-set-container">
    <div class="background-set-panel" ref="controlPanel">
      <button class="background-toggle-btn" @click="togglePanel" title="背景设置面板" aria-label="背景设置面板">
        <i class="fa fa-sliders"></i>
      </button>
      <transition name="slide">
        <div v-if="isPanelOpen" ref="panelContainer" class="background-panel-content">
          <!-- 错误提示 -->
          <div v-show="errorMessage" class="error-message">
            <i class="fa fa-exclamation-triangle"></i>
            <span>{{ errorMessage }}</span>
          </div>
          
          <!-- 背景设置组件（含图片选择、预览、透明度控制） -->
          <BackgroundSelector 
            @error="handleError"
            ref="backgroundSelectorRef"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent, onMounted, onUnmounted, nextTick } from 'vue'
import LoadingSpinner from '../base/LoadingSpinner.vue'
import LoadError from '../base/LoadError.vue'

// 懒加载大型背景选择器组件
const BackgroundSelector = defineAsyncComponent({
  loader: () => import('./BackgroundSelector.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: LoadError,
  delay: 200,
  timeout: 10000
})

const isPanelOpen = ref(false)
const errorMessage = ref('') // 错误信息
const backgroundSelectorRef = ref(null)
const controlPanel = ref(null)

// 防抖变量
let isToggling = false

/**
 * 切换面板显示/隐藏
 */
const togglePanel = () => {
  // 防止重复点击
  if (isToggling) return
  isToggling = true
  
  // 切换面板状态
  isPanelOpen.value = !isPanelOpen.value
  
  // 使用nextTick确保DOM更新后再执行相关操作
  nextTick(() => {
    // 如果面板打开，加载缩略图
    if (isPanelOpen.value) {
      errorMessage.value = ''
      // 使用requestAnimationFrame优化UI响应
      requestAnimationFrame(() => {
        if (backgroundSelectorRef.value) {
          backgroundSelectorRef.value.optimizedLoadThumbnails()
        }
      })
    }
    
    // 重置防抖标志，等待完整动画完成后再重置（与CSS过渡时间保持一致）
    setTimeout(() => {
      isToggling = false
    }, 500)
  })
}

/**
 * 处理错误事件
 * @param {string} message - 错误消息
 */
const handleError = (message) => {
  errorMessage.value = message
  
  // 5秒后自动清除错误信息
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

/**
 * 点击外部关闭面板
 */
const handleClickOutside = (event) => {
  if (controlPanel.value && !controlPanel.value.contains(event.target)) {
    isPanelOpen.value = false
  }
}

onMounted(() => {
  // 添加点击外部关闭面板的事件监听
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.background-set-container {
  position: relative;
  /* 固定容器尺寸，防止内容变化时影响布局 */
  display: inline-block;
}

.background-set-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  position: relative;
  /* 确保面板不会影响父容器的尺寸 */
}

.background-toggle-btn {
  background-color: rgba(30, 42, 58, 0.6);
  backdrop-filter: blur(10px); /* 保留用于关键控制按钮 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #E2E8F0;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  will-change: transform; /* 优化动画性能 */
  transform: translateZ(0); /* 启用硬件加速 */
}

.background-toggle-btn:hover {
  background-color: rgba(59, 130, 246, 0.2);
  color: #F8FAFC;
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: scale(1.1);
}

.background-toggle-btn:active {
  background-color: rgba(59, 130, 246, 0.3);
  color: #93C5FD;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  transform: scale(1.05);
}

.background-panel-content {
  /* 使用绝对定位，防止影响父容器和兄弟元素的布局 */
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  
  background-color: rgba(30, 42, 58, 0.6);
  /* backdrop-filter removed for GPU optimization - only added when panel is open */
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 15px;
  min-width: 240px;
  max-width: 260px; /* 添加最大宽度限制 */
  max-height: 600px; /* 添加最大高度限制 */
  overflow-y: auto; /* 添加垂直滚动 */
  box-sizing: border-box; /* 确保padding不会增加元素总宽度 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  color: #333;
  background-color: rgba(30, 42, 58, 0.9);
  will-change: transform, opacity; /* 优化动画性能 */
  z-index: 1001; /* 确保面板在其他元素之上 */
}

/* 错误提示样式 */
.error-message {
  background-color: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 15px;
  color: #FCA5A5;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideIn 0.3s ease;
  max-height: 100px; /* 限制错误信息区域高度 */
  overflow-y: auto; /* 允许错误信息内容过多时滚动 */
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滑入动画优化 */
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
  transform-origin: top right;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.slide-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .background-toggle-btn {
    width: 36px;
    height: 36px;
    font-size: 12px;
    padding: 8px;
  }
  
  .background-panel-content {
    min-width: 180px;
    padding: 10px;
    margin-top: 8px;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .background-toggle-btn {
    width: 38px;
    height: 38px;
    font-size: 13px;
  }
  
  .background-panel-content {
    min-width: 200px;
    padding: 12px;
  }
}

/* 高分辨率屏幕优化 */
@media (min-width: 1920px) {
  .background-toggle-btn {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
  
  .background-panel-content {
    min-width: 260px;
    padding: 18px;
  }
}
</style>
