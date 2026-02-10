<!--
  PopularTags Component
  
  独立的热门标签组件，用于显示指定数量的热门标签。
  
  功能：
  - 接收标签数据并按文章数量排序
  - 显示前N个标签（默认4个）
  - 支持点击选择功能
  - 支持高亮当前选中标签
  
  Props:
  - tags: 标签数据数组 { name: string, count: number }[]
  - limit: 显示标签数量限制，默认4
  - selectedTag: 当前选中的标签名称
  
  Events:
  - tag-selected: 点击标签时触发，参数为标签名称
-->

<template>
  <div class="popular-tags">
    <!-- 无数据提示 -->
    <div v-if="!topTags || topTags.length === 0" class="empty-message">
      暂无标签
    </div>
    
    <!-- 标签列表 -->
    <div class="tags-container">
      <span
        v-for="tag in topTags"
        :key="tag.name"
        class="tag-item"
        :class="{ active: selectedTag === tag.name }"
        @click="handleTagClick(tag.name)"
      >
        {{ tag.name }}
        <span class="tag-count">{{ tag.count }}</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 组件 Props 定义
 * @typedef {Object} TagItem
 * @property {string} name - 标签名称
 * @property {number} count - 文章数量
 */

/**
 * @type {Object} Props
 * @property {TagItem[]} tags - 标签数据数组
 * @property {number} [limit=4] - 显示数量限制
 * @property {string|null} [selectedTag=null] - 当前选中的标签
 */
const props = defineProps({
  tags: {
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
    default: 4,
    validator: (value) => value > 0
  },
  selectedTag: {
    type: String,
    default: null
  }
})

/**
 * 组件事件定义
 */
const emit = defineEmits(['tag-selected'])

/**
 * 计算属性：获取排序后的前N个标签
 * 按文章数量降序排列
 */
const topTags = computed(() => {
  try {
    if (!props.tags || !Array.isArray(props.tags)) {
      return []
    }
    
    // 按文章数量降序排序，并取前N个
    return [...props.tags]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, props.limit)
  } catch (error) {
    console.error('PopularTags: Error processing tags', error)
    return []
  }
})

/**
 * 处理标签点击事件
 * @param {string} tagName - 被点击的标签名称
 */
const handleTagClick = (tagName) => {
  if (!tagName) {
    console.warn('PopularTags: Invalid tag name')
    return
  }
  
  emit('tag-selected', tagName)
}
</script>

<style scoped>
.popular-tags {
  width: 100%;
}

.empty-message {
  color: #94A3B8;
  font-size: 0.9rem;
  padding: 1rem;
  text-align: center;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: rgba(59, 130, 246, 0.2);
  color: #93C5FD;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.tag-item:hover {
  background-color: rgba(59, 130, 246, 0.4);
  color: #F8FAFC;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.tag-item.active {
  background-color: rgba(59, 130, 246, 0.6);
  color: #F8FAFC;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.tag-count {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* 响应式设计优化 */
@media (max-width: 1024px) {
  .tags-container {
    gap: 0.5rem;
  }
}

@media (max-width: 768px) {
  .tag-item {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .tag-count {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .tag-item {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
  
  .tag-count {
    font-size: 0.65rem;
  }
}

@media (max-width: 320px) {
  .tag-item {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
}
</style>
