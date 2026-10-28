<template>
  <div class="home-container">
    <header class="header">
      <h1 class="header-title text-gradient">fantasy_flowers's Blog</h1>
      <PoemDisplay />
    </header>
    
    <div class="home-content">
      <div class="posts-main">
        <!-- 加载状态 -->
        <div v-if="blogStore.postsLoading && blogStore.posts.length === 0" class="loading-state">
          <LoadingSpinner text="加载中..." />
        </div>
        
        <!-- 文章列表 -->
        <div v-else-if="blogStore.posts.length > 0" class="posts-grid-container">
          <!-- 虚拟滚动容器 -->
          <!-- 标准分页布局 -->
          <div class="posts-wrapper">
            <ListTransition 
              class="posts-grid"
            >
              <PostCard 
                v-for="post in blogStore.posts" 
                :key="post.id" 
                :post="post"
              />
            </ListTransition>
            
            <Pagination 
              v-if="totalPages > 1"
              :current-page="currentPage"
              :total-pages="totalPages"
              @update:current-page="handlePageChange"
            />
          </div>
        </div>
        
        <div v-else class="empty-state">
          <i class="fa fa-search text-4xl mb-4"></i>
          <p>没有找到匹配的文章</p>
        </div>
      </div>
      
      <CategorySidebar />
    </div>
  </div>
</template>

<script setup>

import { onMounted, computed, ref } from 'vue'
import PostCard from '@/components/business/PostCard.vue'
import PoemDisplay from './components/PoemDisplay.vue'
import CategorySidebar from './components/CategorySidebar.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import Pagination from '@/components/base/Pagination.vue'
import ListTransition from '@/components/animations/ListTransition.vue'
import { useBlogStore } from '@/stores/modules/blog'
import { setPageMetadata } from '@/utils/metadata'

const blogStore = useBlogStore()

// 分页设置
const currentPage = ref(1)
const itemsPerPage = 6

// B1：服务端分页——总页数由服务端 total 计算（服务端 pageSize 与 itemsPerPage 一致）
const totalPages = computed(() => {
  return Math.ceil(blogStore.postsTotal / itemsPerPage)
})

// 处理页码切换：按页请求服务端数据
const handlePageChange = async (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
  await blogStore.fetchArticlesPage({ page, pageSize: itemsPerPage })
}

onMounted(async () => {
  // 清除任何筛选条件（D5：保留既有行为）
  blogStore.clearFilters()

  // B1：首页按页请求（第 1 页，pageSize=6），不再依赖全量列表的客户端 slice
  await blogStore.fetchArticlesPage({ page: 1, pageSize: itemsPerPage })
  
  // 设置页面元数据
  setPageMetadata({
    title: '首页',
    description: 'Fantasy Flowers博客首页，分享前端开发技术文章，包括Vue.js、JavaScript、CSS等内容',
    keywords: 'Vue.js,前端开发,JavaScript,CSS,技术博客'
  })
  
  // 动画完成后清理，减少CPU占用
  const container = document.querySelector('.home-container')
  const header = document.querySelector('.header')
  const content = document.querySelector('.home-content')
  
  // 监听所有动画完成
  let animationCount = 0
  const totalAnimations = 3 // container, header, content
  
  const handleAnimationEnd = () => {
    animationCount++
    if (animationCount === totalAnimations) {
      // 所有动画完成后，移除动画类以释放资源
      container?.classList.add('animation-complete')
      header?.classList.add('animation-complete')
      content?.classList.add('animation-complete')
    }
  }
  
  container?.addEventListener('animationend', handleAnimationEnd, { once: true })
  header?.addEventListener('animationend', handleAnimationEnd, { once: true })
  content?.addEventListener('animationend', handleAnimationEnd, { once: true })
})
</script>

<style scoped>
/* 加载状态样式 */
/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--blog-gray);
}

/* 页面基础动画 - 优化版本 */
.home-container {
  width: 100%;
  max-width: none;
  animation: fadeIn 0.5s ease-in-out;
  animation-fill-mode: forwards;
}

/* 动画完成后移除动画属性，释放CPU资源 */
.home-container.animation-complete {
  animation: none;
}

/* @keyframes fadeIn 已移至全局 _keyframes.css */

/* 头部下滑动画 - 优化版本 */
.header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
  animation: slideDown 0.6s ease-out;
  animation-fill-mode: forwards;
}

/* 动画完成后移除动画属性 */
.header.animation-complete {
  animation: none;
  transform: none;
  opacity: 1;
}

/* @keyframes slideDown 已移至全局 _keyframes.css */

.header-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: bold;
  margin-bottom: 0.5rem;
}



/* 内容区上滑动画 - 优化版本 */
.home-content {
  display: flex;
  gap: 1.5rem;
  width: 100%;
  align-items: flex-start;
  animation: slideUp 0.6s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
  animation-delay: 0.2s;
}

/* 动画完成后移除动画属性 */
.home-content.animation-complete {
  animation: none;
  transform: none;
  opacity: 1;
}

/* @keyframes slideUp 已移至全局 _keyframes.css */

.posts-main {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.posts-grid-container {
  width: 100%;
  margin-bottom: 2rem;
}

/* 虚拟滚动样式已移除 */

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  width: 100%;
  will-change: transform;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--blog-gray);
}

/* 响应式布局优化 */
@media (min-width: 1600px) {
  .posts-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}

@media (min-width: 1200px) and (max-width: 1599px) {
  .posts-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.8rem;
  }
}

@media (min-width: 900px) and (max-width: 1199px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 1024px) {
  .home-content {
    flex-direction: column;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .home-content {
    gap: 1.2rem;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .header {
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }
  
  .home-content {
    gap: 1rem;
  }
  
  .posts-grid {
    gap: 0.8rem;
  }
  
  .empty-state {
    padding: 2rem 0.5rem;
  }
}

/* 列表过渡动画已移至 ListTransition 组件 */
</style>
