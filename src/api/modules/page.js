/**
 * 页面内容相关 API
 * @module api/modules/page
 */
import { get, put } from '@/utils/http'

/**
 * 接口地址
 */
const URLS = {
  GET: (type) => `/pages/${type}`,
  UPDATE: (type) => `/pages/${type}`
}

/**
 * 获取页面内容
 * @param {string} type - 页面类型 (about/friend_link)
 * @returns {Promise<any>}
 */
export function getPageContent(type) {
  return get(URLS.GET(type))
}

/**
 * 更新页面内容
 * @param {string} type - 页面类型 (about/friend_link)
 * @param {string} content - 页面内容
 * @returns {Promise<any>}
 */
export function updatePageContent(type, content) {
  return put(URLS.UPDATE(type), { content })
}
