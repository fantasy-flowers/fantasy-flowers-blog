<template>
  <div class="opacity-control-section">
    <h4>背景透明度</h4>
    <div class="opacity-slider-container">
      <label for="bg-opacity-slider">当前透明度: {{ displayTransparency }}%</label>
      <input 
        id="bg-opacity-slider"
        ref="opacitySlider"
        type="range" 
        min="0.1" 
        max="1" 
        step="0.01"
        v-model="transparency"
        @input="updateOpacity"
        @wheel.prevent="handleWheel"
        class="opacity-slider"
        aria-valuemin="10"
        aria-valuemax="100"
        :aria-valuenow="displayTransparency"
        aria-label="背景透明度调节，范围10%到100%，支持鼠标滚轮"
      >
    </div>
    <div class="opacity-presets">
      <button 
        v-for="preset in presets" 
        :key="preset.name"
        @click="setPreset(preset.value)"
        :class="['preset-btn', { active: Math.abs(transparency - preset.value) < 0.01 }]"
      >
        {{ preset.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useBackgroundSettings } from '@/composables/useBackgroundSettings'

/**
 * 透明度 (Transparency) 控制组件
 * 
 * 重要概念区分：
 * - 透明度 (Transparency): 0.1 = 10% 透明（几乎不透明，背景几乎不可见）
 *                          1.0 = 100% 透明（完全透明，背景完全可见）
 * - 不透明度 (Opacity):    0.1 = 10% 不透明（几乎透明，背景几乎完全可见）
 *                          1.0 = 100% 不透明（完全不透明，背景完全不可见）
 * 
 * 关系：不透明度 (Opacity) = 1 - 透明度 (Transparency)
 * 
 * 滑块控制的是透明度 (Transparency)：
 * - 滑块最左端 (0.1) = 10% 透明度 = 90% 不透明度（背景几乎不可见）
 * - 滑块最右端 (1.0) = 100% 透明度 = 0% 不透明度（背景完全可见）
 */

// 使用背景设置服务
const { currentTransparency, applyTransparency, getCurrentSettings } = useBackgroundSettings()

// 从服务获取当前透明度作为初始值
const transparency = ref(getCurrentSettings().transparency || 0.15) // 默认 15% 透明度（85% 不透明度）
const opacitySlider = ref(null) // 滑块引用

// 监听服务中的透明度变化，保持本地状态同步
watch(currentTransparency, (newValue) => {
  if (newValue !== undefined && Math.abs(newValue - transparency.value) > 0.001) {
    transparency.value = newValue
  }
})

// 计算显示的透明度百分比（四舍五入）
const displayTransparency = computed(() => Math.round(transparency.value * 100))

// 计算实际的不透明度（用于CSS）
const actualOpacity = computed(() => 1 - transparency.value)

// 性能优化：使用 requestAnimationFrame 节流透明度更新
// 避免频繁 DOM 操作，将更新合并到浏览器重绘周期
let rafId = null
let pendingTransparency = null
let saveTimer = null

// 预设值：透明度范围 [10%, 100%]
const presets = [
  { name: '10%透明', value: 0.1 },   // 10% 透明度（背景几乎不可见）
  { name: '30%透明', value: 0.3 },   // 30% 透明度
  { name: '50%透明', value: 0.5 },   // 50% 透明度
  { name: '70%透明', value: 0.7 },   // 70% 透明度
  { name: '100%透明', value: 1.0 }   // 100% 透明度（背景完全可见）
]

/**
 * 鼠标滚轮处理函数
 * 
 * 交互逻辑：
 * - 向上滚动（远离用户）：滑块向左移动，透明度降低（趋近 10%）
 * - 向下滚动（靠近用户）：滑块向右移动，透明度提高（趋近 100%）
 * 
 * 性能优化：
 * - 使用节流技术避免高速滚动导致数值跳动过快
 * - 步长设置为 2%，保证调节的精确度与效率
 */
const handleWheel = (event) => {
  // 阻止默认滚动行为
  event.preventDefault()
  
  // 计算滚动方向和步长
  // deltaY > 0: 向下滚动（靠近用户）→ 增加透明度
  // deltaY < 0: 向上滚动（远离用户）→ 减少透明度
  const delta = event.deltaY > 0 ? 0.02 : -0.02
  
  // 计算新的透明度值
  let newTransparency = parseFloat(transparency.value) + delta
  
  // 边界值校验：确保在 [0.1, 1.0] 范围内
  // 0.1 = 10% 透明度（最小值）
  // 1.0 = 100% 透明度（最大值）
  newTransparency = Math.max(0.1, Math.min(1.0, newTransparency))
  
  // 更新透明度
  transparency.value = newTransparency
  updateOpacity()
}

/**
 * 高性能透明度更新函数
 * 
 * 处理透明度 (Transparency) 到不透明度 (Opacity) 的转换
 * 不透明度 = 1 - 透明度
 * 滑块范围：0.1 到 1.0 (对应透明度 10% 到 100%)
 * 
 * 性能优化策略：
 * 1. 使用 requestAnimationFrame 将更新合并到浏览器重绘周期
 * 2. 避免频繁的 DOM 查询和操作
 * 3. 使用防抖技术减少 localStorage 写入频率
 * 
 * 这样可以确保：
 * - 拖拽时流畅无卡顿
 * - 实时反馈无延迟
 * - 不影响其他 UI 交互
 */
const updateOpacity = () => {
  // 边界值校验：确保透明度值在有效范围内 [0.1, 1.0]
  // 0.1 = 10% 透明度（背景几乎不可见）
  // 1.0 = 100% 透明度（背景完全可见）
  const clampedTransparency = Math.max(0.1, Math.min(1.0, parseFloat(transparency.value)))
  
  // 如果值被修正，更新 ref
  if (clampedTransparency !== transparency.value) {
    transparency.value = clampedTransparency
  }
  
  // 计算实际的不透明度（用于CSS）
  // 不透明度 = 1 - 透明度
  const actualOpacityValue = 1 - clampedTransparency
  
  // 存储待更新的不透明度值
  pendingTransparency = actualOpacityValue
  
  // 取消之前的动画帧请求（如果存在）
  // 这样可以将多次快速调用合并为一次更新
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
  }
  
  // 使用 requestAnimationFrame 在下一次重绘时更新
  // 性能优势：将 DOM 操作与浏览器重绘周期同步，避免不必要的重排和重绘
  rafId = requestAnimationFrame(() => {
    if (pendingTransparency !== null) {
      const topOpacity = pendingTransparency
      const bottomOpacity = Math.min(pendingTransparency + 0.15, 1.0) // 底部稍微暗一点
      
      // 直接操作 CSS 变量，性能优于频繁查询 DOM
      const overlayStyle = document.documentElement.style
      overlayStyle.setProperty(
        '--body-overlay-gradient', 
        `linear-gradient(to bottom, rgba(15, 23, 42, ${topOpacity}), rgba(15, 23, 42, ${bottomOpacity}))`
      )
      
      // 保存透明度值（而非不透明度）到 localStorage
      saveTransparencyDebounced(clampedTransparency)
      
      // 重置状态
      pendingTransparency = null
      rafId = null
    }
  })
}

