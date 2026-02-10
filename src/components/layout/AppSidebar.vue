<template>
  <div class="sidebar-wrapper">
    <!-- 侧边栏主容器，根据isCollapsed状态决定是否应用close类进行收展 -->
    <aside class="shell" :class="{ close: isCollapsed }">
    <!-- 侧边栏头部区域，包含头像、标题和收展按钮 -->
    <header>
      <!-- 头像和标题组合 -->
      <div class="image-text">
        <!-- 头像区域 -->
        <span class="image">
          <img src="/head/head.webp" alt="Profile Avatar">
        </span>
        <!-- 标题文本区域 -->
        <div class="text logo-text">
          <span class="name">fantasy_flowers</span>
          <span class="software">热爱生活，热爱编程</span>
        </div>
      </div>
      <!-- 侧边栏收展切换按钮 -->
      <i class="fa fa-chevron-right toggle" @click="toggleSidebar"></i>
    </header>
    
    <!-- 菜单主体区域 -->
    <div class="menu-bar">
      <!-- 主要菜单内容 -->
      <div class="menu">
        <!-- 主导航区域 -->
        <div class="nav-section">
          <div class="nav-section-title">导航</div>
          <ul class="menu-links">
            <!-- 首页导航项 -->
            <li class="nav-link">
              <RouterLink to="/" class="nav-item home-link" :class="{ active: route.name === 'home' }" @click="handleNavClick"
                          @mouseenter="showTooltip($event, '首页')" @mouseleave="hideTooltip">
                <span class="icon home-icon-wrapper">
                  <img src="/icon/image_1.png" alt="首页" class="home-icon home-icon-default" />
                  <img src="/icon/image1.png" alt="首页 Hover" class="home-icon home-icon-hover" />
                </span>
                <span class="text nac-text">首页</span>
              </RouterLink>
            </li>
            
            <!-- 归档导航项 -->
            <li class="nav-link">
              <RouterLink to="/archive" class="nav-item archive-link" :class="{ active: route.name === 'archive' }" @click="handleNavClick"
                          @mouseenter="showTooltip($event, '归档')" @mouseleave="hideTooltip">
                <span class="icon archive-icon-wrapper">
                  <img src="/icon/image_2.png" alt="归档" class="archive-icon archive-icon-default" />
                  <img src="/icon/image2.png" alt="归档 Hover" class="archive-icon archive-icon-hover" />
                </span>
                <span class="text nac-text">归档</span>
              </RouterLink>
            </li>
            
            <!-- 关于导航项 -->
            <li class="nav-link">
              <RouterLink to="/about" class="nav-item about-link" :class="{ active: route.name === 'about' }" @click="handleNavClick"
                          @mouseenter="showTooltip($event, '关于')" @mouseleave="hideTooltip">
                <span class="icon about-icon-wrapper">
                  <img src="/icon/image_3.png" alt="关于" class="about-icon about-icon-default" />
                  <img src="/icon/image3.png" alt="关于 Hover" class="about-icon about-icon-hover" />
                </span>
                <span class="text nac-text">关于</span>
              </RouterLink>
            </li>
          </ul>
        </div>
        
        <!-- 分类导航项 -->
        <div class="nav-section">
          <div class="nav-section-title">文章</div>
          <ul class="menu-links">
            <li class="nav-link">
              <RouterLink to="/categories" class="nav-item categories-link" :class="{ active: route.name === 'categories' || route.name === 'category' }" @click="handleNavClick"
                          @mouseenter="showTooltip($event, '分类')" @mouseleave="hideTooltip">
                <i class="fa fa-folder icon"></i>
                <span class="text nac-text">分类</span>
              </RouterLink>
            </li>
            
            <!-- 标签导航项 -->
            <li class="nav-link">
              <RouterLink to="/tags" class="nav-item tags-link" :class="{ active: route.name === 'tags' || route.name === 'tag' }" @click="handleNavClick"
                          @mouseenter="showTooltip($event, '标签')" @mouseleave="hideTooltip">
                <i class="fa fa-tags icon"></i>
                <span class="text nac-text">标签</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- 底部内容区域 -->
      <div class="bottom-content">
        <div class="nav-section-title">关于本站</div>
        <ul class="menu-links">
          <!-- 友情链接导航项 -->
          <li class="nav-link">
            <RouterLink to="/friends" class="nav-item friends-link" :class="{ active: route.name === 'friends' }" @click="handleNavClick"
                        @mouseenter="showTooltip($event, '友情链接')" @mouseleave="hideTooltip">
              <span class="icon friends-icon-wrapper">
                <img src="/icon/iamge_4.png" alt="友情链接" class="friends-icon friends-icon-default" />
                <img src="/icon/image4.png" alt="友情链接 Hover" class="friends-icon friends-icon-hover" />
              </span>
              <span class="text nac-text">友情链接</span>
            </RouterLink>
          </li>
          
          <!-- GitHub外部链接 -->
          <li class="nav-link">
            <a 
              :href="blogStore.systemConfig.github_link || 'https://github.com/'" 
              target="_blank" 
              rel="noopener noreferrer"
              class="nav-item external-link github-link"
              aria-label="访问GitHub主页"
              @click="handleNavClick"
              @mouseenter="showTooltip($event, 'GitHub')"
              @mouseleave="hideTooltip"
            >
              <span class="icon github-icon-wrapper">
                <img src="/icon/nuowa.png" alt="GitHub" class="github-icon github-icon-default" />
                <img src="/icon/nuowaw.png" alt="GitHub Hover" class="github-icon github-icon-hover" />
              </span>
              <span class="text nac-text">GitHub</span>
              <i class="fa fa-external-link external-icon"></i>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </aside>
  
  <!-- 侧边栏悬停提示组件 -->
  <SidebarTooltip
    :show="tooltipState.show"
    :text="tooltipState.text"
    :target-rect="tooltipState.targetRect"
  />
  </div>
