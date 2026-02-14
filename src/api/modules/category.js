/**
 * 分类相关 API
 * @module api/modules/category
 */
import { get, post, put, del } from '@/utils/http'

/**
 * 接口地址
 */
const URLS = {
  LIST: '/categories',
  DETAIL: (id) => `/categories/${id}`,
  CREATE: '/categories',
  UPDATE: (id) => `/categories/${id}`,
  DELETE: (id) => `/categories/${id}`
}

/**
 * @typedef {Object} CategoryQueryParams
 * @property {number} [page] - 页码
 * @property {number} [pageSize] - 每页数量
 */

/**
 * @typedef {Object} CategoryDTO
 * @property {string} name - 分类名称
 * @property {string} [description] - 分类描述
 */

/**
 * 获取分类列表
 * @param {CategoryQueryParams} params - 查询参数
 * @returns {Promise<any>}
 */
export function getCategories(params = {}) {
  return get(URLS.LIST, params)
}

/**
 * 获取分类详情
 * @param {number} id - 分类ID
 * @returns {Promise<any>}
 */
export function getCategoryDetail(id) {
  return get(URLS.DETAIL(id))
}

/**
 * 创建分类
 * @param {CategoryDTO} data - 分类数据
 * @returns {Promise<any>}
 */
export function createCategory(data) {
  return post(URLS.CREATE, data)
}

/**
 * 更新分类
 * @param {number} id - 分类ID
 * @param {CategoryDTO} data - 分类数据
 * @returns {Promise<any>}
 */
export function updateCategory(id, data) {
  return put(URLS.UPDATE(id), data)
}

/**
 * 删除分类
 * @param {number} id - 分类ID
 * @returns {Promise<any>}
 */
export function deleteCategory(id) {
  return del(URLS.DELETE(id))
}
