<template>
  <div class="error-page min-h-screen flex items-center justify-center p-4 font-ma-shan">
    <div class="text-center max-w-lg w-full relative">
      <!-- 插画 -->
      <div class="image-frame mb-6">
        <img
          :src="isHovered ? hoverImage : defaultImage"
          alt="404"
        >
      </div>

      <!-- 404大字 -->
      <h1 class="text-8xl font-bold text-pink-400 leading-none">404</h1>

      <!-- 提示语 -->
      <p class="text-2xl text-purple-600 mt-2">呜喵~ 页面好像迷路了啦！</p>
      <p class="text-lg text-gray-600 mt-3">{{ isHovered ? hoverText : defaultText }}</p>

      <!-- 返回按钮 -->
      <button
        @click="goHome"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        class="nav-control-btn home-btn"
        aria-label="前往首页"
      >
        <i class="fa fa-home"></i>
        <span>请和我组一辈子乐队！</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { setPageMetadata } from '@/utils/metadata'

const router = useRouter()

const isHovered = ref(false)
const defaultImage = '/icon/404.png'
const hoverImage = '/icon/404-hover.png'
const defaultText = '为——什——么——要——打——开——这——个——页——面——？！！'
const hoverText = '你这个人——怎么永远都想着自己啊！？'

const goHome = () => {
  router.push({ name: 'home' })
}

onMounted(() => {
  setPageMetadata({
    title: '呜喵~页面迷路啦！',
    description: 'Fantasy Flowers博客页面未找到，返回首页继续浏览',
    keywords: '404,页面未找到,错误页面'
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap');

.font-ma-shan {
  font-family: "Ma Shan Zheng", cursive;
}

.error-page {
  position: relative;
  z-index: 1;
}

.image-frame {
  width: 256px;
  height: 256px;
  margin: 0 auto;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 4px solid var(--blog-border);
  transition: all 0.3s ease;
}

.image-frame:hover {
  transform: scale(1.05);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.35);
}

.image-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

h1 {
  font-size: 8rem !important;
  font-weight: bold !important;
  color: var(--blog-pink) !important;
  line-height: 1 !important;
  margin: 0 !important;
}

p {
  color: var(--blog-pink) !important;
  font-size: 1.5rem !important;
  margin-top: 0.5rem !important;
}

p + p {
  color: #ffffff !important;
  font-size: 1.125rem !important;
  transition: all 0.3s ease;
}

.nav-control-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  min-width: 44px;
  height: 44px;
  border-radius: var(--blog-radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  background-color: rgba(59, 130, 246, 0.2);
  border: 1px solid var(--blog-border);
  color: #E2E8F0;
  margin-top: 2rem;
}

.nav-control-btn i {
  font-size: 1em;
  transition: transform 0.2s ease;
}

.nav-control-btn:hover {
  background-color: rgba(212, 56, 145, 0.723);
  border-color: rgba(59, 130, 246, 0.3);
  color: var(--blog-blue-light);
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.nav-control-btn:active {
  background-color: rgb(11, 181, 228);
  border-color: var(--blog-blue-strong);
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
</style>