</template>

<script setup>
// 导入Vue组合式API和相关依赖
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBlogStore } from '@/stores/modules/blog'
import { useSidebarStore } from '@/stores/modules/sidebar'
import SidebarTooltip from './SidebarTooltip.vue'
import { useTooltip } from '@/composables/useTooltip'

// 初始化路由和状态管理实例
const router = useRouter()  // 路由实例，用于页面导航
const route = useRoute()    // 当前路由信息
const blogStore = useBlogStore()  // 博客数据状态管理
const sidebarStore = useSidebarStore()  // 侧边栏状态管理

// 计算属性：从全局状态获取侧边栏收展状态
const isCollapsed = computed(() => sidebarStore.isCollapsed)

// 使用提示框组合函数，仅在侧边栏收起时显示提示
const { tooltipState, showTooltip, hideTooltip } = useTooltip({
  shouldShow: () => isCollapsed.value
})

// 功能：切换侧边栏收展状态
const toggleSidebar = () => {
  sidebarStore.toggleSidebar()  // 调用store中的方法切换状态
}

// 功能：导航到分类页面
const navigateToCategory = (categoryName) => {
  // 使用路由跳转到指定分类
  router.push({ name: 'category', params: { name: categoryName } })
  // 在移动端点击导航后收起侧边栏
  if (window.innerWidth <= 768) {
    isCollapsed.value = true
  }
}

// 功能：处理导航点击事件
const handleNavClick = () => {
  // 在移动端点击导航后收起侧边栏
  if (window.innerWidth <= 768) {
    isCollapsed.value = true
  }
}

// 标签导航功能已移除，保留在主页右侧
</script>

<style scoped>
/* 全局变量定义 - 用于主题颜色管理 */
:root {
  --body-color: #E4E9F7;
  --shell-color: #FFF;
  --primary-color: #6d60f8;
  --primary-color-light: #F6F5FF;
  --toggle-color: #DDD;
  --text-color: #707070;
  --section-title-color: #93C5FD;
}

