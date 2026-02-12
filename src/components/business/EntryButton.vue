<template>
  <button
    class="entry-button"
    :class="{ 'entry-button--touch-active': isTouchActive }"
    type="button"
    :aria-label="ariaLabel"
    :aria-busy="loading"
    :disabled="disabled || loading"
    @click="handleClick"
    @keydown="handleKeydown"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <span class="entry-button__text" aria-hidden="true">{{ text }}</span>
    <i class="fa fa-arrow-right entry-button__icon" aria-hidden="true"></i>
  </button>
</template>

<script setup>
/**
 * EntryButton - 博客入口页进入按钮组件
 *
 * 从 EntryGate.vue 提取的进入按钮，包含触摸交互、
 * 键盘导航（Enter/Space）和屏幕阅读器支持。
 *
 * @component
 * @example
 * <EntryButton text="进入博客" @click="handleEnter" />
 * <EntryButton text="Loading..." :loading="true" />
 * <EntryButton text="进入博客" :disabled="true" />
 */

import { ref } from 'vue'

// ==================== Props 定义 ====================
defineProps({
  /** 按钮文本 */
  text: {
    type: String,
    default: '进入博客'
  },
  /** 是否禁用 */
  disabled: {
    type: Boolean,
    default: false
  },
  /** 是否加载中 */
  loading: {
    type: Boolean,
    default: false
  },
  /** 无障碍标签 */
  ariaLabel: {
    type: String,
    default: '进入博客 - 点击或按回车键进入主博客页面'
  }
})

// ==================== Emits 定义 ====================
const emit = defineEmits({
  /**
   * 按钮点击事件
   * @event click
   */
  click: () => true
})

// ==================== 响应式状态 ====================
/** 触摸激活状态 */
const isTouchActive = ref(false)

// ==================== 方法 ====================
/**
 * 处理按钮点击
 */
const handleClick = () => {
  emit('click')
}

/**
 * 处理键盘导航（Enter/Space 触发点击）
 * @param {KeyboardEvent} event - 键盘事件
 */
const handleKeydown = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('click')
  }
}

/**
 * 处理触摸开始
 */
const handleTouchStart = () => {
  isTouchActive.value = true
}

/**
 * 处理触摸结束
 */
const handleTouchEnd = () => {
  setTimeout(() => {
    isTouchActive.value = false
  }, 150)
}
</script>

<style scoped>
/* Block */
.entry-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: rgba(59, 130, 246, 0.8);
  border: 2px solid rgba(59, 130, 246, 0.6);
  border-radius: 8px;
  color: #f8fafc;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 200px;
  min-height: 48px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  animation: entry-button-pulse 3s ease-in-out infinite;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.entry-button:hover {
  background: rgba(59, 130, 246, 1);
  border-color: #3b82f6;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  animation: none;
}

.entry-button:active,
.entry-button--touch-active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.4);
  background: rgba(59, 130, 246, 0.9);
}

.entry-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5), 0 4px 15px rgba(59, 130, 246, 0.3);
}

.entry-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5), 0 4px 15px rgba(59, 130, 246, 0.3);
}

.entry-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}

/* Element: text */
.entry-button__text {
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

/* Element: icon */
.entry-button__icon {
  transition: transform 0.3s ease;
}

.entry-button:hover .entry-button__icon {
  transform: translateX(4px);
}

/* Pulse animation */
@keyframes entry-button-pulse {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 4px 25px rgba(59, 130, 246, 0.5);
  }
}

/* ==================== Responsive ==================== */

/* Touch devices */
@media (hover: none) and (pointer: coarse) {
  .entry-button {
    min-height: 56px;
    padding: 1.25rem 3rem;
    font-size: 1.2rem;
  }

  .entry-button:hover {
    transform: none;
    background: rgba(59, 130, 246, 0.8);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  }
}

@media (max-width: 1024px) {
  .entry-button {
    min-height: 50px;
    padding: 1rem 2.25rem;
    font-size: 1.1rem;
    min-width: 190px;
  }
}

@media (max-width: 768px) {
  .entry-button {
    padding: 1rem 2rem;
    font-size: 1rem;
    min-width: 180px;
    min-height: 52px;
  }
}

@media (max-width: 480px) {
  .entry-button {
    padding: 1rem 1.5rem;
    font-size: 0.95rem;
    min-width: 160px;
    min-height: 56px;
    gap: 0.5rem;
  }
}

@media (max-width: 360px) {
  .entry-button {
    padding: 0.875rem 1.25rem;
    font-size: 0.9rem;
    min-width: 140px;
    min-height: 56px;
  }
}

@media (min-width: 1920px) {
  .entry-button {
    padding: 1.25rem 3rem;
    font-size: 1.25rem;
    min-width: 240px;
    min-height: 60px;
  }
}

@media (min-width: 2560px) {
  .entry-button {
    padding: 1.5rem 3.5rem;
    font-size: 1.4rem;
    min-width: 280px;
    min-height: 70px;
  }
}

@media (max-height: 500px) and (orientation: landscape) {
  .entry-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    min-height: 44px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .entry-button {
    animation: none;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .entry-button {
    border: 3px solid;
    background: ButtonFace;
    color: ButtonText;
  }

  .entry-button:focus {
    outline: 3px solid Highlight;
    outline-offset: 2px;
  }
}
</style>
