/**
 * 文章相关 API
 * @module api/modules/article
 */
import { get, post, put, del } from '@/utils/http'

/**
 * 接口地址
 */
const URLS = {
  LIST: '/articles',
  DETAIL: (id) => `/articles/${id}`,
  CREATE: '/articles',
  UPDATE: (id) => `/articles/${id}`,
  DELETE: (id) => `/articles/${id}`,
  UPDATE_STATUS: (id) => `/articles/${id}/status`
}

/**
 * @typedef {Object} ArticleQueryParams
 * @property {number} [page] - 页码
 * @property {number} [pageSize] - 每页数量
 * @property {string} [status] - 状态筛选 (draft/published)
 * @property {number} [categoryId] - 分类ID
 * @property {string} [keyword] - 搜索关键词
 */

/**
 * @typedef {Object} ArticleDTO
 * @property {string} title - 标题
 * @property {string} summary - 简介
 * @property {string} content - 内容
 * @property {string} [cover_image] - 封面图
 * @property {string} [category_name] - 分类名称
 * @property {Array<string>} [tag_names] - 标签名称数组
 * @property {string} [status] - 状态 (draft/published)
 * @property {number} [is_top] - 是否置顶
 */

/**
 * 获取文章列表
 * @param {ArticleQueryParams} params - 查询参数
 * @returns {Promise<any>}
 */
export function getArticles(params = {}) {
  return get(URLS.LIST, params)
}

/**
 * 获取文章详情
 * @param {number} id - 文章ID
 * @returns {Promise<any>}
 */
export function getArticleDetail(id) {
  return get(URLS.DETAIL(id))
}

/**
 * 创建文章
 * @param {ArticleDTO} data - 文章数据
 * @returns {Promise<any>}
 */
export function createArticle(data) {
  return post(URLS.CREATE, data)
}

/**
 * 更新文章
 * @param {number} id - 文章ID
 * @param {ArticleDTO} data - 文章数据
 * @returns {Promise<any>}
 */
export function updateArticle(id, data) {
  return put(URLS.UPDATE(id), data)
}

/**
 * 删除文章
 * @param {number} id - 文章ID
 * @returns {Promise<any>}
 */
export function deleteArticle(id) {
  return del(URLS.DELETE(id))
}

/**
 * 更新文章状态
 * @param {number} id - 文章ID
 * @param {string} status - 状态 (draft/published)
 * @returns {Promise<any>}
 */
export function updateArticleStatus(id, status) {
  return put(URLS.UPDATE_STATUS(id), { status })
}
