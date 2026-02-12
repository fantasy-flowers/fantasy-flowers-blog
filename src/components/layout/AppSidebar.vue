<template>
  <div class="sidebar-wrapper">
    <aside class="app-sidebar" :class="{ 'app-sidebar--collapsed': isCollapsed }">
      <!-- 头部：头像、名称、折叠按钮 -->
      <SidebarHeader
        avatar-src="/head/head.webp"
        name="fantasy_flowers"
        slogan="热爱生活，热爱编程"
        :collapsed="isCollapsed"
        @toggle="toggleSidebar"
      />
      <!-- 菜单主体 -->
      <div class="app-sidebar__menu-bar">
        <div class="app-sidebar__menu">
          <SidebarNav
            :items="navItems"
            :active-route="currentRouteName"
            :collapsed="isCollapsed"
            @navigate="handleNavClick"
            @tooltip-show="showTooltip"
            @tooltip-hide="hideTooltip"
          />
        </div>
        <!-- 底部：友情链接、GitHub -->
        <SidebarFooter
          :collapsed="isCollapsed"
          :active-route="currentRouteName"
          :github-link="githubLink"
          @navigate="handleNavClick"
          @tooltip-show="showTooltip"
          @tooltip-hide="hideTooltip"
        />
      </div>
    </aside>
    <SidebarTooltip
      :show="tooltipState.show"
      :text="tooltipState.text"
      :target-rect="tooltipState.targetRect"
    />
  </div>
</template>

<script setup>
/**
 * AppSidebar - 侧边栏容器组件
 * 组合 SidebarHeader、SidebarNav、SidebarFooter、SidebarTooltip，
 * 管理折叠状态并协调子组件间的交互。
 * @component
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBlogStore } from '@/stores/modules/blog'
import { useSidebarStore } from '@/stores/modules/sidebar'
import { useTooltip } from '@/composables/useTooltip'
import SidebarHeader from './SidebarHeader.vue'
import SidebarNav from './SidebarNav.vue'
import SidebarFooter from './SidebarFooter.vue'
import SidebarTooltip from './SidebarTooltip.vue'

// ==================== Props & Emits ====================
defineProps({
  collapsed: { type: Boolean, default: false }
})

const emit = defineEmits({
  'update:collapsed': (value) => typeof value === 'boolean'
})

// ==================== 状态管理 ====================
const route = useRoute()
const blogStore = useBlogStore()
const sidebarStore = useSidebarStore()

const isCollapsed = computed(() => sidebarStore.isCollapsed)
const currentRouteName = computed(() => route.name || '')
const githubLink = computed(() => blogStore.systemConfig?.github_link || 'https://github.com/')

const { tooltipState, showTooltip, hideTooltip } = useTooltip({
  shouldShow: () => isCollapsed.value
})
// ==================== 导航数据 ====================
const navItems = [
  { path: '/', label: '首页', icon: '/icon/image_1.png', iconHover: '/icon/image1.png', routeName: 'home', group: '导航' },
  { path: '/archive', label: '归档', icon: '/icon/image_2.png', iconHover: '/icon/image2.png', routeName: 'archive', group: '导航' },
  { path: '/about', label: '关于', icon: '/icon/image_3.png', iconHover: '/icon/image3.png', routeName: 'about', group: '导航' },
  { path: '/categories', label: '分类', icon: 'fa fa-folder', routeName: 'categories', activeNames: ['categories', 'category'], group: '文章' },
  { path: '/tags', label: '标签', icon: 'fa fa-tags', routeName: 'tags', activeNames: ['tags', 'tag'], group: '文章' }
]
// ==================== 方法 ====================
const toggleSidebar = () => {
  sidebarStore.toggleSidebar()
  emit('update:collapsed', !isCollapsed.value)
}

const handleNavClick = () => {
  if (window.innerWidth <= 768) {
    sidebarStore.setSidebarCollapsed(true)
  }
}
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 250px;
  padding: 10px 14px;
  background: rgba(30, 42, 58, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-x: visible;
  overflow-y: visible;
}

.app-sidebar--collapsed {
  width: 75px;
  padding: 10px 8px;
}

.app-sidebar__menu-bar {
  height: calc(100% - 55px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: scroll;
  overflow-x: hidden;
}

.app-sidebar__menu-bar::-webkit-scrollbar { display: none; }
.app-sidebar__menu {
  margin-top: 40px;
  flex: 1;
}

@media (max-width: 768px) {
  .app-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: visible;
  }
  .app-sidebar.show { transform: translateX(0); }
  .app-sidebar--collapsed { width: 250px; padding: 10px 14px; }
}

/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .app-sidebar {
    transition: none;
  }
}
</style>
