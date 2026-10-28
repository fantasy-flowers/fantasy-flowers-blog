<template>
  <AnimatedContainer :duration="500">
    <div class="tag-page">
      <NavigationControls />
      <AnimatedHeader :duration="600">
        <header class="header">
          <h1 class="header-title">标签: {{ tagName }}</h1>
          <p class="header-subtitle">共 {{ displayedTotal }} 篇文章</p>
          
          <!-- 排序控件 -->
          <div class="sort-controls">
            <button 
              class="sort-button"
              :class="{ active: sortBy === 'time' }"
              @click="changeSort('time')"
            >
              <i class="fa fa-calendar"></i>
              <span>最新发布</span>
            </button>
            <button 
              class="sort-button"
              :class="{ active: sortBy === 'views' }"
              @click="changeSort('views')"
            >
              <i class="fa fa-eye"></i>
              <span>最多阅读</span>
            </button>
          </div>
        </header>
      </AnimatedHeader>
      
      <AnimatedGrid v-if="displayedPosts.length > 0" :duration="600" :delay="200">
        <PostCard 
          v-for="post in displayedPosts" 
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

const tagName = computed(() => route.params?.name || '')

// 分页设置
const currentPage = ref(1)
const itemsPerPage = 6

// B1：服务端分页。dataReady 门控展示数据，避免展示其他上下文（首页/其他标签）的旧数据
const dataReady = ref(false)

const displayedPosts = computed(() => {
  return dataReady.value ? blogStore.posts : []
})

const displayedTotal = computed(() => {
  return dataReady.value ? blogStore.postsTotal : 0
})

// 计算总页数（服务端 total）
const totalPages = computed(() => {
  return Math.ceil(displayedTotal.value / itemsPerPage)
})

// 请求序号守卫：防止快速切换标签/排序时的过期响应回填
let loadSeq = 0

/**
 * 由标签名解析标签 id；标签列表未加载时先拉取列表
 * @returns {Promise<number|null>} 标签 id，找不到返回 null（等价于旧客户端过滤的 miss）
 */
const resolveTagId = async () => {
  const name = tagName.value
  if (!name) return null

  let tag = blogStore.tags.find(t => t.name === name)
  if (!tag) {
    await blogStore.fetchTags()
    tag = blogStore.tags.find(t => t.name === name)
  }
  return tag ? tag.id : null
}

/**
 * B1：按服务端分页加载当前标签下文章
 * @param {number} page - 页码
 * @param {boolean} hideStale - 切换标签（上下文变化）时先隐藏旧数据，避免闪现其他标签的文章
 */
const loadPage = async (page, hideStale = false) => {
  const seq = ++loadSeq

  const tagId = await resolveTagId()
  if (seq !== loadSeq) return

  if (tagId == null) {
    // 标签不存在：与旧客户端过滤 miss 一致——空结果呈现
    dataReady.value = false
    return
  }

  if (hideStale) {
    dataReady.value = false
  }

  await blogStore.fetchArticlesPage({
    tagId,
    page,
    pageSize: itemsPerPage,
    sortBy: sortBy.value
  })

  if (seq !== loadSeq) return
  dataReady.value = true
}

// 切换排序：重置到第 1 页并重新请求（后端按 sortBy 排序，语义与旧客户端排序一致）
const changeSort = async (value) => {
  if (sortBy.value === value) return
  sortBy.value = value
  currentPage.value = 1
  await loadPage(1)
}

// 处理页码切换
const handlePageChange = async (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
  await loadPage(page)
}

// 设置页面元数据
const updateMetadata = () => {
  setPageMetadata({
    title: `标签: ${tagName.value}`,
    description: `Fantasy Flowers博客${tagName.value}标签下的文章，共${displayedTotal.value}篇文章`,
    keywords: `${tagName.value},标签,博客文章`
  })
}

onMounted(async () => {
  await loadPage(1, true)
  updateMetadata()
})

// 监听标签变化，重置页码并重新请求
watch(tagName, async () => {
  currentPage.value = 1
  await loadPage(1, true)
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
  background-color: var(--blog-bg-card);
  border: 1px solid var(--blog-border);
  color: var(--blog-gray);
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
  border-color: var(--blog-blue-strong);
  color: var(--blog-text-bright);
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
