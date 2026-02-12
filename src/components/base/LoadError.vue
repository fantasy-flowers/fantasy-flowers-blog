<template>
  <div class="load-error" role="alert">
    <p class="load-error__text">{{ message }}</p>
    <button
      v-if="retry"
      class="load-error__retry"
      @click="$emit('retry')"
    >
      重试
    </button>
  </div>
</template>

<script setup>
/**
 * LoadError - 组件加载失败回退提示
 *
 * 用于 defineAsyncComponent 的 errorComponent 选项，
 * 在异步组件加载失败时向用户展示错误提示和可选的重试按钮。
 *
 * @component
 * @example
 * <LoadError message="加载失败，请重试" :retry="true" @retry="reload" />
 */

// ==================== Props 定义 ====================
defineProps({
  /** 错误提示文本 */
  message: {
    type: String,
    default: '组件加载失败，请刷新页面重试'
  },
  /** 是否显示重试按钮 */
  retry: {
    type: Boolean,
    default: true
  }
})

// ==================== Emits 定义 ====================
defineEmits({
  /** 用户点击重试按钮 */
  retry: () => true
})
</script>

<style scoped>
.load-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #f87171;
}

.load-error__text {
  font-size: 0.9rem;
  margin: 0 0 1rem;
}

.load-error__retry {
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  color: #e2e8f0;
  background-color: rgba(59, 130, 246, 0.3);
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.load-error__retry:hover {
  background-color: rgba(59, 130, 246, 0.5);
}
</style>
