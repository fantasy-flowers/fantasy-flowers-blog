// 页面内容相关 API
import { get, put } from '../request'
import { API_ENDPOINTS } from '../config'

/**
 * 获取页面内容
 * @param {string} type - 页面类型 (about/friend_link)
 */
export function getPageContent(type) {
  return get(API_ENDPOINTS.PAGES.GET(type))
}

/**
 * 更新页面内容
 * @param {string} type - 页面类型 (about/friend_link)
 * @param {string} content - 页面内容
 */
export function updatePageContent(type, content) {
  return put(API_ENDPOINTS.PAGES.UPDATE(type), { content })
}
