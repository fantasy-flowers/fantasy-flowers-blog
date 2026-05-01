<template>
  <div class="article-not-found font-ma-shan">
    <div class="not-found-content animated-card">
      <!-- 插画 -->
      <div class="image-frame mb-6">
        <img
          :src="isHovered ? hoverImage : defaultImage"
          alt="404 Article Not Found"
        >
      </div>

      <!-- 404大字 -->
      <h2 class="text-7xl font-bold text-pink-400 leading-none mb-4">404</h2>

      <!-- 提示语 -->
      <p class="text-2xl text-purple-600 mt-2">呜喵~ 文章好像迷路了啦！</p>
      <p class="text-lg text-gray-400 mt-3">{{ isHovered ? hoverText : defaultText }}</p>

      <!-- 返回按钮 -->
      <button
        @click="goHome"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        class="nav-control-btn home-btn"
        aria-label="前往首页"
      >
        <i class="fa fa-home"></i>
        <span>一键转身异世界！</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isHovered = ref(false)
const defaultImage = '/public/icon/404-article.png'
const hoverImage = '/public/icon/404-article-hover.png'
const defaultText = '杂~~~鱼~♡杂鱼~♡ 臭杂鱼♡ 页面不见了 ~ 是不是被你吃了?!'
const hoverText = '杂鱼~♡杂鱼~♡ 臭杂鱼♡'

const goHome = () => {
  router.push({ name: 'home' })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap');

.font-ma-shan {
  font-family: "Ma Shan Zheng", cursive;
}

.article-not-found {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 60vh;
  padding: 4rem 1rem;
  box-sizing: border-box;
  display: grid;
  place-items: center;
  text-align: center;
}

.not-found-content {
  width: min(100%, 640px);
  margin: 0 auto;
}


.image-frame {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.25);
  border: 3px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.image-frame:hover {
  transform: scale(1.05);
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.35);
}

.image-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

h2 {
  font-size: 6rem !important;
  font-weight: bold !important;
  color: #EC4899 !important;
  line-height: 1 !important;
  margin: 0 !important;
}

p {
  color: #EC4899 !important;
  font-size: 1.5rem !important;
  margin-top: 0.5rem !important;
}

p + p {
  color: #94A3B8 !important;
  font-size: 1.125rem !important;
  transition: all 0.3s ease;
}

.nav-control-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  min-width: 44px;
  height: 44px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  background-color: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #E2E8F0;
  margin-top: 2rem;
}

.nav-control-btn i {
  font-size: 1.2em;
  transition: transform 0.2s ease;
}

.nav-control-btn:hover {
  background-color: rgba(212, 56, 145, 0.723);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93C5FD;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.nav-control-btn:active {
  background-color: rgb(11, 181, 228);
  border-color: #3B82F6;
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.animated-card {
  animation: slideUp 0.6s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
