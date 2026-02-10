<template>
  <Transition
    name="entry-gate"
    appear
    @enter="onEnter"
    @leave="onLeave"
  >
    <slot></slot>
  </Transition>
</template>

<script setup>
import { nextTick } from 'vue'

const onEnter = (el) => {
  el.style.opacity = '0'
  el.style.transform = 'scale(0.9)'
  
  nextTick(() => {
    // Force reflow
    el.offsetHeight
    
    el.style.transition = 'opacity 500ms ease-out, transform 500ms ease-out'
    el.style.opacity = '1'
    el.style.transform = 'scale(1)'
  })
}

const onLeave = (el) => {
  el.style.transition = 'opacity 300ms ease-in, transform 300ms ease-in'
  el.style.opacity = '0'
  el.style.transform = 'scale(0.95)'
}
</script>

<style>
/* 
  Styles are handled via JS hooks above, 
  but we keep the class names for reference if needed
*/
.entry-gate-enter-active {
  transition: all 500ms ease-out;
}

.entry-gate-leave-active {
  transition: all 300ms ease-in;
}

.entry-gate-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.entry-gate-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
