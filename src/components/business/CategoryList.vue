<!--
  CategoryList Component
  
  独立的文章分类列表组件，用于显示指定数量的文章分类项。
  
  功能：
  - 接收分类数据并按文章数量排序
  - 显示前N个分类项（默认3个）
  - 支持点击选择功能
  - 支持高亮当前选中分类
  
  Props:
  - categories: 分类数据数组 { name: string, count: number }[]
  - limit: 显示分类数量限制，默认3
  - selectedCategory: 当前选中的分类名称
  
  Events:
  - category-selected: 点击分类时触发，参数为分类名称
-->

<template>
  <div class="category-list">
    <!-- 无数据提示 -->
    <div v-if="!topCategories || topCategories.length === 0" class="empty-message">
      暂无分类
    </div>
    
    <!-- 分类列表 -->
    <div
      v-for="category in topCategories"
      :key="category.name"
      class="category-item"
      :class="{ active: selectedCategory === category.name }"
      @click="handleCategoryClick(category.name)"
    >
      <i class="fa-regular fa-folder"></i>
      <span>{{ category.name }}</span>
      <span class="ml-auto text-xs">{{ category.count }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 组件 Props 定义
 * @typedef {Object} CategoryItem
 * @property {string} name - 分类名称
 * @property {number} count - 文章数量
 */

/**
 * @type {Object} Props
 * @property {CategoryItem[]} categories - 分类数据数组
 * @property {number} [limit=3] - 显示数量限制
 * @property {string|null} [selectedCategory=null] - 当前选中的分类
 */
const props = defineProps({
  categories: {
    type: Array,
    required: true,
    default: () => [],
    validator: (value) => {
      // 验证数组中的每个对象是否包含必需的属性
      return value.every(item => 
        typeof item === 'object' && 
        'name' in item && 
        'count' in item
      )
    }
  },
  limit: {
    type: Number,
    default: 3,
    validator: (value) => value > 0
  },
  selectedCategory: {
    type: String,
    default: null
  }
})

/**
 * 组件事件定义
 */
const emit = defineEmits(['category-selected'])

/**
 * 计算属性：获取排序后的前N个分类
 * 按文章数量降序排列
 */
const topCategories = computed(() => {
  try {
    if (!props.categories || !Array.isArray(props.categories)) {
      return []
    }
    
    // 按文章数量降序排序，并取前N个
    return [...props.categories]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, props.limit)
  } catch (error) {
    console.error('CategoryList: Error processing categories', error)
    return []
  }
})

/**
 * 处理分类点击事件
 * @param {string} categoryName - 被点击的分类名称
 */
const handleCategoryClick = (categoryName) => {
  if (!categoryName) {
    console.warn('CategoryList: Invalid category name')
    return
  }
  
  emit('category-selected', categoryName)
}
</script>

<style scoped>
.category-list {
  width: 100%;
}

.empty-message {
  color: var(--blog-gray);
  font-size: 0.9rem;
  padding: 1rem;
  text-align: center;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--blog-radius-md);
  margin-bottom: 8px;
  color: #E2E8F0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  border: 1px solid transparent;
}

.category-item:hover {
  background-color: rgba(59, 130, 246, 0.2);
  color: var(--blog-text-bright);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.category-item.active {
  background-color: rgba(59, 130, 246, 0.3);
  color: var(--blog-blue-light);
  border-color: var(--blog-blue-strong);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  font-weight: 600;
}

.category-item i {
  flex-shrink: 0;
}

.ml-auto {
  margin-left: auto;
}

.text-xs {
  font-size: 0.75rem;
}

/* 响应式设计优化 */
@media (max-width: 1024px) {
  .category-item {
    display: inline-flex;
    margin-right: 1rem;
    margin-bottom: 0.6rem;
    padding: 0.6rem 0.8rem;
  }
}

@media (max-width: 768px) {
  .category-item {
    margin-right: 0.8rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .category-item {
    margin-right: 0.5rem;
    margin-bottom: 0.4rem;
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 320px) {
  .category-item {
    margin-right: 0.4rem;
    margin-bottom: 0.3rem;
    padding: 0.3rem 0.5rem;
    font-size: 0.8rem;
  }
}
</style>
