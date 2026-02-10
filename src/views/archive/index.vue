<template>
  <div class="archive-page">
    <!-- 头部标题 -->
    <header class="header animated-header">
      <h1 class="header-title text-gradient">文章归档</h1>
      <p class="header-subtitle">共 {{ blogStore.posts.length }} 篇文章</p>
    </header>
    
    <!-- 加载状态 -->
    <div v-if="blogStore.postsLoading" class="loading-state">
      <LoadingSpinner text="加载中..." />
    </div>
    
    <!-- 文章列表 -->
    <div v-else-if="blogStore.posts.length > 0" class="archive-list animated-card">
      <div 
        v-for="post in blogStore.posts" 
        :key="post.id"
        class="archive-item"
        @click="navigateToPost(post.id)"
      >
        <h3 class="archive-item-title">{{ post.title }}</h3>
        <div class="archive-item-meta">
          <div>
            <span class="mr-4">{{ post.date }}</span>
            <span class="mr-4">{{ post.category }}</span>
            <span>{{ post.views }} 阅读</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fa fa-heart text-pink-400"></i>
            <span>{{ post.likes }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <i class="fa fa-archive text-4xl mb-4"></i>
      <p>暂无文章</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '@/stores/modules/blog'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { setPageMetadata } from '@/utils/metadata'

const router = useRouter()
const blogStore = useBlogStore()

/**
 * 跳转到文章详情页
 * @param {number} postId - 文章ID
 */
const navigateToPost = (postId) => {
  if (router) {
    router.push({ name: 'post-detail', params: { id: postId } })
  } else {
    console.error('Router is not available')
    // 回退方案：使用 window.location
    window.location.href = `/post/${postId}`
  }
}

onMounted(async () => {
  // 确保刷新页面时也能加载文章列表
  // initializeData 方法会自动管理 postsLoading 状态并检查是否已加载
  if (blogStore.posts.length === 0 && !blogStore.postsLoading) {
    await blogStore.initializeData()
  }
  
  // 设置页面元数据
  setPageMetadata({
    title: '文章归档',
    description: `Fantasy Flowers博客文章归档，共${blogStore.posts.length}篇文章`,
    keywords: '文章归档,博客文章,技术文章'
  })
})
</script>

<style scoped>
/* 归档页样式 */
.archive-list {
  background-color: rgba(30, 42, 58, 0.6);
  /* backdrop-filter removed for GPU optimization */
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.archive-item {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.archive-item:last-child {
  border-bottom: none;
}

.archive-item:hover {
  background-color: rgba(15, 23, 42, 0.5);
}

.archive-item-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.archive-item:hover .archive-item-title {
  color: #EC4899;
}

.archive-item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #94A3B8;
}

/* 页面基础动画 */
.archive-page {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 头部下滑动画 */
.header {
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 内容卡片上滑动画 */
.animated-card {
  animation: slideUp 0.6s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
  animation-delay: 0.2s;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #94A3B8;
  animation: slideUp 0.6s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
  animation-delay: 0.2s;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  color: #94A3B8;
  animation: slideUp 0.6s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
  animation-delay: 0.2s;
}

.empty-state i {
  margin-bottom: 1rem;
  font-size: 3rem;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}
</style>

