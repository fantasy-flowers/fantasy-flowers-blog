<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-center">
    <h1 class="text-6xl font-bold mb-4 text-gradient">404</h1>
    <h2 class="text-2xl mb-6 text-gray-300">页面未找到</h2>
    <p class="text-gray-400 mb-8 max-w-md">
      抱歉，您访问的页面不存在。可能是链接错误或页面已被删除。
    </p>
    <button 
      @click="goHome" 
      class="px-6 py-3 rounded-lg transition-all duration-300"
    >
      返回首页
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { setPageMetadata } from '@/utils/metadata'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'home' })
}

onMounted(() => {
  setPageMetadata({
    title: '页面未找到',
    description: 'Fantasy Flowers博客页面未找到，返回首页继续浏览',
    keywords: '404,页面未找到,错误页面'
  })
})
</script>

<style scoped>
button {
  background-color: rgba(30, 42, 58, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #E2E8F0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  /* backdrop-filter removed for GPU optimization */
}

button:hover:not(:disabled) {
  background-color: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93C5FD;
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

button:active:not(:disabled) {
  background-color: rgba(59, 130, 246, 0.3);
  border-color: #3B82F6;
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
</style>