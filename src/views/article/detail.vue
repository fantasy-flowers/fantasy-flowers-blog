<template>
  <div class="post-detail-page">
    <!-- 过渡动画容器 -->
    <SlideTransition mode="out-in">
      <div :key="route.params.id" class="post-detail-wrapper">
        <!-- 返回导航按钮 -->
        <NavigationControls />
        
        <div v-if="blogStore.postsLoading" class="loading-state">
          <LoadingSpinner text="加载中..." />
        </div>
        
        <div v-else-if="post" class="article-page-container">
          <!-- 左侧栏: 封面 + 目录 -->
          <aside class="article-sidebar" :class="{ 'mobile-open': mobileMenuOpen }">
            <!-- 封面图 -->
            <div class="sidebar-cover">
              <img 
                v-if="post.cover_image || post.image"
                :src="getImageUrl(post.cover_image || post.image)"
                :alt="post.title"
                class="cover-image"
                loading="lazy"
              />
              <div v-else class="cover-placeholder">
                <i class="fa fa-image"></i>
              </div>
            </div>
            

            <!-- 文章目录 -->
            <nav class="sidebar-toc" v-if="toc.length > 0">
              <h3 class="toc-title">
                <i class="fa fa-list"></i>
                目录
              </h3>
              <ul class="toc-list">
                <li 
                  v-for="item in toc" 
                  :key="item.id"
                  :class="['toc-item', `toc-level-${item.level}`, { 'active': activeHeading === item.id }]"
                >
                  <a 
                    :href="`#${item.id}`" 
                    class="toc-link"
                    @click.prevent="scrollToHeading(item.id)"
                  >
                    {{ item.title }}
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
          
          <!-- 移动端目录按钮 -->
          <button 
            v-if="isMobile && toc.length > 0"
            class="mobile-toc-btn"
            @click="openMobileMenu"
            aria-label="打开目录"
          >
            <i class="fa fa-list"></i>
            <span>目录</span>
          </button>
          
          <!-- 移动端遮罩 -->
          <FadeTransition>
            <div 
              v-if="isMobile && mobileMenuOpen" 
              class="mobile-overlay"
              @click="closeMobileMenu"
            ></div>
          </FadeTransition>
          
          <!-- 右侧栏: 标题 + 元信息 + 正文 -->
          <main class="article-main animated-card">
            <!-- 标题区 -->
            <header class="article-header">
              <h1 class="article-title">{{ post.title }}</h1>
              
              <!-- 分类和标签 -->
              <div class="article-taxonomy">
                <span class="article-category" v-if="post.category_name || post.category">
                  <i class="fa fa-folder"></i>
                  {{ post.category_name || post.category }}
                </span>
                <div class="article-tags" v-if="displayTags.length > 0">
                  <span 
                    v-for="tag in displayTags" 
                    :key="tag.id || tag"
                    class="article-tag"
                    @click="navigateToTag(tag.name || tag)"
                  >
                    <i class="fa fa-tag"></i>
                    {{ tag.name || tag }}
                  </span>
                </div>
              </div>
              
              <!-- 元数据 -->
              <div class="article-meta">
                <span class="meta-item">
                  <i class="fa fa-eye"></i>
                  浏览数-{{ post.view_count || post.views || 0 }}
                </span>
                <span class="meta-item">
                  <i class="fa fa-calendar"></i>
                  发布于{{ formatDateTime(post.publish_time || post.date) }}
                </span>
                <span class="meta-item">
                  <i class="fa fa-edit"></i>
                  {{ post.update_time ? `重新编辑于${formatDateTime(post.update_time)}` : '编辑于---' }}
                </span>
              </div>
            </header>
            
            <!-- 分隔线 -->
            <hr class="article-divider" />
            
            <!-- 正文内容 -->
            <article class="article-content" ref="articleContent">
              <MarkdownRenderer :content="processedContent" />
            </article>
          </main>
        </div>
        
        <div v-else class="text-center py-8 text-gray-400">
          <i class="fa fa-exclamation-circle text-4xl mb-4"></i>
          <p>文章不存在、未发布或已被删除</p>
          <button 
            @click="router.push('/')" 
            class="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            返回首页
          </button>
        </div>
        
        <div class="nav-buttons animated-card" style="animation-delay: 0.4s;" v-if="post">
          <button 
            v-if="prevPost" 
            @click="navigateToPost(prevPost.id)" 
            class="btn btn-secondary"
          >
            <i class="fa fa-chevron-left"></i>
            <span>上一篇: {{ prevPost.title }}</span>
          </button>
          
          <button 
            v-if="nextPost" 
            @click="navigateToPost(nextPost.id)" 
            class="btn btn-secondary"
          >
            <span>下一篇: {{ nextPost.title }}</span>
            <i class="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </SlideTransition>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@/stores/modules/blog'
