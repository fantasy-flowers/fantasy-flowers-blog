<template>
  <RouterLink
    :to="{ name: 'post-detail', params: { id: post.id } }"
    class="post-card-link"
    @click="handleClick"
  >
    <article
      class="post-card"
      role="article"
      :aria-label="`文章: ${post.title}`"
    >
      <div class="post-card__header">
        <img
          :src="getImageUrl(post.cover_image || post.image)"
          :alt="post.title"
          class="post-card__image"
          loading="lazy"
        >
      </div>
      <div class="post-card__body">
        <h3 class="post-card__title">{{ post.title }}</h3>
        <div class="post-card__meta">
          <span class="post-card__date">{{ formatDate(post.publish_time || post.date, 'date') }}</span>
          <span class="post-card__views">{{ post.view_count || post.views || 0 }} 阅读</span>
        </div>
        <p class="post-card__excerpt">{{ post.summary || post.excerpt }}</p>
        <div class="post-card__tags" v-if="visibleTags.length > 0">
          <button
            v-for="tag in visibleTags"
            :key="tag.id || tag.name || tag"
            type="button"
            class="post-card__tag"
            :aria-label="`标签: ${tag.name || tag}`"
            @click.stop="handleTagClick(tag.name || tag)"
          >
            {{ tag.name || tag }}
          </button>
        </div>
      </div>
    </article>
  </RouterLink>
</template>

<script setup>
/**
 * PostCard - 文章卡片组件
 *
 * 展示博客文章的封面图片、标题、摘要、发布时间和标签信息。
 * 支持点击卡片跳转到文章详情，点击标签跳转到标签页面。
 *
 * @component
 * @example
 * <PostCard :post="postData" :max-tags="5" @click="onPostClick" @tag-click="onTagClick" />
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getImageUrl } from '@/utils/imageUrl'
import { isValidPost } from '@/types/components'
import { formatDate } from '@/utils/format'

// ==================== Props 定义 ====================
const props = defineProps({
  /**
   * 文章数据对象
   * @type {import('@/types/components').Post}
   */
  post: {
    type: Object,
    required: true,
    validator: (value) => isValidPost(value)
  },
  /**
   * 最大显示标签数量
   * @type {number}
   */
  maxTags: {
    type: Number,
    default: 3
  }
})

// ==================== Emits 定义 ====================
const emit = defineEmits({
  /**
   * 点击文章卡片时触发
   * @param {number|string} postId - 文章 ID
   */
  click: (postId) => typeof postId !== 'undefined',
  /**
   * 点击标签时触发
   * @param {string} tagName - 标签名称
   */
  'tag-click': (tagName) => typeof tagName === 'string'
})

const router = useRouter()

// ==================== 计算属性 ====================

/** 根据 maxTags 限制显示的标签列表 */
const visibleTags = computed(() => {
  if (!props.post.tags || !Array.isArray(props.post.tags)) return []
  return props.post.tags.slice(0, props.maxTags)
})

// ==================== 方法 ====================

/**
 * 处理卡片点击，触发 emit（导航由外层 RouterLink 完成）
 */
const handleClick = () => {
  emit('click', props.post.id)
}

/**
 * 处理标签点击，触发 emit 并导航到标签页面
 * @param {string} tagName - 标签名称
 */
const handleTagClick = (tagName) => {
  emit('tag-click', tagName)
  router.push({ name: 'tag', params: { name: tagName } })
}
</script>

<style scoped>
/* Block */
.post-card-link {
  display: block;
  height: 100%;
  text-decoration: none;
  color: inherit;
  border-radius: var(--blog-radius-lg);
}

.post-card-link:focus-visible {
  outline: 2px solid var(--blog-purple-ring);
  outline-offset: 2px;
}

.post-card {
  background-color: var(--blog-bg-card);
  border-radius: var(--blog-radius-lg);
  overflow: hidden;
  border: 1px solid var(--blog-border);
  transition: transform 0.3s ease, border-color 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.post-card::after {
  content: ''; position: absolute; inset: 0;
  box-shadow: 0 10px 15px -3px var(--blog-purple-soft);
  opacity: 0; transition: opacity 0.3s ease;
  pointer-events: none; z-index: -1; border-radius: var(--blog-radius-lg);
}
.post-card:hover { transform: translateY(-4px); border-color: var(--blog-purple-mid); }
.post-card:hover::after { opacity: 1; }
.post-card:focus-visible { outline: 2px solid var(--blog-purple-ring); outline-offset: 2px; }

/* Elements */
.post-card__header {
  height: 160px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  will-change: transform;
  transform: translateZ(0);
}

.post-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.post-card:hover .post-card__image {
  transform: scale(1.05) translateZ(0);
}

.post-card:not(:hover) .post-card__image {
  will-change: auto;
}

.post-card__body {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-card__title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
  color: var(--blog-text-bright);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card:hover .post-card__title {
  color: var(--blog-pink);
}

.post-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: var(--blog-gray);
}

.post-card__excerpt {
  color: var(--blog-gray-light);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  flex: 1;
}

.post-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
}

.post-card__tag {
  background-color: var(--blog-purple-soft);
  color: var(--blog-purple-light);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  transition: all 0.3s ease;
  cursor: pointer;
  /* button UA 重置（span → button，保持视觉一致）。
     color 已有显式 var(--blog-purple-light)，无需 inherit */
  border: none;
  font-family: inherit;
  line-height: inherit;
  text-align: inherit;
}

.post-card__tag:hover {
  background-color: var(--blog-purple-strong);
  color: var(--blog-text-bright);
  transform: translateY(-1px);
}

.post-card__tag:focus-visible {
  outline: 2px solid var(--blog-purple-ring);
  outline-offset: 1px;
}

/* Responsive */
@media (max-width: 768px) {
  .post-card__header { height: 140px; }
  .post-card__body { padding: 1.2rem; }
  .post-card__title { font-size: 1.1rem; }
  .post-card__excerpt { font-size: 0.85rem; -webkit-line-clamp: 2; line-clamp: 2; }
  .post-card__meta { font-size: 0.75rem; margin-bottom: 0.8rem; }
  .post-card__tag { font-size: 0.7rem; padding: 0.2rem 0.6rem; }
}

@media (max-width: 480px) {
  .post-card__header { height: 120px; }
  .post-card__body { padding: 1rem; }
  .post-card__title { font-size: 1rem; margin-bottom: 0.4rem; }
  .post-card__excerpt { font-size: 0.8rem; margin-bottom: 0.8rem; }
  .post-card__meta { margin-bottom: 0.6rem; }
  .post-card__tags { gap: 0.4rem; }
}

@media (max-width: 320px) {
  .post-card__body { padding: 0.8rem; }
  .post-card__title { font-size: 0.95rem; }
  .post-card__excerpt { font-size: 0.75rem; }
}

/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .post-card,
  .post-card::after,
  .post-card__image,
  .post-card__title,
  .post-card__tag {
    transition: none;
  }

  .post-card:hover {
    transform: none;
  }

  .post-card:hover .post-card__image {
    transform: none;
  }

  .post-card__tag:hover {
    transform: none;
  }
}
</style>
