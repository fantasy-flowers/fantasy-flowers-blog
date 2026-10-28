<template>
  <div class="about-page">
    <header class="header animated-header">
      <h1 class="header-title text-gradient">关于我</h1>
      <p class="header-subtitle">了解更多关于我的信息</p>
    </header>
    
    <div v-if="loading" class="loading-state">
      <LoadingSpinner text="加载中..." />
    </div>
    
    <div v-else-if="pageContent" class="about-content animated-card">
      <MarkdownRenderer :content="pageContent" />
    </div>
    
    <div v-else class="about-content animated-card">
      <div class="no-content-message">
        <h2>关于我</h2>
        <p>页面内容正在准备中，请稍后再来查看。</p>
        <p>如果您是管理员，请登录后台管理系统添加关于页面的内容。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { setPageMetadata } from '@/utils/metadata'
import { pageAPI } from '@/api'
import MarkdownRenderer from '@/components/business/MarkdownRenderer.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'

const loading = ref(false)
const pageContent = ref('')

// 加载关于页面内容
const loadAboutContent = async () => {
  loading.value = true
  try {
    const response = await pageAPI.getPageContent('about')
    if (response && response.content) {
      pageContent.value = response.content
    }
  } catch (error) {
    console.error('加载关于页面内容失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadAboutContent()
  setPageMetadata({
    title: '关于我',
    description: '了解更多关于Fantasy Flowers的信息，包括个人简介、技术栈和联系方式',
    keywords: '关于我,个人简介,技术栈,联系方式'
  })
})
</script>
<style
 scoped>
/* 加载状态样式 */
/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--blog-gray);
}

/* 页面基础动画 */
.about-page {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 头部下滑动画 */
.header {
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 内容卡片上滑动画 */
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

/* 关于页面内容样式 */
.about-content {
  background-color: var(--blog-bg-card);
  border: 1px solid var(--blog-border);
  border-radius: var(--blog-radius-lg);
  padding: 2rem;
  margin: 2rem auto;
  max-width: 800px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 无内容提示样式 */
.no-content-message {
  text-align: center;
  padding: 3rem 2rem;
}

.no-content-message h2 {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--blog-border-strong);
  padding-bottom: 0.5rem;
  display: inline-block;
}

.no-content-message p {
  color: var(--blog-gray);
  line-height: 1.8;
  margin-bottom: 1rem;
}
</style>
