import { defineStore } from 'pinia'
import { friendLinkAPI, pageAPI } from '@/api'
import { getSystemConfigs } from '@/api/modules/systemConfig'

// 模块级 in-flight 守卫：防止 App 初始化与友链页并发触发重复请求
let friendLinksRequest = null

/**
 * 站点域 store（B3 D1：从 blog.js 拆分）
 *
 * 职责：友情链接、关于/友链页面内容、系统配置（站点名/描述/备案号/github 等）。
 */
export const useSiteStore = defineStore('site', {
  state: () => ({
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

    // 错误信息
    error: null
  }),

  actions: {
    /**
     * 获取友情链接列表
     */
    async fetchFriendLinks() {
      if (friendLinksRequest) {
        return friendLinksRequest
      }

      this.friendsLoading = true
      this.error = null

      friendLinksRequest = (async () => {
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
          friendLinksRequest = null
        }
      })()

      return friendLinksRequest
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
    },

    /**
     * 获取系统配置
     */
    async fetchSystemConfig() {
      try {
        const config = await getSystemConfigs()
        if (config) {
          // 更新 state
          this.systemConfig.site_name = config.site_name || this.systemConfig.site_name
          this.systemConfig.site_description = config.site_description || this.systemConfig.site_description
          this.systemConfig.github_link = config.github_link || this.systemConfig.github_link
          this.systemConfig.icp_record = config.icp_record || ''
          // 兼容旧的 beian_number 字段
          this.systemConfig.beian_number = config.icp_record || this.systemConfig.beian_number || ''

          // 保存完整配置
          this.systemConfig.fullConfig = config
        }
        return this.systemConfig
      } catch (error) {
        console.error('获取系统配置失败:', error)
        // 失败时不覆盖默认值或已有值
        return this.systemConfig
      }
    }
  }
})
