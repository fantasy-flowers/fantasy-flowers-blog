// 友情链接相关 API
import { get, post, put, del } from '../request'
import { API_ENDPOINTS } from '../config'

/**
 * 获取友情链接列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（可选）
 * @param {number} params.pageSize - 每页数量（可选）
 */
export function getFriendLinks(params = {}) {
  return get(API_ENDPOINTS.FRIEND_LINKS.LIST, params)
}

/**
 * 获取友情链接详情
 * @param {number} id - 友情链接ID
 */
export function getFriendLinkDetail(id) {
  return get(API_ENDPOINTS.FRIEND_LINKS.DETAIL(id))
}

/**
 * 创建友情链接
 * @param {Object} data - 友情链接数据
 * @param {string} data.name - 链接名称
 * @param {string} data.url - 链接URL
 * @param {string} data.icon - 图标URL
 * @param {string} data.description - 描述
 * @param {number} data.status - 状态 (0/1)
 * @param {number} data.sort_order - 排序顺序
 */
export function createFriendLink(data) {
  return post(API_ENDPOINTS.FRIEND_LINKS.CREATE, data)
}

/**
 * 更新友情链接
 * @param {number} id - 友情链接ID
 * @param {Object} data - 友情链接数据
 */
export function updateFriendLink(id, data) {
  return put(API_ENDPOINTS.FRIEND_LINKS.UPDATE(id), data)
}

/**
 * 删除友情链接
 * @param {number} id - 友情链接ID
 */
export function deleteFriendLink(id) {
  return del(API_ENDPOINTS.FRIEND_LINKS.DELETE(id))
}

/**
 * 更新友情链接状态
 * @param {number} id - 友情链接ID
 * @param {number} status - 状态 (0/1)
 */
export function updateFriendLinkStatus(id, status) {
  return put(API_ENDPOINTS.FRIEND_LINKS.UPDATE_STATUS(id), { status })
}
