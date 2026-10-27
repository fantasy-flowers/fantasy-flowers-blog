<template>
  <div class="background-selector">
    <!-- 标题 -->
    <h4 class="background-selector__title">背景图片</h4>

    <!-- 背景预览 -->
    <BackgroundPreview
      :image-path="currentBackground"
    />

    <!-- 背景图片网格 -->
    <BackgroundGrid
      :images="backgroundImages"
      :selected-image="currentBackground"
      @select="handleBackgroundSelect"
    />

    <!-- 背景透明度控制 -->
    <BackgroundOpacityControl ref="opacityControlRef" />
  </div>
</template>

<script setup>
/**
 * BackgroundSelector - 背景设置容器组件
 *
 * 组合 BackgroundGrid、BackgroundPreview、BackgroundOpacityControl 的容器组件。
 * 使用 useBackgroundSettings composable 管理背景状态。
 *
 * @component
 * @example
 * <BackgroundSelector @error="handleError" />
 */
import { ref, watch, onMounted } from 'vue'
import { BACKGROUNDS, DEFAULT_BACKGROUND } from '@/constants/backgrounds'
import { useBackgroundSettings } from '@/composables/useBackgroundSettings'
import BackgroundGrid from './BackgroundGrid.vue'
import BackgroundPreview from './BackgroundPreview.vue'
import BackgroundOpacityControl from './BackgroundOpacityControl.vue'

const props = defineProps({
  /** 默认背景图片文件名 */
  currentBackground: { type: String, default: DEFAULT_BACKGROUND }
})

const emit = defineEmits({
  'background-changed': (filename) => typeof filename === 'string',
  error: (message) => typeof message === 'string'
})

const {
  currentBackgroundImage,
  applyBackgroundImage,
  getCurrentSettings
} = useBackgroundSettings()

const backgroundImages = BACKGROUNDS
const currentBackground = ref(getCurrentSettings().backgroundImage || props.currentBackground)
const isLoading = ref(false)
const opacityControlRef = ref(null)

watch(currentBackgroundImage, (newValue) => {
  if (newValue && newValue !== currentBackground.value) currentBackground.value = newValue
})

/** 处理背景图片选择 */
const handleBackgroundSelect = async (filename) => {
  if (isLoading.value) return

  isLoading.value = true
  try {
    await applyBackgroundImage(filename)
    currentBackground.value = filename
    emit('background-changed', filename)
  } catch (error) {
    console.error('背景选择失败:', error)
    emit('error', '图片加载失败')
  } finally {
    isLoading.value = false
  }
}

/** 初始化背景图片 */
const initializeBackground = async () => {
  const settings = getCurrentSettings()
  if (settings.backgroundImage) currentBackground.value = settings.backgroundImage
}

/** 加载缩略图（兼容父组件调用） */
const optimizedLoadThumbnails = () => {}

defineExpose({ optimizedLoadThumbnails, initializeBackground })

onMounted(async () => {
  await initializeBackground()
})
</script>

<style scoped>
.background-selector {
  margin-bottom: 20px;
}

.background-selector__title {
  margin: 0 0 12px 0;
  font-size: 16px;
  text-align: center;
  color: #44eb0dcb;
}

/* 响应式 - 小屏手机 */
@media (max-width: 480px) {
  .background-selector__title {
    font-size: 14px;
    margin-bottom: 10px;
  }
}

/* 响应式 - 高分辨率屏幕 */
@media (min-width: 1920px) {
  .background-selector__title {
    font-size: 18px;
  }
}
</style>
