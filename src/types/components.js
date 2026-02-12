/**
 * @file components.js
 * @description 组件共用 JSDoc 类型定义
 *
 * 为项目中的组件 Props 和数据模型提供统一的类型定义，
 * 提升代码可读性和 IDE 智能提示支持。
 */

/**
 * 文章数据模型
 * @typedef {Object} Post
 * @property {number|string} id - 文章唯一标识
 * @property {string} title - 文章标题
 * @property {string} [summary] - 文章摘要
 * @property {string} [excerpt] - 文章摘要（兼容字段）
 * @property {string} [cover_image] - 封面图片路径
 * @property {string} [image] - 封面图片路径（兼容字段）
 * @property {string} [publish_time] - 发布时间
 * @property {string} [date] - 发布时间（兼容字段）
 * @property {number} [view_count] - 阅读数
 * @property {Array<Tag>} [tags] - 标签列表
 */

/**
 * 标签数据模型
 * @typedef {Object} Tag
 * @property {number|string} [id] - 标签唯一标识
 * @property {string} name - 标签名称
 */

/**
 * 导航项数据模型
 * @typedef {Object} NavItem
 * @property {string} path - 路由路径
 * @property {string} label - 显示文本
 * @property {string} [icon] - 图标类名或路径
 * @property {string} [iconHover] - 悬停图标路径
 * @property {string} [routeName] - 路由名称（用于激活状态判断）
 */

/**
 * 背景设置数据模型
 * @typedef {Object} BackgroundSettings
 * @property {string} imagePath - 背景图片路径
 * @property {number} opacity - 透明度 (0-1)
 */

/**
 * 分页数据模型
 * @typedef {Object} PaginationState
 * @property {number} currentPage - 当前页码
 * @property {number} totalPages - 总页数
 * @property {number} pageSize - 每页条数
 * @property {number} total - 总条数
 */

/**
 * Post 对象验证器
 * @param {*} value - 待验证的值
 * @returns {boolean} 是否为有效的 Post 对象
 */
export function isValidPost(value) {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof value.id !== 'undefined' &&
    typeof value.title === 'string'
  )
}

/**
 * NavItem 对象验证器
 * @param {*} value - 待验证的值
 * @returns {boolean} 是否为有效的 NavItem 对象
 */
export function isValidNavItem(value) {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof value.path === 'string' &&
    typeof value.label === 'string'
  )
}

/**
 * PaginationState 对象验证器
 * @param {*} value - 待验证的值
 * @returns {boolean} 是否为有效的 PaginationState 对象
 */
export function isValidPaginationState(value) {
  return (
    value != null &&
    typeof value === 'object' &&
    Number.isInteger(value.currentPage) &&
    Number.isInteger(value.totalPages) &&
    value.currentPage > 0 &&
    value.totalPages >= 0
  )
}
