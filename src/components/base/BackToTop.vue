<template>
  <button
    v-show="isVisible"
    class="back-to-top"
    :aria-label="ariaLabel"
    @click="scrollToTop"
  >
    <i class="fa fa-arrow-up" aria-hidden="true"></i>
    <!-- 屏幕阅读器专用文本 -->
    <span class="back-to-top__sr-only">{{ ariaLabel }}</span>
  </button>
</template>

<script setup>
/**
 * BackToTop - 返回顶部按钮
 *
 * 当页面滚动超过指定阈值时显示，点击后平滑滚动回页面顶部。
 * 包含完整的无障碍支持（ARIA 属性、键盘可操作）。
 *
 * @component
 * @example
 * <!-- 默认用法 -->
 * <BackToTop />
 *
 * @example
 * <!-- 自定义阈值和滚动行为 -->
 * <BackToTop :threshold="500" :smooth="false" />
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useThrottle } from '@/composables/useThrottle'

// ==================== Props 定义 ====================
const props = defineProps({
  /**
   * 显示按钮的滚动距离阈值（px）
   * @type {number}
   */
  threshold: {
    type: Number,
    default: 300
  },
  /**
   * 是否使用平滑滚动
   * @type {boolean}
   */
  smooth: {
    type: Boolean,
    default: true
  },
  /**
   * 无障碍标签，供屏幕阅读器使用
   * @type {string}
   */
  ariaLabel: {
    type: String,
    default: '返回顶部'
  }
})

// ==================== 响应式状态 ====================

/** 按钮是否可见 */
const isVisible = ref(false)

// ==================== 方法 ====================

/**
 * 处理页面滚动事件，根据阈值切换按钮可见性
 */
const handleScroll = () => {
  isVisible.value = window.scrollY > props.threshold
}

/** 节流后的滚动处理（每 100ms 最多执行一次） */
const throttledScroll = useThrottle(handleScroll, 100)

/**
 * 滚动到页面顶部
 */
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: props.smooth ? 'smooth' : 'instant'
  })
}

// ==================== 生命周期 ====================
onMounted(() => {
  window.addEventListener('scroll', throttledScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', throttledScroll)
})
</script>

<style scoped>
/* Block: 返回顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: rgba(30, 42, 58, 0.65) url('/icon/topboqi.gif') center/cover no-repeat;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: #E2E8F0;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

/* Modifier: hover 状态 */
.back-to-top:hover:not(:disabled) {
  background-color: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93C5FD;
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* Modifier: active 状态 */
.back-to-top:active:not(:disabled) {
  background-color: rgba(59, 130, 246, 0.3);
  border-color: #3B82F6;
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* Modifier: focus-visible 键盘焦点 */
.back-to-top:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Element: 屏幕阅读器专用文本 */
.back-to-top__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .back-to-top {
    transition: none;
  }

  .back-to-top:hover:not(:disabled) {
    transform: none;
  }

  .back-to-top:active:not(:disabled) {
    transform: none;
  }
}
</style>
