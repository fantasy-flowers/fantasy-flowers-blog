<template>
  <div class="mobile-nav" v-if="visible">
    <button ref="toggleBtnRef" class="mobile-nav__toggle"
      :class="{ 'mobile-nav__toggle--active': isOpen }"
      :aria-expanded="String(isOpen)" aria-controls="mobile-nav-sidebar"
      aria-label="切换导航菜单" @click="toggle">
      <span class="mobile-nav__hamburger-line" />
      <span class="mobile-nav__hamburger-line" />
      <span class="mobile-nav__hamburger-line" />
    </button>
    <div v-if="isOpen" class="mobile-nav__overlay" aria-hidden="true" @click="close" />
    <aside id="mobile-nav-sidebar" ref="sidebarRef" class="mobile-nav__sidebar"
      :class="{ 'mobile-nav__sidebar--open': isOpen }" role="navigation"
      aria-label="移动端导航菜单" @keydown="handleSidebarKeydown">
      <div class="mobile-nav__profile">
        <img :src="avatarSrc" :alt="profileName" class="mobile-nav__avatar" />
        <h2 class="mobile-nav__name">{{ profileName }}</h2>
        <p class="mobile-nav__slogan">{{ siteDescription }}</p>
      </div>
      <nav v-for="(group, idx) in navGroups" :key="idx"
        class="mobile-nav__section" :aria-label="group.title">
        <div class="mobile-nav__section-title">{{ group.title }}</div>
        <template v-for="item in group.items" :key="item.path">
          <RouterLink v-if="!item.external" :to="item.path" class="mobile-nav__item"
            :class="{ 'mobile-nav__item--active': isActive(item) }" data-nav-item @click="close">
            <span v-if="item.icon && item.iconHover" class="mobile-nav__icon-wrap">
              <img :src="item.icon" :alt="item.label" class="mobile-nav__icon mobile-nav__icon--default" />
              <img :src="item.iconHover" :alt="item.label" class="mobile-nav__icon mobile-nav__icon--hover" />
            </span>
            <i v-else-if="item.faIcon" :class="'fa ' + item.faIcon" />
            <span>{{ item.label }}</span>
          </RouterLink>
          <a v-else :href="item.path" target="_blank" rel="noopener noreferrer"
            class="mobile-nav__item mobile-nav__item--external" data-nav-item
            :aria-label="item.ariaLabel || item.label" @click="close">
            <span v-if="item.icon && item.iconHover" class="mobile-nav__icon-wrap">
              <img :src="item.icon" :alt="item.label" class="mobile-nav__icon mobile-nav__icon--default" />
              <img :src="item.iconHover" :alt="item.label" class="mobile-nav__icon mobile-nav__icon--hover" />
            </span>
            <span>{{ item.label }}</span>
            <i class="fa fa-external-link mobile-nav__external-icon" />
          </a>
        </template>
      </nav>
    </aside>
  </div>
</template>

<script setup>
/**
 * MobileNavigation - 移动端导航侧边栏组件
 *
 * 在小屏幕设备上提供汉堡菜单触发的侧边栏导航，包含个人资料展示和分组导航链接。
 * 支持焦点陷阱、Escape 键关闭、触摸遮罩关闭等无障碍交互。
 *
 * @component
 * @example
 * <MobileNavigation :visible="isMobile" />
 */
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useBlogStore } from '@/stores/modules/blog'
import { useFocusTrap } from '@/composables/useAccessibility'

/** @see {import('@/types/components').NavItem} */
defineProps({
  /** 是否显示移动导航 */
  visible: { type: Boolean, default: true },
  /** 头像图片路径 */
  avatarSrc: { type: String, default: '/head/head.webp' },
  /** 用户名 */
  profileName: { type: String, default: 'fantasy_flowers' },
  /** 个性签名 */
  profileSlogan: { type: String, default: '热爱生活，热爱编程' }
})

const emit = defineEmits({
  /** 侧边栏打开/关闭时触发 */
  'update:open': (/** @type {boolean} */ value) => typeof value === 'boolean'
})

const isOpen = ref(false)
const sidebarRef = ref(null)
const toggleBtnRef = ref(null)
const route = useRoute()
const blogStore = useBlogStore()
const { activate: activateTrap, deactivate: deactivateTrap } = useFocusTrap(sidebarRef)

const siteDescription = computed(() => blogStore.systemConfig?.site_description || '热爱生活，热爱编程')

/** @type {import('vue').ComputedRef<Array<{title: string, items: Array}>>} */
const navGroups = computed(() => [
  {
    title: '导航',
    items: [
      { path: '/', label: '首页', routeNames: ['home'], icon: '/icon/image_1.png', iconHover: '/icon/image1.png' },
      { path: '/archive', label: '归档', routeNames: ['archive'], icon: '/icon/image_2.png', iconHover: '/icon/image2.png' },
      { path: '/about', label: '关于', routeNames: ['about'], icon: '/icon/image_3.png', iconHover: '/icon/image3.png' }
    ]
  },
  {
    title: '文章',
    items: [
      { path: '/categories', label: '分类', routeNames: ['categories', 'category'], faIcon: 'fa-folder' },
      { path: '/tags', label: '标签', routeNames: ['tags', 'tag'], faIcon: 'fa-tags' }
    ]
  },
  {
    title: '关于本站',
    items: [
      { path: '/friends', label: '友情链接', routeNames: ['friends'], icon: '/icon/iamge_4.png', iconHover: '/icon/image4.png' },
      {
        path: blogStore.systemConfig?.github_link || 'https://github.com/',
        label: 'GitHub', external: true, ariaLabel: '访问GitHub主页',
        icon: '/icon/nuowa.png', iconHover: '/icon/nuowaw.png'
      }
    ]
  }
])

