<template>
  <header class="sidebar-header">
    <!-- 头像和标题组合 -->
    <div class="sidebar-header__image-text">
      <!-- 头像区域 -->
      <span class="sidebar-header__avatar">
        <img
          :src="avatarSrc"
          :alt="`${name} avatar`"
          class="sidebar-header__avatar-img"
        >
      </span>
      <!-- 标题文本区域 -->
      <div
        class="sidebar-header__info"
        :class="{ 'sidebar-header__text--hidden': collapsed }"
      >
        <span class="sidebar-header__name">{{ name }}</span>
        <span class="sidebar-header__slogan">{{ slogan }}</span>
      </div>
    </div>
    <!-- 侧边栏收展切换按钮 -->
    <i
      class="fa fa-chevron-right sidebar-header__toggle"
      :class="{ 'sidebar-header__toggle--collapsed': collapsed }"
      role="button"
      tabindex="0"
      :aria-label="collapsed ? '展开侧边栏' : '收起侧边栏'"
      :aria-expanded="String(!collapsed)"
      @click="$emit('toggle')"
      @keydown.enter.prevent="$emit('toggle')"
      @keydown.space.prevent="$emit('toggle')"
    ></i>
  </header>
</template>

<script setup>
/**
 * SidebarHeader - 侧边栏头部组件
 *
 * 展示用户头像、名称、标语以及侧边栏折叠/展开切换按钮。
 * 从 AppSidebar.vue 中提取，遵循单一职责原则。
 *
 * @component
 * @example
 * <SidebarHeader
 *   avatar-src="/head/head.webp"
 *   name="fantasy_flowers"
 *   slogan="热爱生活，热爱编程"
 *   :collapsed="false"
 *   @toggle="handleToggle"
 * />
 */

// ==================== Props 定义 ====================
defineProps({
  /**
   * 头像图片路径
   * @type {string}
   */
  avatarSrc: {
    type: String,
    default: '/head/head.webp'
  },
  /**
   * 用户名称
   * @type {string}
   */
  name: {
    type: String,
    default: 'fantasy_flowers'
  },
  /**
   * 用户标语/口号
   * @type {string}
   */
  slogan: {
    type: String,
    default: '热爱生活，热爱编程'
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
defineEmits({
  /**
   * 切换侧边栏折叠状态
   */
  toggle: () => true
})
</script>

<style scoped>
/* ==================== Block: sidebar-header ==================== */

.sidebar-header {
  position: relative;
}

/* ==================== Element: image-text ==================== */

.sidebar-header__image-text {
  display: flex;
  align-items: center;
}

/* ==================== Element: avatar ==================== */

.sidebar-header__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  border-radius: 6px;
}

.sidebar-header__avatar-img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.1);
  aspect-ratio: 1 / 1;
  box-sizing: border-box;
}

/* ==================== Element: info ==================== */

.sidebar-header__info {
  display: flex;
  flex-direction: column;
  transition: opacity 0.3s ease, width 0.3s ease;
}

.sidebar-header__text--hidden {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* ==================== Element: name ==================== */

.sidebar-header__name {
  margin-top: 2px;
  font-size: 18px;
  font-weight: 600;
  color: #F8FAFC;
  white-space: nowrap;
}

/* ==================== Element: slogan ==================== */

.sidebar-header__slogan {
  font-size: 12px;
  margin-top: -2px;
  display: block;
  color: #94A3B8;
  white-space: nowrap;
}

/* ==================== Element: toggle ==================== */

.sidebar-header__toggle {
  position: absolute;
  top: 50%;
  right: -20px;
  transform: translateY(-50%) rotate(180deg);
  height: 30px;
  width: 30px;
  background-color: rgba(59, 130, 246, 0.5);
  color: #F8FAFC;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 101;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

/* ==================== Modifier: toggle--collapsed ==================== */

.sidebar-header__toggle--collapsed {
  transform: translateY(-50%) rotate(0deg);
  background-color: rgba(59, 130, 246, 0.6);
  right: -20px;
}

.sidebar-header__toggle:hover {
  background-color: rgba(59, 130, 246, 0.9);
  transform: translateY(-50%) rotate(180deg) scale(1.1);
}

.sidebar-header__toggle--collapsed:hover {
  transform: translateY(-50%) rotate(0deg) scale(1.1);
}

/* ==================== 响应式设计 ==================== */

@media (max-width: 768px) {
  .sidebar-header__toggle {
    right: -25px;
    height: 36px;
    width: 36px;
    font-size: 14px;
  }

  .sidebar-header__toggle--collapsed {
    right: -25px;
  }

  .sidebar-header__text--hidden {
    opacity: 1;
    width: auto;
    overflow: visible;
  }
}

@media (min-resolution: 1.25dppx) {
  .sidebar-header__toggle {
    border-width: 1px;
  }
}

/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .sidebar-header__info,
  .sidebar-header__toggle {
    transition: none;
  }

  .sidebar-header__toggle:hover,
  .sidebar-header__toggle--collapsed:hover {
    transform: translateY(-50%);
  }
}
</style>
