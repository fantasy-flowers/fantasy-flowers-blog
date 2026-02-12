<template>
  <div
    ref="wrapperElement"
    class="lazy-image"
    :class="{
      'lazy-image--loaded': isImageLoaded,
      'lazy-image--loading': imageFallback.isLoading.value,
      'lazy-image--error': imageFallback.hasError.value
    }"
  >
    <!-- 占位符：显示在图片加载完成前 -->
    <div
      v-if="!isImageLoaded"
      class="lazy-image__placeholder"
      :style="placeholderStyle"
    >
      <div v-if="showSpinner && imageFallback.isLoading.value" class="lazy-image__spinner" role="status">
        <span class="lazy-image__spinner-ring" aria-hidden="true"></span>
        <span class="lazy-image__sr-only">加载中...</span>
      </div>
    </div>

    <!-- CSS 渐变回退：所有图片源均失败时显示 -->
    <div
      v-if="imageFallback.useCssGradient.value"
      class="lazy-image__fallback"
      :style="{ background: imageFallback.cssGradientStyle.value }"
      role="img"
      :aria-label="alt || '图片加载失败'"
    >
      <span class="lazy-image__fallback-icon" aria-hidden="true">🖼️</span>
    </div>

    <!-- 实际图片 -->
    <img
      v-if="!imageFallback.useCssGradient.value && imageFallback.currentSrc.value"
      v-show="isImageLoaded"
      :src="imageFallback.currentSrc.value"
      :alt="alt"
      :loading="nativeLazy ? 'lazy' : 'eager'"
      class="lazy-image__img"
      @load="onLoad"
      @error="onError"
    >
  </div>
</template>

<script setup>
/**
 * LazyImage - 懒加载图片组件
 *
 * 基础层组件，提供图片懒加载能力，支持原生 `loading="lazy"` 和
 * IntersectionObserver 两种策略。集成 `useImageFallback` 实现
 * 多级回退：主图片 → 备用图片 → SVG 占位符 → CSS 渐变。
 *
 * @component
 * @example
 * <LazyImage src="/images/photo.webp" alt="风景照片" />
 *
 * @example
 * <LazyImage
 *   src="/images/photo.webp"
 *   alt="风景照片"
 *   placeholder="/images/photo-thumb.webp"
 *   :error-fallback="['/images/default.webp']"
 *   :show-spinner="true"
 * />
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useImageFallback } from '@/composables/useImageFallback'

// ==================== Props 定义 ====================
const props = defineProps({
  /**
   * 图片源地址
   * @type {string}
   */
  src: {
    type: String,
    required: true
  },
  /**
   * 图片替代文本
   * @type {string}
   */
  alt: {
    type: String,
    default: ''
  },
  /**
   * 占位图片路径，在主图加载前显示为背景
   * @type {string}
   */
  placeholder: {
    type: String,
    default: ''
  },
  /**
   * 加载失败时的备用图片路径列表
   * @type {string[]}
   */
  errorFallback: {
    type: Array,
    default: () => []
  },
  /**
   * 是否在加载时显示旋转指示器
   * @type {boolean}
   */
  showSpinner: {
    type: Boolean,
    default: true
  },
  /**
   * 是否使用浏览器原生 loading="lazy"
   * @type {boolean}
   */
  nativeLazy: {
    type: Boolean,
    default: true
  },
  /**
   * IntersectionObserver 可见比例阈值（仅在 nativeLazy=false 时生效）
   * @type {number}
   */
  threshold: {
    type: Number,
    default: 0.1
  }
})

// ==================== Emits 定义 ====================
const emit = defineEmits({
  /** 图片加载成功时触发 */
  load: null,
  /**
   * 图片加载失败时触发
   * @param {Event} error - 原始错误事件
   */
  error: null
})

// ==================== 图片回退逻辑 ====================
const imageFallback = useImageFallback(props.src, {
  fallbacks: props.errorFallback
})

// ==================== 响应式状态 ====================
const wrapperElement = ref(null)
const observer = ref(null)
const isImageLoaded = ref(false)
const isObserved = ref(false)

// ==================== 计算属性 ====================
/** 占位符背景样式 */
const placeholderStyle = computed(() => ({
  backgroundImage: props.placeholder ? `url(${props.placeholder})` : 'none',
  backgroundColor: props.placeholder ? 'transparent' : '#f0f0f0'
}))

// ==================== 方法 ====================
/**
 * 图片加载成功回调
 */
const onLoad = () => {
  imageFallback.handleLoad()
  isImageLoaded.value = true
  emit('load')
}

/**
 * 图片加载失败回调，委托给 useImageFallback 处理回退
 * @param {Event} error - 原始错误事件
 */
const onError = (error) => {
  imageFallback.handleError()
  // 仅在所有回退均失败后通知父组件
  if (imageFallback.hasError.value) {
    emit('error', error)
  }
}

/**
 * 触发图片加载（设置 currentSrc）
 */
const startLoad = () => {
  if (isObserved.value) return
  isObserved.value = true
  imageFallback.reset(props.src)
}

// ==================== 监听 src 变化 ====================
watch(() => props.src, (newSrc) => {
  if (newSrc) {
    isImageLoaded.value = false
    isObserved.value = false
    imageFallback.reset(newSrc)
    if (props.nativeLazy) {
      isObserved.value = true
    }
  }
})

// ==================== 生命周期 ====================
onMounted(() => {
  if (props.nativeLazy) {
    // 原生懒加载：立即设置 src，让浏览器处理
    startLoad()
  } else if ('IntersectionObserver' in window) {
    // IntersectionObserver 自定义懒加载
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startLoad()
            observer.value?.disconnect()
          }
        })
      },
      { threshold: props.threshold, rootMargin: '50px' }
    )
    if (wrapperElement.value) {
      observer.value.observe(wrapperElement.value)
    }
  } else {
    // 降级：立即加载
    startLoad()
  }
})

onUnmounted(() => {
  observer.value?.disconnect()
})
</script>

<style scoped>
/* Block */
.lazy-image {
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;
}

/* Elements */
.lazy-image__placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lazy-image__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lazy-image__spinner-ring {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: lazy-image-spin 1s linear infinite;
}

.lazy-image__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.lazy-image__fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lazy-image__fallback-icon {
  font-size: 2rem;
  opacity: 0.6;
}

.lazy-image__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

/* Modifiers */
.lazy-image--loading .lazy-image__img {
  opacity: 0;
}

.lazy-image--loaded .lazy-image__img {
  opacity: 1;
}

/* Animations */
@keyframes lazy-image-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lazy-image__spinner-ring {
    animation: none;
  }
}
</style>