/* 深色主题变量 - 保持原有主题色 */
.dark {
  --body-color: #202224;
  --shell-color: #171717;
  --primary-color: #3a3b3c;
  --primary-color-light: #3a3b3c;
  --toggle-color: #fff;
  --text-color: #ccc;
  --section-title-color: #93C5FD;
}

/* 侧边栏主容器样式 */
.shell {
  position: fixed;  /* 固定定位，始终在屏幕左侧 */
  top: 0;
  left: 0;
  height: 100%;  /* 占满整个屏幕高度 */
  width: 250px;  /* 默认展开宽度 */
  padding: 10px 14px;
  background: rgba(30, 42, 58, 0.6);  /* 半透明背景 */
  backdrop-filter: blur(10px);  /* 背景模糊效果 - 保留用于关键UI */
  border: 1px solid rgba(255, 255, 255, 0.1);  /* 边框效果 */
  /* 统一使用与内容区域相同的缓动函数，确保同步过渡 */
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;  /* 确保在其他元素上方 */
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);  /* 阴影效果 */
  overflow-x: hidden;  /* 隐藏水平滚动条 */
  overflow-y: visible;  /* 允许垂直方向溢出，用于显示收起按钮 */
}

/* 侧边栏收起状态样式 */
.shell.close {
  width: 75px;  /* 收起后的宽度 */
  padding: 10px 8px;  /* 调整内边距 */
}

/* 菜单项基础样式 */
.shell li {
  height: 50px;
  list-style: none;  /* 移除默认列表样式 */
  display: flex;
  align-items: center;
  margin-top: 10px;
}

/* 头像和图标共用的基础样式 */
.image,
.icon {
  min-width: 60px;  /* 确保图标区域宽度固定 */
  border-radius: 6px;
}

/* 导航图标样式 */
.icon {
  min-width: 60px;
  border-radius: 6px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;  /* 图标大小 */
}

/* 侧边栏收起时图标居中 */
.shell.close .icon {
  min-width: 100%;  /* 占满整个宽度以实现居中 */
  justify-content: center;
  margin: 0;  /* 移除外边距 */
}

/* 侧边栏收起时确保列表项不溢出 */
.shell.close li {
  width: 100%;
  overflow: hidden;
  justify-content: center;  /* 列表项内容居中 */
}

/* 侧边栏收起时确保链接和div不溢出 */
.shell.close li a,
.shell.close li div {
  width: 100%;
  justify-content: center;
  padding: 0;
  margin: 0;  /* 移除外边距 */
}

/* 侧边栏收起时隐藏文本，只显示图标 */
.shell.close .nac-text {
  display: none;  /* 完全隐藏文本 */
}

/* 侧边栏收起时外部链接图标也隐藏 */
.shell.close .external-icon {
  display: none;
}

/* 文本和图标的颜色及过渡效果 */
.text, .icon {
  color: #E2E8F0;
  transition: all 0.3s ease;  /* 平滑过渡动画 */
}

/* 导航文本样式 */
.text {
  font-size: 17px;
  font-weight: 500;
  white-space: nowrap;  /* 防止文本换行 */
  opacity: 1;
  transition: opacity 0.3s ease, transform 0.3s ease;  /* 透明度和位移动画 */
}

/* 侧边栏收起时文本的动画效果 */
.shell.close .text {
  opacity: 0;  /* 透明化 */
  transform: translateX(-10px);  /* 向左移动 */
}

/* 侧边栏收起时保持头像可见 */
.shell.close .image {
  opacity: 1;  /* 保持头像可见 */
  display: flex;  /* 保持显示 */
}

.shell.close .image img {
  opacity: 1;  /* 保持头像图片可见 */
}

/* 侧边栏收起时隐藏头像旁边的文字 */
.shell.close .logo-text {
  opacity: 0;  /* 隐藏用户名和标语 */
  width: 0;  /* 不占用空间 */
  overflow: hidden;  /* 隐藏溢出内容 */
}

