<template>
  <div class="opacity-control">
    <!-- 标题 -->
    <h4 class="opacity-control__title">背景透明度</h4>

    <!-- 滑块区域 -->
    <div class="opacity-control__slider-container">
      <label
        class="opacity-control__label"
        for="bg-opacity-slider"
      >
        当前透明度: {{ displayTransparency }}%
      </label>
      <input
        id="bg-opacity-slider"
        ref="sliderRef"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        v-model="transparency"
        class="opacity-control__slider"
        aria-valuemin="10"
        aria-valuemax="100"
        :aria-valuenow="displayTransparency"
        aria-label="背景透明度调节，范围10%到100%，支持鼠标滚轮"
        @input="handleInput"
        @wheel.prevent="handleWheel"
      >
    </div>

    <!-- 预设按钮 -->
    <div class="opacity-control__presets">
      <button
        v-for="preset in presets"
        :key="preset.name"
        :class="[
          'opacity-control__preset-btn',
          { 'opacity-control__preset-btn--active': Math.abs(transparency - preset.value) < 0.01 }
        ]"
        @click="setPreset(preset.value)"
      >
        {{ preset.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * BackgroundOpacityControl - 背景透明度控制组件
 *
 * 提供滑块和预设按钮来调节背景透明度。
 * 使用 useBackgroundSettings composable 管理持久化状态，
 * 通过 requestAnimationFrame 节流 DOM 更新以保证拖拽流畅。
 *
 * 透明度 (Transparency) 与不透明度 (Opacity) 的关系：
 * - 透明度 0.1 (10%) = 背景几乎不可见
 * - 透明度 1.0 (100%) = 背景完全可见
 * - 不透明度 = 1 - 透明度
 *
 * @component
 * @example
 * <BackgroundOpacityControl />
 * <BackgroundOpacityControl :opacity="0.3" :min="0.1" :max="1" :step="0.05" />
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useBackgroundSettings } from '@/composables/useBackgroundSettings'

// ==================== Props 定义 ====================
const props = defineProps({
  /**
   * 初始透明度值
   * @type {number}
   */
  opacity: {
    type: Number,
    default: undefined,
    validator: (v) => v === undefined || (v >= 0.1 && v <= 1.0)
  },
  /**
   * 滑块最小值
   * @type {number}
   */
  min: {
    type: Number,
    default: 0.1
  },
  /**
   * 滑块最大值
   * @type {number}
   */
  max: {
    type: Number,
    default: 1
  },
  /**
   * 滑块步进值
   * @type {number}
   */
  step: {
    type: Number,
    default: 0.01
  }
})

// ==================== Emits 定义 ====================
const emit = defineEmits({
  /**
   * 透明度变更事件
   * @param {number} value - 新的透明度值 (0.1-1.0)
   */
  'update:opacity': (value) => typeof value === 'number' && value >= 0.1 && value <= 1.0
})

// ==================== Composable ====================
const { currentTransparency, applyTransparency, getCurrentSettings } = useBackgroundSettings()

// ==================== 响应式状态 ====================
const sliderRef = ref(null)
const transparency = ref(props.opacity ?? getCurrentSettings().transparency ?? 0.15)

/** 透明度百分比（四舍五入） */
const displayTransparency = computed(() => Math.round(transparency.value * 100))

/** 预设选项 */
const presets = [
  { name: '10%透明', value: 0.1 },
  { name: '30%透明', value: 0.3 },
  { name: '50%透明', value: 0.5 },
  { name: '70%透明', value: 0.7 },
  { name: '100%透明', value: 1.0 }
]

// ==================== 性能优化状态 ====================
let rafId = null
let pendingOpacity = null
let saveTimer = null

// ==================== 监听器 ====================

/** 同步来自 composable 的外部变更 */
watch(currentTransparency, (val) => {
  if (val !== undefined && Math.abs(val - transparency.value) > 0.001) {
    transparency.value = val
  }
})

// ==================== 方法 ====================

/**
 * 将透明度值限制在有效范围内
 * @param {number} value - 原始值
 * @returns {number} 限制后的值
 */
const clamp = (value) => Math.max(props.min, Math.min(props.max, parseFloat(value)))

/**
 * 应用透明度到 DOM 并防抖保存
 * 使用 requestAnimationFrame 合并更新到浏览器重绘周期
 * @param {number} value - 透明度值
 */
const applyUpdate = (value) => {
  const clamped = clamp(value)
  if (clamped !== transparency.value) transparency.value = clamped

  const actualOpacity = 1 - clamped
  pendingOpacity = actualOpacity

  if (rafId !== null) cancelAnimationFrame(rafId)

  rafId = requestAnimationFrame(() => {
    if (pendingOpacity !== null) {
      const top = pendingOpacity
      const bottom = Math.min(pendingOpacity + 0.15, 1.0)
      document.documentElement.style.setProperty(
        '--body-overlay-gradient',
        `linear-gradient(to bottom, rgba(15, 23, 42, ${top}), rgba(15, 23, 42, ${bottom}))`
      )
      debouncedSave(clamped)
      emit('update:opacity', clamped)
      pendingOpacity = null
      rafId = null
    }
  })
}

/**
 * 防抖保存到 localStorage（300ms）
 * @param {number} value - 透明度值
 */
const debouncedSave = (value) => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    applyTransparency(value)
    saveTimer = null
  }, 300)
}

