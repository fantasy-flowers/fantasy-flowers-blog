<template>
  <div 
    ref="wrapperElement"
    class="lazy-image-wrapper"
    :class="{ 'is-loaded': isLoaded, 'is-loading': isLoading }"
  >
    <!-- 占位符 -->
    <div v-if="!isLoaded" class="placeholder" :style="placeholderStyle">
      <div v-if="showSpinner" class="spinner"></div>
    </div>
    
    <!-- 实际图片 -->
    <img
      v-show="isLoaded"
      :src="currentSrc"
      :alt="alt"
      :loading="nativeLazy ? 'lazy' : 'eager'"
      @load="handleLoad"
      @error="handleError"
      class="lazy-image"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  showSpinner: {
    type: Boolean,
    default: true
  },
  nativeLazy: {
    type: Boolean,
    default: true
  },
  threshold: {
    type: Number,
    default: 0.1
  }
})

const emit = defineEmits(['load', 'error'])

const isLoaded = ref(false)
const isLoading = ref(false)
const currentSrc = ref('')
const observer = ref(null)
const wrapperElement = ref(null)

const placeholderStyle = computed(() => ({
  backgroundImage: props.placeholder ? `url(${props.placeholder})` : 'none',
  backgroundColor: props.placeholder ? 'transparent' : '#f0f0f0'
}))

const handleLoad = () => {
  isLoaded.value = true
  isLoading.value = false
  emit('load')
}

const handleError = (error) => {
  isLoading.value = false
  emit('error', error)
}

const loadImage = () => {
  if (isLoading.value || isLoaded.value) return
  
  isLoading.value = true
  currentSrc.value = props.src
}

// 监听 src 变化，重新加载图片
watch(() => props.src, (newSrc) => {
  if (newSrc && newSrc !== currentSrc.value) {
    isLoaded.value = false
    isLoading.value = false
    // 如果使用原生懒加载，立即更新 src
    if (props.nativeLazy) {
      loadImage()
    }
  }
})

onMounted(() => {
  // 如果使用原生懒加载，立即设置 src，让浏览器处理懒加载
  if (props.nativeLazy) {
    loadImage()
  } else if ('IntersectionObserver' in window) {
    // 使用 Intersection Observer 实现自定义懒加载
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage()
            observer.value?.disconnect()
          }
        })
      },
      {
        threshold: props.threshold,
        rootMargin: '50px'
      }
    )
    
    if (wrapperElement.value) {
      observer.value.observe(wrapperElement.value)
    }
  } else {
    // 降级到立即加载
    loadImage()
  }
})

onUnmounted(() => {
  observer.value?.disconnect()
})
</script>

<style scoped>
.lazy-image-wrapper {
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;
}

.placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.is-loading .lazy-image {
  opacity: 0;
}

.is-loaded .lazy-image {
  opacity: 1;
}
</style>
