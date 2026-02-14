/**
 * 友情链接相关 API
 * @module api/modules/friendLink
 */
import { get, post, put, del } from '@/utils/http'

/**
 * 接口地址
 */
const URLS = {
  LIST: '/friend-links',
  DETAIL: (id) => `/friend-links/${id}`,
  CREATE: '/friend-links',
  UPDATE: (id) => `/friend-links/${id}`,
  DELETE: (id) => `/friend-links/${id}`,
  UPDATE_STATUS: (id) => `/friend-links/${id}/status`
}

/**
 * @typedef {Object} FriendLinkQueryParams
 * @property {number} [page] - 页码
 * @property {number} [pageSize] - 每页数量
 */

/**
 * @typedef {Object} FriendLinkDTO
 * @property {string} name - 链接名称
 * @property {string} url - 链接URL
 * @property {string} [icon] - 图标URL
 * @property {string} [description] - 描述
 * @property {number} [status] - 状态 (0/1)
 * @property {number} [sort_order] - 排序顺序
 */

/**
 * 获取友情链接列表
 * @param {FriendLinkQueryParams} params - 查询参数
 * @returns {Promise<any>}
 */
export function getFriendLinks(params = {}) {
  return get(URLS.LIST, params)
}

/**
 * 获取友情链接详情
 * @param {number} id - 友情链接ID
 * @returns {Promise<any>}
 */
export function getFriendLinkDetail(id) {
  return get(URLS.DETAIL(id))
}

/**
 * 创建友情链接
 * @param {FriendLinkDTO} data - 友情链接数据
 * @returns {Promise<any>}
 */
export function createFriendLink(data) {
  return post(URLS.CREATE, data)
}

/**
 * 更新友情链接
 * @param {number} id - 友情链接ID
 * @param {FriendLinkDTO} data - 友情链接数据
 * @returns {Promise<any>}
 */
export function updateFriendLink(id, data) {
  return put(URLS.UPDATE(id), data)
}

/**
 * 删除友情链接
 * @param {number} id - 友情链接ID
 * @returns {Promise<any>}
 */
export function deleteFriendLink(id) {
  return del(URLS.DELETE(id))
}

/**
 * 更新友情链接状态
 * @param {number} id - 友情链接ID
 * @param {number} status - 状态 (0/1)
 * @returns {Promise<any>}
 */
export function updateFriendLinkStatus(id, status) {
  return put(URLS.UPDATE_STATUS(id), { status })
}
