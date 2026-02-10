<template>
  <TransitionGroup
    name="list"
    :tag="tag"
    appear
  >
    <slot></slot>
  </TransitionGroup>
</template>

<script setup>
defineProps({
  tag: {
    type: String,
    default: 'div'
  }
})
</script>

<style scoped>
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
</style>
