<template>
  <div class="background-section">
    <h4>背景图片</h4>
    <div class="background-presets">
      <button 
        v-for="image in backgroundImages" 
        :key="image.filename"
        @click="handleBackgroundSelect(image.filename)"
        @mouseenter="handleMouseEnter(image.filename)"
        @mouseleave="handleMouseLeave(image.filename)"
        :class="['background-btn', { active: currentBackground === image.filename, loading: isLoading && loadingTarget === image.filename }]"
        :title="image.name"
        :disabled="isLoading"
      >
        <div 
          class="background-thumbnail" 
          :style="getThumbnailStyle(image)"
          :class="{ 
            'loaded': thumbnailsLoaded[image.filename],
            'loading': isThumbnailLoading[image.filename],
            'load-failed': !thumbnailsLoaded[image.filename] && !isThumbnailLoading[image.filename]
          }"
          :aria-label="getThumbnailAriaLabel(image)"
        ></div>
        <span>{{ image.name }}</span>
        <div v-if="isLoading && loadingTarget === image.filename" class="loading-spinner"></div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { smartPreloader } from '@/utils/imageOptimizer'
import { BACKGROUNDS, DEFAULT_BACKGROUND, getBackgroundUrl, getThumbnailUrl } from '@/constants/backgrounds'
import { useBackgroundSettings } from '@/composables/useBackgroundSettings'

// Props定义
const props = defineProps({
  currentBackground: {
    type: String,
    default: DEFAULT_BACKGROUND
  }
})

// Emits定义
const emit = defineEmits(['background-changed', 'error'])

// 使用背景设置服务
const { currentBackgroundImage, applyBackgroundImage, getCurrentSettings } = useBackgroundSettings()

// 背景图片相关状态
const backgroundImages = BACKGROUNDS
// 使用服务中的当前背景图片作为初始值
const currentBackground = ref(getCurrentSettings().backgroundImage || props.currentBackground)
const isLoading = ref(false)
// 跟踪正在加载的目标图片（用于显示加载动画）
const loadingTarget = ref(null)



// 监听服务中的背景图片变化，保持本地状态同步
watch(currentBackgroundImage, (newValue) => {
  if (newValue && newValue !== currentBackground.value) {
    currentBackground.value = newValue
  }
})

// 缩略图相关状态
const thumbnailsLoaded = ref({})
const isThumbnailLoading = ref({})
const thumbnailCache = new Map()

// 获取缩略图样式
const getThumbnailStyle = (image) => {
  const url = thumbnailCache.get(image.filename) || getThumbnailUrl(image.filename)
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
}

// 获取缩略图的aria-label
const getThumbnailAriaLabel = (image) => {
  if (thumbnailsLoaded.value[image.filename]) {
    return `${image.name}预览图`
  } else if (isThumbnailLoading.value[image.filename]) {
    return `正在加载${image.name}预览图`
  } else {
    return `${image.name}预览图`
  }
}

/**
 * 预加载图片
 * @param {string} url - 图片URL
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<string>} - 返回图片URL
 */
const preloadImage = (url, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    // 设置超时
    const timer = setTimeout(() => {
      reject(new Error(`图片加载超时: ${url}`))
    }, timeout)
    
    img.onload = () => {
      clearTimeout(timer)
      resolve(url)
    }
    
    img.onerror = () => {
      clearTimeout(timer)
      reject(new Error(`图片加载失败: ${url}`))
    }
    
    img.src = url
  })
}

/**
 * 设置背景图片
 * @param {string} filename - 背景图片文件名或URL
 * @param {number} retries - 重试次数
 */
const setBackground = async (filename, retries = 2) => {
  let lastError
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // 使用背景设置服务来应用和保存背景图片
      await applyBackgroundImage(filename)
      console.log(`背景图片已更换为: ${filename}`)
      return // 成功则直接返回
    } catch (error) {
      lastError = error
      console.warn(`尝试 ${attempt + 1} 失败:`, error.message)
      
      if (attempt < retries) {
        console.log(`重试中... (${attempt + 1}/${retries})`)
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
      }
    }
  }
  
  // 所有重试都失败
  console.error(`加载背景图片失败: ${filename}`, lastError)
  throw lastError
}

/**
 * 初始化背景图片
 * 注意：此函数现在主要用于同步组件状态，
 * 实际的背景设置加载已在应用初始化时通过 useBackgroundSettings 服务完成
 */
const initializeBackground = async () => {
  // 从服务获取当前设置并同步到组件状态
  const settings = getCurrentSettings()
  if (settings.backgroundImage) {
    currentBackground.value = settings.backgroundImage
    console.log('[BackgroundSelector] 同步当前背景设置:', settings.backgroundImage)
  }
}

/**
 * 处理背景选择
 * @param {string} filename - 选择的背景图片文件名
 */
const handleBackgroundSelect = async (filename) => {
  if (isLoading.value) return
  
  isLoading.value = true
  loadingTarget.value = filename // 设置加载目标，确保动画显示在正确的按钮上
  try {
    await setBackground(filename)
    currentBackground.value = filename
    emit('background-changed', filename)
  } catch (error) {
    console.error('背景选择失败:', error)
    emit('error', '图片加载失败')
  } finally {
    isLoading.value = false
    loadingTarget.value = null // 清除加载目标
  }
}

