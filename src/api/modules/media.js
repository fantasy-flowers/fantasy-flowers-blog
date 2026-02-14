/**
 * 媒体文件相关 API
 * @module api/modules/media
 */
import { get, del, upload } from '@/utils/http'

/**
 * 接口地址
 */
const URLS = {
  LIST: '/media',
  UPLOAD: '/media/upload',
  DELETE: (id) => `/media/${id}`,
  REFERENCES: (id) => `/media/${id}/references`
}

/**
 * @typedef {Object} MediaQueryParams
 * @property {number} [page] - 页码
 * @property {number} [pageSize] - 每页数量
 * @property {string} [filetype] - 文件类型
 */

/**
 * 获取媒体文件列表
 * @param {MediaQueryParams} params - 查询参数
 * @returns {Promise<any>}
 */
export function getMediaFiles(params = {}) {
  return get(URLS.LIST, params)
}

/**
 * 上传媒体文件
 * @param {File} file - 文件对象
 * @param {(progress: number) => void} [onProgress] - 进度回调
 * @returns {Promise<any>}
 */
export function uploadMediaFile(file, onProgress) {
  return upload(URLS.UPLOAD, file, onProgress)
}

/**
 * 删除媒体文件
 * @param {number} id - 文件ID
 * @returns {Promise<any>}
 */
export function deleteMediaFile(id) {
  return del(URLS.DELETE(id))
}

/**
 * 获取文件引用信息
 * @param {number} id - 文件ID
 * @returns {Promise<any>}
 */
export function getMediaReferences(id) {
  return get(URLS.REFERENCES(id))
}