import { useSidebarStore } from '@/stores/modules/sidebar'
import { setPageMetadata } from '@/utils/metadata'
import { generateTOC } from '@/utils/markdownUtils'
import { getImageUrl } from '@/utils/imageUrl'
import { useThrottle } from '@/composables/useThrottle'
import MarkdownRenderer from '@/components/business/MarkdownRenderer.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import NavigationControls from '@/components/base/NavigationControls.vue'
import SlideTransition from '@/components/animations/SlideTransition.vue'
import FadeTransition from '@/components/animations/FadeTransition.vue'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
// const sidebarStore = useSidebarStore()

// 响应式状态
const isMobile = ref(false)
const mobileMenuOpen = ref(false)
const activeHeading = ref('')
const articleContent = ref(null)

const post = computed(() => blogStore.currentPost || blogStore.getPostById(parseInt(route.params.id)))
const prevPost = computed(() => blogStore.getPrevPost(parseInt(route.params.id)))
const nextPost = computed(() => blogStore.getNextPost(parseInt(route.params.id)))

// 处理内容（不需要添加锚点，MarkdownRenderer会自动处理）
const processedContent = computed(() => {
  if (!post.value || !post.value.content) return ''
  return post.value.content
})

// 生成目录
const toc = computed(() => {
  if (!post.value || !post.value.content) return []
  return generateTOC(post.value.content)
})

// 处理标签显示
const displayTags = computed(() => {
  if (!post.value || !post.value.tags) return []
  return Array.isArray(post.value.tags) ? post.value.tags : []
})

// 格式化日期时间 (包含时分)
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }) + ' ' + date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 滚动到指定标题
const scrollToHeading = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
    // 移动端点击后关闭菜单
    if (isMobile.value) {
      closeMobileMenu()
    }
  }
}

// 检测当前阅读的章节
const updateActiveHeading = () => {
  if (!toc.value.length) return
  
  const headings = toc.value.map(item => document.getElementById(item.id)).filter(Boolean)
  const scrollPosition = window.scrollY + 100
  
  let currentActive = ''
  
  for (let i = headings.length - 1; i >= 0; i--) {
    if (headings[i].offsetTop <= scrollPosition) {
      currentActive = headings[i].id
      break
    }
  }
  
  if (!currentActive && headings.length > 0) {
    currentActive = headings[0].id
  }
  
  activeHeading.value = currentActive
}

// 移动端菜单控制
const openMobileMenu = () => {
  mobileMenuOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// 检测屏幕尺寸
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    closeMobileMenu()
  }
}

/** 节流后的 resize 处理 */
const throttledCheckMobile = useThrottle(checkMobile, 150)

/** 节流后的 scroll 处理（目录高亮） */
const throttledUpdateActiveHeading = useThrottle(updateActiveHeading, 100)

