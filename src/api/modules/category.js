// 分类相关 API
import { get, post, put, del } from '../request'
import { API_ENDPOINTS } from '../config'

/**
 * 获取分类列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（可选）
 * @param {number} params.pageSize - 每页数量（可选）
 */
export function getCategories(params = {}) {
  return get(API_ENDPOINTS.CATEGORIES.LIST, params)
}

/**
 * 获取分类详情
 * @param {number} id - 分类ID
 */
export function getCategoryDetail(id) {
  return get(API_ENDPOINTS.CATEGORIES.DETAIL(id))
}

/**
 * 创建分类
 * @param {Object} data - 分类数据
 * @param {string} data.name - 分类名称
 * @param {string} data.description - 分类描述
 */
export function createCategory(data) {
  return post(API_ENDPOINTS.CATEGORIES.CREATE, data)
}

/**
 * 更新分类
 * @param {number} id - 分类ID
 * @param {Object} data - 分类数据
 */
export function updateCategory(id, data) {
  return put(API_ENDPOINTS.CATEGORIES.UPDATE(id), data)
}

/**
 * 删除分类
 * @param {number} id - 分类ID
 */
export function deleteCategory(id) {
  return del(API_ENDPOINTS.CATEGORIES.DELETE(id))
}
