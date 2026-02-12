<template>
  <div
    class="entry-avatar"
    :style="containerStyle"
  >
    <img
      v-if="!useCssGradient"
      :src="currentSrc"
      :alt="alt"
      :width="size"
      :height="size"
      class="entry-avatar__image"
      :style="imageStyle"
      role="img"
      @load="handleLoad"
      @error="handleError"
    >
    <div
      v-else
      class="entry-avatar__fallback"
      :style="fallbackStyle"
      role="img"
      :aria-label="alt"
    >
      <span class="entry-avatar__fallback-icon" aria-hidden="true">👤</span>
    </div>
  </div>
</template>

<script setup>
/**
 * EntryAvatar - 博客入口页头像展示组件
 *
 * 从 EntryGate.vue 提取的头像展示逻辑，支持图片加载失败时的
 * 多级回退策略：备用图片 → SVG 占位符 → CSS 渐变。
 *
 * @component
 * @example
 * <EntryAvatar src="/head/head.webp" alt="Blog avatar" :size="120" />
 */

import { computed } from 'vue'
import { useImageFallback } from '@/composables/useImageFallback'

// ==================== Props 定义 ====================
const props = defineProps({
  /** 头像图片路径 */
  src: {
    type: String,
    required: true
  },
  /** 头像替代文本 */
  alt: {
    type: String,
    default: 'Blog avatar'
  },
  /** 头像尺寸（px） */
  size: {
    type: Number,
    default: 120
  }
})

// ==================== 图片回退逻辑 ====================
const {
  currentSrc,
  useCssGradient,
  cssGradientStyle,
  handleError,
  handleLoad
} = useImageFallback(props.src, {
  fallbacks: ['/background/12.webp']
})

// ==================== 计算样式 ====================
/** 容器尺寸样式 */
const containerStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`
}))

/** 图片尺寸样式 */
const imageStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`
}))

/** CSS 渐变回退样式 */
const fallbackStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  background: cssGradientStyle.value
}))
</script>

<style scoped>
/* Block */
.entry-avatar {
  position: relative;
  display: inline-block;
}

/* Element: image */
.entry-avatar__image {
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
  animation: entry-avatar-glow 2s ease-in-out infinite alternate;
  transition: transform 0.3s ease;
}

/* Element: CSS gradient fallback */
.entry-avatar__fallback {
  border-radius: 50%;
  border: 3px solid rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: entry-avatar-glow 2s ease-in-out infinite alternate;
}

/* Element: fallback icon */
.entry-avatar__fallback-icon {
  font-size: 3rem;
  opacity: 0.8;
}

/* Glow animation */
@keyframes entry-avatar-glow {
  from {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
  to {
    box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .entry-avatar__image,
  .entry-avatar__fallback {
    animation: none;
  }
}
</style>
