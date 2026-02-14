/**
 * 系统配置相关 API
 * @module api/modules/systemConfig
 */
import { get, put } from '@/utils/http'

/**
 * 接口地址
 */
const URLS = {
  GET: '/configs',
  UPDATE: '/configs'
}

/**
 * 获取系统配置
 * @returns {Promise<any>}
 */
export function getSystemConfigs() {
  return get(URLS.GET)
}

/**
 * 更新系统配置
 * @param {Object} configs - 配置对象
 * @returns {Promise<any>}
 */
export function updateSystemConfigs(configs) {
  return put(URLS.UPDATE, configs)
}