/** 判断导航项是否激活 */
const isActive = (item) => item.routeNames?.includes(route.name) ?? false

/** 切换侧边栏 */
const toggle = () => { isOpen.value ? close() : open() }

/** 打开侧边栏，激活焦点陷阱 */
const open = async () => {
  isOpen.value = true
  document.body.style.overflow = 'hidden'
  emit('update:open', true)
  await nextTick()
  activateTrap()
}

/** 关闭侧边栏，恢复焦点到触发按钮 */
const close = () => {
  if (!isOpen.value) return
  deactivateTrap()
  isOpen.value = false
  document.body.style.overflow = ''
  emit('update:open', false)
  toggleBtnRef.value?.focus()
}

/** Escape 键关闭侧边栏 */
const handleSidebarKeydown = (event) => {
  if (event.key === 'Escape') { event.stopPropagation(); close() }
}

watch(() => route.path, close)
onUnmounted(() => { deactivateTrap(); document.body.style.overflow = '' })
</script>

<style scoped>
.mobile-nav { display: none; }
.mobile-nav__toggle {
  position: fixed; top: 20px; left: 20px; z-index: 1001;
  width: 44px; height: 44px; background-color: rgba(30, 42, 58, 0.6);
  backdrop-filter: blur(10px); opacity: 0.5;
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px;
  cursor: pointer; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px;
  transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.mobile-nav__toggle:hover,
.mobile-nav__toggle:focus-visible {
  background-color: rgba(59, 130, 246, 0.15); border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px); opacity: 1; outline: none;
}
.mobile-nav__hamburger-line {
  width: 20px; height: 2px; background-color: #F8FAFC;
  border-radius: 1px; transition: all 0.3s ease;
}
.mobile-nav__toggle--active .mobile-nav__hamburger-line:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.mobile-nav__toggle--active .mobile-nav__hamburger-line:nth-child(2) { opacity: 0; }
.mobile-nav__toggle--active .mobile-nav__hamburger-line:nth-child(3) { transform: rotate(-45deg) translate(7px, -6px); }
.mobile-nav__overlay {
  position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6);
  z-index: 999; backdrop-filter: blur(2px);
}
.mobile-nav__sidebar {
  position: fixed; top: 0; left: 0; width: 280px; height: 100vh;
  background-color: rgba(30, 42, 58, 0.6); backdrop-filter: blur(15px);
  border-right: 1px solid rgba(255, 255, 255, 0.1); z-index: 1000;
  transform: translateX(-100%); transition: transform 0.3s ease;
  overflow-y: auto; padding: 20px; box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
}
.mobile-nav__sidebar--open { transform: translateX(0); }
.mobile-nav__profile {
  text-align: center; margin: 60px 0 32px; padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.mobile-nav__avatar {
  width: 80px; height: 80px; border-radius: 50%; object-fit: cover;
  margin: 0 auto 16px; border: 3px solid rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  aspect-ratio: 1 / 1; box-sizing: border-box;
}
.mobile-nav__name { font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; color: #F8FAFC; }
.mobile-nav__slogan { font-size: 0.9rem; color: #94A3B8; line-height: 1.4; }
.mobile-nav__section { margin-bottom: 28px; }
.mobile-nav__section-title {
  font-size: 1rem; font-weight: 600; margin-bottom: 12px; color: #93C5FD;
  padding-bottom: 6px; border-bottom: 1px solid rgba(59, 130, 246, 0.3);
}
.mobile-nav__item {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px;
  border-radius: 6px; margin-bottom: 6px; color: #E2E8F0;
  text-decoration: none; transition: all 0.3s ease; font-weight: 500;
  border: 1px solid transparent; cursor: pointer;
}
.mobile-nav__item:hover,
.mobile-nav__item:focus-visible {
  background-color: rgba(59, 130, 246, 0.2); color: #F8FAFC;
  border-color: rgba(59, 130, 246, 0.3); outline: none;
}
.mobile-nav__item--active {
  background-color: rgba(59, 130, 246, 0.3); color: #93C5FD;
  border-color: #3B82F6; font-weight: 600;
}
.mobile-nav__item--external .mobile-nav__external-icon {
  font-size: 0.75rem; opacity: 0.7; margin-left: auto; transition: all 0.3s ease;
}
.mobile-nav__item--external:hover .mobile-nav__external-icon { opacity: 1; transform: translateX(2px); }
.mobile-nav__icon-wrap {
  position: relative; display: flex; align-items: center;
  justify-content: center; width: 24px; height: 24px;
}
.mobile-nav__icon {
  width: 24px; height: 24px; object-fit: contain;
  position: absolute; transition: opacity 0.3s ease, transform 0.3s ease;
}
.mobile-nav__icon--default { opacity: 1; transform: scale(1); }
.mobile-nav__icon--hover { opacity: 0; transform: scale(0.9); }
.mobile-nav__item:hover .mobile-nav__icon--default { opacity: 0; transform: scale(0.9); }
.mobile-nav__item:hover .mobile-nav__icon--hover { opacity: 1; transform: scale(1); }
@media (max-width: 768px) { .mobile-nav { display: block !important; } }
@media (min-width: 769px) { .mobile-nav { display: none !important; visibility: hidden; } }
@media (max-width: 480px) {
  .mobile-nav__sidebar { width: 260px; padding: 16px; }
  .mobile-nav__avatar { width: 70px; height: 70px; }
  .mobile-nav__name { font-size: 1.2rem; }
  .mobile-nav__item { padding: 8px 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .mobile-nav__sidebar, .mobile-nav__toggle, .mobile-nav__hamburger-line,
  .mobile-nav__item, .mobile-nav__icon { transition: none; }
}
</style>
