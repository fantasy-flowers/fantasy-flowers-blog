// 文章相关 API
import { get, post, put, del } from '../request'
import { API_ENDPOINTS } from '../config'

/**
 * 获取文章列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.status - 状态筛选 (draft/published)
 * @param {number} params.categoryId - 分类ID
 * @param {string} params.keyword - 搜索关键词
 */
export function getArticles(params = {}) {
  return get(API_ENDPOINTS.ARTICLES.LIST, params)
}

/**
 * 获取文章详情
 * @param {number} id - 文章ID
 */
export function getArticleDetail(id) {
  return get(API_ENDPOINTS.ARTICLES.DETAIL(id))
}

/**
 * 创建文章
 * @param {Object} data - 文章数据
 * @param {string} data.title - 标题
 * @param {string} data.summary - 简介
 * @param {string} data.content - 内容
 * @param {string} data.cover_image - 封面图
 * @param {string} data.category_name - 分类名称
 * @param {Array<string>} data.tag_names - 标签名称数组
 * @param {string} data.status - 状态 (draft/published)
 * @param {number} data.is_top - 是否置顶
 */
export function createArticle(data) {
  return post(API_ENDPOINTS.ARTICLES.CREATE, data)
}

/**
 * 更新文章
 * @param {number} id - 文章ID
 * @param {Object} data - 文章数据
 */
export function updateArticle(id, data) {
  return put(API_ENDPOINTS.ARTICLES.UPDATE(id), data)
}

/**
 * 删除文章
 * @param {number} id - 文章ID
 */
export function deleteArticle(id) {
  return del(API_ENDPOINTS.ARTICLES.DELETE(id))
}

/**
 * 更新文章状态
 * @param {number} id - 文章ID
 * @param {string} status - 状态 (draft/published)
 */
export function updateArticleStatus(id, status) {
  return put(API_ENDPOINTS.ARTICLES.UPDATE_STATUS(id), { status })
}
