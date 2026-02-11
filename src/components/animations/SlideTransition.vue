<template>
  <Transition
    name="slide"
    :mode="mode"
    appear
  >
    <slot></slot>
  </Transition>
</template>

<script setup>
defineProps({
  mode: {
    type: String,
    default: 'out-in'
  }
})
</script>

<style scoped>
/* Slide Up by default */
.slide-enter-active {
  transition: opacity 0.35s ease-out;
}

.slide-leave-active {
  transition: opacity 0.2s ease-in;
}

.slide-enter-from {
  opacity: 0;
}

.slide-leave-to {
  opacity: 0;
}
</style>
