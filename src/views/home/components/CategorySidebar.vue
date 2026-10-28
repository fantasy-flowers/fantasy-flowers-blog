<template>
  <div class="category-sidebar">
    <!-- 文章分类标题 -->
    <div class="category-title">
      <i class="fa fa-folder"></i>
      <span>文章分类</span>
    </div>
    
    <!-- 使用 CategoryList 组件显示前3个分类 -->
    <CategoryList
      :categories="blogStore.categoriesWithCount"
      :limit="3"
      :selected-category="selectedCategory"
      @category-selected="selectCategory"
    />
    
    <!-- 热门标签标题 -->
    <div class="category-title mt-6">
      <i class="fa fa-tags"></i>
      <span>热门标签</span>
    </div>
    
    <!-- 使用 PopularTags 组件显示前4个标签 -->
    <PopularTags
      :tags="blogStore.tagsWithCount"
      :limit="4"
      :selected-tag="selectedTag"
      @tag-selected="selectTag"
    />
  </div>
</template>

<style scoped>
/* CategorySidebar 样式 - 响应式设计优化 */
.category-sidebar {
  background-color: var(--blog-bg-card);
  /* backdrop-filter removed for GPU optimization */
  border: 1px solid var(--blog-border);
  border-radius: var(--blog-radius-lg);
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 220px;
  height: fit-content;
  position: sticky;
  top: 2rem;
  flex-shrink: 0;
}

.category-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--blog-blue-light);
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.mt-6 {
  margin-top: 1.5rem;
}

/* 响应式设计优化 */
@media (max-width: 1024px) {
  .category-sidebar {
    width: 100%;
    position: static;
    order: -1;
    padding: 1rem 1.2rem;
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 768px) {
  .category-sidebar {
    padding: 1rem;
    margin-bottom: 1.2rem;
  }
  
  .category-title {
    font-size: 1rem;
    margin-bottom: 0.8rem;
  }
}

@media (max-width: 480px) {
  .category-sidebar {
    padding: 0.8rem;
    margin-bottom: 1rem;
  }
}

@media (max-width: 320px) {
  .category-sidebar {
    padding: 0.6rem;
  }
}
</style>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@/stores/modules/blog'
import CategoryList from '@/components/business/CategoryList.vue'
import PopularTags from '@/components/business/PopularTags.vue'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

const selectedCategory = ref(null)
const selectedTag = ref(null)

// 监听路由变化，更新选中的分类和标签
watch(() => route.name, (newName) => {
  if (newName === 'category') {
    selectedCategory.value = route.params.name
    selectedTag.value = null
    blogStore.setSelectedCategory(route.params.name)
    blogStore.setSelectedTag(null)
  } else if (newName === 'tag') {
    selectedCategory.value = null
    selectedTag.value = route.params.name
    blogStore.setSelectedCategory(null)
    blogStore.setSelectedTag(route.params.name)
  } else if (newName === 'home' || newName === 'search') {
    selectedCategory.value = null
    selectedTag.value = null
    blogStore.setSelectedCategory(null)
    blogStore.setSelectedTag(null)
  }
}, { immediate: true })

const selectCategory = (categoryName) => {
  router.push({ name: 'category', params: { name: categoryName } })
}

const selectTag = (tagName) => {
  router.push({ name: 'tag', params: { name: tagName } })
}
</script>