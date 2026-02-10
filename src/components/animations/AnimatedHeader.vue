<template>
  <header 
    class="animated-header"
    :style="headerStyle"
  >
    <slot></slot>
  </header>
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
    default: 0
  },
  timing: {
    type: String,
    default: 'ease-out'
  },
  translateY: {
    type: Number,
    default: 30
  }
})

const headerStyle = computed(() => ({
  animation: `slideDown ${props.duration}ms ${props.timing} ${props.delay}ms forwards`
}))
</script>

<style scoped>
.animated-header {
  opacity: 0;
}

@keyframes slideDown {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
