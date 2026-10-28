<template>
  <div class="sidebar-nav">
    <!-- 遍历导航分组 -->
    <div
      v-for="(group, groupIndex) in groupedItems"
      :key="groupIndex"
      class="sidebar-nav__section"
    >
      <!-- 分组标题 -->
      <div
        v-if="group.title"
        class="sidebar-nav__section-title"
        :class="{ 'sidebar-nav__section-title--hidden': collapsed }"
      >
        {{ group.title }}
      </div>
      <ul class="sidebar-nav__list">
        <li
          v-for="item in group.items"
          :key="item.path"
          class="sidebar-nav__item"
        >
          <!-- 外部链接 -->
          <a
            v-if="item.external"
            :href="item.path"
            target="_blank"
            rel="noopener noreferrer"
            class="sidebar-nav__link"
            :class="{ 'sidebar-nav__link--collapsed': collapsed }"
            :aria-label="item.label"
            @mouseenter="handleMouseEnter($event, item.label)"
            @mouseleave="$emit('tooltip-hide')"
          >
            <span class="sidebar-nav__icon-wrapper">
              <template v-if="item.icon && item.iconHover">
                <img
                  :src="item.icon"
                  :alt="item.label"
                  class="sidebar-nav__icon-img sidebar-nav__icon-img--default"
                >
                <img
                  :src="item.iconHover"
                  :alt="item.label + ' Hover'"
                  class="sidebar-nav__icon-img sidebar-nav__icon-img--hover"
                >
              </template>
              <i v-else-if="item.icon" :class="item.icon" class="sidebar-nav__icon-fa"></i>
            </span>
            <span
              class="sidebar-nav__text"
              :class="{ 'sidebar-nav__text--hidden': collapsed }"
            >{{ item.label }}</span>
            <i
              class="fa fa-external-link sidebar-nav__external-icon"
              :class="{ 'sidebar-nav__external-icon--hidden': collapsed }"
            ></i>
          </a>

          <!-- 内部导航链接 -->
          <RouterLink
            v-else
            :to="item.path"
            class="sidebar-nav__link"
            :class="{
              'sidebar-nav__link--active': isActive(item),
              'sidebar-nav__link--collapsed': collapsed
            }"
            @click="handleNavigate(item.path)"
            @mouseenter="handleMouseEnter($event, item.label)"
            @mouseleave="$emit('tooltip-hide')"
          >
            <span class="sidebar-nav__icon-wrapper">
              <template v-if="item.icon && item.iconHover">
                <img
                  :src="item.icon"
                  :alt="item.label"
                  class="sidebar-nav__icon-img sidebar-nav__icon-img--default"
                >
                <img
                  :src="item.iconHover"
                  :alt="item.label + ' Hover'"
                  class="sidebar-nav__icon-img sidebar-nav__icon-img--hover"
                >
              </template>
              <i v-else-if="item.icon" :class="item.icon" class="sidebar-nav__icon-fa"></i>
            </span>
            <span
              class="sidebar-nav__text"
              :class="{ 'sidebar-nav__text--hidden': collapsed }"
            >{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
/**
 * SidebarNav - 侧边栏导航菜单组件
 *
 * 从 AppSidebar.vue 提取的导航菜单区域，负责渲染导航项列表。
 * 支持分组导航、图标切换（默认/悬停）、折叠模式下的 tooltip 提示。
 * 使用 NavItem 类型定义，遵循单一职责原则。
 *
 * @component
 * @example
 * <SidebarNav
 *   :items="navItems"
 *   active-route="home"
 *   :collapsed="false"
 *   @navigate="handleNavigate"
 *   @tooltip-show="showTooltip"
 *   @tooltip-hide="hideTooltip"
 * />
 */
import { computed } from 'vue'
import { isValidNavItem } from '@/types/components'

// ==================== Props 定义 ====================
const props = defineProps({
  /**
   * 导航项列表，每项需包含 path 和 label
   * @type {Array<import('@/types/components').NavItem>}
   */
  items: {
    type: Array,
    required: true,
    validator: (value) => value.every(item => isValidNavItem(item))
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
   * 侧边栏是否处于折叠状态
   * @type {boolean}
   */
  collapsed: {
    type: Boolean,
    default: false
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

// ==================== 计算属性 ====================

/**
 * 将导航项按 group 字段分组
 * 无 group 的项归入默认分组
 * @returns {Array<{title: string, items: Array}>}
 */
const groupedItems = computed(() => {
  const groups = []
  const groupMap = new Map()

  for (const item of props.items) {
    const groupTitle = item.group || ''
    if (!groupMap.has(groupTitle)) {
      const group = { title: groupTitle, items: [] }
      groupMap.set(groupTitle, group)
      groups.push(group)
    }
    groupMap.get(groupTitle).items.push(item)
  }

  return groups
})

// ==================== 方法 ====================

/**
 * 判断导航项是否处于激活状态
 * @param {import('@/types/components').NavItem} item - 导航项
 * @returns {boolean}
 */
const isActive = (item) => {
  if (!props.activeRoute) return false
  // Support activeNames array for routes that match multiple names (e.g., categories/category)
  if (item.activeNames && Array.isArray(item.activeNames)) {
    return item.activeNames.includes(props.activeRoute)
  }
  if (item.routeName) {
    return item.routeName === props.activeRoute
  }
  return false
}

/**
 * 处理导航点击
 * @param {string} path - 目标路由路径
 */
const handleNavigate = (path) => {
  emit('navigate', path)
}

/**
 * 处理鼠标悬停，仅在折叠模式下触发 tooltip
 * @param {Event} event - 鼠标事件
 * @param {string} text - 提示文本
 */
const handleMouseEnter = (event, text) => {
  emit('tooltip-show', event, text)
}
</script>

<style scoped>
.sidebar-nav { display: flex; flex-direction: column; gap: 16px; }
.sidebar-nav__section { margin-bottom: 8px; }

.sidebar-nav__section-title {
  color: var(--blog-blue-light); font-size: 14px; font-weight: 600;
  margin: 0 20px 8px; padding-bottom: 4px;
  border-bottom: 1px solid rgba(147, 197, 253, 0.2); transition: all 0.3s ease;
}
.sidebar-nav__section-title--hidden { opacity: 0; transform: translateX(-10px); height: 0; margin: 0; padding: 0; overflow: hidden; }

.sidebar-nav__list { list-style: none; padding: 0; margin: 0; }
.sidebar-nav__item { height: 50px; display: flex; align-items: center; margin-top: 10px; }

.sidebar-nav__link {
  display: flex; align-items: center; width: 100%; height: 100%;
  border-radius: var(--blog-radius-sm); text-decoration: none; background-color: transparent;
  overflow: hidden; transition: all 0.3s ease; cursor: pointer; position: relative;
}
.sidebar-nav__link:hover { background-color: rgba(59, 130, 246, 0.2); }
.sidebar-nav__link:hover .sidebar-nav__icon-fa,
.sidebar-nav__link:hover .sidebar-nav__text { color: var(--blog-text-bright); }
.sidebar-nav__link--active { background-color: rgba(59, 130, 246, 0.3); color: var(--blog-blue-light); font-weight: 600; }

.sidebar-nav__icon-wrapper {
  min-width: 60px; height: 100%; display: flex; align-items: center;
  justify-content: center; border-radius: var(--blog-radius-sm); position: relative;
}

.sidebar-nav__icon-img { width: 28px; height: 28px; object-fit: contain; position: absolute; transition: opacity 0.3s ease, transform 0.3s ease; }
.sidebar-nav__icon-img--default { opacity: 1; transform: scale(1); }
.sidebar-nav__icon-img--hover { opacity: 0; transform: scale(0.9); }
.sidebar-nav__link:hover .sidebar-nav__icon-img--default { opacity: 0; transform: scale(0.9); }
.sidebar-nav__link:hover .sidebar-nav__icon-img--hover { opacity: 1; transform: scale(1); }

.sidebar-nav__icon-fa { font-size: 23px; color: #E2E8F0; transition: all 0.3s ease; }

.sidebar-nav__text { font-size: 17px; font-weight: 500; white-space: nowrap; color: #E2E8F0; opacity: 1; transition: opacity 0.3s ease, transform 0.3s ease; }
.sidebar-nav__text--hidden { opacity: 0; pointer-events: none; }

.sidebar-nav__external-icon { font-size: 0.75rem; opacity: 0.7; margin-left: auto; color: #E2E8F0; transition: all 0.3s ease; }
.sidebar-nav__external-icon--hidden { opacity: 0; pointer-events: none; }
.sidebar-nav__link:hover .sidebar-nav__external-icon { opacity: 1; transform: translateX(2px); }

@media (max-width: 768px) {
  .sidebar-nav__section-title--hidden { opacity: 1; transform: translateX(0); height: auto; margin: 0 20px 8px; padding-bottom: 4px; }
  .sidebar-nav__text--hidden { opacity: 1; pointer-events: auto; }
  .sidebar-nav__external-icon--hidden { opacity: 0.7; pointer-events: auto; }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-nav__section-title, .sidebar-nav__link, .sidebar-nav__icon-img,
  .sidebar-nav__icon-fa, .sidebar-nav__text, .sidebar-nav__external-icon { transition: none; }
  .sidebar-nav__link:hover .sidebar-nav__external-icon { transform: none; }
}
</style>
