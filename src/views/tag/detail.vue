<template>
  <AnimatedContainer :duration="500">
    <div class="tag-page">
      <NavigationControls />
      <AnimatedHeader :duration="600">
        <header class="header">
          <h1 class="header-title">标签: {{ tagName }}</h1>
          <p class="header-subtitle">共 {{ sortedPosts.length }} 篇文章</p>
          
          <!-- 排序控件 -->
          <div class="sort-controls">
            <button 
              class="sort-button"
              :class="{ active: sortBy === 'time' }"
              @click="sortBy = 'time'"
            >
              <i class="fa fa-calendar"></i>
              <span>最新发布</span>
            </button>
            <button 
              class="sort-button"
              :class="{ active: sortBy === 'views' }"
              @click="sortBy = 'views'"
            >
              <i class="fa fa-eye"></i>
              <span>最多阅读</span>
            </button>
          </div>
        </header>
      </AnimatedHeader>
      
      <AnimatedGrid v-if="sortedPosts.length > 0" :duration="600" :delay="200">
        <PostCard 
          v-for="post in paginatedPosts" 
          :key="post.id" 
          :post="post"
        />
        <template #pagination>
          <Pagination 
            v-if="totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            @update:current-page="handlePageChange"
          />
        </template>
      </AnimatedGrid>
      
      <div v-else class="text-center py-8 text-gray-400">
        <i class="fa fa-tags text-4xl mb-4"></i>
        <p>该标签下暂无文章</p>
      </div>
    </div>
  </AnimatedContainer>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import PostCard from '@/components/business/PostCard.vue'
import Pagination from '@/components/base/Pagination.vue'
import NavigationControls from '@/components/base/NavigationControls.vue'
import AnimatedContainer from '@/components/animations/AnimatedContainer.vue'
import AnimatedHeader from '@/components/animations/AnimatedHeader.vue'
import AnimatedGrid from '@/components/animations/AnimatedGrid.vue'
import { useBlogStore } from '@/stores/modules/blog'
import { setPageMetadata } from '@/utils/metadata'

const route = useRoute()
const blogStore = useBlogStore()

// 排序状态
const sortBy = ref('time') // 'time' or 'views'

const tagName = computed(() => route.params.name)
const tagPosts = computed(() => {
  const name = tagName.value
  if (!name) return []
  return blogStore.getPostsByTag(name)
})

// 排序后的文章列表
const sortedPosts = computed(() => {
  const posts = [...tagPosts.value]
  
  if (sortBy.value === 'time') {
    // 按发布时间降序排序
    return posts.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime()
      const timeB = new Date(b.created_at).getTime()
      return timeB - timeA
    })
  } else if (sortBy.value === 'views') {
    // 按阅读量降序排序
    return posts.sort((a, b) => {
      const viewsA = a.view_count || 0
      const viewsB = b.view_count || 0
      return viewsB - viewsA
    })
  }
  
  return posts
})

// 分页设置
const currentPage = ref(1)
const itemsPerPage = 6

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(sortedPosts.value.length / itemsPerPage)
})

// 获取当前页文章
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedPosts.value.slice(start, end)
})

// 处理页码切换
const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 设置页面元数据
const updateMetadata = () => {
  setPageMetadata({
    title: `标签: ${tagName.value}`,
    description: `Fantasy Flowers博客${tagName.value}标签下的文章，共${tagPosts.value.length}篇文章`,
    keywords: `${tagName.value},标签,博客文章`
  })
}

// 加载文章数据
const ensureDataLoaded = async () => {
  // 如果文章列表为空且未在加载中，则加载数据
  // D2：标签页与分类页同属分类加载场景，使用独立的 categoryLoading 判断
  if (blogStore.posts.length === 0 && !blogStore.categoryLoading) {
    await blogStore.fetchCategoryArticles()
  }
}

onMounted(async () => {
  await ensureDataLoaded()
  updateMetadata()
})

// 监听标签变化，更新元数据
watch(tagName, async () => {
  currentPage.value = 1
  // 标签变化时通常不需要重新加载所有文章
  await ensureDataLoaded()
  updateMetadata()
})
</script>

<style scoped>
/* 页面基础动画 */
.tag-page {
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

/* 排序控件样式 */
.sort-controls {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  margin-top: 1.2rem;
}

.sort-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  background-color: rgba(30, 42, 58, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94A3B8;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.sort-button:hover {
  background-color: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #E2E8F0;
  transform: translateY(-2px);
}

.sort-button.active {
  background-color: rgba(59, 130, 246, 0.4);
  border-color: #3B82F6;
  color: #F8FAFC;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.sort-button i {
  font-size: 1rem;
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
  
  .sort-controls {
    gap: 0.6rem;
    margin-top: 1rem;
  }
  
  .sort-button {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
  
  .sort-button i {
    font-size: 0.9rem;
  }
}
</style>
