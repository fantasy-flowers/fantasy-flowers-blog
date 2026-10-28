<template>
  <div class="markdown-content" v-html="renderedContent" @click="onClickContent"></div>
</template>

<script>
import 'highlight.js/styles/github.css'; // 选择你喜欢的样式
import { renderMarkdown } from '@/utils/markdownRenderer';

export default {
  name: 'MarkdownRenderer',
  props: {
    content: {
      type: String,
      required: true
    },
    baseUrl: {
      type: String,
      default: ''
    }
  },
  computed: {
    renderedContent() {
      return renderMarkdown(this.content, this.baseUrl);
    }
  },
  mounted() {
    this.scrollToHash();
    window.addEventListener('hashchange', this.scrollToHash);
  },
  beforeUnmount() {
    window.removeEventListener('hashchange', this.scrollToHash);
  },
  methods: {
    onClickContent(e) {
      const button = e.target.closest('.copy-button');
      if (!button) return;
      const pre = button.closest('pre');
      if (!pre) return;
      const code = pre.querySelector('code');
      if (!code) return;
      const text = code.innerText;
      navigator.clipboard.writeText(text).then(() => {
        button.textContent = '已复制';
        setTimeout(() => button.textContent = '复制', 2000);
      }).catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        button.textContent = '已复制';
        setTimeout(() => button.textContent = '复制', 2000);
      });
    },

    scrollToHash() {
      const hash = window.location.hash;
      if (hash) {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }
}
</script>

<style scoped>
/* 基础样式优化 */
.markdown-content {
  line-height: 1.8;
  font-size: 1.1rem;
  color: #ffffff;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 标题样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.25;
  color: #ffffff;
}

.markdown-content :deep(h1) {
  font-size: 2.25rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.markdown-content :deep(h2) {
  font-size: 1.875rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.25rem;
}

.markdown-content :deep(h3) {
  font-size: 1.5rem;
}

.markdown-content :deep(h4) {
  font-size: 1.25rem;
}

/* 段落样式 */
.markdown-content :deep(p) {
  margin-bottom: 1rem;
  color: #ffffff;
}

/* 列表样式 */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 2rem;
  color: #ffffff;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5rem;
  color: #ffffff;
}

/* 引用样式 */
.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--blog-blue-strong);
  background: var(--blog-bg-card);
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #ffffff;
}

/* 代码块样式 */
.markdown-content :deep(pre) {
  background: #2d2d2d;
  border-radius: var(--blog-radius-sm);
  padding: 15px;
  overflow-x: auto;
  margin: 20px 0;
  position: relative;
  color: #ffffff;
}

.markdown-content :deep(code) {
  background: var(--blog-bg-card-strong);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: #ffffff;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: #f8f8f2;
}

/* 复制按钮样式 */
.markdown-content :deep(.copy-button) {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #444;
  color: white;
  border: none;
  border-radius: var(--blog-radius-xs);
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
  z-index: 10;
  transition: background-color 0.2s;
}

.markdown-content :deep(.copy-button:hover) {
  background: #555;
}

/* 响应式图片 */
.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--blog-radius-md);
  margin: 20px 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 表格样式 */
.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  overflow-x: auto;
  display: block;
  white-space: nowrap;
  color: #ffffff;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--blog-border-strong);
  padding: 0.75rem;
  text-align: left;
  color: #ffffff;
}

.markdown-content :deep(th) {
  background: var(--blog-bg-card-strong);
  font-weight: 600;
  color: #ffffff;
}

.markdown-content :deep(tbody tr:nth-child(even)) {
  background: rgba(30, 42, 58, 0.4);
}

/* 链接样式 */
.markdown-content :deep(a) {
  color: var(--blog-blue);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.markdown-content :deep(a:hover) {
  border-bottom-color: var(--blog-blue);
  color: var(--blog-blue-light);
}

/* 分割线样式 */
.markdown-content :deep(hr) {
  border: none;
  border-top: 2px solid var(--blog-border-strong);
  margin: 2rem 0;
}

/* 任务列表样式 */
.markdown-content :deep(.task-list-item) {
  list-style: none;
  margin-left: -1.5rem;
  padding-left: 0;
  color: #ffffff;
}

.markdown-content :deep(.task-list-item-checkbox) {
  margin-right: 0.5rem;
  margin-left: 0;
  transform: scale(1.2);
  accent-color: var(--blog-blue);
}

.markdown-content :deep(.task-list-item-checkbox:checked + *) {
  text-decoration: line-through;
  opacity: 0.7;
  color: #ffffff;
}

/* 强调文本样式 */
.markdown-content :deep(strong),
.markdown-content :deep(b) {
  color: #ffffff;
  font-weight: 600;
}

.markdown-content :deep(em),
.markdown-content :deep(i) {
  color: #ffffff;
  font-style: italic;
}

/* 删除线文本 */
.markdown-content :deep(del),
.markdown-content :deep(s) {
  color: #ffffff;
  text-decoration: line-through;
}

/* 其他文本元素 */
.markdown-content :deep(span),
.markdown-content :deep(div) {
  color: inherit;
}

/* 确保所有文本都是白色 */
.markdown-content :deep(*) {
  color: inherit;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .markdown-content {
    padding: 0 15px;
    font-size: 1rem;
  }
  
  .markdown-content :deep(h1) {
    font-size: 1.875rem;
  }
  
  .markdown-content :deep(h2) {
    font-size: 1.5rem;
  }
  
  .markdown-content :deep(h3) {
    font-size: 1.25rem;
  }
  
  .markdown-content :deep(table) {
    font-size: 0.875rem;
  }
  
  .markdown-content :deep(.copy-button) {
    font-size: 10px;
    padding: 3px 6px;
  }
}
</style>
