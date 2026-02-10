<template>
  <div class="nav-buttons-group">
    <NavSearchButton />
    <BackgroundSet />
  </div>
</template>

<script setup>
import NavSearchButton from './NavSearchButton.vue'
import BackgroundSet from '../business/BackgroundSet.vue'
</script>

<style scoped>
.nav-buttons-group {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 响应式设计 - 移动端 */
@media (max-width: 480px) {
  .nav-buttons-group {
    top: 8px;
    right: 8px;
    gap: 8px;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .nav-buttons-group {
    top: 10px;
    right: 10px;
    gap: 8px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .nav-buttons-group {
    top: 15px;
    right: 15px;
  }
}

@media (min-width: 1920px) {
  .nav-buttons-group {
    top: 25px;
    right: 25px;
    gap: 12px;
  }
}
</style>
