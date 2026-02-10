<template>
  <div class="post-card card-hover" @click="navigateToPost(post.id)">
    <div class="post-card-header">
      <img 
        :src="getImageUrl(post.cover_image || post.image)" 
        :alt="post.title" 
        class="post-card-image"
        loading="lazy"
      >
    </div>
    <div class="post-card-body">
      <h3 class="post-card-title">{{ post.title }}</h3>
      <div class="post-card-meta">
        <span>{{ formatDate(post.publish_time || post.date) }}</span>
        <span>{{ post.view_count || post.views || 0 }} 阅读</span>
      </div>
      <p class="post-card-excerpt">{{ post.summary || post.excerpt }}</p>
      <div class="post-card-tags">
        <span 
          v-for="tag in displayTags" 
          :key="tag.id || tag"
          class="post-card-tag"
          @click.stop="navigateToTag(tag.name || tag)"
        >
          {{ tag.name || tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getImageUrl } from '@/utils/imageUrl'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const router = useRouter()

// 处理标签显示（兼容新旧格式）
const displayTags = computed(() => {
  if (!props.post.tags) return []
  return Array.isArray(props.post.tags) ? props.post.tags : []
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const navigateToPost = (postId) => {
  router.push({ name: 'post-detail', params: { id: postId } })
}

const navigateToTag = (tagName) => {
  router.push({ name: 'tag', params: { name: tagName } })
}
</script><style sco
ped>
.post-card {
  background-color: rgba(30, 42, 58, 0.6);
  /* backdrop-filter removed for GPU optimization */
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, border-color 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 使用伪元素处理阴影，减少重绘开销 */
.post-card::after {
  content: '';
  position: absolute;
  inset: 0;
  box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.2);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: -1;
  border-radius: 12px;
}

.post-card:hover {
  transform: translateY(-4px);
  border-color: rgba(139, 92, 246, 0.3);
}

.post-card:hover::after {
  opacity: 1;
}

.post-card-header {
  height: 160px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  /* 创建独立合成层，优化 GPU 性能 */
  will-change: transform;
  transform: translateZ(0);
}

/* 图片缩放优化 - 启用硬件加速 */
.post-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  /* 提示浏览器优化 transform 属性 */
  will-change: transform;
  /* 启用硬件加速，创建独立的合成层 */
  transform: translateZ(0);
  /* 优化图片渲染质量 */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.post-card:hover .post-card-image {
  /* 使用 translateZ(0) 保持硬件加速 */
  transform: scale(1.05) translateZ(0);
}

/* 悬停结束后清理 will-change，释放 GPU 资源 */
.post-card:not(:hover) .post-card-image {
  will-change: auto;
}

.post-card-body {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
  color: #F8FAFC;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card:hover .post-card-title {
  color: #EC4899;
}

.post-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #94A3B8;
}

.post-card-excerpt {
  color: #CBD5E1;
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

.post-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
}

.post-card-tag {
  background-color: rgba(139, 92, 246, 0.2);
  color: #C4B5FD;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.post-card-tag:hover {
  background-color: rgba(139, 92, 246, 0.4);
  color: #F8FAFC;
  transform: translateY(-1px);
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .post-card-header {
    height: 140px;
  }
  
  .post-card-body {
    padding: 1.2rem;
  }
  
  .post-card-title {
    font-size: 1.1rem;
  }
  
  .post-card-excerpt {
    font-size: 0.85rem;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
  
  .post-card-meta {
    font-size: 0.75rem;
    margin-bottom: 0.8rem;
  }
  
  .post-card-tag {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
  }
}

@media (max-width: 480px) {
  .post-card-header {
    height: 120px;
  }
  
  .post-card-body {
    padding: 1rem;
  }
  
  .post-card-title {
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }
  
  .post-card-excerpt {
    font-size: 0.8rem;
    margin-bottom: 0.8rem;
  }
  
  .post-card-meta {
    margin-bottom: 0.6rem;
  }
  
  .post-card-tags {
    gap: 0.4rem;
  }
}

@media (max-width: 320px) {
  .post-card-body {
    padding: 0.8rem;
  }
  
  .post-card-title {
    font-size: 0.95rem;
  }
  
  .post-card-excerpt {
    font-size: 0.75rem;
  }
}
</style>