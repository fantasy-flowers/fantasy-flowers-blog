import { defineStore } from 'pinia'
import {
  abortRequestGroup,
  createApiError,
  get,
  isCancelError,
  serializeParams
} from '@/api'

// ==================== C4：TTL 缓存（模块级，跨组件共享，不进入响应式 state） ====================

const LIST_CACHE_TTL = 60 * 1000 // 列表缓存 60s
const DETAIL_CACHE_TTL = 5 * 60 * 1000 // 详情缓存 5min

// 列表缓存：requestKey（`articles:${serializeParams(...)}`）-> { data, expiresAt }
const listCache = new Map()
// 详情缓存：`article:${id}` -> { data, expiresAt }（严格按文章 id 键控，遵守 D3 id 强绑定）
const detailCache = new Map()

/**
 * 文章域 store（B3 D1：从 blog.js 拆分）
 *
 * 职责：文章列表（服务端分页）、文章详情、筛选条件与文章相关 getter/action。
 * 数据流：posts/postsTotal/postsPage/postsPageSize 由服务端分页接口回填，
 * postsLoading 控制列表加载态（沿用既有命名与机制）。
 */
export const useArticleStore = defineStore('article', {
  state: () => ({
    // 文章相关
    posts: [],
    currentPost: null,
    postsTotal: 0,
    postsPage: 1,
    postsPageSize: 10,
    postsLoading: false,
    // 详情场景独立加载态（D2：与列表/分类加载隔离）
    detailLoading: false,

    // 筛选条件
    searchQuery: '',
    selectedCategory: null,
    selectedTag: null,

    // 错误信息
    error: null
  }),

  getters: {
    /**
     * 过滤后的文章列表（客户端筛选）
     */
    filteredPosts: (state) => {
      let filtered = [...state.posts]

      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter(post =>
          post.title.toLowerCase().includes(query)
        )
      }

      if (state.selectedCategory) {
        filtered = filtered.filter(post => post.category_name === state.selectedCategory)
      }

      if (state.selectedTag) {
        filtered = filtered.filter(post =>
          post.tags && post.tags.some(tag => tag.name === state.selectedTag)
        )
      }

      return filtered
    },

    /**
     * 根据ID获取文章
     */
    getPostById: (state) => {
      return (postId) => state.posts.find(post => post.id === parseInt(postId))
    },

    /**
     * 获取上一篇文章
     */
    getPrevPost: (state) => {
      return (postId) => {
        const index = state.posts.findIndex(post => post.id === parseInt(postId))
        return index > 0 ? state.posts[index - 1] : null
      }
    },

    /**
     * 获取下一篇文章
     */
    getNextPost: (state) => {
      return (postId) => {
        const index = state.posts.findIndex(post => post.id === parseInt(postId))
        return index < state.posts.length - 1 ? state.posts[index + 1] : null
      }
    },

    /**
     * 根据分类获取文章
     */
    getPostsByCategory: (state) => {
      return (category) => state.posts.filter(post => post.category_name === category)
    },

    /**
     * 根据标签获取文章
     */
    getPostsByTag: (state) => {
      return (tag) => state.posts.filter(post =>
        post.tags && post.tags.some(t => t.name === tag)
      )
    }
  },

  actions: {
    /**
     * 获取文章列表（服务端分页）
     * C3：requestKey 用于并发去重与竞态取消；
     * C4：命中 TTL 缓存直接返回缓存数据（不触发网络、不闪加载态）
     */
    async fetchArticles(params = {}) {
      const finalParams = {
        page: params.page || this.postsPage,
        pageSize: params.pageSize || this.postsPageSize,
        status: 'published', // 只获取已发布的文章
        ...params
      }

      // C3/C4 共用键：排序后的参数序列化（同参数同键；status 恒为 'published'，
      // 因此实际区分键为 page/pageSize/sortBy/categoryId/tagId/keyword）
      const requestKey = `articles:${serializeParams(finalParams)}`

      // C4：列表 TTL 缓存命中 → 直接返回缓存数据
      const cached = listCache.get(requestKey)
      if (cached && Date.now() < cached.expiresAt) {
        // 缓存命中路径不发请求，需显式取消组内仍在途的旧列表请求，
        // 防止旧请求稍后回填覆盖当前上下文数据
        abortRequestGroup(requestKey)

        const data = cached.data
        this.posts = data.list || []
        this.postsTotal = data.total || 0
        this.postsPage = data.page || 1
        this.postsPageSize = data.pageSize || 10
        this.postsLoading = false
        this.error = null

        return data
      }

      this.postsLoading = true
      this.error = null

      try {
        const data = await get('/articles', finalParams, { requestKey })

        this.posts = data.list || []
        this.postsTotal = data.total || 0
        this.postsPage = data.page || 1
        this.postsPageSize = data.pageSize || 10

        // C4：写列表缓存（仅成功写入，失败不缓存）
        listCache.set(requestKey, {
          data,
          expiresAt: Date.now() + LIST_CACHE_TTL
        })

        this.postsLoading = false
        return data
      } catch (error) {
        // C3：被取消的请求静默退出——不写 error、不打日志、不动 state/loading，
        // loading 与数据由接管的新请求负责
        if (isCancelError(error)) {
          return { list: [], total: 0 }
        }
        this.error = error.message
        console.error('获取文章列表失败:', error)
        // 如果API失败，返回空数组而不是抛出错误
        this.posts = []
        this.postsLoading = false
        return { list: [], total: 0 }
      }
    },

    /**
     * B1：服务端分页取文章当前页
     *
     * 契约（与 backend-batch3 QueryArticleDto 一致）：
     * - page / pageSize：正整数
     * - sortBy: 'time'（createdAt DESC, id DESC）| 'views'（viewCount DESC, id DESC）
     * - categoryId / tagId：数字 ID
     * - keyword：字符串（后端按 title+summary+content LIKE 过滤）
     * 未传（null/undefined/空串）的筛选参数不加入请求，避免空值参数干扰后端校验。
     *
     * @returns 服务端响应 { list, total, page, pageSize, totalPages }
     */
    async fetchArticlesPage({ page = 1, pageSize = this.postsPageSize, sortBy, categoryId, tagId, keyword } = {}) {
      const params = {
        page,
        pageSize
      }

      if (sortBy) {
        params.sortBy = sortBy
      }
      if (categoryId != null) {
        params.categoryId = categoryId
      }
      if (tagId != null) {
        params.tagId = tagId
      }
      if (keyword) {
        params.keyword = keyword
      }

      return this.fetchArticles(params)
    },

    /**
     * 获取文章详情
     * C3：requestKey=`article:${id}`，路由参数变化时旧请求自动被取消；
     * C4：详情 TTL 缓存（5min）+ SWR——命中先把缓存内容立即填给 currentPost
     * （即时渲染），再后台静默刷新一次（GET /articles/:id 会触发后端阅读量 +1，
     * 保持「每次进入详情都上报阅读量」的现状）
     */
    async fetchArticleDetail(id) {
      const requestKey = `article:${id}`

      // C4：详情缓存命中 → 立即渲染缓存内容 + 后台静默刷新
      const cached = detailCache.get(requestKey)
      if (cached && Date.now() < cached.expiresAt) {
        // 缓存按文章 id 键控，取出的数据 id 必然等于请求 id（D3 强绑定）
        this.currentPost = { ...cached.data }
        this.detailLoading = false
        this.error = null

        // 同步列表中的同一篇（保持既有行为；浅拷贝避免列表条目与缓存互相污染）
        const index = this.posts.findIndex(p => parseInt(p.id) === parseInt(id))
        if (index !== -1) {
          this.posts[index] = { ...cached.data }
        }

        // 后台静默刷新（不 await）：上报阅读量 + 获取最新内容
        this.refreshArticleDetailInBackground(id, requestKey)

        return this.currentPost
      }

      this.detailLoading = true
      this.error = null

      try {
        const article = await get(`/articles/${id}`, undefined, { requestKey })

        // D3：详情与路由参数强绑定——返回数据 id 与请求 id 不一致时视为失败，
        // 避免把上一篇的文章内容渲染到当前路由下（串页）
        if (parseInt(article?.id) !== parseInt(id)) {
          throw createApiError('ARTICLE_ID_MISMATCH', '文章数据与请求不匹配', null)
        }

        this.currentPost = article

        // 更新列表中的文章（如果存在）
        const index = this.posts.findIndex(p => p.id === article.id)
        if (index !== -1) {
          this.posts[index] = article
        }

        // C4：写详情缓存（仅成功写入）
        detailCache.set(requestKey, {
          data: article,
          expiresAt: Date.now() + DETAIL_CACHE_TTL
        })

        this.detailLoading = false
        return article
      } catch (error) {
        // C3：被取消的请求静默退出——不写 error、不打日志、不动 state/loading，
        // loading 与数据由接管的新请求负责（静默吞掉，不向调用方抛取消错误）
        if (isCancelError(error)) {
          return null
        }
        this.error = error.message
        console.error('获取文章详情失败:', error)
        this.detailLoading = false
        // 真实错误（含 404 ApiError）保持原样抛出，detail.vue 的 404 分支不受影响
        throw error
      }
    },

    /**
     * C4：详情 SWR 后台静默刷新。
     * 刷新成功后把新数据字段原位替换进 currentPost（保留对象引用、逐字段赋值），
     * 避免整块重建造成视觉跳变；失败（含被取消）静默丢弃，不覆盖已渲染内容。
     * @param {number|string} id - 文章 id
     * @param {string} requestKey - 与主请求相同的 requestKey（触发同 key/同组取消语义）
     */
    async refreshArticleDetailInBackground(id, requestKey) {
      try {
        const article = await get(`/articles/${id}`, undefined, { requestKey })

        // D3：id 不匹配一律丢弃，绝不渲染
        if (parseInt(article?.id) !== parseInt(id)) {
          return
        }

        // 刷新成功：更新缓存（TTL 重新起算）
        detailCache.set(requestKey, {
          data: article,
          expiresAt: Date.now() + DETAIL_CACHE_TTL
        })

        // 字段原位替换：仅当 currentPost 仍是同一篇文章时逐字段赋值，
        // 保留对象引用，避免整块重建造成视觉跳变
        if (this.currentPost && parseInt(this.currentPost.id) === parseInt(id)) {
          Object.assign(this.currentPost, article)
        }

        // 同步列表中的同一篇
        const index = this.posts.findIndex(p => parseInt(p.id) === parseInt(id))
        if (index !== -1) {
          this.posts[index] = article
        }
      } catch (error) {
        // 刷新失败（网络错误 / 超时 / 被取消）静默丢弃：
        // 不覆盖已渲染内容、不触发 error 提示、不打可见日志
      }
    },

    /**
     * C1：服务端搜索文章（title + summary + content 匹配）
     * @param {string} keyword - 搜索关键词
     * @param {number} page - 页码（默认 1）
     */
    async searchArticles(keyword, page = 1) {
      return this.fetchArticlesPage({
        keyword,
        page,
        pageSize: 6
      })
    },

    /**
     * 按分类获取文章
     */
    async fetchArticlesByCategory(categoryId) {
      return this.fetchArticles({
        categoryId,
        page: 1
      })
    },

    /**
     * 设置搜索关键词
     */
    setSearchQuery(query) {
      this.searchQuery = query
    },

    /**
     * 设置选中的分类
     */
    setSelectedCategory(category) {
      this.selectedCategory = category
    },

    /**
     * 设置选中的标签
     */
    setSelectedTag(tag) {
      this.selectedTag = tag
    },

    /**
     * 清除所有筛选条件
     */
    clearFilters() {
      this.searchQuery = ''
      this.selectedCategory = null
      this.selectedTag = null
    },

    // 兼容旧方法
    incrementPostViews(postId) {
      const post = this.posts.find(p => p.id === postId)
      if (post && post.view_count !== undefined) {
        post.view_count++
      }
    },

    likePost() {
      // 后端暂未实现点赞功能
      console.log('点赞功能待实现')
    }
  }
})
