// 系统配置相关 API
import { get, put } from '../request'
import { API_ENDPOINTS } from '../config'

/**
 * 获取系统配置
 */
export function getSystemConfigs() {
  return get(API_ENDPOINTS.CONFIGS.GET)
}

/**
 * 更新系统配置
 * @param {Object} configs - 配置对象
 */
export function updateSystemConfigs(configs) {
  return put(API_ENDPOINTS.CONFIGS.UPDATE, configs)
}