const navigateToPost = async (postId) => {
  await router.push({ name: 'post-detail', params: { id: postId } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const navigateToTag = (tag) => {
  router.push({ name: 'tag', params: { name: tag } })
}

// 设置页面元数据
const updateMetadata = () => {
  if (post.value) {
    const tags = displayTags.value.map(t => t.name || t).join(',')
    setPageMetadata({
      title: post.value.title,
      description: post.value.summary || post.value.excerpt || '',
      keywords: tags
    })
  }
}

// 加载文章数据
const loadArticle = async (postId) => {
  if (!postId) return

  // 先用本地缓存回填，减少内容闪烁；但仍会继续请求后端详情
  const existingPost = blogStore.getPostById(postId)
  if (existingPost && existingPost.content) {
    blogStore.currentPost = existingPost
    updateMetadata()
    nextTick(() => {
      updateActiveHeading()
    })
  }

  // 每次进入详情页都请求后端，确保阅读量按点击次数累加
  try {
    await blogStore.fetchArticleDetail(postId)
    updateMetadata()
    // 内容加载后更新目录高亮
    nextTick(() => {
      updateActiveHeading()
    })
  } catch (error) {
    console.error('加载文章失败:', error)
    // 如果是404错误，清空当前文章
    if (error.response?.status === 404) {
      blogStore.currentPost = null
    }
  }
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', throttledCheckMobile)
  window.addEventListener('scroll', throttledUpdateActiveHeading)
  
  const postId = parseInt(route.params.id)
  await loadArticle(postId)
})

onUnmounted(() => {
  window.removeEventListener('resize', throttledCheckMobile)
  window.removeEventListener('scroll', throttledUpdateActiveHeading)
  document.body.style.overflow = ''
})

watch(() => route.params.id, async (newId) => {
  if (newId) {
    const postId = parseInt(newId)
    await loadArticle(postId)
  }
})

watch(post, () => {
  updateMetadata()
})
</script>

<style scoped>
/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #94A3B8;
}

/* 页面基础动画 */
.post-detail-page {
  animation: fadeIn 0.5s ease-in-out;
}

/* @keyframes fadeIn 已移至全局 _keyframes.css */

/* 文章切换过渡动画 - 已由 SlideTransition 组件替代 */

/* 简单的淡入淡出动画 - 已由 FadeTransition 组件替代 */

.post-detail-wrapper {
  width: 100%;
}

/* 双栏布局容器 */
.article-page-container {
  display: flex;
  gap: 2rem;
  width: 100%;
  position: relative;
}

/* ===== 左侧栏样式 ===== */
.article-sidebar {
  flex: 0 0 20%;
  position: fixed;
  top: 80px;
  width: 18%;
  max-width: 280px;
  min-width: 200px;
  height: auto;
  max-height: 75vh;
  overflow-y: auto;
  background: rgba(30, 42, 58, 0.85);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 50;
}

/* 自定义滚动条 */
.article-sidebar::-webkit-scrollbar {
  width: 4px;
}

.article-sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.article-sidebar::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 2px;
}

.article-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.8);
}

/* 封面图 */
.sidebar-cover {
  width: 100%;
  padding-bottom: 100%; /* 正方形 */
  position: relative;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
}

.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cover-image:hover {
  transform: scale(1.05);
}

.cover-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 42, 58, 0.3);
  color: #64748B;
  font-size: 3rem;
}

/* 目录样式 */
.sidebar-toc {
  margin-top: 1rem;
}

.toc-title {
  color: #F8FAFC;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toc-title i {
  color: #8B5CF6;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin-bottom: 0.5rem;
}

/* 目录层级缩进 */
.toc-level-1 { margin-left: 0; }
.toc-level-2 { margin-left: 1rem; }
.toc-level-3 { margin-left: 2rem; }
.toc-level-4 { margin-left: 3rem; }
.toc-level-5 { margin-left: 4rem; }
.toc-level-6 { margin-left: 5rem; }

.toc-link {
  color: #CBD5E1;
  text-decoration: none;
  font-size: 0.9rem;
  line-height: 1.4;
  display: block;
  padding: 0.35rem 0.5rem;
  border-radius: 4px;
  border-left: 2px solid transparent;
  transition: all 0.2s ease;
}

.toc-link:hover {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
  border-left-color: rgba(96, 165, 250, 0.5);
}

/* 当前章节高亮 */
.toc-item.active .toc-link {
  color: #2983c7;
  background: rgba(139, 92, 246, 0.15);
  border-left-color: #d722cb;
  font-weight: 500;
}

