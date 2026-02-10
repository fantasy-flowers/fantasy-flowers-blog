<template>
  <!-- 悬停提示组件 - 仅在侧边栏收起状态下显示 -->
  <transition name="tooltip-fade">
    <div
      v-if="isVisible && isCollapsed"
      class="sidebar-tooltip"
      :class="{ 'left-arrow': isLeftArrow, 'bottom-arrow': isBottomArrow }"
      :style="tooltipStyle"
    >
      {{ text }}
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useSidebarStore } from '@/stores/modules/sidebar'

// 定义组件属性
const props = defineProps({
  // 提示文本内容
  text: {
    type: String,
    required: true
  },
  // 是否显示提示
  show: {
    type: Boolean,
    default: false
  },
  // 目标元素的位置信息
  targetRect: {
    type: Object,
    default: () => ({})
  }
})

// 获取侧边栏状态
const sidebarStore = useSidebarStore()
const isCollapsed = computed(() => sidebarStore.isCollapsed)

// 控制提示显示状态
const isVisible = ref(false)
const tooltipStyle = ref({})
const isLeftArrow = ref(false)
const isBottomArrow = ref(false)
let showTimeout = null

// 监听显示状态变化
watch(() => props.show, (newVal) => {
  console.log('props.show changed:', newVal, 'isCollapsed:', isCollapsed.value)
  if (newVal && isCollapsed.value) {
    // 清除之前的定时器
    if (showTimeout) {
      clearTimeout(showTimeout)
    }
    // 设置延迟显示
    showTimeout = setTimeout(() => {
      if (props.show && isCollapsed.value) {
        console.log('Setting isVisible to true')
        isVisible.value = true
        updateTooltipPosition()
      }
    }, 400) // 400毫秒延迟
  } else {
    // 清除定时器并立即隐藏
    if (showTimeout) {
      clearTimeout(showTimeout)
    }
    console.log('Setting isVisible to false')
    isVisible.value = false
  }
})

// 监听侧边栏状态变化
watch(isCollapsed, (newVal) => {
  console.log('isCollapsed changed:', newVal)
  if (!newVal) {
    console.log('Setting isVisible to false (sidebar expanded)')
    isVisible.value = false
  } else if (props.show) {
    // 如果侧边栏折叠且应该显示提示，则显示
    if (showTimeout) {
      clearTimeout(showTimeout)
    }
    showTimeout = setTimeout(() => {
      if (props.show && isCollapsed.value) {
        console.log('Setting isVisible to true (sidebar collapsed)')
        isVisible.value = true
        updateTooltipPosition()
      }
    }, 400)
  }
})

// 更新提示位置
const updateTooltipPosition = () => {
  if (!props.targetRect) return

  const { top, left, width, height } = props.targetRect
  const tooltipWidth = 120 // 提示框宽度
  const tooltipHeight = 36 // 提示框高度
  const margin = 10 // 边距
  const sidebarWidth = 75 // 收起状态下侧边栏宽度

  // 默认位置：右侧对齐
  let tooltipLeft = left + width + margin
  let tooltipTop = top + (height / 2) - (tooltipHeight / 2)
  isLeftArrow.value = false
  isBottomArrow.value = false

  // 检查是否超出视窗右侧
  if (tooltipLeft + tooltipWidth > window.innerWidth) {
    // 改为左侧显示
    tooltipLeft = left - tooltipWidth - margin
    isLeftArrow.value = true
  }

  // 检查是否超出视窗顶部
  if (tooltipTop < 10) {
    tooltipTop = top + height + margin
    isBottomArrow.value = true
  }

  // 检查是否超出视窗底部
  if (tooltipTop + tooltipHeight > window.innerHeight - 10) {
    // 如果右侧空间足够，显示在上方
    if (tooltipLeft + tooltipWidth <= window.innerWidth) {
      tooltipTop = top - tooltipHeight - margin
      isBottomArrow.value = true
    } else {
      // 如果右侧空间不足，调整到视窗底部
      tooltipTop = window.innerHeight - tooltipHeight - 10
    }
  }

  tooltipStyle.value = {
    position: 'fixed',
    left: `${tooltipLeft}px`,
    top: `${tooltipTop}px`,
    width: `${tooltipWidth}px`,
    height: `${tooltipHeight}px`,
    zIndex: 1000
  }
}

// 监听目标元素位置变化
watch(() => props.targetRect, () => {
  if (isVisible.value) {
    updateTooltipPosition()
  }
}, { deep: true })

// 监听窗口大小变化
const handleResize = () => {
  if (isVisible.value) {
    updateTooltipPosition()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (showTimeout) {
    clearTimeout(showTimeout)
  }
})
</script>

<style scoped>
/* 提示框过渡动画 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.sidebar-tooltip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background-color: rgba(30, 42, 58, 0.6);
  backdrop-filter: blur(10px); /* 保留用于提示框 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #F8FAFC;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

/* 默认箭头指向左侧 */
.sidebar-tooltip::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid rgba(30, 42, 58, 0.95);
}

/* 当提示框显示在左侧时，箭头指向右侧 */
.sidebar-tooltip.left-arrow::before {
  left: auto;
  right: -6px;
  border-right: none;
  border-left: 6px solid rgba(30, 42, 58, 0.95);
}

/* 当提示框显示在下方时，箭头指向上方 */
.sidebar-tooltip.bottom-arrow::before {
  left: 50%;
  top: -6px;
  transform: translateX(-50%);
  border-right: none;
  border-left: none;
  border-top: none;
  border-bottom: 6px solid rgba(30, 42, 58, 0.95);
}

/* 当提示框显示在上方时，箭头指向下方 */
.sidebar-tooltip.bottom-arrow.left-arrow::before {
  left: auto;
  right: 50%;
  top: auto;
  bottom: -6px;
  transform: translateX(50%);
  border-right: none;
  border-left: none;
  border-bottom: none;
  border-top: 6px solid rgba(30, 42, 58, 0.95);
}

/* 深色主题适配 */
.dark .sidebar-tooltip {
  background-color: rgba(23, 23, 23, 0.95);
  border-color: rgba(255, 255, 255, 0.05);
}

.dark .sidebar-tooltip::before {
  border-right-color: rgba(23, 23, 23, 0.95);
}

.dark .sidebar-tooltip.left-arrow::before {
  border-left-color: rgba(23, 23, 23, 0.95);
}

.dark .sidebar-tooltip.bottom-arrow::before {
  border-bottom-color: rgba(23, 23, 23, 0.95);
}

.dark .sidebar-tooltip.bottom-arrow.left-arrow::before {
  border-top-color: rgba(23, 23, 23, 0.95);
}
</style>