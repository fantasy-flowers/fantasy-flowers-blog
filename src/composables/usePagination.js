
import { computed } from 'vue'

/**
 * Generates the array of page numbers to display.
 * @param {number} currentPage Current active page
 * @param {number} totalPages Total number of pages
 * @returns {Array<number|string>} Array of page numbers and "..." strings
 */
function generatePageNumbers(currentPage, totalPages) {
    // Case 1: Few pages, show all
    if (totalPages < 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Case 2: Many pages (>= 7)

    // Case A: Head (Current page is close to start, <= 4)
    if (currentPage <= 4) {
        return [1, 2, 3, 4, '...', totalPages]
    }

    // Case B: Tail (Current page is close to end, >= totalPages - 3)
    if (currentPage >= totalPages - 3) {
        return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    // Case C: Middle
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
}

/**
 * Vue Composable for Pagination Logic
 * @param {import('vue').Ref<number> | number} currentPageRef 
 * @param {import('vue').Ref<number> | number} totalPagesRef 
 */
export function usePagination(currentPageRef, totalPagesRef) {
    // Handle both ref objects and raw values by using unref-like access in computed
    // Note: Since we are in a composable, we usually expect refs or getters.
    // For simplicity, we assume they are reactive sources passed to computed.

    const pageNumbers = computed(() => {
        const current = typeof currentPageRef === 'object' ? currentPageRef.value : currentPageRef
        const total = typeof totalPagesRef === 'object' ? totalPagesRef.value : totalPagesRef
        return generatePageNumbers(current, total)
    })

    return {
        pageNumbers
    }
}
