<template>
  <div class="mobile-navigation">
    <!-- 汉堡菜单按钮 -->
    <button 
      @click="toggleSidebar"
      class="mobile-menu-toggle"
      :class="{ active: isSidebarOpen }"
      aria-label="切换导航菜单"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <!-- 遮罩层 -->
    <div 
      v-if="isSidebarOpen"
      class="mobile-overlay"
      @click="closeSidebar"
    ></div>

    <!-- 移动端侧边栏 -->
    <aside 
      class="mobile-sidebar"
      :class="{ open: isSidebarOpen }"
    >
      <!-- 个人资料区域 -->
      <div class="mobile-profile-section">
        <img src="/head/head.webp" alt="Profile Avatar" class="mobile-profile-avatar">
        <h2 class="mobile-profile-name">fantasy_flowers</h2>
        <p class="mobile-profile-status">热爱生活，热爱编程</p>
      </div>
      
      <!-- 导航区域 -->
      <nav class="mobile-nav-section">
        <div class="mobile-nav-title">导航</div>
        <RouterLink 
          to="/" 
          class="mobile-nav-item mobile-home-link" 
          :class="{ active: route.name === 'home' }"
          @click="closeSidebar"
        >
          <span class="mobile-home-icon-wrapper">
            <img src="/icon/image_1.png" alt="首页" class="mobile-home-icon mobile-home-icon-default" />
            <img src="/icon/image1.png" alt="首页 Hover" class="mobile-home-icon mobile-home-icon-hover" />
          </span>
          <span>首页</span>
        </RouterLink>
        <RouterLink 
          to="/archive" 
          class="mobile-nav-item mobile-archive-link" 
          :class="{ active: route.name === 'archive' }"
          @click="closeSidebar"
        >
          <span class="mobile-archive-icon-wrapper">
            <img src="/icon/image_2.png" alt="归档" class="mobile-archive-icon mobile-archive-icon-default" />
            <img src="/icon/image2.png" alt="归档 Hover" class="mobile-archive-icon mobile-archive-icon-hover" />
          </span>
          <span>归档</span>
        </RouterLink>
        <RouterLink 
          to="/about" 
          class="mobile-nav-item mobile-about-link" 
          :class="{ active: route.name === 'about' }"
          @click="closeSidebar"
        >
          <span class="mobile-about-icon-wrapper">
            <img src="/icon/image_3.png" alt="关于" class="mobile-about-icon mobile-about-icon-default" />
            <img src="/icon/image3.png" alt="关于 Hover" class="mobile-about-icon mobile-about-icon-hover" />
          </span>
          <span>关于</span>
        </RouterLink>
      </nav>
      
      <!-- 分类导航项 -->
      <div class="mobile-nav-section">
        <div class="mobile-nav-title">文章</div>
        <RouterLink 
          to="/categories" 
          class="mobile-nav-item mobile-categories-link" 
          :class="{ active: route.name === 'categories' || route.name === 'category' }"
          @click="closeSidebar"
        >
          <i class="fa fa-folder"></i>
          <span>分类</span>
        </RouterLink>
        
        <!-- 标签导航项 -->
        <RouterLink 
          to="/tags" 
          class="mobile-nav-item mobile-tags-link" 
          :class="{ active: route.name === 'tags' || route.name === 'tag' }"
          @click="closeSidebar"
        >
          <i class="fa fa-tags"></i>
          <span>标签</span>
        </RouterLink>
      </div>
      
      <!-- 关于本站区域 -->
      <div class="mobile-nav-section">
        <div class="mobile-nav-title">关于本站</div>
        <RouterLink 
          to="/friends" 
          class="mobile-nav-item mobile-friends-link" 
          :class="{ active: route.name === 'friends' }"
          @click="closeSidebar"
        >
          <span class="mobile-friends-icon-wrapper">
            <img src="/icon/iamge_4.png" alt="友情链接" class="mobile-friends-icon mobile-friends-icon-default" />
            <img src="/icon/image4.png" alt="友情链接 Hover" class="mobile-friends-icon mobile-friends-icon-hover" />
          </span>
          <span>友情链接</span>
        </RouterLink>
        <a 
          :href="blogStore.systemConfig.github_link || 'https://github.com/'" 
          target="_blank" 
          rel="noopener noreferrer"
          class="mobile-nav-item mobile-external-link mobile-github-link"
          aria-label="访问GitHub主页"
          @click="closeSidebar"
        >
          <span class="mobile-github-icon-wrapper">
            <img src="/icon/nuowa.png" alt="GitHub" class="mobile-github-icon mobile-github-icon-default" />
            <img src="/icon/nuowaw.png" alt="GitHub Hover" class="mobile-github-icon mobile-github-icon-hover" />
          </span>
          <span>GitHub</span>
          <i class="fa fa-external-link mobile-external-icon"></i>
        </a>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBlogStore } from '@/stores/modules/blog'

const router = useRouter()
const route = useRoute()
const blogStore = useBlogStore()

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  // 防止背景滚动
  document.body.style.overflow = isSidebarOpen.value ? 'hidden' : ''
}

const closeSidebar = () => {
  isSidebarOpen.value = false
  document.body.style.overflow = ''
}

const navigateToCategory = (categoryName) => {
  router.push({ name: 'category', params: { name: categoryName } })
  closeSidebar()
}

// 标签导航功能已移除，保留在主页右侧

