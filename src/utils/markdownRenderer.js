import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import yaml from 'highlight.js/lib/languages/yaml';
import taskLists from 'markdown-it-task-lists';
import { processImagePaths } from '@/utils/markdownUtils';

// 按需注册语言（xml 同时覆盖 html 别名；markdown 内联 HTML 依赖 xml 语法）
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('yaml', yaml);

// 配置 Markdown 渲染器（模块级单例）
const md = new MarkdownIt({
  html: true,        // 允许原始HTML
  linkify: true,     // 自动转换URL
  typographer: true, // 启用智能引号等
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) { /* 高亮失败静默回退，保持旧行为 */ }
    }
    return ''; // 使用默认代码块样式
  }
})
.use(taskLists, { enabled: true }); // 启用任务列表

/**
 * 渲染 Markdown 为安全 HTML
 * @param {string} content - Markdown 原文
 * @param {string} baseUrl - 相对图片路径的基准 URL
 * @returns {string} 净化后的 HTML（含标题锚点、懒加载图片、外链属性、复制按钮）
 */
export function renderMarkdown(content, baseUrl) {
  if (!content) return '';

  // 1. 处理图片路径
  const processedContent = processImagePaths(content, baseUrl);

  // 2. Markdown 渲染
  let html = md.render(processedContent);

  // 3. 安全净化（关键！防止XSS攻击）
  html = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 
      'ul', 'ol', 'li', 'code', 'pre', 'a', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td', 'strong', 'em', 'hr',
      'br', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'target', 'rel']
  });

  // 4. 为标题添加ID（用于目录导航）
  html = html.replace(/<(h[1-6])>(.+?)<\/h[1-6]>/gi, (match, tag, title) => {
    const id = title
      .replace(/<[^>]+>/g, '') // 移除HTML标签
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 只保留字母、数字、中文、空格和连字符
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/-+/g, '-') // 多个连字符合并为一个
      .replace(/^-|-$/g, ''); // 移除开头和结尾的连字符
    return `<${tag} id="${id}">${title}</${tag}>`;
  });

  // 5. 优化图片加载（懒加载）
  html = html.replace(/<img/g, '<img loading="lazy"');

  // 6. 处理外部链接（在新窗口打开）
  html = html.replace(/<a href="http/g, '<a target="_blank" rel="noopener noreferrer" href="http');

  // 7. 净化之后注入复制按钮（绝对定位，视觉位置与原先 append 到 pre 末尾一致）
  html = html.replace(/<pre([^>]*)><code/g, '<pre$1><button class="copy-button" type="button">复制</button><code');

  return html;
}
