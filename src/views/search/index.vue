<template>
  <div class="search-page">
    <header class="header animated-header">
      <h1 class="header-title">搜索文章</h1>
      <p class="header-subtitle" v-if="activeQuery">
        关键词: "{{ activeQuery }}" - 共 {{ displayedCount }} 篇文章
      </p>
      <p class="header-subtitle" v-else>
        请输入搜索关键词
      </p>
    </header>
    
    <div class="search-box-wrapper animated-card">
      <SearchBox
        ref="searchBoxRef"
        v-model="localSearchQuery"
        placeholder="搜索文章..."
        :debounce-ms="300"
        @search="handleSearch"
      />
    </div>
    
    <div v-if="activeQuery && displayedPosts.length > 0" class="posts-grid-container animated-card" style="animation-delay: 0.4s;">
      <div class="posts-wrapper">
        <div class="posts-grid">
            <PostCard 
              v-for="post in displayedPosts" 
              :key="post.id" 
              :post="post"
            />
        </div>
        
        <Pagination 
          v-if="totalPages > 1"
          :current-page="currentPage"
          :total-pages="totalPages"
          @update:current-page="handlePageChange"
        />
      </div>
    </div>
    
    <div v-else-if="activeQuery && displayedPosts.length === 0" class="empty-search-container">
      <div class="empty-search-content">
        <img src="/icon/search.gif" class="empty-search-icon" alt="搜索图标">
        <p class="empty-search-text">没有找到包含 "{{ activeQuery }}" 的文章</p>
        <p class="empty-search-subtext">请尝试使用其他关键词</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, nextTick } from 'vue'
import SearchBox from '@/components/base/SearchBox.vue'
import PostCard from '@/components/business/PostCard.vue'
import Pagination from '@/components/base/Pagination.vue'
import { useBlogStore } from '@/stores/modules/blog'
import { setPageMetadata } from '@/utils/metadata'

const blogStore = useBlogStore()
const searchBoxRef = ref(null)
const localSearchQuery = ref(blogStore.searchQuery || '')

// C1：服务端搜索状态。serverCompleted=false 期间沿用本地过滤作为临时呈现，
// 服务端结果（title+summary+content 命中）落库后切换为服务端分页数据
const serverCompleted = ref(false)
const activeQuery = ref('')
let searchSeq = 0

// 分页设置
const currentPage = ref(1)
const itemsPerPage = 6

// 展示列表：服务端阶段直接展示当前页数据；本地阶段沿用原客户端分页 slice
const displayedPosts = computed(() => {
  if (serverCompleted.value) {
    return blogStore.posts
  }
  const start = (currentPage.value - 1) * itemsPerPage
  return blogStore.filteredPosts.slice(start, start + itemsPerPage)
})

// 副标题计数：服务端阶段用服务端 total，本地阶段沿用 filteredPosts 长度（格式不变）
const displayedCount = computed(() => {
  return serverCompleted.value ? blogStore.postsTotal : blogStore.filteredPosts.length
})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(displayedCount.value / itemsPerPage)
})

/**
 * 处理搜索事件（SearchBox 自带 300ms 防抖，保持不变）
 * C1：先本地过滤即时反馈，再请求服务端搜索（title+summary+content）
 * @param {string} query - 搜索关键词
 */
const handleSearch = async (query) => {
  const keyword = (query || '').trim()
  const seq = ++searchSeq
  activeQuery.value = keyword
  currentPage.value = 1

  if (!keyword) {
    serverCompleted.value = false
    blogStore.setSearchQuery('')
    updateMetadata()
    return
  }

  // 本地过滤：服务端结果返回前的临时呈现，保持输入过程的即时反馈
  blogStore.setSearchQuery(keyword)
  updateMetadata()

  // 服务端搜索（第 1 页）
  await blogStore.searchArticles(keyword, 1)

  // 过期响应（期间又触发了新搜索）不落库
  if (seq !== searchSeq) return

  serverCompleted.value = true
  // 服务端结果总是第 1 页：本地阶段若已翻页，回正页码，避免页号与数据错位
  currentPage.value = 1
  // 清空客户端过滤：否则按 title 过滤会隐藏服务端按 title+summary+content 命中的结果
  blogStore.setSearchQuery('')
  updateMetadata()
}

// 处理页码切换
const handlePageChange = async (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })

  // 服务端结果已落库：翻页改为请求服务端对应页
  if (serverCompleted.value && activeQuery.value) {
    const seq = ++searchSeq
    await blogStore.searchArticles(activeQuery.value, page)
    if (seq === searchSeq) {
      blogStore.setSearchQuery('')
    }
  }
}