// 监听路由变化，自动关闭侧边栏
const handleRouteChange = () => {
  closeSidebar()
}

// ESC键关闭侧边栏
const handleKeydown = (event) => {
  if (event.key === 'Escape' && isSidebarOpen.value) {
    closeSidebar()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = '' // 清理样式
})
</script>

<style scoped>
/* 移动端导航容器 */
.mobile-navigation {
  display: none; /* 默认隐藏，只在小屏幕显示 */
}

/* 汉堡菜单按钮 */
.mobile-menu-toggle {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  width: 44px;
  height: 44px;
  background-color: rgba(30, 42, 58, 0.6);
  backdrop-filter: blur(10px); /* 保留用于移动导航 */
  opacity: 0.5;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-menu-toggle:hover {
  background-color: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

/* 汉堡图标线条 */
.hamburger-line {
  width: 20px;
  height: 2px;
  background-color: #F8FAFC;
  border-radius: 1px;
  transition: all 0.3s ease;
}

/* 激活状态的汉堡图标 */
.mobile-menu-toggle.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-toggle.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* 遮罩层 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 999;
  backdrop-filter: blur(2px); /* 保留用于移动遮罩 */
}

/* 移动端侧边栏 */
.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background-color: rgba(30, 42, 58, 0.6);
  backdrop-filter: blur(15px); /* 保留用于移动侧边栏 */
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
  padding: 20px;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
}

.mobile-sidebar.open {
  transform: translateX(0);
}

/* 移动端个人资料区域 */
.mobile-profile-section {
  text-align: center;
  margin: 60px 0 32px 0;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 16px;
  border: 3px solid rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  /* 确保在所有设备上都保持完美的圆形 */
  aspect-ratio: 1 / 1;
  /* 防止图片变形 */
  -webkit-border-radius: 50%;
  -moz-border-radius: 50%;
  /* 兼容性处理 */
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.mobile-profile-name {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #F8FAFC;
}

.mobile-profile-status {
  font-size: 0.9rem;
  color: #94A3B8;
  line-height: 1.4;
}

/* 移动端导航区域 */
.mobile-nav-section {
  margin-bottom: 28px;
}

.mobile-nav-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #93C5FD;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 6px;
  margin-bottom: 6px;
  color: #E2E8F0;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
}

.mobile-nav-item:hover {
  background-color: rgba(59, 130, 246, 0.2);
  color: #F8FAFC;
  border-color: rgba(59, 130, 246, 0.3);
}

.mobile-nav-item.active {
  background-color: rgba(59, 130, 246, 0.3);
  color: #93C5FD;
  border-color: #3B82F6;
  font-weight: 600;
}

/* 移动端外部链接样式 */
.mobile-external-link {
  position: relative;
}

.mobile-external-icon {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-left: auto;
  transition: all 0.3s ease;
}

.mobile-external-link:hover .mobile-external-icon {
  opacity: 1;
  transform: translateX(2px);
}

/* 移动端图标容器样式 */
.mobile-github-icon-wrapper,
.mobile-home-icon-wrapper,
.mobile-about-icon-wrapper,
.mobile-friends-icon-wrapper,
.mobile-archive-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

/* 移动端图标基础样式 */
.mobile-github-icon,
.mobile-home-icon,
.mobile-about-icon,
.mobile-friends-icon,
.mobile-archive-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  position: absolute;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* 移动端默认图标样式 */
.mobile-github-icon-default,
.mobile-home-icon-default,
.mobile-about-icon-default,
.mobile-friends-icon-default,
.mobile-archive-icon-default {
  opacity: 1;
  transform: scale(1);
}

/* 移动端悬停图标样式 - 初始隐藏 */
.mobile-github-icon-hover,
.mobile-home-icon-hover,
.mobile-about-icon-hover,
.mobile-friends-icon-hover,
.mobile-archive-icon-hover {
  opacity: 0;
  transform: scale(0.9);
}

/* 移动端悬停时切换图标 */
.mobile-github-link:hover .mobile-github-icon-default,
.mobile-home-link:hover .mobile-home-icon-default,
.mobile-about-link:hover .mobile-about-icon-default,
.mobile-friends-link:hover .mobile-friends-icon-default,
.mobile-archive-link:hover .mobile-archive-icon-default {
  opacity: 0;
  transform: scale(0.9);
}

.mobile-github-link:hover .mobile-github-icon-hover,
.mobile-home-link:hover .mobile-home-icon-hover,
.mobile-about-link:hover .mobile-about-icon-hover,
.mobile-friends-link:hover .mobile-friends-icon-hover,
.mobile-archive-link:hover .mobile-archive-icon-hover {
  opacity: 1;
  transform: scale(1);
}

/* 响应式显示控制 - 只在小屏幕显示 */
@media (max-width: 768px) {
  .mobile-navigation {
    display: block !important;
  }
}

/* 确保在大屏幕上完全隐藏 */
@media (min-width: 769px) {
  .mobile-navigation {
    display: none !important;
    visibility: hidden;
  }
}

/* 小屏幕优化 */
@media (max-width: 480px) {
  .mobile-sidebar {
    width: 260px;
    padding: 16px;
  }
  
  .mobile-profile-avatar {
    width: 70px;
    height: 70px;
  }
  
  .mobile-profile-name {
    font-size: 1.2rem;
  }
  
  .mobile-nav-item {
    padding: 8px 12px;
  }
  
  /* 移动端标签样式已移除 */
}
</style>