/* 侧边栏收起时区域标题的动画效果 */
.shell.close .nav-section-title {
  opacity: 0;
  transform: translateX(-10px);
  height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 头部区域定位 */
header {
  position: relative;  /* 为收起按钮的绝对定位提供参考 */
}

/* 头像和文本组合样式 */
.image-text {
  display: flex;  /* 水平排列头像和文本 */
  align-items: center;
}

/* 标题文本容器样式 */
.logo-text {
  display: flex;
  flex-direction: column;  /* 垂直排列标题 */
}

/* 用户名样式 */
.name {
  margin-top: 2px;
  font-size: 18px;
  font-weight: 600;
  color: #F8FAFC;
}

/* 标语样式 */
.software {
  font-size: 12px;
  margin-top: -2px;
  display: block;
  color: #94A3B8;
}

/* 头像容器样式 */
.image {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 头像图片样式 */
.image img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;  /* 确保图片填充容器 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.1);
  /* 确保在所有设备上都保持完美的圆形 */
  aspect-ratio: 1 / 1;
  /* 防止图片变形 */
  -webkit-border-radius: 50%;
  -moz-border-radius: 50%;
  /* 兼容性处理 */
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

/* 侧边栏收展按钮样式 */
.toggle {
  position: absolute;
  top: 50%;
  right: -20px;  /* 定位在侧边栏外部 */
  transform: translateY(-50%) rotate(180deg);  /* 垂直居中并旋转 */
  height: 30px;
  width: 30px;
  background-color: rgba(59, 130, 246, 0.5);  /* 半透明背景 */
  color: #F8FAFC;
  border-radius: 50%;  /* 圆形按钮 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);  /* 平滑过渡 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);  /* 阴影效果 */
  z-index: 101;  /* 确保在侧边栏之上 */
  border: 2px solid rgba(255, 255, 255, 0.1);  /* 边框效果 */
}

/* 侧边栏收起时按钮的样式 */
.shell.close .toggle {
  transform: translateY(-50%) rotate(0deg);  /* 旋转回原位 */
  background-color: rgba(59, 130, 246, 0.6);
  right: -20px;
}

/* 确保按钮在任何状态下都不会被截断 */
.shell {
  overflow: visible;
}

/* 优化按钮在鼠标悬停时的效果 */
.toggle:hover {
  background-color: rgba(59, 130, 246, 0.9);
  transform: translateY(-50%) rotate(180deg) scale(1.1);  /* 轻微放大 */
}

/* 收起状态下按钮的悬停效果 */
.shell.close .toggle:hover {
  transform: translateY(-50%) rotate(0deg) scale(1.1);
}

/* 确保在高分辨率屏幕上按钮也能正确显示 */
@media (min-resolution: 1.25dppx) {
  .toggle {
    border-width: 1px;  /* 调整边框宽度以适应高分辨率 */
  }
}

/* 菜单区域样式 */
.menu {
  margin-top: 40px;
  flex: 1;  /* 占满剩余空间 */
  display: flex;
  flex-direction: column;
  gap: 16px;  /* 菜单项之间的间隙 */
}

/* 菜单栏容器样式 */
.menu-bar {
  height: calc(100% - 55px);  /* 减去头部高度 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;  /* 内容和底部分离 */
  overflow-y: scroll;  /* 允许内容滚动 */
  overflow-x: hidden;  /* 隐藏水平滚动条 */
}

/* 导航区域基础样式 */
.nav-section {
  margin-bottom: 8px;
}

/* 导航区域标题样式 */
.nav-section-title {
  color: var(--section-title-color);
  font-size: 14px;
  font-weight: 600;
  margin: 0 20px 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(147, 197, 253, 0.2);  /* 下划线效果 */
}

/* 底部内容区域标题样式调整 */
.bottom-content .nav-section-title {
  margin-bottom: 12px;
}

/* 底部内容列表样式重置 */
.bottom-content ul {
  padding: 0;
  margin: 0;
}

/* 隐藏滚动条 */
.menu-bar::-webkit-scrollbar {
  display: none;
}

/* 导航链接和分类项的共用样式 */
.shell li a,
.shell li div {
  list-style: none;
  height: 100%;
  background-color: transparent;
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s ease;  /* 平滑过渡 */
  overflow: hidden;  /* 防止内容溢出 */
}

/* 悬停效果 */
.shell li a:hover,
.shell li div:hover {
  background-color: rgba(59, 130, 246, 0.2);  /* 悬停背景色 */
}

/* 悬停时文本和图标的颜色变化 */
.shell li a:hover .icon,
.shell li a:hover .text,
.shell li div:hover .icon,
.shell li div:hover .text {
  color: #F8FAFC;
}

/* 激活状态样式 */
.shell li a.active,
.shell li div.active {
  background-color: rgba(59, 130, 246, 0.3);  /* 激活状态背景色 */
  color: #93C5FD;
  font-weight: 600;
}

/* 外部链接样式 */
.external-link {
  cursor: pointer;
  position: relative;
}

/* 外部链接图标样式 */
.external-icon {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-left: auto;  /* 推到右侧 */
  transition: all 0.3s ease;  /* 平滑过渡 */
}

/* 外部链接悬停效果 */
.external-link:hover .external-icon {
  opacity: 1;
  transform: translateX(2px);  /* 轻微右移 */
}

/* GitHub图标容器样式 */
.github-icon-wrapper,
.home-icon-wrapper,
.about-icon-wrapper,
.friends-icon-wrapper,
.archive-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 100%;
}

/* GitHub图标基础样式 */
.github-icon,
.home-icon,
.about-icon,
.friends-icon,
.archive-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  position: absolute;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* 默认图标样式 */
.github-icon-default,
.home-icon-default,
.about-icon-default,
.friends-icon-default,
.archive-icon-default {
  opacity: 1;
  transform: scale(1);
}

/* 悬停图标样式 - 初始隐藏 */
.github-icon-hover,
.home-icon-hover,
.about-icon-hover,
.friends-icon-hover,
.archive-icon-hover {
  opacity: 0;
  transform: scale(0.9);
}

/* 悬停时切换图标 */
.github-link:hover .github-icon-default,
.home-link:hover .home-icon-default,
.about-link:hover .about-icon-default,
.friends-link:hover .friends-icon-default,
.archive-link:hover .archive-icon-default {
  opacity: 0;
  transform: scale(0.9);
}

.github-link:hover .github-icon-hover,
.home-link:hover .home-icon-hover,
.about-link:hover .about-icon-hover,
.friends-link:hover .friends-icon-hover,
.archive-link:hover .archive-icon-hover {
  opacity: 1;
  transform: scale(1);
}

/* 侧边栏收起时GitHub图标容器居中 */
.shell.close .github-icon-wrapper,
.shell.close .home-icon-wrapper,
.shell.close .about-icon-wrapper,
.shell.close .friends-icon-wrapper,
.shell.close .archive-icon-wrapper {
  width: 100%;
  justify-content: center;
  margin: 0;  /* 移除外边距 */
}

/* 侧边栏收起时所有图标容器都居中 */
.shell.close .image-text {
  justify-content: center;
}

/* 侧边栏收起时头像居中 */
.shell.close .image {
  margin: 0 auto;
}

/* 响应式设计 - 移动端适配 */
@media (max-width: 768px) {
  /* 移动端侧边栏默认隐藏 */
  .shell {
    transform: translateX(-100%);  /* 移出屏幕 */
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: visible;
  }
  
  /* 移动端侧边栏显示状态 */
  .shell.show {
    transform: translateX(0);  /* 移回屏幕 */
  }
  
  /* 移动端不需要关闭状态的样式 */
  .shell.close {
    width: 250px;
    padding: 10px 14px;
  }
  
  /* 移动端收起状态下文本和标题保持可见 */
  .shell.close .text,
  .shell.close .nav-section-title {
    opacity: 1;
    transform: translateX(0);
    height: auto;
    margin: 0 20px 8px;
    padding-bottom: 4px;
  }
  
  /* 调整移动端按钮位置，确保完全显示 */
  .toggle {
    right: -25px;
    height: 36px;
    width: 36px;
    font-size: 14px;
  }
  
  .shell.close .toggle {
    right: -25px;
  }
}
</style>