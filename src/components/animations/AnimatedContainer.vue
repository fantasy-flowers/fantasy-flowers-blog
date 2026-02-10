<template>
  <div 
    class="animated-container"
    :style="containerStyle"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  duration: {
    type: Number,
    default: 500
  },
  delay: {
    type: Number,
    default: 0
  },
  timing: {
    type: String,
    default: 'ease-in-out'
  }
})

const containerStyle = computed(() => ({
  animation: `fadeIn ${props.duration}ms ${props.timing} ${props.delay}ms forwards`
}))
</script>

<style scoped>
.animated-container {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
