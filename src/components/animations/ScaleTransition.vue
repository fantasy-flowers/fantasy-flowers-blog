<template>
  <Transition
    name="scale"
    appear
  >
    <slot></slot>
  </Transition>
</template>

<style scoped>
.scale-enter-active {
  animation: scale-in 0.3s ease-out forwards;
}

.scale-leave-active {
  animation: scale-in 0.3s ease-in reverse forwards;
}

@keyframes scale-in {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
