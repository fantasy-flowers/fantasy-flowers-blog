import { defineStore, storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useArticleStore } from './article'
import { useTaxonomyStore } from './taxonomy'
import { useSiteStore } from './site'

/**
 * 聚合出口 store（B3 D1：三域 store 的组合视图）
 *
 * 保留 id 'blog' 与全部 state/getter/action 的既有名称与返回结构，
 * 现有视图的 `import { useBlogStore } from '@/stores/modules/blog'` 零改动。
 *
 * - state：通过 storeToRefs 直连各域 store，支持写穿透
 *   （如 article/detail.vue 中的 blogStore.currentPost = xxx）。
 * - getters：computed 重包各域 getter，函数型 getter 以箭头函数转发。
 * - 跨域 action（initializeData / fetchCategoryArticles / clearError）在本 store 内实现。
 *
 * 注意：initializeData 不再拉取文章列表——首页/分类/标签/搜索/归档各自按页请求
 * （B1 服务端分页），此处只负责分类/标签/友链/系统配置的引导加载，
 * 避免引导时的全量请求覆盖视图当前页数据。
 */
export const useBlogStore = defineStore('blog', () => {
  const article = useArticleStore()
  const taxonomy = useTaxonomyStore()
  const site = useSiteStore()

  // ==================== state（storeToRefs 直连，支持写穿透） ====================

  const {
    posts, currentPost, postsTotal, postsPage, postsPageSize,
    postsLoading, detailLoading, searchQuery, selectedCategory, selectedTag
  } = storeToRefs(article)

  const {
    categories, categoriesLoading, tags, tagsLoading, categoryLoading
  } = storeToRefs(taxonomy)

  const {
    friends, friendsLoading, aboutContent, friendLinkContent, systemConfig
  } = storeToRefs(site)

  // ==================== getters ====================

  const filteredPosts = computed(() => article.filteredPosts)

  const getPostById = (postId) => article.getPostById(postId)
  const getPrevPost = (postId) => article.getPrevPost(postId)
  const getNextPost = (postId) => article.getNextPost(postId)
  const getPostsByCategory = (category) => article.getPostsByCategory(category)
  const getPostsByTag = (tag) => article.getPostsByTag(tag)

  const categoriesWithCount = computed(() => taxonomy.categoriesWithCount)
  const tagsWithCount = computed(() => taxonomy.tagsWithCount)

  // 合并三域错误信息（任一域失败即对外暴露）
  const error = computed(() => article.error || taxonomy.error || site.error)

  // ==================== actions：转发各域 ====================

  const fetchArticles = (params) => article.fetchArticles(params)
  const fetchArticlesPage = (params) => article.fetchArticlesPage(params)
  const fetchArticleDetail = (id) => article.fetchArticleDetail(id)
  const searchArticles = (keyword, page) => article.searchArticles(keyword, page)
  const fetchArticlesByCategory = (categoryId) => article.fetchArticlesByCategory(categoryId)

  const fetchCategories = () => taxonomy.fetchCategories()
  const fetchTags = () => taxonomy.fetchTags()

  const fetchFriendLinks = () => site.fetchFriendLinks()
  const fetchAboutContent = () => site.fetchAboutContent()
  const fetchFriendLinkContent = () => site.fetchFriendLinkContent()
  const setSystemConfig = (config) => site.setSystemConfig(config)
  const fetchSystemConfig = () => site.fetchSystemConfig()

  const setSearchQuery = (query) => article.setSearchQuery(query)
  const setSelectedCategory = (category) => article.setSelectedCategory(category)
  const setSelectedTag = (tag) => article.setSelectedTag(tag)
  const clearFilters = () => article.clearFilters()

  const incrementPostViews = (postId) => article.incrementPostViews(postId)
  const likePost = () => article.likePost()

  // ==================== actions：跨域聚合 ====================

  /**
   * 初始化数据（App 启动引导加载）
   * 只加载分类/标签/友链/系统配置；文章列表由各视图按需请求（B1）。
   * @param {boolean} force - 是否强制刷新
   */
  async function initializeData(force = false) {
    try {
      const tasks = []

      if (force || taxonomy.categories.length === 0) {
        tasks.push(taxonomy.fetchCategories())
      }
      if (force || taxonomy.tags.length === 0) {
        tasks.push(taxonomy.fetchTags())
      }
      if (force || site.friends.length === 0) {
        tasks.push(site.fetchFriendLinks())
      }
      if (force || !site.systemConfig.fullConfig) {
        tasks.push(site.fetchSystemConfig())
      }

      await Promise.all(tasks)
    } catch (error) {
      console.error('初始化数据失败:', error)
    }
  }

  /**
   * 分类/标签页兜底加载（D2 兼容垫片）：保留原签名与 categoryLoading 语义。
   * B1 后分类/标签视图直接走 fetchArticlesPage，本方法仅作兼容保留。
   */
  async function fetchCategoryArticles() {
    if (article.posts.length > 0 || taxonomy.categoryLoading) {
      return
    }

    taxonomy.categoryLoading = true
    try {
      await initializeData()
    } finally {
      taxonomy.categoryLoading = false
    }
  }

  /**
   * 清除错误信息（清空三域 error）
   */
  function clearError() {
    article.error = null
    taxonomy.error = null
    site.error = null
  }

  return {
    // state
    posts, currentPost, postsTotal, postsPage, postsPageSize,
    postsLoading, detailLoading, searchQuery, selectedCategory, selectedTag,
    categories, categoriesLoading, tags, tagsLoading, categoryLoading,
    friends, friendsLoading, aboutContent, friendLinkContent, systemConfig,
    // getters
    filteredPosts, getPostById, getPrevPost, getNextPost,
    getPostsByCategory, getPostsByTag, categoriesWithCount, tagsWithCount,
    error,
    // actions
    fetchArticles, fetchArticlesPage, fetchArticleDetail, searchArticles,
    fetchArticlesByCategory, fetchCategories, fetchTags, fetchFriendLinks,
    fetchAboutContent, fetchFriendLinkContent, setSystemConfig, fetchSystemConfig,
    setSearchQuery, setSelectedCategory, setSelectedTag, clearFilters, clearError,
    initializeData, fetchCategoryArticles, incrementPostViews, likePost
  }
})