// 设置页面元数据
const updateMetadata = () => {
  if (activeQuery.value) {
    setPageMetadata({
      title: `搜索: ${activeQuery.value}`,
      description: `Fantasy Flowers博客搜索"${activeQuery.value}"的结果，共${displayedCount.value}篇文章`,
      keywords: `${activeQuery.value},搜索,博客文章`
    })
  } else {
    setPageMetadata({
      title: '搜索',
      description: 'Fantasy Flowers博客搜索页面，搜索您感兴趣的技术文章',
      keywords: '搜索,博客文章,技术文章'
    })
  }
}

onMounted(() => {
  updateMetadata()
  
  // 自动聚焦搜索输入框
  nextTick(() => {
    searchBoxRef.value?.focus()
  })
})
</script>
<style scoped>
/* 页面基础动画 */
.search-page {
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

.search-box-wrapper {
  margin-bottom: 1.5rem;
}

/* 搜索结果为空时的容器样式 */
.empty-search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  width: 100%;
  margin: 2rem 0;
}

.empty-search-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  background-color: var(--blog-bg-card);
  border-radius: var(--blog-radius-lg);
  /* backdrop-filter removed for GPU optimization */
  border: 1px solid var(--blog-border);
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-in-out;
}

.empty-search-icon {
  width: 6rem;
  height: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.empty-search-text {
  font-size: 1.2rem;
  color: #E2E8F0;
  margin-bottom: 0.8rem;
  line-height: 1.5;
}

.empty-search-subtext {
  font-size: 1rem;
  color: var(--blog-gray);
  margin-top: 0;
}

/* 响应式设计 - 平板设备 */
@media (max-width: 1024px) and (min-width: 769px) {
  .empty-search-container {
    min-height: 40vh;
    margin: 1.5rem 0;
  }
  
  .empty-search-content {
    padding: 1.8rem;
    max-width: 450px;
  }
  
  .empty-search-icon {
    width: 8rem;
    height: 6rem;
    margin-bottom: 1.2rem;
  }
  
  .empty-search-text {
    font-size: 1.1rem;
  }
  
  .empty-search-subtext {
    font-size: 0.95rem;
  }
}

/* 响应式设计 - 手机设备 */
@media (max-width: 768px) {
  .empty-search-container {
    min-height: 35vh;
    margin: 1rem 0;
  }
  
  .empty-search-content {
    padding: 1.5rem;
    width: 95%;
  }
  
  .empty-search-icon {
      width: 6rem;
      height: 4rem;
      margin-bottom: 1rem;
    }
  
  .empty-search-text {
    font-size: 1rem;
  }
  
  .empty-search-subtext {
    font-size: 0.9rem;
  }
}

/* 响应式设计 - 小屏手机 */
@media (max-width: 480px) {
  .empty-search-container {
    min-height: 30vh;
    margin: 0.8rem 0;
  }
  
  .empty-search-content {
    padding: 1.2rem;
    width: 98%;
  }
  
  .empty-search-icon {
      width: 6rem;
      height: 4rem;
      margin-bottom: 0.8rem;
    }
  
  .empty-search-text {
    font-size: 0.95rem;
  }
  
  .empty-search-subtext {
    font-size: 0.85rem;
  }
}

/* 响应式设计 - 超小屏手机 */
@media (max-width: 320px) {
  .empty-search-container {
    min-height: 25vh;
    margin: 0.5rem 0;
  }
  
  .empty-search-content {
    padding: 1rem;
    width: 100%;
  }
  
  .empty-search-icon {
    width: 3rem;
    height: 2rem;
    margin-bottom: 0.6rem;
  }
  
  .empty-search-text {
    font-size: 0.9rem;
  }
  
  .empty-search-subtext {
    font-size: 0.8rem;
  }
}

/* 响应式设计 - 大屏设备 */
@media (min-width: 1200px) {
  .empty-search-container {
    min-height: 55vh;
    margin: 2.5rem 0;
  }
  
  .empty-search-content {
    padding: 2.5rem;
    max-width: 550px;
  }
  
  .empty-search-icon {
    width: 10rem;
    height: 6.5rem;
    margin-bottom: 1.8rem;
  }
  
  .empty-search-text {
    font-size: 1.3rem;
  }
  
  .empty-search-subtext {
    font-size: 1.1rem;
  }
}

/* 响应式设计 - 超大屏设备 */
@media (min-width: 1921px) {
  .empty-search-container {
    min-height: 60vh;
    margin: 3rem 0;
  }
  
  .empty-search-content {
    padding: 3rem;
    max-width: 600px;
  }
  
  .empty-search-icon {
    width: 12rem;
    height: 8rem;
    margin-bottom: 2rem;
  }
  
  .empty-search-text {
    font-size: 1.4rem;
  }
  
  .empty-search-subtext {
    font-size: 1.2rem;
  }
}

/* 虚拟滚动样式 */
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

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
