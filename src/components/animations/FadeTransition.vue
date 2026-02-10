<template>
  <Transition
    name="fade"
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
