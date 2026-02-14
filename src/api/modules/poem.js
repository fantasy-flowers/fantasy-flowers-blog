/**
 * 诗词相关 API
 * @module api/modules/poem
 */
import axios from 'axios'

/**
 * 获取随机诗词
 * 注意：这是静态资源请求，不经过 API BaseURL
 * @returns {Promise<any>}
 */
export async function getRandomPoem() {
  try {
    const response = await axios.get('/poem/poem.json')
    // 随机获取一首
    const poems = response.data
    if (Array.isArray(poems) && poems.length > 0) {
      const randomIndex = Math.floor(Math.random() * poems.length)
      return poems[randomIndex]
    }
    return null
  } catch (error) {
    console.error('获取诗词失败:', error)
    return null
  }
}
