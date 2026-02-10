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
  transition: all 0.4s ease-out;
}

.slide-leave-active {
  transition: all 0.3s ease-in;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
