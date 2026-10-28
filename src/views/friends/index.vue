<template>
  <div class="friends-page">
    <header class="header animated-header">
      <h1 class="header-title text-gradient">友情链接</h1>
      <p class="header-subtitle">与我互相链接的朋友们</p>
    </header>
    
    <div class="friends-content">
      <div class="friends-main">
        <div class="friends-description animated-card">
          <div v-if="loading" class="loading-state">
            <LoadingSpinner text="加载中..." />
          </div>
          
          <div v-else-if="friendsPageContent" class="description-card">
            <MarkdownRenderer :content="friendsPageContent" />
          </div>
          
          <div v-else class="description-card">
            <div class="no-content-message">
              <h3>
                <i class="fa fa-heart"></i>
                友情链接
              </h3>
              <p>页面内容正在准备中，请稍后再来查看。</p>
              <p>如果您是管理员，请登录后台管理系统添加友情链接页面的内容。</p>
            </div>
          </div>
        </div>
        
        <div class="friends-grid-container animated-card">
          <h3 class="friends-section-title">
            <i class="fa fa-users"></i>
            我的朋友们
          </h3>
          <div class="friends-grid">
            <a 
              v-for="friend in blogStore.friends" 
              :key="friend.name"
              :href="friend.url"
              target="_blank"
              rel="noopener noreferrer"
              class="friend-card animated-friend"
            >
              <img :src="friend.avatar" :alt="friend.name" class="friend-avatar">
              <div class="friend-info">
                <div class="friend-name">{{ friend.name }}</div>
                <div class="friend-description">{{ friend.description || '暂无描述' }}</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useBlogStore } from '@/stores/modules/blog'
import { setPageMetadata } from '@/utils/metadata'
import { pageAPI } from '@/api'
import MarkdownRenderer from '@/components/business/MarkdownRenderer.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'

const blogStore = useBlogStore()
const loading = ref(false)
const friendsPageContent = ref('')

const currentUrl = computed(() => {
  return window.location.origin
})

// 加载友情链接页面内容
const loadFriendsPageContent = async () => {
  loading.value = true
  try {
    const response = await pageAPI.getPageContent('friends')
    if (response && response.content) {
      friendsPageContent.value = response.content
    }
  } catch (error) {
    console.error('加载友情链接页面内容失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 并行加载友情链接和页面内容
  await Promise.all([
    blogStore.fetchFriendLinks(),
    loadFriendsPageContent()
  ])
  
  // 设置页面元数据
  setPageMetadata({
    title: '友情链接',
    description: 'Fantasy Flowers博客友情链接页面，展示与我互相链接的朋友们的博客',
    keywords: '友情链接,博客,技术交流,友链'
  })
})
</script>

<style scoped>
/* 页面基础样式 */
.friends-page {
  animation: fadeIn 0.5s ease-in-out;
}

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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 页面头部样式 */
.header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%);
  border-radius: var(--blog-radius-lg);
  border: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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

/* 卡片动画样式 */
.animated-card {
  animation: slideUp 0.6s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
}

.animated-card:nth-child(1) {
  animation-delay: 0.2s;
}

.animated-card:nth-child(2) {
  animation-delay: 0.4s;
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

/* 友情链接动画样式 */
.animated-friend {
  animation: fadeIn 0.3s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.friends-grid .animated-friend:nth-child(1) { animation-delay: 0.1s; }
.friends-grid .animated-friend:nth-child(2) { animation-delay: 0.2s; }
.friends-grid .animated-friend:nth-child(3) { animation-delay: 0.3s; }
.friends-grid .animated-friend:nth-child(4) { animation-delay: 0.4s; }
.friends-grid .animated-friend:nth-child(5) { animation-delay: 0.5s; }
.friends-grid .animated-friend:nth-child(6) { animation-delay: 0.6s; }
.friends-grid .animated-friend:nth-child(7) { animation-delay: 0.7s; }
.friends-grid .animated-friend:nth-child(8) { animation-delay: 0.8s; }
.friends-grid .animated-friend:nth-child(9) { animation-delay: 0.9s; }
.friends-grid .animated-friend:nth-child(10) { animation-delay: 1.0s; }

.header-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--blog-text-bright);
  position: relative;
}

.header-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, var(--blog-blue-strong) 0%, var(--blog-blue-light) 100%);
  border-radius: 2px;
  margin: 10px auto;
}

.text-gradient {
  background: linear-gradient(135deg, var(--blog-blue-strong) 0%, var(--blog-blue-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: 1.1rem;
  color: var(--blog-gray);
  line-height: 1.6;
}

/* 主要内容区域 */
.friends-content {
  display: block;
  max-width: 800px;
  margin: 0 auto;
}

.friends-main {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 描述卡片样式 */
.description-card {
  background-color: rgba(30, 42, 58, var(--bg-opacity, 0.6));
  /* backdrop-filter removed for GPU optimization */
  border: 1px solid var(--blog-border);
  border-radius: var(--blog-radius-lg);
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.description-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.description-card h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--blog-blue-light);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.description-card p {
  color: #E2E8F0;
  line-height: 1.6;
  margin-bottom: 16px;
}

/* 无内容提示样式 */
.no-content-message {
  text-align: center;
  padding: 2rem;
}

.no-content-message h3 {
  color: var(--blog-blue-light);
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.no-content-message p {
  color: var(--blog-gray);
  line-height: 1.6;
  margin-bottom: 1rem;
}

/* 友情链接网格容器 */
.friends-grid-container {
  background-color: var(--blog-bg-card);
  /* backdrop-filter removed for GPU optimization */
  border: 1px solid var(--blog-border);
  border-radius: var(--blog-radius-lg);
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.friends-grid-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.friends-section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--blog-blue-light);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
}

/* 友情链接网格布局 */
.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* 友情链接卡片样式 */
.friend-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--blog-radius-md);
  text-decoration: none;
  transition: all 0.3s ease;
  color: inherit;
  position: relative;
  overflow: hidden;
}

.friend-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 197, 253, 0.2) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.friend-card:hover {
  background-color: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.friend-card:hover::before {
  opacity: 1;
}

/* 友情链接头像样式 */
.friend-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(59, 130, 246, 0.5);
  transition: all 0.3s ease;
}

.friend-card:hover .friend-avatar {
  border-color: var(--blog-blue-strong);
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
}

/* 友情链接信息样式 */
.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--blog-text-bright);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.friend-description {
  font-size: 0.85rem;
  color: var(--blog-gray);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
    line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .friends-content {
    max-width: 100%;
    padding: 0 20px;
  }
  
  .friends-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .header {
    padding: 30px 15px;
  }
  
  .header-title {
    font-size: 2rem;
  }
  
  .description-card,
  .friends-grid-container {
    padding: 20px;
  }
  
  .friends-grid {
    grid-template-columns: 1fr;
  }
  
  .friend-card {
    padding: 12px;
  }
  
  .friends-content {
    padding: 0 15px;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.8rem;
  }
  
  .description-card,
  .friends-grid-container {
    padding: 16px;
  }
  
  .friend-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .friend-avatar {
    width: 60px;
    height: 60px;
  }
  
  .friends-content {
    padding: 0 10px;
  }
}
</style>