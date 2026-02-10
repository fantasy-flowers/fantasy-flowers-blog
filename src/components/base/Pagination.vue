
<template>
  <nav v-if="totalPages > 1" class="pagination-container" aria-label="Pagination">
    <!-- Previous Button -->
    <button 
      class="pagination-btn nav-btn"
      :disabled="currentPage === 1"
      @click="handlePageChange(currentPage - 1)"
      aria-label="Previous page"
    >
      &lt;
    </button>

    <!-- Page Numbers -->
    <template v-for="(item, index) in pageNumbers" :key="index">
      <span v-if="item === '...'" class="pagination-ellipsis">
        ...
      </span>
      
      <button 
        v-else 
        class="pagination-btn number-btn"
        :class="{ active: item === currentPage }"
        @click="handlePageChange(item)"
        :aria-current="item === currentPage ? 'page' : undefined"
      >
        {{ item }}
      </button>
    </template>

    <!-- Next Button -->
    <button 
      class="pagination-btn nav-btn"
      :disabled="currentPage === totalPages"
      @click="handlePageChange(currentPage + 1)"
      aria-label="Next page"
    >
      &gt;
    </button>
  </nav>
</template>

<script setup>
import { toRefs } from 'vue'
import { usePagination } from '@/composables/usePagination'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['pageChange'])

const { currentPage, totalPages } = toRefs(props)
const { pageNumbers } = usePagination(currentPage, totalPages)

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    emit('pageChange', page)
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 1rem 0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border-radius: 0.5rem; /* rounded-lg */
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: transparent;
  border: 1px solid transparent;
  color: #94a3b8; /* text-slate-400 */
}

/* Number buttons hover effect */
.number-btn:hover:not(.active) {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Active state for current page */
.pagination-btn.active {
  background-color: #3b82f6; /* bg-blue-500 */
  color: #ffffff;
  border-color: #3b82f6;
  pointer-events: none;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

/* Navigation Arrows */
.nav-btn {
  font-family: monospace;
  font-weight: bold;
}

.nav-btn:hover:not(:disabled) {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

.pagination-ellipsis {
  color: #64748b; /* text-slate-500 */
  font-weight: bold;
  letter-spacing: 1px;
  padding: 0 0.25rem;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .pagination-container {
    gap: 0.25rem;
  }
  
  .pagination-btn {
    min-width: 32px;
    height: 32px;
    font-size: 0.85rem;
    border-radius: 0.375rem; /* rounded-md */
  }
}
</style>
