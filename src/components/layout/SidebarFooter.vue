<template>
  <div class="sidebar-footer">
    <!-- 底部区域标题 -->
    <div
      class="sidebar-footer__section-title"
      :class="{ 'sidebar-footer__section-title--hidden': collapsed }"
    >
      关于本站
    </div>
    <ul class="sidebar-footer__list">
      <!-- 友情链接导航项 -->
      <li class="sidebar-footer__item">
        <RouterLink
          to="/friends"
          class="sidebar-footer__link"
          :class="{
            'sidebar-footer__link--active': activeRoute === 'friends',
            'sidebar-footer__link--collapsed': collapsed
          }"
          @click="handleNavigate('/friends')"
          @mouseenter="handleMouseEnter($event, '友情链接')"
          @mouseleave="$emit('tooltip-hide')"
        >
          <span class="sidebar-footer__icon-wrapper">
            <img
              src="/icon/iamge_4.png"
              alt="友情链接"
              class="sidebar-footer__icon-img sidebar-footer__icon-img--default"
            >
            <img
              src="/icon/image4.png"
              alt="友情链接 Hover"
              class="sidebar-footer__icon-img sidebar-footer__icon-img--hover"
            >
          </span>
          <span
            class="sidebar-footer__text"
            :class="{ 'sidebar-footer__text--hidden': collapsed }"
          >友情链接</span>
        </RouterLink>
      </li>

      <!-- GitHub 外部链接 -->
      <li class="sidebar-footer__item">
        <a
          :href="githubLink"
          target="_blank"
          rel="noopener noreferrer"
          class="sidebar-footer__link"
          :class="{ 'sidebar-footer__link--collapsed': collapsed }"
          aria-label="访问GitHub主页"
          @click="handleNavigate('')"
          @mouseenter="handleMouseEnter($event, 'GitHub')"
          @mouseleave="$emit('tooltip-hide')"
        >
          <span class="sidebar-footer__icon-wrapper">
            <img
              src="/icon/nuowa.png"
              alt="GitHub"
              class="sidebar-footer__icon-img sidebar-footer__icon-img--default"
            >
            <img
              src="/icon/nuowaw.png"
              alt="GitHub Hover"
              class="sidebar-footer__icon-img sidebar-footer__icon-img--hover"
            >
          </span>
          <span
            class="sidebar-footer__text"
            :class="{ 'sidebar-footer__text--hidden': collapsed }"
          >GitHub</span>
          <i
            class="fa fa-external-link sidebar-footer__external-icon"
            :class="{ 'sidebar-footer__external-icon--hidden': collapsed }"
          ></i>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
/**
 * SidebarFooter - 侧边栏底部区域组件
 *
 * 从 AppSidebar.vue 提取的底部操作区域，包含友情链接、GitHub 外部链接等。
 * 支持折叠模式下的 tooltip 提示，遵循单一职责原则。
 *
 * @component
 * @example
 * <SidebarFooter
 *   :collapsed="false"
 *   active-route="friends"
 *   github-link="https://github.com/"
 *   @navigate="handleNavigate"
 *   @tooltip-show="showTooltip"
 *   @tooltip-hide="hideTooltip"
 * />
 */

// ==================== Props 定义 ====================
defineProps({
  /**
   * 侧边栏是否处于折叠状态
   * @type {boolean}
   */
  collapsed: {
    type: Boolean,
    default: false
  },
  /**
   * 当前激活的路由名称，用于高亮当前导航项
   * @type {string}
   */
  activeRoute: {
    type: String,
    default: ''
  },
  /**
   * GitHub 链接地址
   * @type {string}
   */
  githubLink: {
    type: String,
    default: 'https://github.com/'
  }
})

// ==================== Emits 定义 ====================
const emit = defineEmits({
  /**
   * 导航项被点击时触发
   * @param {string} path - 目标路由路径
   */
  navigate: (path) => typeof path === 'string',
  /**
   * 鼠标悬停导航项时触发（用于 tooltip 显示）
   * @param {Event} event - 鼠标事件
   * @param {string} text - 提示文本
   */
  'tooltip-show': (event, text) => true,
  /**
   * 鼠标离开导航项时触发（用于 tooltip 隐藏）
   */
  'tooltip-hide': () => true
})

