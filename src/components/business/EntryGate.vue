<template>
  <EntryAnimation @after-leave="onAnimationComplete">
    <div
      v-if="!isHidden"
      class="entry-gate"
      ref="gateRef"
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-title"
      aria-describedby="entry-subtitle"
    >
      <div
        class="entry-gate__background"
        :style="backgroundStyle"
        aria-hidden="true"
      ></div>

      <div class="entry-gate__content">
        <div class="entry-gate__avatar">
          <EntryAvatar src="/head/head.webp" alt="fantasy_flowers blog avatar" :size="120" />
        </div>

        <div id="entry-title" class="entry-gate__title">
          <EntryTitle :title="title" :subtitle="subtitle" />
        </div>

        <EntryButton
          :disabled="isAnimating"
          :aria-describedby="isAnimating ? 'loading-message' : undefined"
          @click="handleEnterClick"
        />

        <div v-if="isAnimating" id="loading-message" class="sr-only" aria-live="polite">
          正在进入博客，请稍候...
        </div>
        <div class="sr-only" aria-live="polite">
          博客入口页面。使用回车键或点击按钮进入主博客。
        </div>
      </div>
    </div>
  </EntryAnimation>
</template>

<script setup>
/**
 * EntryGate - 博客入口门户容器组件
 *
 * 组合 EntryAvatar、EntryTitle、EntryButton 子组件，
 * 管理进入状态、路由导航、SessionManager 交互和动画控制。
 *
 * @component
 * @example
 * <EntryGate @enter="handleEntryComplete" />
 * <EntryGate title="My Blog" subtitle="Welcome" @enter="onEnter" />
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SessionManager from '@/utils/SessionManager.js'
import EntryAnimation from '@/components/animations/EntryAnimation.vue'
import EntryAvatar from '@/components/business/EntryAvatar.vue'
import EntryTitle from '@/components/business/EntryTitle.vue'
import EntryButton from '@/components/business/EntryButton.vue'
import { useFocusTrap, announceToScreenReader } from '@/composables/useAccessibility'

// ==================== Props 定义 ====================
const props = defineProps({
  /** 背景图片路径 */
  backgroundImage: { type: String, default: '/background/12.webp' },
  /** 博客标题 */
  title: { type: String, default: "fantasy_flowers's Blog" },
  /** 博客副标题 */
  subtitle: { type: String, default: '欢迎来到我的个人博客' }
})

// ==================== Emits 定义 ====================
const emit = defineEmits({
  /** 用户点击进入按钮后触发 */
  enter: () => true
})

// ==================== 响应式状态 ====================
const isAnimating = ref(false)
const isHidden = ref(false)
const pendingRoute = ref({ path: '/' })
const gateRef = ref(null)

const router = useRouter()
const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(gateRef)

// ==================== 计算属性 ====================
const backgroundStyle = computed(() => ({
  backgroundImage: `url('${props.backgroundImage}')`
}))

// ==================== 方法 ====================
/** 解析目标路由 */
const resolveTargetRoute = () => {
  try {
    const data = SessionManager.safeStorageOperation('get', 'session', 'blog_intended_route')
    if (data) {
      const parsed = JSON.parse(data)
      if (parsed && typeof parsed.path === 'string') {
        SessionManager.safeStorageOperation('remove', 'session', 'blog_intended_route')
        return { path: parsed.path, name: parsed.name, params: parsed.params || {}, query: parsed.query || {}, hash: parsed.hash || '' }
      }
    }
  } catch (e) {
    console.warn('EntryGate: Error resolving target route', e)
    SessionManager.safeStorageOperation('remove', 'session', 'blog_intended_route')
  }
  return { path: '/' }
}

/** 处理进入按钮点击 */
const handleEnterClick = async () => {
  if (isAnimating.value) return
  isAnimating.value = true
  announceToScreenReader('正在进入博客...', 'assertive')

  try {
    const validation = SessionManager.validateSessionData()
    if (!validation.isValid && validation.canRecover) {
      try { SessionManager.recoverFromCorruptedSession() } catch (_) { /* continue */ }
    }
    try { SessionManager.markAsEntered() } catch (_) { /* continue */ }
    SessionManager.safeStorageOperation('remove', 'session', 'blog_show_entry')

    pendingRoute.value = resolveTargetRoute()
    isHidden.value = true
    deactivateFocusTrap()
  } catch (error) {
    console.error('EntryGate: Critical error during entry', error)
    isAnimating.value = false
    announceToScreenReader('进入过程中出现错误，正在重试...', 'assertive')
    setTimeout(() => {
      try {
        SessionManager.clearSession()
        isHidden.value = true
        emit('enter')
        router.push('/').catch(() => { window.location.href = '/' })
      } catch (_) {
        window.location.reload()
      }
    }, 300)
  }
}

/** 动画完成后导航 */
const onAnimationComplete = async () => {
  try {
    emit('enter')
    const target = pendingRoute.value
    const attempts = [
      () => router.push({ path: target.path, name: target.name, params: target.params, query: target.query, hash: target.hash }),
      () => router.push(target.path),
      () => router.push('/'),
      () => { window.location.href = target.path || '/' }
    ]
    for (const attempt of attempts) {
      try { await attempt(); return } catch (_) { /* try next */ }
    }
  } catch (_) {
    window.location.href = pendingRoute.value.path || '/'
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  setTimeout(() => activateFocusTrap(), 600)
  announceToScreenReader('博客入口页面已加载。按回车键进入博客。')
})
</script>

<style scoped>
.entry-gate { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; display: flex; align-items: center; justify-content: center; }
.entry-gate__background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; background-attachment: fixed; background-color: #0f172a; }
.entry-gate__background::before { content: ''; position: absolute; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(2px); }
.entry-gate__content { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 500px; padding: 2rem; }
.entry-gate__avatar { margin-bottom: 2rem; }
.entry-gate__title { margin-bottom: 3rem; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

/* Responsive */
@media (max-width: 1024px) { .entry-gate__content { padding: 2rem 1.5rem; max-width: 85%; } }
@media (max-width: 768px) { .entry-gate__content { padding: 1.5rem; max-width: 90%; } .entry-gate__title { margin-bottom: 2.5rem; } }
@media (max-width: 640px) { .entry-gate__content { padding: 1.25rem; max-width: 95%; } }
@media (max-width: 480px) { .entry-gate__content { padding: 1rem; max-width: 100%; } .entry-gate__avatar { margin-bottom: 1.5rem; } .entry-gate__title { margin-bottom: 2rem; } }
@media (max-width: 360px) { .entry-gate__content { padding: 0.75rem; } }
@media (min-width: 1920px) { .entry-gate__content { padding: 2.5rem; } }
@media (max-height: 500px) and (orientation: landscape) { .entry-gate__content { padding: 1rem; max-width: 80%; } .entry-gate__avatar { margin-bottom: 1rem; } .entry-gate__title { margin-bottom: 1.5rem; } }
@media (prefers-reduced-motion: reduce) { .entry-gate { animation: none; } }
</style>
