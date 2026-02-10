import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

/**
 * Virtual scrolling composable for Vue 3 with Grid support
 * Renders only visible items to improve performance
 */
export function useVirtualScroll(items, options = {}) {
  const {
    itemHeight = 450,
    buffer = 3,
    containerRef = null
  } = options

  const scrollTop = ref(0)
  const containerHeight = ref(0)
  const scrollContainer = containerRef || ref(null)

  // Get columns count based on screen width
  const getColumnsCount = () => {
    const width = window.innerWidth
    if (width >= 1600) return 4
    if (width >= 1200) return 3
    if (width >= 900) return 2
    return 1
  }

  const columnsCount = ref(getColumnsCount())

  // Calculate visible range based on rows
  const visibleRange = computed(() => {
    const cols = columnsCount.value
    const rowHeight = itemHeight
    const startRow = Math.floor(scrollTop.value / rowHeight)
    const visibleRows = Math.ceil(containerHeight.value / rowHeight)
    
    const startIndex = Math.max(0, (startRow - buffer) * cols)
    const endIndex = Math.min(items.value.length, (startRow + visibleRows + buffer) * cols)
    
    return { start: startIndex, end: endIndex }
  })

  // Get visible items
  const visibleItems = computed(() => {
    const { start, end } = visibleRange.value
    return items.value.slice(start, end)
  })

  // Calculate total height based on rows
  const totalHeight = computed(() => {
    const cols = columnsCount.value
    const totalRows = Math.ceil(items.value.length / cols)
    return totalRows * itemHeight
  })

  // Calculate offset
  const offsetY = computed(() => {
    const cols = columnsCount.value
    const startRow = Math.floor(visibleRange.value.start / cols)
    return startRow * itemHeight
  })

  // Handle scroll event with requestAnimationFrame throttling
  let scrollTicking = false
  const handleScroll = (event) => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        scrollTop.value = event.target.scrollTop
        scrollTicking = false
      })
      scrollTicking = true
    }
  }

  // Update container height and columns
  const updateDimensions = () => {
    if (scrollContainer.value) {
      containerHeight.value = scrollContainer.value.clientHeight
    }
    columnsCount.value = getColumnsCount()
  }

  // Debounce resize event
  let resizeTimeout = null
  let resizeTicking = false
  const handleResize = () => {
    // Leading edge: immediate update
    if (!resizeTicking) {
      updateDimensions()
      resizeTicking = true
    }
    
    // Trailing edge: debounced update
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    resizeTimeout = setTimeout(() => {
      updateDimensions()
      resizeTicking = false
    }, 150)
  }

  onMounted(() => {
    updateDimensions()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
  })

  // Watch items length changes
  watch(() => items.value.length, () => {
    // Reset scroll position when items change significantly
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = 0
    }
    scrollTop.value = 0
  })

  return {
    scrollContainer,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange
  }
}