/**
 * 防抖保存函数
 * 避免拖拽时频繁写入 localStorage，提升性能
 * 延迟 300ms 后才执行保存操作
 * 
 * 注意：保存的是透明度值（而非不透明度）
 */
const saveTransparencyDebounced = (value) => {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  saveTimer = setTimeout(() => {
    // 使用背景设置服务来保存透明度
    applyTransparency(value)
    saveTimer = null
  }, 300) // 300ms 防抖延迟
}

/**
 * 设置预设值
 */
const setPreset = (value) => {
  transparency.value = value
  updateOpacity()
}

/**
 * 初始化透明度设置
 * 注意：此函数现在主要用于同步组件状态，
 * 实际的透明度设置加载已在应用初始化时通过 useBackgroundSettings 服务完成
 */
const initializeTransparency = () => {
  // 从服务获取当前设置并同步到组件状态
  const settings = getCurrentSettings()
  if (settings.transparency !== undefined) {
    transparency.value = settings.transparency
    console.log(`[BackgroundOpacity] 同步当前透明度: ${(settings.transparency * 100).toFixed(0)}%`)
  }
}

onMounted(() => {
  // 同步组件状态（透明度设置已在应用初始化时加载）
  initializeTransparency()
})

onUnmounted(() => {
  // 清理性能优化相关的定时器和动画帧
  // 防止内存泄漏和资源浪费
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (saveTimer !== null) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
})

// 暴露方法给父组件
defineExpose({
  updateOpacity
})
</script>

<style scoped>
/* 透明度控制区域 */
.opacity-control-section {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 15px;
}

.opacity-control-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  text-align: center;
  color: #44eb0dcb;
}

.opacity-slider-container {
  margin-bottom: 15px;
}

.opacity-slider-container label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #1c7dd8;
}

.opacity-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #cbd5e1;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  transition: all 0.3s ease;
}

.opacity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
  transition: all 0.3s ease;
}

.opacity-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 3px 10px rgba(139, 92, 246, 0.5);
}

.opacity-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
  border: none;
  transition: all 0.3s ease;
}

.opacity-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 3px 10px rgba(139, 92, 246, 0.5);
}

.opacity-presets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preset-btn {
  background-color: rgba(30, 42, 58, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #E2E8F0;
  font-weight: 500;
}

.preset-btn:hover {
  background-color: rgba(59, 130, 246, 0.2);
  color: #F8FAFC;
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.preset-btn.active {
  background-color: rgba(59, 130, 246, 0.3);
  color: #93C5FD;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .opacity-control-section h4 {
    font-size: 14px;
    margin-bottom: 12px;
  }
  
  .opacity-slider-container label {
    font-size: 12px;
    margin-bottom: 6px;
  }
  
  .opacity-slider {
    height: 4px;
  }
  
  .opacity-slider::-webkit-slider-thumb,
  .opacity-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
  }
  
  .opacity-presets {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
  
  .preset-btn {
    padding: 6px 4px;
    font-size: 11px;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .opacity-presets {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 高分辨率屏幕优化 */
@media (min-width: 1920px) {
  .opacity-control-section h4 {
    font-size: 18px;
  }
  
  .opacity-slider-container label {
    font-size: 16px;
  }
  
  .preset-btn {
    padding: 10px 8px;
    font-size: 14px;
  }
}
</style>