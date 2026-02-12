<template>
  <div
    :class="['loading-spinner', `loading-spinner--${size}`]"
    role="status"
    :aria-label="ariaLabel"
  >
    <img
      src="/icon/load.gif"
      alt=""
      aria-hidden="true"
      :class="['loading-spinner__icon', `loading-spinner__icon--${size}`]"
    />
    <p
      v-if="text"
      class="loading-spinner__text"
      :style="textColorStyle"
    >
      {{ text }}
    </p>
    <!-- 屏幕阅读器专用文本 -->
    <span class="loading-spinner__sr-only">{{ ariaLabel }}</span>
  </div>
</template>

<script setup>
/**
 * LoadingSpinner - 加载状态指示器
 *
 * 用于在数据加载或异步操作期间向用户展示加载状态。
 * 支持三种预设尺寸和自定义颜色，包含完整的无障碍支持。
 *
 * @component
 * @example
 * <!-- 默认用法 -->
 * <LoadingSpinner />
 *
 * @example
 * <!-- 小尺寸，自定义文本 -->
 * <LoadingSpinner size="sm" text="正在加载数据..." />
 *
 * @example
 * <!-- 大尺寸，自定义颜色 -->
 * <LoadingSpinner size="lg" color="#3B82F6" text="请稍候..." />
 */
import { computed } from 'vue'

// ==================== Props 定义 ====================
const props = defineProps({
  /**
   * 加载提示文本
   * @type {string}
   */
  text: {
    type: String,
    default: '加载中...'
  },
  /**
   * 加载图标尺寸
   * @type {'sm' | 'md' | 'lg'}
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  /**
   * 文本颜色（CSS 颜色值）
   * @type {string}
   */
  color: {
    type: String,
    default: ''
  },
  /**
   * 无障碍标签，供屏幕阅读器使用
   * @type {string}
   */
  ariaLabel: {
    type: String,
    default: '内容加载中'
  }
})

// ==================== 计算属性 ====================

/**
 * 文本自定义颜色样式
 * @returns {Object|null} CSS 样式对象
 */
const textColorStyle = computed(() => {
  return props.color ? { color: props.color } : null
})
</script>

<style scoped>
/* Block */
.loading-spinner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #94a3b8;
}

/* Size modifiers */
.loading-spinner--sm {
  padding: 1rem;
}

.loading-spinner--lg {
  padding: 3rem;
}

/* Element: icon */
.loading-spinner__icon {
  margin-bottom: 0.75rem;
  object-fit: contain;
}

.loading-spinner__icon--sm {
  width: 48px;
  height: 48px;
}

.loading-spinner__icon--md {
  width: 100px;
  height: 100px;
}

.loading-spinner__icon--lg {
  width: 150px;
  height: 150px;
}

/* Element: text */
.loading-spinner__text {
  font-size: 0.9rem;
  color: #94a3b8;
  margin: 0;
}

.loading-spinner--sm .loading-spinner__text {
  font-size: 0.8rem;
}

.loading-spinner--lg .loading-spinner__text {
  font-size: 1.1rem;
}

/* Screen reader only */
.loading-spinner__sr-only {
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
</style>
