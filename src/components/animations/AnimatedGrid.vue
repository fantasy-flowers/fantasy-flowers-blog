<template>
  <div 
    class="animated-grid"
    :style="gridStyle"
  >
    <div class="posts-wrapper">
      <TransitionGroup 
        name="list"
        tag="div"
        class="posts-grid"
      >
        <slot></slot>
      </TransitionGroup>
      <slot name="pagination"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  duration: {
    type: Number,
    default: 600
  },
  delay: {
    type: Number,
    default: 200
  },
  timing: {
    type: String,
    default: 'ease-out'
  }
})

const gridStyle = computed(() => ({
  animation: `slideUp ${props.duration}ms ${props.timing} ${props.delay}ms forwards`
}))
</script>

<style scoped>
.animated-grid {
  width: 100%;
  margin-bottom: 2rem;
  opacity: 0;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  width: 100%;
  will-change: transform;
}

:deep(.list-move),
:deep(.list-enter-active),
:deep(.list-leave-active) {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

:deep(.list-enter-from) {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
}

:deep(.list-leave-to) {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

:deep(.list-leave-active) {
  position: absolute;
}

@media (min-width: 1600px) {
  .posts-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}

@media (min-width: 1200px) and (max-width: 1599px) {
  .posts-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.8rem;
  }
}

@media (min-width: 900px) and (max-width: 1199px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
