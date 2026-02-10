<template>
  <div class="markdown-renderer-with-toc">
    <!-- 目录 -->
    <div v-if="showTOC && toc.length > 0" class="toc-container">
      <h3 class="toc-title">目录</h3>
      <nav class="toc-nav">
        <ul class="toc-list">
          <li 
            v-for="item in toc" 
            :key="item.id"
            :class="['toc-item', `toc-level-${item.level}`]"
          >
            <a 
              :href="`#${item.id}`" 
              class="toc-link"
              @click="scrollToHeading(item.id)"
            >
              {{ item.title }}
            </a>
          </li>
        </ul>
      </nav>
    </div>
    
    <!-- Markdown 内容 -->
    <div class="markdown-content-wrapper">
      <MarkdownRenderer 
        :content="processedContent" 
        :base-url="baseUrl"
        ref="markdownRenderer"
      />
      
      <!-- 阅读时间和字数统计 -->
      <div v-if="showStats" class="reading-stats">
        <span class="stat-item">
          <i class="fa fa-clock"></i>
          预计阅读时间: {{ readingTime }} 分钟
        </span>
        <span class="stat-item">
          <i class="fa fa-file-text"></i>
          字数: {{ wordCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import MarkdownRenderer from './MarkdownRenderer.vue';
import { generateTOC, addHeadingAnchors, estimateReadingTime, extractSummary } from '@/utils/markdownUtils';

export default {
  name: 'MarkdownRendererWithTOC',
  components: {
    MarkdownRenderer
  },
  props: {
    content: {
      type: String,
      required: true
    },
    baseUrl: {
      type: String,
      default: ''
    },
    showTOC: {
      type: Boolean,
      default: true
    },
    showStats: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    processedContent() {
      if (!this.content) return '';
      return addHeadingAnchors(this.content);
    },
    
    toc() {
      return generateTOC(this.content);
    },
    
    readingTime() {
      return estimateReadingTime(this.content);
    },
    
    wordCount() {
      if (!this.content) return 0;
      
      // 计算字符数（中文按字符计算，英文按单词计算）
      const text = this.content
        .replace(/```[\s\S]*?```/g, '') // 移除代码块
        .replace(/`[^`]+`/g, '') // 移除内联代码
        .replace(/[^\u4e00-\u9fa5\w\s]/g, '') // 只保留中文、英文和空格
        .trim();
      
      const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
      const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
      
      return chineseChars + englishWords;
    },
    
    summary() {
      return extractSummary(this.content);
    }
  },
  methods: {
    scrollToHeading(id) {
      this.$nextTick(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    }
  }
}
</script>

<style scoped>
.markdown-renderer-with-toc {
  display: flex;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 目录样式 */
.toc-container {
  flex: 0 0 250px;
  position: sticky;
  top: 2rem;
  height: fit-content;
  background: rgba(30, 42, 58, 0.6);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toc-title {
  color: #F8FAFC;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.toc-nav {
  max-height: 70vh;
  overflow-y: auto;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin-bottom: 0.5rem;
}

.toc-level-1 {
  margin-left: 0;
}

.toc-level-2 {
  margin-left: 1rem;
}

.toc-level-3 {
  margin-left: 2rem;
}

.toc-level-4 {
  margin-left: 3rem;
}

.toc-level-5 {
  margin-left: 4rem;
}

.toc-level-6 {
  margin-left: 5rem;
}

.toc-link {
  color: #ffffff;
  text-decoration: none;
  font-size: 0.9rem;
  line-height: 1.4;
  display: block;
  padding: 0.25rem 0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toc-link:hover {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
  padding-left: 0.5rem;
}

/* 内容区域 */
.markdown-content-wrapper {
  flex: 1;
  min-width: 0; /* 防止 flex 子项溢出 */
}

/* 阅读统计 */
.reading-stats {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(30, 42, 58, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  color: #ffffff;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-item i {
  color: #60a5fa;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .markdown-renderer-with-toc {
    flex-direction: column;
  }
  
  .toc-container {
    flex: none;
    position: static;
    order: -1;
  }
  
  .toc-nav {
    max-height: 200px;
  }
}

@media (max-width: 768px) {
  .markdown-renderer-with-toc {
    gap: 1rem;
  }
  
  .toc-container {
    padding: 1rem;
  }
  
  .reading-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>