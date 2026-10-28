<template>
  <div class="background-grid">
    <div class="background-grid__list">
      <button
        v-for="image in images"
        :key="image.filename"
        :class="[
          'background-grid__item',
          { 'background-grid__item--active': selectedImage === image.filename }
        ]"
        :title="image.name"
        :aria-label="`选择背景图片: ${image.name}`"
        :aria-pressed="selectedImage === image.filename"
        @click="handleSelect(image.filename)"
      >
        <div
          class="background-grid__thumbnail"
          :style="getThumbnailStyle(image.filename)"
        ></div>
        <span class="background-grid__label">{{ image.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * BackgroundGrid - 背景图片网格选择组件
 *
 * 以网格形式展示所有可选背景图片，支持高亮当前选中项。
 * 从 BackgroundSelector.vue 中提取的子组件，负责纯展示和选择交互。
 *
 * @component
 * @example
 * <BackgroundGrid
 *   :images="backgroundImages"
 *   :selected-image="currentBackground"
 *   @select="handleBackgroundSelect"
 * />
 */

import { getThumbnailUrl } from '@/constants/backgrounds'

// ==================== Props 定义 ====================
const props = defineProps({
  /**
   * 背景图片列表
   * @type {Array<{ id: number, name: string, filename: string }>}
   */
  images: {
    type: Array,
    required: true
  },
  /**
   * 当前选中的背景图片文件名
   * @type {string}
   */
  selectedImage: {
    type: String,
    default: ''
  }
})

// ==================== Emits 定义 ====================
const emit = defineEmits({
  /**
   * 用户选择背景图片时触发
   * @param {string} imagePath - 选中的图片文件名
   */
  select: (imagePath) => typeof imagePath === 'string'
})

// ==================== 方法 ====================

/**
 * 获取缩略图的内联样式
 * @param {string} filename - 图片文件名
 * @returns {Object} CSS 样式对象
 */
const getThumbnailStyle = (filename) => {
  const url = getThumbnailUrl(filename)
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
}

/**
 * 处理图片选择
 * @param {string} filename - 选中的图片文件名
 */
const handleSelect = (filename) => {
  emit('select', filename)
}
</script>

<style scoped>
/* Block */
.background-grid {
  margin-bottom: 20px;
}

/* 网格列表 */
.background-grid__list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

/* 网格项（按钮） */
.background-grid__item {
  background-color: var(--blog-bg-card-strong);
  border: 1px solid var(--blog-border);
  border-radius: var(--blog-radius-md);
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #E2E8F0;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 60px;
}

.background-grid__item:hover {
  background-color: rgba(59, 130, 246, 0.2);
  color: var(--blog-text-bright);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

/* 选中状态 */
.background-grid__item--active {
  background-color: rgba(59, 130, 246, 0.3);
  color: var(--blog-blue-light);
  border-color: var(--blog-blue-strong);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  font-weight: 600;
}

/* 缩略图 */
.background-grid__thumbnail {
  width: 40px;
  height: 25px;
  border-radius: var(--blog-radius-xs);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* 悬停时缩略图效果 */
.background-grid__item:hover .background-grid__thumbnail {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.2),
    0 0 0 2px rgba(59, 130, 246, 0.2);
  transform: scale(1.05);
}

/* 选中时缩略图效果 */
.background-grid__item--active .background-grid__thumbnail {
  border-color: var(--blog-blue-strong);
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.2),
    0 0 0 2px rgba(59, 130, 246, 0.4);
}

/* 标签文本 */
.background-grid__label {
  font-size: 11px;
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

/* 响应式 - 小屏手机 */
@media (max-width: 480px) {
  .background-grid__list {
    gap: 6px;
  }

  .background-grid__item {
    padding: 6px;
    min-height: 55px;
  }

  .background-grid__thumbnail {
    width: 35px;
    height: 22px;
  }

  .background-grid__label {
    font-size: 10px;
  }
}

/* 响应式 - 平板 */
@media (min-width: 481px) and (max-width: 768px) {
  .background-grid__thumbnail {
    width: 38px;
    height: 24px;
  }
}

/* 响应式 - 高分辨率屏幕 */
@media (min-width: 1920px) {
  .background-grid__item {
    padding: 10px;
    min-height: 65px;
  }

  .background-grid__thumbnail {
    width: 45px;
    height: 28px;
  }

  .background-grid__label {
    font-size: 12px;
  }
}

/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .background-grid__item,
  .background-grid__thumbnail {
    transition: none;
  }

  .background-grid__item:hover {
    transform: none;
  }

  .background-grid__item:hover .background-grid__thumbnail {
    transform: none;
  }
}
</style>
