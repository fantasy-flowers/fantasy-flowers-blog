/**
 * 标签相关 API
 * @module api/modules/tag
 */
import { get, post, put, del } from '@/utils/http'

/**
 * 接口地址
 */
const URLS = {
  LIST: '/tags',
  DETAIL: (id) => `/tags/${id}`,
  CREATE: '/tags',
  UPDATE: (id) => `/tags/${id}`,
  DELETE: (id) => `/tags/${id}`
}

/**
 * @typedef {Object} TagQueryParams
 * @property {number} [page] - 页码
 * @property {number} [pageSize] - 每页数量
 */

/**
 * @typedef {Object} TagDTO
 * @property {string} name - 标签名称
 */

/**
 * 获取标签列表
 * @param {TagQueryParams} params - 查询参数
 * @returns {Promise<any>}
 */
export function getTags(params = {}) {
  return get(URLS.LIST, params)
}

/**
 * 获取标签详情
 * @param {number} id - 标签ID
 * @returns {Promise<any>}
 */
export function getTagDetail(id) {
  return get(URLS.DETAIL(id))
}

/**
 * 创建标签
 * @param {TagDTO} data - 标签数据
 * @returns {Promise<any>}
 */
export function createTag(data) {
  return post(URLS.CREATE, data)
}

/**
 * 更新标签
 * @param {number} id - 标签ID
 * @param {TagDTO} data - 标签数据
 * @returns {Promise<any>}
 */
export function updateTag(id, data) {
  return put(URLS.UPDATE(id), data)
}

/**
 * 删除标签
 * @param {number} id - 标签ID
 * @returns {Promise<any>}
 */
export function deleteTag(id) {
  return del(URLS.DELETE(id))
}
