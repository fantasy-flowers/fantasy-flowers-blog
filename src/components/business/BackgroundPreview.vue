<template>
  <div class="background-preview" role="img" :aria-label="ariaLabel">
    <div
      class="background-preview__image"
      :style="previewStyle"
    ></div>
    <div class="background-preview__overlay">
      <span class="background-preview__label">当前背景预览</span>
    </div>
  </div>
</template>

<script setup>
/**
 * BackgroundPreview - 背景图片预览组件
 *
 * 展示当前选中背景图片的预览效果。
 * 从 BackgroundSelector.vue 中提取的子组件，负责纯展示预览。
 *
 * @component
 * @example
 * <BackgroundPreview image-path="/background/12.webp" />
 */

import { computed } from 'vue'
import { getBackgroundUrl } from '@/constants/backgrounds'

// ==================== Props 定义 ====================
const props = defineProps({
  /**
   * 背景图片文件名或完整路径
   * @type {string}
   */
  imagePath: {
    type: String,
    required: true
  },
})

// ==================== 计算属性 ====================

/**
 * 预览图片的内联样式
 * @returns {Object} CSS 样式对象
 */
const previewStyle = computed(() => {
  const url = props.imagePath.startsWith('/')
    ? props.imagePath
    : getBackgroundUrl(props.imagePath)
  return {
    backgroundImage: `url(${url})`
  }
})

/**
 * 无障碍标签文本
 * @returns {string}
 */
const ariaLabel = computed(() => {
  return '当前背景预览'
})
</script>

<style scoped>
/* Block */
.background-preview {
  position: relative;
  width: 100%;
  border-radius: var(--blog-radius-md);
  overflow: hidden;
  margin-bottom: 12px;
  aspect-ratio: 16 / 9;
  background-color: var(--blog-bg-card);
}

/* 预览图片 */
.background-preview__image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: opacity 0.3s ease;
}

/* 信息覆盖层 */
.background-preview__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* 标签文本 */
.background-preview__label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

/* 响应式 - 小屏手机 */
@media (max-width: 480px) {
  .background-preview {
    margin-bottom: 8px;
  }

  .background-preview__label {
    font-size: 10px;
  }
}

/* 响应式 - 高分辨率屏幕 */
@media (min-width: 1920px) {
  .background-preview {
    margin-bottom: 16px;
  }

  .background-preview__label {
    font-size: 12px;
  }
}

/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .background-preview__image {
    transition: none;
  }
}
</style>