/** 滑块 input 事件处理 */
const handleInput = () => applyUpdate(transparency.value)

/**
 * 鼠标滚轮处理
 * 向上滚动 → 降低透明度，向下滚动 → 提高透明度
 * @param {WheelEvent} event
 */
const handleWheel = (event) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.02 : -0.02
  transparency.value = clamp(parseFloat(transparency.value) + delta)
  applyUpdate(transparency.value)
}

/**
 * 设置预设透明度
 * @param {number} value - 预设值
 */
const setPreset = (value) => {
  transparency.value = value
  applyUpdate(value)
}

// ==================== 生命周期 ====================
onMounted(() => {
  const settings = getCurrentSettings()
  if (props.opacity !== undefined) {
    transparency.value = props.opacity
  } else if (settings.transparency !== undefined) {
    transparency.value = settings.transparency
  }
})

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  if (saveTimer !== null) clearTimeout(saveTimer)
})

// ==================== 暴露给父组件 ====================
defineExpose({ updateOpacity: handleInput })
</script>

<style scoped>
.opacity-control { border-top: 1px solid rgba(255, 255, 255, 0.2); padding-top: 15px; }
.opacity-control__title { margin: 0 0 15px 0; font-size: 16px; text-align: center; color: #44eb0dcb; }
.opacity-control__slider-container { margin-bottom: 15px; }
.opacity-control__label { display: block; margin-bottom: 8px; font-size: 14px; color: #1c7dd8; }
.opacity-control__slider {
  width: 100%; height: 6px; border-radius: 3px; background: #cbd5e1;
  outline: none; -webkit-appearance: none; appearance: none; transition: all 0.3s ease;
}
.opacity-control__slider::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%;
  background: #8b5cf6; cursor: pointer; box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3); transition: all 0.3s ease;
}
.opacity-control__slider::-webkit-slider-thumb:hover { transform: scale(1.2); box-shadow: 0 3px 10px rgba(139, 92, 246, 0.5); }
.opacity-control__slider::-moz-range-thumb {
  width: 18px; height: 18px; border-radius: 50%; background: #8b5cf6;
  cursor: pointer; box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3); border: none; transition: all 0.3s ease;
}
.opacity-control__slider::-moz-range-thumb:hover { transform: scale(1.2); box-shadow: 0 3px 10px rgba(139, 92, 246, 0.5); }
.opacity-control__presets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.opacity-control__preset-btn {
  background-color: rgba(30, 42, 58, 0.8); border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px; padding: 8px 6px; font-size: 12px; cursor: pointer;
  transition: all 0.3s ease; color: #E2E8F0; font-weight: 500;
  width: 100%; box-sizing: border-box;
  height: 32px; line-height: 1; display: flex; align-items: center; justify-content: center;
}
.opacity-control__preset-btn:hover {
  background-color: rgba(59, 130, 246, 0.2); color: #F8FAFC;
  border-color: rgba(59, 130, 246, 0.3); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); transform: translateY(-1px);
}
.opacity-control__preset-btn--active {
  background-color: rgba(59, 130, 246, 0.3); color: #93C5FD;
  border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); font-weight: 600;
}
@media (max-width: 480px) {
  .opacity-control__title { font-size: 14px; margin-bottom: 12px; }
  .opacity-control__label { font-size: 12px; margin-bottom: 6px; }
  .opacity-control__slider { height: 4px; }
  .opacity-control__slider::-webkit-slider-thumb,
  .opacity-control__slider::-moz-range-thumb { width: 16px; height: 16px; }
  .opacity-control__presets { grid-template-columns: repeat(2, 1fr); gap: 6px; }
  .opacity-control__preset-btn { padding: 6px 4px; font-size: 11px; height: 28px; }
}
@media (min-width: 481px) and (max-width: 768px) {
  .opacity-control__presets { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1920px) {
  .opacity-control__title { font-size: 18px; }
  .opacity-control__label { font-size: 16px; }
  .opacity-control__preset-btn { padding: 10px 8px; font-size: 14px; height: 36px; }
}

/* 尊重用户减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .opacity-control__slider,
  .opacity-control__slider::-webkit-slider-thumb,
  .opacity-control__preset-btn {
    transition: none;
  }

  .opacity-control__slider::-webkit-slider-thumb:hover,
  .opacity-control__preset-btn:hover {
    transform: none;
  }
}
</style>
