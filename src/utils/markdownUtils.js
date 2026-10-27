/**
 * Markdown 渲染相关的工具函数
 */

import { STATIC_BASE_URL } from './imageUrl';

/**
 * 处理 Markdown 中的图片路径
 * @param {string} content - 原始 Markdown 内容
 * @param {string} baseUrl - 图片基础 URL（为空时回落到 G4 的静态资源基址，修复正文相对图片 404）
 * @returns {string} 处理后的 Markdown 内容
 */
export function processImagePaths(content, baseUrl = '') {
  if (!content) return '';

  // 未显式传入基址时，统一使用静态资源基址（与 getImageUrl 同一变量）
  const resolvedBase = baseUrl || STATIC_BASE_URL;

  // 处理相对路径的图片
  return content.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
    (match, alt, src) => {
      // 如果是相对路径，添加基础 URL
      const fullUrl = src.startsWith('/') ? `${resolvedBase}${src}` : `${resolvedBase}/${src}`;
      return `![${alt}](${fullUrl})`;
    }
  );
}

/**
 * 提取 Markdown 内容的摘要
 * @param {string} content - Markdown 内容
 * @param {number} maxLength - 最大长度
 * @returns {string} 摘要文本
 */
export function extractSummary(content, maxLength = 200) {
  if (!content) return '';

  // 移除 Markdown 语法
  let text = content
    .replace(/#{1,6}\s+/g, '') // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
    .replace(/`(.*?)`/g, '$1') // 移除内联代码标记
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 移除图片
    .replace(/>\s+/g, '') // 移除引用标记
    .replace(/[-*+]\s+/g, '') // 移除列表标记
    .replace(/\d+\.\s+/g, '') // 移除有序列表标记
    .replace(/\n+/g, ' ') // 将换行符替换为空格
    .trim();

  // 截取指定长度
  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + '...';
  }

  return text;
}

/**
 * 估算 Markdown 内容的阅读时间
 * @param {string} content - Markdown 内容
 * @param {number} wordsPerMinute - 每分钟阅读字数（中文按字符计算）
 * @returns {number} 预估阅读时间（分钟）
 */
export function estimateReadingTime(content, wordsPerMinute = 200) {
  if (!content) return 0;

  // 移除 Markdown 语法，只计算纯文本
  const text = content
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`[^`]+`/g, '') // 移除内联代码
    .replace(/#{1,6}\s+/g, '') // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 移除图片
    .replace(/[^\u4e00-\u9fa5\w\s]/g, '') // 只保留中文、英文和空格
    .trim();

  // 计算字符数（中文按字符计算，英文按单词计算）
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

  const totalWords = chineseChars + englishWords;
  const readingTime = Math.ceil(totalWords / wordsPerMinute);

  return Math.max(1, readingTime); // 至少1分钟
}

/**
 * 生成目录（TOC）
 * @param {string} content - Markdown 内容
 * @returns {Array} 目录数组
 */
export function generateTOC(content) {
  if (!content) return [];

  const headings = [];
  const lines = content.split('\n');
  let inCodeBlock = false;

  lines.forEach((line, index) => {
    // 检测代码块边界
    if (/^\s*```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      return;
    }

    // 如果在代码块内，跳过处理
    if (inCodeBlock) return;

    // 匹配标题，仅匹配一二级标题 (#{1,2})
    const match = line.match(/^(#{1,2})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = title
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 只保留字母、数字、中文、空格和连字符
        .replace(/\s+/g, '-') // 空格替换为连字符
        .replace(/-+/g, '-') // 多个连字符合并为一个
        .replace(/^-|-$/g, ''); // 移除开头和结尾的连字符

      headings.push({
        level,
        title,
        id,
        line: index + 1
      });
    }
  });

  return headings;
}

/**
 * 为标题添加锚点 ID
 * @param {string} content - Markdown 内容
 * @returns {string} 添加了锚点的 Markdown 内容
 */
export function addHeadingAnchors(content) {
  if (!content) return '';

  const lines = content.split('\n');
  let inCodeBlock = false;

  const processedLines = lines.map(line => {
    // 检测代码块边界
    if (/^\s*```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      return line;
    }

    // 如果在代码块内，保持原样
    if (inCodeBlock) return line;

    // 匹配标题并添加锚点
    return line.replace(/^(#{1,6})\s+(.+)$/, (match, hashes, title) => {
      const id = title.trim()
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      return `${hashes} ${title} {#${id}}`;
    });
  });

  return processedLines.join('\n');
}