<template>
  <button 
    v-show="isVisible" 
    @click="scrollToTop" 
    class="back-to-top"
    aria-label="返回顶部"
  >
    <i class="fa fa-arrow-up"></i>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)

const handleScroll = () => {
  isVisible.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: rgba(30, 42, 58, 0.65) url('/icon/topboqi.gif') center/cover no-repeat;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: #E2E8F0;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px); /* 保留用于返回顶部按钮 */
}

.back-to-top:hover:not(:disabled) {
  background-color: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93C5FD;
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.back-to-top:active:not(:disabled) {
  background-color: rgba(59, 130, 246, 0.3);
  border-color: #3B82F6;
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
</style>