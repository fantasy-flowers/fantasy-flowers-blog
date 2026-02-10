<template>
  <div class="loading-container">
    <img src="/icon/load.gif" alt="加载中..." class="spinner-img" />
    <p class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '加载中...'
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #94A3B8;
}

.spinner-img {
  width: 100px;
  height: 100px;
  margin-bottom: 1rem;
  object-fit: contain;
}

.loading-text {
  font-size: 0.9rem;
  color: #94A3B8;
}
</style>