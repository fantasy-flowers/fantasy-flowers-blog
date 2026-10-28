import { defineStore } from 'pinia'
import { categoryAPI, tagAPI } from '@/api'

// 模块级 in-flight 守卫：防止 App 初始化与视图并发触发重复请求
let categoriesRequest = null
let tagsRequest = null

/**
 * 分类/标签域 store（B3 D1：从 blog.js 拆分）
 *
 * 职责：分类与标签列表数据及加载态。
 * categoriesWithCount / tagsWithCount 的返回结构保持与拆分前完全一致：
 * [{ name, count }]，count 取 article_count || 0。
 */
export const useTaxonomyStore = defineStore('taxonomy', {
  state: () => ({
    // 分类相关
    categories: [],
    categoriesLoading: false,

    // 标签相关
    tags: [],
    tagsLoading: false,

    // 分类/标签页兜底加载独立加载态（D2：与列表/详情隔离）
    categoryLoading: false,

    // 错误信息
    error: null
  }),

  getters: {
    /**
     * 分类列表（带文章数量）
     */
    categoriesWithCount: (state) => {
      return state.categories.map(cat => ({
        name: cat.name,
        count: cat.article_count || 0
      }))
    },

    /**
     * 标签列表（带文章数量）
     */
    tagsWithCount: (state) => {
      return state.tags.map(tag => ({
        name: tag.name,
        count: tag.article_count || 0
      }))
    }
  },

  actions: {
    /**
     * 获取分类列表
     */
    async fetchCategories() {
      if (categoriesRequest) {
        return categoriesRequest
      }

      this.categoriesLoading = true
      this.error = null

      categoriesRequest = (async () => {
        try {
          // 不传分页参数，获取所有分类
          const categories = await categoryAPI.getCategories()
          this.categories = Array.isArray(categories) ? categories : categories.list || []
          return this.categories
        } catch (error) {
          this.error = error.message
          console.error('获取分类列表失败:', error)
          this.categories = []
          return []
        } finally {
          this.categoriesLoading = false
          categoriesRequest = null
        }
      })()

      return categoriesRequest
    },

    /**
     * 获取标签列表
     */
    async fetchTags() {
      if (tagsRequest) {
        return tagsRequest
      }

      this.tagsLoading = true
      this.error = null

      tagsRequest = (async () => {
        try {
          // 不传分页参数，获取所有标签
          const tags = await tagAPI.getTags()
          this.tags = Array.isArray(tags) ? tags : tags.list || []
          return this.tags
        } catch (error) {
          this.error = error.message
          console.error('获取标签列表失败:', error)
          this.tags = []
          return []
        } finally {
          this.tagsLoading = false
          tagsRequest = null
        }
      })()

      return tagsRequest
    }
  }
})
