<template>
  <div class="categories-page">
    <header class="header animated-header">
      <h1 class="header-title">文章分类</h1>
      <p class="header-subtitle">共 {{ totalCategories }} 个分类</p>
    </header>
    
    <div v-if="blogStore.categoriesLoading" class="loading-state">
      <LoadingSpinner text="加载中..." />
    </div>
    
    <div v-else-if="totalCategories > 0" class="categories-container animated-card">
      <!-- 分类网格 -->
      <div class="categories-grid">
        <CategoryCard
          v-for="(category, index) in paginatedCategories"
          :key="category.name"
          :category="category"
          :index="index"
        />
      </div>
      
      <!-- 分页控件 -->
      <Pagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:current-page="handlePageChange"
      />
    </div>
    
    <div v-else class="empty-state">
      <i class="fa fa-folder-open text-4xl mb-4"></i>
      <p>暂无分类</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import CategoryCard from '@/components/business/CategoryCard.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import Pagination from '@/components/base/Pagination.vue'
import { useBlogStore } from '@/stores/modules/blog'
import { setPageMetadata } from '@/utils/metadata'

const blogStore = useBlogStore()

// 分页配置
const itemsPerPage = 8
const currentPage = ref(1)

// 计算属性
const totalCategories = computed(() => blogStore.categories.length)

const totalPages = computed(() => {
  return Math.ceil(totalCategories.value / itemsPerPage)
})

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return blogStore.categoriesWithCount.slice(start, end)
})

// 分页方法
const handlePageChange = (page) => {
  currentPage.value = page
  scrollToTop()
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 设置页面元数据
const updateMetadata = () => {
  setPageMetadata({
    title: '文章分类',
    description: `Fantasy Flowers博客所有文章分类，共${totalCategories.value}个分类`,
    keywords: '分类,博客分类,文章分类'
  })
}

onMounted(async () => {
  // 如果分类列表为空，先加载分类
  if (blogStore.categories.length === 0) {
    try {
      await blogStore.fetchCategories()
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  }
  updateMetadata()
})
</script>

<style scoped>
/* 页面基础动画 */
.categories-page {
  animation: fadeIn 0.5s ease-in-out;
  padding-bottom: 2rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 头部样式 */
.header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
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

.header-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #F8FAFC;
}

.header-subtitle {
  color: #94A3B8;
  font-size: clamp(1rem, 2vw, 1.2rem);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #94A3B8;
}

/* 分类容器动画 */
.categories-container {
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

/* 分类网格 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* CSS removed */

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 4rem 2rem;
  color: #94A3B8;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

/* 响应式设计 */
@media (min-width: 1200px) and (max-width: 1599px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem;
  }
}

@media (max-width: 767px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .pagination-controls {
    gap: 1rem;
  }
  
  .pagination-button {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
  
  .pagination-info {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .header {
    margin-bottom: 1.5rem;
  }
  
  .pagination-controls {
    gap: 0.8rem;
    margin-top: 1.5rem;
  }
}
</style>
