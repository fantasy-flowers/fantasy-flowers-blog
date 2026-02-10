// 标签相关 API
import { get, post, put, del } from '../request'
import { API_ENDPOINTS } from '../config'

/**
 * 获取标签列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（可选）
 * @param {number} params.pageSize - 每页数量（可选）
 */
export function getTags(params = {}) {
  return get(API_ENDPOINTS.TAGS.LIST, params)
}

/**
 * 获取标签详情
 * @param {number} id - 标签ID
 */
export function getTagDetail(id) {
  return get(API_ENDPOINTS.TAGS.DETAIL(id))
}

/**
 * 创建标签
 * @param {Object} data - 标签数据
 * @param {string} data.name - 标签名称
 */
export function createTag(data) {
  return post(API_ENDPOINTS.TAGS.CREATE, data)
}

/**
 * 更新标签
 * @param {number} id - 标签ID
 * @param {Object} data - 标签数据
 */
export function updateTag(id, data) {
  return put(API_ENDPOINTS.TAGS.UPDATE(id), data)
}

/**
 * 删除标签
 * @param {number} id - 标签ID
 */
export function deleteTag(id) {
  return del(API_ENDPOINTS.TAGS.DELETE(id))
}