// ==================== 方法 ====================

/**
 * 处理导航点击
 * @param {string} path - 目标路由路径
 */
const handleNavigate = (path) => {
  emit('navigate', path)
}

/**
 * 处理鼠标悬停，触发 tooltip 显示事件
 * @param {Event} event - 鼠标事件
 * @param {string} text - 提示文本
 */
const handleMouseEnter = (event, text) => {
  emit('tooltip-show', event, text)
}
</script>

<style scoped>
.sidebar-footer { padding: 0; margin: 0; }

.sidebar-footer__section-title {
  color: var(--blog-blue-light); font-size: 14px; font-weight: 600;
  margin: 0 20px 12px; padding-bottom: 4px;
  border-bottom: 1px solid rgba(147, 197, 253, 0.2); transition: all 0.3s ease;
}
.sidebar-footer__section-title--hidden { opacity: 0; transform: translateX(-10px); height: 0; margin: 0; padding: 0; overflow: hidden; }

.sidebar-footer__list { list-style: none; padding: 0; margin: 0; }
.sidebar-footer__item { height: 50px; display: flex; align-items: center; margin-top: 10px; }

.sidebar-footer__link {
  display: flex; align-items: center; width: 100%; height: 100%;
  border-radius: var(--blog-radius-sm); text-decoration: none; background-color: transparent;
  overflow: hidden; transition: all 0.3s ease; cursor: pointer; position: relative;
}
.sidebar-footer__link:hover { background-color: rgba(59, 130, 246, 0.2); }
.sidebar-footer__link:hover .sidebar-footer__text { color: var(--blog-text-bright); }
.sidebar-footer__link--active { background-color: rgba(59, 130, 246, 0.3); color: var(--blog-blue-light); font-weight: 600; }

.sidebar-footer__icon-wrapper {
  min-width: 60px; height: 100%; display: flex; align-items: center;
  justify-content: center; border-radius: var(--blog-radius-sm); position: relative;
}

.sidebar-footer__icon-img { width: 28px; height: 28px; object-fit: contain; position: absolute; transition: opacity 0.3s ease, transform 0.3s ease; }
.sidebar-footer__icon-img--default { opacity: 1; transform: scale(1); }
.sidebar-footer__icon-img--hover { opacity: 0; transform: scale(0.9); }
.sidebar-footer__link:hover .sidebar-footer__icon-img--default { opacity: 0; transform: scale(0.9); }
.sidebar-footer__link:hover .sidebar-footer__icon-img--hover { opacity: 1; transform: scale(1); }

.sidebar-footer__text { font-size: 17px; font-weight: 500; white-space: nowrap; color: #E2E8F0; opacity: 1; transition: opacity 0.3s ease, transform 0.3s ease; }
.sidebar-footer__text--hidden { opacity: 0; pointer-events: none; }

.sidebar-footer__external-icon { font-size: 0.75rem; opacity: 0.7; margin-left: auto; color: #E2E8F0; transition: all 0.3s ease; }
.sidebar-footer__external-icon--hidden { opacity: 0; pointer-events: none; }
.sidebar-footer__link:hover .sidebar-footer__external-icon { opacity: 1; transform: translateX(2px); }

@media (max-width: 768px) {
  .sidebar-footer__section-title--hidden { opacity: 1; transform: translateX(0); height: auto; margin: 0 20px 12px; padding-bottom: 4px; }
  .sidebar-footer__text--hidden { opacity: 1; pointer-events: auto; }
  .sidebar-footer__external-icon--hidden { opacity: 0.7; pointer-events: auto; }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-footer__section-title, .sidebar-footer__link, .sidebar-footer__icon-img,
  .sidebar-footer__text, .sidebar-footer__external-icon { transition: none; }
  .sidebar-footer__link:hover .sidebar-footer__external-icon { transform: none; }
}
</style>
