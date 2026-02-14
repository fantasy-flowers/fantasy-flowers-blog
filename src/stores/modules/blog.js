import { defineStore } from 'pinia'
import { articleAPI, categoryAPI, tagAPI, friendLinkAPI, pageAPI } from '@/api'
import { getSystemConfigs } from '@/api/modules/systemConfig'

export const useBlogStore = defineStore('blog', {
  state: () => ({
    // 文章相关
    posts: [],
    currentPost: null,
    postsTotal: 0,
    postsPage: 1,
    postsPageSize: 10,
    postsLoading: false,

    // 分类相关
    categories: [],
    categoriesLoading: false,

    // 标签相关
    tags: [],
    tagsLoading: false,

    // 友情链接相关
    friends: [],
    friendsLoading: false,

    // 页面内容
    aboutContent: '',
    friendLinkContent: '',

    // 系统配置
    systemConfig: {
      site_name: '',
      site_description: '',
      site_keywords: '',
      beian_number: 'xxxxx',
      github_link: 'https://github.com/',
      // 保留完整配置对象以供高级使用
      fullConfig: null
    },

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
    },

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
     * 获取文章列表
     */
    async fetchArticles(params = {}) {
      this.postsLoading = true
      this.error = null

      try {
        const data = await articleAPI.getArticles({
          page: params.page || this.postsPage,
          pageSize: params.pageSize || this.postsPageSize,
          status: 'published', // 只获取已发布的文章
          ...params
        })

        this.posts = data.list || []
        this.postsTotal = data.total || 0
        this.postsPage = data.page || 1
        this.postsPageSize = data.pageSize || 10

        return data
      } catch (error) {
        this.error = error.message
        console.error('获取文章列表失败:', error)
        // 如果API失败，返回空数组而不是抛出错误
        this.posts = []
        return { list: [], total: 0 }
      } finally {
        this.postsLoading = false
      }
    },

    /**
     * 获取文章详情
     */
    async fetchArticleDetail(id) {
      this.postsLoading = true
      this.error = null

      try {
        const article = await articleAPI.getArticleDetail(id)
        this.currentPost = article

        // 更新列表中的文章（如果存在）
        const index = this.posts.findIndex(p => p.id === article.id)
        if (index !== -1) {
          this.posts[index] = article
        }

        return article
      } catch (error) {
        this.error = error.message
        console.error('获取文章详情失败:', error)
        throw error
      } finally {
        this.postsLoading = false
      }
    },

    /**
     * 搜索文章
     */
    async searchArticles(keyword) {
      return this.fetchArticles({
        keyword,
        page: 1
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
     * 获取分类列表
     */
    async fetchCategories() {
      this.categoriesLoading = true
      this.error = null

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
      }
    },

    /**
     * 获取标签列表
     */
    async fetchTags() {
      this.tagsLoading = true
      this.error = null

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
      }
    },

    /**
     * 获取友情链接列表
     */
    async fetchFriendLinks() {
      this.friendsLoading = true
      this.error = null

      try {
        const links = await friendLinkAPI.getFriendLinks()
        // 只显示启用的友情链接
        this.friends = (Array.isArray(links) ? links : links.list || [])
          .filter(link => link.status === 1)
          .map(link => ({
            name: link.name,
            avatar: link.icon,
            url: link.url,
            description: link.description
          }))
        return this.friends
      } catch (error) {
        this.error = error.message
        console.error('获取友情链接失败:', error)
        this.friends = []
        return []
      } finally {
        this.friendsLoading = false
      }
    },

    /**
     * 获取关于页面内容
     */
    async fetchAboutContent() {
      try {
        const data = await pageAPI.getPageContent('about')
        this.aboutContent = data?.content || ''
        return this.aboutContent
      } catch (error) {
        this.error = error.message
        console.error('获取关于页面内容失败:', error)
        // 如果页面不存在，返回空字符串
        this.aboutContent = ''
        return ''
      }
    },

    /**
     * 获取友情链接页面内容
     */
    async fetchFriendLinkContent() {
      try {
        const data = await pageAPI.getPageContent('friend_link')
        this.friendLinkContent = data?.content || ''
        return this.friendLinkContent
      } catch (error) {
        this.error = error.message
        console.error('获取友情链接页面内容失败:', error)
        this.friendLinkContent = ''
        return ''
      }
    },

    /**
     * 初始化数据（首页加载时调用）
     * @param {boolean} force - 是否强制刷新
     */
    async initializeData(force = false) {
      // 如果已有数据且不是强制刷新，或者正在加载中，则直接返回
      if (!force && (this.posts.length > 0 || this.postsLoading)) {
        return
      }

      try {
        await Promise.all([
          this.fetchArticles({ page: 1, pageSize: 1000 }),
          this.fetchCategories(),
          this.fetchTags(),
          this.fetchFriendLinks()
          // fetchSystemConfig 已移除，配置在 main.js 中初始化
        ])
      } catch (error) {
        console.error('初始化数据失败:', error)
      }
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

    /**
     * 清除错误信息
     */
    clearError() {
      this.error = null
    },

    /**
     * 设置系统配置 (从 site.json 加载)
     * @param {Object} config - 配置对象
     */
    setSystemConfig(config) {
      if (!config) return

      // 保存完整配置
      this.systemConfig.fullConfig = config

      // 映射到扁平化结构，保持向下兼容
      if (config.meta) {
        this.systemConfig.site_name = config.meta.siteName || ''
        this.systemConfig.beian_number = config.meta.beianNumber || ''
      }

      if (config.seo) {
        this.systemConfig.site_description = config.seo.defaultDescription || ''
        this.systemConfig.site_keywords = config.seo.keywords || ''
      }
      
      // 联系方式中的 github 链接（如果有）
      // 这里假设 config.contact 中可能包含 github，或者保持默认
      // 如果 site.json 中没有专门的 github 字段，可以考虑加进去或者映射 meta 中的其他字段
    },

    /**
     * 获取系统配置 (已废弃，保留兼容性，但不再调用 API)
     */
    async fetchSystemConfig() {
      // 此方法不再需要主动调用后端 API，配置已在应用启动时加载
      return this.systemConfig
    },

    // 兼容旧方法
    incrementPostViews(postId) {
      const post = this.posts.find(p => p.id === postId)
      if (post && post.view_count !== undefined) {
        post.view_count++
      }
    },

    likePost(postId) {
      // 后端暂未实现点赞功能
      console.log('点赞功能待实现')
    }
  }
})



