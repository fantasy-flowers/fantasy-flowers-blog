/**
 * 页面标题和元数据管理工具
 */

/**
 * 设置页面标题
 * @param {string} title - 页面标题
 */
export function setPageTitle(title) {
  document.title = title ? `${title} - Fantasy Flowers` : 'Fantasy Flowers'
}

/**
 * 设置页面描述
 * @param {string} description - 页面描述
 */
export function setPageDescription(description) {
  let metaDescription = document.querySelector('meta[name="description"]')
  
  if (!metaDescription) {
    metaDescription = document.createElement('meta')
    metaDescription.name = 'description'
    document.head.appendChild(metaDescription)
  }
  
  metaDescription.content = description || 'Fantasy Flowers - 前端开发技术博客，分享Vue.js、JavaScript、CSS等前端技术'
}

/**
 * 设置页面关键词
 * @param {string} keywords - 页面关键词
 */
export function setPageKeywords(keywords) {
  let metaKeywords = document.querySelector('meta[name="keywords"]')
  
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta')
    metaKeywords.name = 'keywords'
    document.head.appendChild(metaKeywords)
  }
  
  metaKeywords.content = keywords || 'Vue.js,JavaScript,前端开发,博客,技术分享'
}

/**
 * 设置页面元数据
 * @param {Object} options - 元数据选项
 * @param {string} options.title - 页面标题
 * @param {string} options.description - 页面描述
 * @param {string} options.keywords - 页面关键词
 */
export function setPageMetadata({ title, description, keywords }) {
  setPageTitle(title)
  setPageDescription(description)
  setPageKeywords(keywords)
}