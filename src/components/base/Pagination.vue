<template>
  <nav
    v-if="totalPages > 1"
    class="pagination"
    role="navigation"
    aria-label="分页导航"
    @keydown="handleKeydown"
  >
    <!-- Previous Button -->
    <button
      class="pagination__btn pagination__btn--nav"
      :disabled="currentPage === 1"
      :aria-label="`前往第 ${currentPage - 1} 页`"
      @click="goToPage(currentPage - 1)"
    >
      &lt;
    </button>

    <!-- Page Numbers -->
    <template v-for="(item, index) in pageNumbers" :key="index">
      <span v-if="item === '...'" class="pagination__ellipsis" aria-hidden="true">
        ...
      </span>

      <button
        v-else
        class="pagination__btn pagination__btn--number"
        :class="{ 'pagination__btn--active': item === currentPage }"
        :aria-label="`第 ${item} 页`"
        :aria-current="item === currentPage ? 'page' : undefined"
        @click="goToPage(item)"
      >
        {{ item }}
      </button>
    </template>

    <!-- Next Button -->
    <button
      class="pagination__btn pagination__btn--nav"
      :disabled="currentPage === totalPages"
      :aria-label="`前往第 ${currentPage + 1} 页`"
      @click="goToPage(currentPage + 1)"
    >
      &gt;
    </button>
  </nav>
</template>

<script setup>
/**
 * Pagination - 分页导航组件
 *
 * 提供页码切换功能，支持键盘导航（左右箭头翻页）和屏幕阅读器。
 * 使用 usePagination composable 计算可见页码范围。
 *
 * @component
 * @example
 * <Pagination
 *   :current-page="page"
 *   :total-pages="total"
 *   :max-visible="5"
 *   @update:current-page="page = $event"
 * />
 */
import { toRefs } from 'vue'
import { usePagination } from '@/composables/usePagination'

// ==================== Props 定义 ====================
const props = defineProps({
  /**
   * 当前页码
   * @type {number}
   */
  currentPage: {
    type: Number,
    required: true
  },
  /**
   * 总页数
   * @type {number}
   */
  totalPages: {
    type: Number,
    required: true
  },
  /**
   * 最大可见页码按钮数
   * @type {number}
   */
  maxVisible: {
    type: Number,
    default: 5
  }
})

// ==================== Emits 定义 ====================
const emit = defineEmits({
  /**
   * 页码变更事件
   * @param {number} page - 目标页码，必须为正整数
   */
  'update:currentPage': (page) => {
    return Number.isInteger(page) && page > 0
  }
})

// ==================== 分页逻辑 ====================
const { currentPage, totalPages } = toRefs(props)
const { pageNumbers } = usePagination(currentPage, totalPages)

// ==================== 方法 ====================

/**
 * 跳转到指定页码
 * @param {number} page - 目标页码
 */
const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}

/**
 * 处理键盘导航事件
 * @param {KeyboardEvent} event - 键盘事件
 */
const handleKeydown = (event) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    goToPage(props.currentPage - 1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    goToPage(props.currentPage + 1)
  }
}
</script>

<style scoped>
/* Block */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 1rem 0;
}

/* Element: button (shared) */
.pagination__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: transparent;
  border: 1px solid transparent;
  color: var(--blog-gray);
}

/* Modifier: number button hover */
.pagination__btn--number:hover:not(.pagination__btn--active) {
  color: #ffffff;
  background-color: var(--blog-border);
}

/* Modifier: active page */
.pagination__btn--active {
  background-color: var(--blog-blue-strong);
  color: #ffffff;
  border-color: var(--blog-blue-strong);
  pointer-events: none;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

/* Modifier: nav arrows */
.pagination__btn--nav {
  font-family: monospace;
  font-weight: bold;
}

.pagination__btn--nav:hover:not(:disabled) {
  color: #ffffff;
  background-color: var(--blog-border);
}

.pagination__btn--nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

/* Element: ellipsis */
.pagination__ellipsis {
  color: #64748b;
  font-weight: bold;
  letter-spacing: 1px;
  padding: 0 0.25rem;
}

/* Responsive */
@media (max-width: 480px) {
  .pagination {
    gap: 0.25rem;
  }

  .pagination__btn {
    min-width: 32px;
    height: 32px;
    font-size: 0.85rem;
    border-radius: 0.375rem;
  }
}

/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .pagination__btn {
    transition: none;
  }
}
</style>