// Hover handlers using smartPreloader
const hoverHandlers = computed(() => {
  const handlers = {}
  backgroundImages.forEach(image => {
    const imageUrl = getBackgroundUrl(image.filename)
    const loadTask = () => Promise.resolve(imageUrl)
    handlers[image.filename] = smartPreloader.preloadOnHover(imageUrl, loadTask)
  })
  return handlers
})

const handleMouseEnter = (filename) => {
  hoverHandlers.value[filename]?.onMouseEnter()
}

const handleMouseLeave = (filename) => {
  hoverHandlers.value[filename]?.onMouseLeave()
}

/**
 * 优化的缩略图加载
 */
const optimizedLoadThumbnails = () => {
  // 简单实现：标记为已加载，因为浏览器会处理图片加载
  // 这里主要为了兼容旧逻辑的 loading 状态显示
  backgroundImages.forEach(img => {
    thumbnailsLoaded.value[img.filename] = true
  })
}

// 暴露方法给父组件
defineExpose({
  optimizedLoadThumbnails,
  initializeBackground
})

onMounted(async () => {
  // 同步组件状态（背景设置已在应用初始化时加载）
  await initializeBackground()
  
  // Preload predicted images
  setTimeout(() => {
    const imageNames = backgroundImages.map(img => getBackgroundUrl(img.filename))
    const simpleLoader = {
      loadImage: (url) => Promise.resolve(url)
    }
    try {
      smartPreloader.preloadPredicted(simpleLoader, imageNames)
    } catch (e) {
      // Ignore
    }
  }, 3000)
})

onUnmounted(() => {
  thumbnailCache.clear()
  smartPreloader.clearHoverTimers()
})
</script>

<style scoped>
/* 背景图片选择区域 */
.background-section {
  margin-bottom: 20px;
}

.background-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  text-align: center;
  color: #44eb0dcb;
}

.background-presets {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 15px;
}


.background-btn {
  background-color: rgba(30, 42, 58, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #E2E8F0;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 60px;
}

.background-btn:hover {
  background-color: rgba(59, 130, 246, 0.2);
  color: #F8FAFC;
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.background-btn.active {
  background-color: rgba(59, 130, 246, 0.3);
  color: #93C5FD;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  font-weight: 600;
}

.background-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.background-btn.loading {
  position: relative;
  overflow: hidden;
}

/* 悬停状态增强 */
.background-btn:hover .background-thumbnail {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.2),
    0 0 0 2px rgba(59, 130, 246, 0.2);
  transform: scale(1.05);
}

/* 选中状态协调 */
.background-btn.active .background-thumbnail {
  border-color: #3B82F6;
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.2),
    0 0 0 2px rgba(59, 130, 246, 0.4);
}

/* 确保加载动画不会导致按钮变形 */
.background-btn.loading .background-thumbnail {
  opacity: 0.5;
  filter: grayscale(0.3) brightness(0.8);
}

.background-btn.loading span {
  opacity: 0.5; /* 加载时降低内容可见度 */
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #93C5FD;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 1; /* 确保加载动画在最上层 */
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

.background-thumbnail {
  /* 基础尺寸 */
  width: 40px;
  height: 25px;
  border-radius: 4px;
  
  /* 图片显示优化 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  /* 视觉效果增强 */
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.2);
  
  /* 过渡动画 */
  transition: all 0.3s ease;
  
  /* 图片渲染优化 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  
  /* 确保缩略图质量 */
  backface-visibility: hidden;
  transform: translateZ(0);
  
  /* 默认状态 - 透明度较低 */
  opacity: 0.8;
}

/* 缩略图加载中状态 */
.background-thumbnail.loading {
  opacity: 0.5;
  background-color: rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

/* 加载动画效果 */
.background-thumbnail.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 缩略图加载失败状态 */
.background-thumbnail.load-failed {
  background-color: rgba(255, 255, 255, 0.1);
  background-image: none;
  position: relative;
  opacity: 0.5;
}

.background-thumbnail.load-failed::after {
  content: '?';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: bold;
}

/* 缩略图加载成功标识 */
.background-thumbnail.loaded {
  /* 加载成功后提高透明度 */
  opacity: 1;
}

/* 悬停状态增强 */
.background-btn:hover .background-thumbnail.loaded {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.2),
    0 0 0 2px rgba(59, 130, 246, 0.2);
  transform: scale(1.05);
}

/* 选中状态协调 */
.background-btn.active .background-thumbnail.loaded {
  border-color: #3B82F6;
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.2),
    0 0 0 2px rgba(59, 130, 246, 0.4);
}

.background-btn span {
  font-size: 11px;
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .background-section h4 {
    font-size: 14px;
    margin-bottom: 10px;
  }
  
  .background-presets {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
  
  .background-btn {
    padding: 6px;
    min-height: 55px;
  }
  
  .background-thumbnail {
    width: 35px;
    height: 22px;
  }
  
  .background-btn span {
    font-size: 10px;
  }
  

}

@media (min-width: 481px) and (max-width: 768px) {
  .background-presets {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .background-thumbnail {
    width: 38px;
    height: 24px;
  }
}

/* 高分辨率屏幕优化 */
@media (min-width: 1920px) {
  .background-section h4 {
    font-size: 18px;
  }
  
  .background-btn {
    padding: 10px;
    min-height: 65px;
  }
  
  .background-thumbnail {
    width: 45px;
    height: 28px;
  }
  
  .background-btn span {
    font-size: 12px;
  }
}
</style>