<template>
  <button 
    class="nav-search-btn" 
    @click="navigateToSearch"
    title="搜索文章"
    aria-label="搜索文章"
  >
    <i class="fa fa-search"></i>
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 导航到搜索页面
const navigateToSearch = () => {
  router.push({ name: 'search' })
}
</script>

<style scoped>
.nav-search-btn {
  background-color: var(--blog-bg-card);
  backdrop-filter: blur(10px); /* 保留用于关键导航按钮 */
  border: 1px solid var(--blog-border);
  color: #E2E8F0;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  will-change: transform;
  transform: translateZ(0);
}

.nav-search-btn:hover {
  background-color: rgba(59, 130, 246, 0.2);
  color: var(--blog-text-bright);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: scale(1.1);
}

.nav-search-btn:active {
  background-color: rgba(59, 130, 246, 0.3);
  color: var(--blog-blue-light);
  border-color: var(--blog-blue-strong);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  transform: scale(1.05);
}

/* 响应式设计 - 移动端 */
@media (max-width: 480px) {
  .nav-search-btn {
    width: 36px;
    height: 36px;
    font-size: 12px;
    padding: 8px;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .nav-search-btn {
    width: 38px;
    height: 38px;
    font-size: 13px;
  }
}

@media (min-width: 1920px) {
  .nav-search-btn {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
}
</style>
