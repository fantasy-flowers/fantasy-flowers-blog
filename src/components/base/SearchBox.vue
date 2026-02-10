<template>
  <div class="search-container">
    <i class="fa fa-search search-icon"></i>
    <input
      type="text"
      id="search-input"
      name="search"
      placeholder="搜索文章..."
      class="search-input"
      v-model="searchQuery"
      @input="onSearchInput"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useBlogStore } from '@/stores/modules/blog'
import { useDebounce } from '@/composables/useDebounce'

const blogStore = useBlogStore()
const searchQuery = ref('')

// 初始化时从 store 获取当前搜索查询
onMounted(() => {
  searchQuery.value = blogStore.searchQuery || ''
})

// 监听 store 中的搜索查询变化
watch(() => blogStore.searchQuery, (newQuery) => {
  // 只在外部更改时更新（避免循环）
  if (newQuery !== searchQuery.value) {
    searchQuery.value = newQuery || ''
  }
})

// 创建防抖搜索函数（300ms 延迟）
const debouncedSearch = useDebounce((value) => {
  blogStore.setSearchQuery(value)
}, 300)

const onSearchInput = () => {
  debouncedSearch(searchQuery.value)
}
</script>

<style scoped>
.search-container {
  position: relative;
  margin-bottom: 1.5rem;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background-color: rgba(30, 42, 58, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #F8FAFC;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px); /* 保留用于搜索框 */
}

.search-input:focus {
  outline: none;
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  background-color: rgba(30, 42, 58, 0.9);
}

.search-input::placeholder {
  color: #94A3B8;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8;
  transition: color 0.3s ease;
  z-index: 1;
}

.search-input:focus + .search-icon,
.search-container:hover .search-icon {
  color: #8B5CF6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-container {
    margin-bottom: 1.2rem;
  }
  
  .search-input {
    padding: 0.7rem 0.9rem 0.7rem 2.3rem;
    font-size: 0.85rem;
  }
  
  .search-icon {
    left: 0.7rem;
  }
}

@media (max-width: 480px) {
  .search-container {
    margin-bottom: 1rem;
  }
  
  .search-input {
    padding: 0.6rem 0.8rem 0.6rem 2.1rem;
    font-size: 0.8rem;
  }
  
  .search-icon {
    left: 0.6rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 320px) {
  .search-input {
    padding: 0.5rem 0.7rem 0.5rem 2rem;
    font-size: 0.75rem;
  }
  
  .search-icon {
    left: 0.5rem;
    font-size: 0.85rem;
  }
}
</style>