/* ===== 右侧栏样式 ===== */
.article-main {
  flex: 1;
  min-width: 0;
  margin-left: calc(20% + 2rem);
  background: rgba(30, 42, 58, 0.6);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #1374d5;
}

/* 文章头部 */
.article-header {
  margin-bottom: 1.5rem;
}

.article-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #F8FAFC;
  line-height: 1.3;
}

/* 分类和标签 */
.article-taxonomy {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.article-category {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: rgba(236, 72, 153, 0.2);
  color: #F472B6;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.article-category:hover {
  background: rgba(236, 72, 153, 0.3);
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.article-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.7rem;
  background: rgba(139, 92, 246, 0.2);
  color: #C4B5FD;
  border-radius: 9999px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.article-tag:hover {
  background: rgba(139, 92, 246, 0.4);
  transform: translateY(-1px);
}

/* 元数据 */
.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  color: #94A3B8;
  font-size: 0.875rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.meta-item i {
  color: #64748B;
}

/* 分隔线 */
.article-divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 1.5rem 0 2rem;
}

/* ===== 文章内容样式 ===== */
.article-content {
  color: #E2E8F0;
  line-height: 1.8;
}

article {
  
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgb(198, 33, 96);
}

/* ===== 移动端样式 ===== */
.mobile-toc-btn {
  display: none;
  position: fixed;
  left: 16px;
  bottom: 80px;
  z-index: 100;
  padding: 10px 10px;
  background: rgba(26, 163, 205, 0.9);
  opacity: 0.7;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
  transition: all 0.3s ease;
}

.mobile-toc-btn:hover {
  background: rgba(139, 92, 246, 1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
}

.mobile-toc-btn i {
  margin-right: 6px;
}

.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 900;
}

/* ===== 导航按钮样式 ===== */
/* 已移至 NavigationControls.vue */
.animated-card {
  animation: slideUp 0.6s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
  animation-delay: 0.2s;
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

/* 响应式设计：平板设备 */
@media (max-width: 1024px) {
  .article-sidebar {
    width: 22%;
    max-width: 250px;
  }
  
  .article-main {
    margin-left: calc(24% + 1.5rem);
  }
  
  .article-title {
    font-size: 1.75rem;
  }
}

/* 响应式设计：移动设备 */
@media (max-width: 768px) {
  .article-page-container {
    flex-direction: column;
  }
  
  .article-sidebar {
    display: block; /* 改为block以便进行动画 */
    position: fixed;
    top: 0;
    left: 0;
    width: 85%;
    max-width: 300px;
    height: 100vh;
    max-height: 100vh;
    z-index: 1000;
    border-radius: 0;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 50px;
    /* 动画属性 */
    transform: translateX(-100%);
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.5s;
    visibility: hidden;
    background: rgba(30, 42, 58, 0.95); /* 增加不透明度 */
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.3);
  }
  
  .article-sidebar.mobile-open {
    transform: translateX(0);
    visibility: visible;
  }
  
  .mobile-toc-btn {
    display: flex;
    align-items: center;
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .article-main {
    width: 100%;
    margin-left: 0;
    padding: 1.5rem;
  }
  
  .article-title {
    font-size: 1.5rem;
  }
  
  .article-taxonomy {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* ===== 响应式设计：标准手机设备 (321px - 480px) */
@media (max-width: 480px) and (min-width: 321px) {
  article {
    padding: 16px;
    margin-bottom: 16px;
  }
}

/* 响应式设计：小屏手机设备 (≤320px) */
@media (max-width: 320px) {
  article {
    padding: 12px;
    margin-bottom: 12px;
  }
}

/* 响应式设计：超大屏桌面 (1441px - 1920px) */
@media (min-width: 1441px) and (max-width: 1920px) {
  article {
    padding: 24px;
  }
}

/* 响应式设计：4K及超高分辨率屏幕 (≥1921px) */
@media (min-width: 1921px) {
  article {
    padding: 28px;
    max-width: 1400px; /* 限制文章内容宽度，提高可读性 */
    margin-left: auto;
    margin-right: auto;
    transition: padding 0.3s ease;
  }
}
</style>