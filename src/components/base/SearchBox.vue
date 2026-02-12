<template>
  <div class="search-box" role="search" :aria-label="ariaLabel">
    <i class="fa fa-search search-box__icon" aria-hidden="true"></i>
    <input
      ref="inputRef"
      type="text"
      class="search-box__input"
      :placeholder="placeholder"
      :value="modelValue"
      :aria-label="placeholder"
      aria-autocomplete="list"
      @input="handleInput"
      @keydown.enter="handleSearch"
    />
    <kbd
      v-if="!modelValue"
      class="search-box__shortcut"
      aria-hidden="true"
    >
      Ctrl+K
    </kbd>
  </div>
</template>

<script setup>
/**
 * SearchBox - 搜索输入框组件
 *
 * 提供带防抖功能的搜索输入框，支持 v-model 双向绑定、
 * Ctrl+K 快捷键聚焦、ARIA 无障碍属性。
 *
 * @component
 * @example
 * <SearchBox
 *   v-model="query"
 *   placeholder="搜索文章..."
 *   :debounce-ms="300"
 *   @search="onSearch"
 * />
 */

// ==================== 导入依赖 ====================
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useDebounce } from '@/composables/useDebounce'

// ==================== Props 定义 ====================
const props = defineProps({
  /**
   * 搜索框占位文本
   * @type {string}
   */
  placeholder: {
    type: String,
    default: '搜索文章...'
  },
  /**
   * 防抖延迟时间（毫秒）
   * @type {number}
   */
  debounceMs: {
    type: Number,
    default: 300
  },
  /**
   * 当前搜索值（支持 v-model）
   * @type {string}
   */
  modelValue: {
    type: String,
    default: ''
  }
})

// ==================== Emits 定义 ====================
const emit = defineEmits({
  /**
   * 搜索值变更事件（v-model 绑定）
   * @param {string} value - 新的搜索值
   */
  'update:modelValue': (value) => typeof value === 'string',
  /**
   * 提交搜索事件（防抖后触发或按下 Enter 时触发）
   * @param {string} query - 搜索关键词
   */
  search: (query) => typeof query === 'string'
})

// ==================== 响应式状态 ====================
/** @type {import('vue').Ref<HTMLInputElement|null>} */
const inputRef = ref(null)

// ==================== 防抖搜索 ====================
const debouncedSearch = useDebounce((value) => {
  emit('search', value)
}, props.debounceMs)

// ==================== 方法 ====================
/**
 * 处理输入事件，更新 modelValue 并触发防抖搜索
 * @param {Event} event - 输入事件
 */
const handleInput = (event) => {
  const value = event.target.value
  emit('update:modelValue', value)
  debouncedSearch(value)
}

/**
 * 处理 Enter 键立即搜索
 */
const handleSearch = () => {
  emit('search', props.modelValue)
}

/**
 * 处理全局 Ctrl+K 快捷键聚焦搜索框
 * @param {KeyboardEvent} event
 */
const handleKeydown = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    inputRef.value?.focus()
  }
}

// ==================== ARIA 属性 ====================
const ariaLabel = '搜索'

// ==================== 生命周期 ====================
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// ==================== 暴露给父组件 ====================
defineExpose({
  /** 聚焦搜索输入框 */
  focus: () => inputRef.value?.focus()
})
</script>

<style scoped>
/* Block */
.search-box {
  position: relative;
  margin-bottom: 1.5rem;
  width: 100%;
}

/* Elements */
.search-box__input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background-color: rgba(30, 42, 58, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #F8FAFC;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-box__input:focus {
  outline: none;
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  background-color: rgba(30, 42, 58, 0.9);
}

.search-box__input::placeholder {
  color: #94A3B8;
}

.search-box__icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8;
  transition: color 0.3s ease;
  z-index: 1;
}

.search-box__input:focus ~ .search-box__icon,
.search-box:hover .search-box__icon {
  color: #8B5CF6;
}

.search-box__shortcut {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.15rem 0.4rem;
  font-size: 0.7rem;
  color: #94A3B8;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  pointer-events: none;
  line-height: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-box {
    margin-bottom: 1.2rem;
  }

  .search-box__input {
    padding: 0.7rem 0.9rem 0.7rem 2.3rem;
    font-size: 0.85rem;
  }

  .search-box__icon {
    left: 0.7rem;
  }

  .search-box__shortcut {
    display: none;
  }
}

@media (max-width: 480px) {
  .search-box {
    margin-bottom: 1rem;
  }

  .search-box__input {
    padding: 0.6rem 0.8rem 0.6rem 2.1rem;
    font-size: 0.8rem;
  }

  .search-box__icon {
    left: 0.6rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 320px) {
  .search-box__input {
    padding: 0.5rem 0.7rem 0.5rem 2rem;
    font-size: 0.75rem;
  }

  .search-box__icon {
    left: 0.5rem;
    font-size: 0.85rem;
  }
}

/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .search-box__input,
  .search-box__icon {
    transition: none;
  }
}
</style>
