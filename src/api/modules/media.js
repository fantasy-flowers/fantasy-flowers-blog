// 媒体文件相关 API
import { get, del, upload } from '../request'
import { API_ENDPOINTS } from '../config'

/**
 * 获取媒体文件列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.filetype - 文件类型
 */
export function getMediaFiles(params = {}) {
  return get(API_ENDPOINTS.MEDIA.LIST, params)
}

/**
 * 上传媒体文件
 * @param {File} file - 文件对象
 * @param {Function} onProgress - 进度回调
 */
export function uploadMediaFile(file, onProgress) {
  return upload(API_ENDPOINTS.MEDIA.UPLOAD, file, onProgress)
}

/**
 * 删除媒体文件
 * @param {number} id - 文件ID
 */
export function deleteMediaFile(id) {
  return del(API_ENDPOINTS.MEDIA.DELETE(id))
}

/**
 * 获取文件引用信息
 * @param {number} id - 文件ID
 */
export function getMediaReferences(id) {
  return get(API_ENDPOINTS.MEDIA.REFERENCES(id))
}
