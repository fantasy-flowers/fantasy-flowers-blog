<template>
  <!-- 归档页：按年份分组的时间线展示 -->
  <div class="archive-page">
    <!-- 页面头部 -->
    <header class="archive-header fadeIn">
      <div class="archive-header__content">
        <h1 class="archive-header__title">文章归档</h1>
        <p class="archive-header__subtitle">共 {{ blogStore.posts.length }} 篇文章，记录成长的每一步</p>
      </div>
    </header>

    <!-- 加载状态 -->
    <LoadingSpinner v-if="blogStore.postsLoading" text="正在加载归档..." />

    <!-- 时间线内容 -->
    <div v-else-if="yearGroups.length" class="archive-timeline archive-card">
      <div
        v-for="(group, groupIndex) in yearGroups"
        :key="group.year"
        class="archive-year slideUp"
        :style="{ animationDelay: `${groupIndex * 0.1}s` }"
      >
        <!-- 年份标题 -->
        <h2 class="archive-year__title">
          <i class="fa-regular fa-calendar-days"></i>
          {{ group.year }}
          <span class="archive-year__count">{{ group.posts.length }} 篇</span>
        </h2>

        <!-- 该年份下的文章列表 -->
        <ul class="archive-year__list">
          <li
            v-for="post in group.posts"
            :key="post.id"
            class="archive-item"
            @click="navigateToPost(post.id)"
          >
            <span class="archive-item__date">{{ formatPostDate(post) }}</span>
            <span class="archive-item__dot"></span>
            <span class="archive-item__title">{{ post.title }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="archive-empty fadeIn">
      <i class="fa-regular fa-clock"></i>
      <p>暂无归档文章</p>
    </div>
  </div>
</template>

<script setup>
/**
 * 归档视图组件
 *
 * 展示所有文章按年份分组的时间线
 * 每篇文章显示发布日期和标题，点击可跳转到详情页
 */
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '@/stores/modules/blog'
import { setPageMetadata } from '@/utils/metadata'
import { formatDate } from '@/utils/format'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'

// ==================== 路由和 Store ====================

const router = useRouter()
const blogStore = useBlogStore()

// ==================== 计算属性 ====================

/** 按年份分组的文章列表 */
const yearGroups = computed(() => {
  const groups = {}

  // 按日期降序排列的文章列表
  const sortedPosts = [...blogStore.posts].sort((a, b) => {
    const dateA = new Date(a.publish_time || a.date || 0)
    const dateB = new Date(b.publish_time || b.date || 0)
    return dateB - dateA
  })

  sortedPosts.forEach((post) => {
    const date = new Date(post.publish_time || post.date || 0)
    const year = date.getFullYear()
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(post)
  })

  // 转为数组，按年份降序排列
  return Object.keys(groups)
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      posts: groups[year]
    }))
})

// ==================== 方法 ====================

/**
 * 格式化文章日期（仅月/日）
 * @param {Object} post - 文章对象
 * @returns {string} 格式化后的日期字符串
 */
function formatPostDate(post) {
  const dateStr = post.publish_time || post.date || ''
  return formatDate(dateStr, { month: '2-digit', day: '2-digit' })
}

/**
 * 跳转到文章详情页
 * @param {number|string} id - 文章 ID
 */
function navigateToPost(id) {
  router.push({ name: 'post-detail', params: { id } })
}

// ==================== 生命周期 ====================

onMounted(async () => {
  // 设置页面元数据
  setPageMetadata({
    title: '文章归档',
    description: '按时间归档的所有文章列表',
    keywords: '归档,文章,时间线,博客'
  })

  // 确保数据已加载
  await blogStore.initializeData()
})
</script>

<style scoped>
/* ==================== 动画定义 ==================== */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fadeIn {
  animation: fadeIn 0.8s ease forwards;
}

.slideUp {
  opacity: 0;
  animation: slideUp 0.5s ease forwards;
}

/* ==================== 页面容器 ==================== */
.archive-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ==================== 头部区域 ==================== */
.archive-header {
  text-align: center;
  padding: 60px 20px 40px;
}

.archive-header__content {
  max-width: 600px;
  margin: 0 auto;
}

.archive-header__title {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #638cff, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 12px;
}

.archive-header__subtitle {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* ==================== 时间线 ==================== */
.archive-timeline {
  margin: 20px 0 60px;
}

/* ==================== 卡片样式 ==================== */
.archive-card {
  position: relative;
  padding: 40px;
  background-color: rgba(30, 42, 58, 0.6); /* 深色半透明背景，提供清晰的对比度 */
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(6px); /* 可选：毛玻璃效果 */
}

/* ==================== 年份分组 ==================== */
.archive-year {
  margin-bottom: 40px;
}

.archive-year:last-child {
  margin-bottom: 0;
}

.archive-year__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.archive-year__title i {
  color: #638cff;
  font-size: 18px;
}

.archive-year__count {
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  margin-left: auto;
}

/* ==================== 文章条目 ==================== */
.archive-year__list {
  list-style: none;
  margin: 0;
  padding: 0 0 0 12px;
  border-left: 2px solid rgba(99, 140, 255, 0.2);
}

.archive-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  margin-left: -1px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.archive-item:hover {
  background: rgba(99, 140, 255, 0.06);
}

.archive-item__date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Courier New', monospace;
  flex-shrink: 0;
  min-width: 50px;
}

.archive-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(99, 140, 255, 0.5);
  flex-shrink: 0;
  transition: background 0.2s ease, transform 0.2s ease;
}

.archive-item:hover .archive-item__dot {
  background: #638cff;
  transform: scale(1.3);
}

.archive-item__title {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1; /* 让标题占据剩余空间 */
  min-width: 0; /* 允许在Flex容器中收缩 */
}

.archive-item:hover .archive-item__title {
  color: #638cff;
}

/* ==================== 空状态 ==================== */
.archive-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.archive-empty i {
  font-size: 48px;
  margin-bottom: 16px;
}

.archive-empty p {
  font-size: 16px;
  margin: 0;
}

/* ==================== 响应式适配 ==================== */
@media (max-width: 768px) {
  .archive-page {
    padding: 0 16px;
  }

  .archive-header {
    padding: 40px 16px 24px;
  }

  .archive-header__title {
    font-size: 28px;
  }

  .archive-card {
    padding: 20px;
  }

  .archive-year__title {
    font-size: 18px;
  }

  .archive-item {
    padding: 8px 12px;
    gap: 10px;
  }

  .archive-item__title {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .archive-header__title {
    font-size: 24px;
  }

  .archive-card {
    padding: 16px; /* 进一步减小内边距 */
  }

  .archive-year__list {
    border-left: none;
    padding-left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .archive-item {
    margin-left: 0;
    justify-content: center;
    width: 100%;
  }

  .archive-item__dot,
  .archive-item__date {
    display: none;
  }

  .archive-item__title {
    text-align: center;
  }

  .archive-year__title {
    justify-content: center;
  }

  .archive-year__count {
    margin-left: 10px;
  }
}
</style>
