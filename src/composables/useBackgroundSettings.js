/**
 * Background Settings Management Service
 * 
 * 负责背景设置的持久化存储与管理
 * 遵循组件化开发原则，将存储逻辑与UI展示逻辑分离
 */

import { ref, readonly } from 'vue'
import { DEFAULT_BACKGROUND, getBackgroundUrl } from '@/constants/backgrounds'

// ==================== 存储键常量 ====================
const STORAGE_KEYS = {
    BACKGROUND_IMAGE: 'blog-background-image',
    BACKGROUND_TRANSPARENCY: 'blog-background-transparency',
    // 旧版本兼容
    BACKGROUND_OPACITY_LEGACY: 'blog-background-opacity'
}

// ==================== 默认值常量 ====================
const DEFAULTS = {
    BACKGROUND_IMAGE: DEFAULT_BACKGROUND,
    TRANSPARENCY: 0.15  // 15% 透明度 (85% 不透明度)
}

// ==================== 响应式状态 ====================
// 使用模块级别的状态实现单例模式，确保所有组件共享同一状态
const currentBackgroundImage = ref(DEFAULTS.BACKGROUND_IMAGE)
const currentTransparency = ref(DEFAULTS.TRANSPARENCY)
const isInitialized = ref(false)
const lastError = ref(null)

// ==================== 工具函数 ====================

/**
 * 安全地从 localStorage 读取值
 * @param {string} key - 存储键
 * @param {*} defaultValue - 默认值
 * @returns {string|null} - 读取的值
 */
const safeGetItem = (key, defaultValue = null) => {
    try {
        const value = localStorage.getItem(key)
        return value !== null ? value : defaultValue
    } catch (error) {
        console.error(`[BackgroundSettings] 读取 localStorage 失败 (${key}):`, error)
        lastError.value = { type: 'read', key, error }
        return defaultValue
    }
}

/**
 * 安全地向 localStorage 写入值
 * @param {string} key - 存储键
 * @param {*} value - 要存储的值
 * @returns {boolean} - 是否成功
 */
const safeSetItem = (key, value) => {
    try {
        localStorage.setItem(key, String(value))
        return true
    } catch (error) {
        console.error(`[BackgroundSettings] 写入 localStorage 失败 (${key}):`, error)
        lastError.value = { type: 'write', key, error }
        return false
    }
}

/**
 * 验证透明度值是否有效
 * @param {number} value - 透明度值
 * @returns {number} - 验证后的透明度值
 */
const validateTransparency = (value) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return DEFAULTS.TRANSPARENCY
    return Math.max(0.1, Math.min(1.0, numValue))
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

// ==================== 核心功能函数 ====================

/**
 * 应用背景图片到 DOM
 * @param {string} filename - 背景图片文件名或URL
 * @param {boolean} shouldSave - 是否保存到 localStorage
 */
const applyBackgroundImage = async (filename, shouldSave = false) => {
    try {
        const imageUrl = getBackgroundUrl(filename)

        // 预加载图片（带超时和重试）
        let loaded = false
        for (let attempt = 0; attempt < 3 && !loaded; attempt++) {
            try {
                await preloadImage(imageUrl, 3000)
                loaded = true
            } catch (err) {
                if (attempt < 2) {
                    console.warn(`[BackgroundSettings] 图片加载重试 (${attempt + 1}/3):`, err.message)
                    await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
                }
            }
        }

        // 更新 body 背景
        const body = document.body
        body.style.backgroundImage = `url(${imageUrl})`
        body.style.backgroundSize = 'cover'
        body.style.backgroundPosition = 'center'
        body.style.backgroundAttachment = 'fixed'

        // 更新响应式状态
        currentBackgroundImage.value = filename

        // 保存到 localStorage
        if (shouldSave) {
            safeSetItem(STORAGE_KEYS.BACKGROUND_IMAGE, filename)
        }

        console.log(`[BackgroundSettings] 背景图片已应用: ${filename}`)
        return true
    } catch (error) {
        console.error('[BackgroundSettings] 应用背景图片失败:', error)
        lastError.value = { type: 'apply_background', error }

        // 回退到直接路径
        const directPath = getBackgroundUrl(filename)
        document.body.style.backgroundImage = `url(${directPath})`
        return false
    }
}

/**
 * 应用透明度设置到 DOM
 * @param {number} transparency - 透明度值 (0.1-1.0)
 * @param {boolean} shouldSave - 是否保存到 localStorage
 */
const applyTransparency = (transparency, shouldSave = false) => {
    try {
        const validTransparency = validateTransparency(transparency)

        // 计算不透明度 (用于CSS)
        const actualOpacity = 1 - validTransparency
        const topOpacity = actualOpacity
        const bottomOpacity = Math.min(actualOpacity + 0.15, 1.0)

        // 应用到 CSS 变量
        document.documentElement.style.setProperty(
            '--body-overlay-gradient',
            `linear-gradient(to bottom, rgba(15, 23, 42, ${topOpacity}), rgba(15, 23, 42, ${bottomOpacity}))`
        )

        // 更新响应式状态
        currentTransparency.value = validTransparency

        // 保存到 localStorage
        if (shouldSave) {
            safeSetItem(STORAGE_KEYS.BACKGROUND_TRANSPARENCY, validTransparency.toString())
        }

        console.log(`[BackgroundSettings] 透明度已应用: ${(validTransparency * 100).toFixed(0)}%`)
        return true
    } catch (error) {
        console.error('[BackgroundSettings] 应用透明度失败:', error)
        lastError.value = { type: 'apply_transparency', error }
        return false
    }
}

/**
 * 从 localStorage 加载并应用所有设置
 * 这是应用初始化时调用的核心函数
 */
const loadAndApplySettings = async () => {
    console.group('%c🎨 BackgroundSettings Initialization', 'color: #8B5CF6; font-weight: bold')

    try {
        // 1. 加载透明度设置
        let savedTransparency = safeGetItem(STORAGE_KEYS.BACKGROUND_TRANSPARENCY)

        if (savedTransparency !== null) {
            // 新格式：直接是透明度值
            const parsedTransparency = validateTransparency(savedTransparency)
            applyTransparency(parsedTransparency, false)
            console.log(`✓ 透明度已恢复: ${(parsedTransparency * 100).toFixed(0)}%`)
        } else {
            // 尝试读取旧格式（不透明度）并转换
            const savedOpacity = safeGetItem(STORAGE_KEYS.BACKGROUND_OPACITY_LEGACY)
            if (savedOpacity !== null) {
                const parsedOpacity = parseFloat(savedOpacity)
                const convertedTransparency = validateTransparency(1 - parsedOpacity)
                applyTransparency(convertedTransparency, true)  // 保存为新格式
                console.log(`✓ 透明度已从旧格式转换: ${(convertedTransparency * 100).toFixed(0)}%`)
            } else {
                // 使用默认值
                applyTransparency(DEFAULTS.TRANSPARENCY, false)
                console.log(`✓ 使用默认透明度: ${(DEFAULTS.TRANSPARENCY * 100).toFixed(0)}%`)
            }
        }

        // 2. 加载背景图片设置
        const savedBackground = safeGetItem(STORAGE_KEYS.BACKGROUND_IMAGE)

        if (savedBackground) {
            await applyBackgroundImage(savedBackground, false)
            console.log(`✓ 背景图片已恢复: ${savedBackground}`)
        } else {
            await applyBackgroundImage(DEFAULTS.BACKGROUND_IMAGE, false)
            console.log(`✓ 使用默认背景图片: ${DEFAULTS.BACKGROUND_IMAGE}`)
        }

        isInitialized.value = true
        console.log('✓ 背景设置初始化完成')
    } catch (error) {
        console.error('✗ 背景设置初始化失败:', error)
        lastError.value = { type: 'initialization', error }

        // 使用默认值作为fallback
        applyTransparency(DEFAULTS.TRANSPARENCY, false)
        await applyBackgroundImage(DEFAULTS.BACKGROUND_IMAGE, false)
        isInitialized.value = true
    }

    console.groupEnd()
}

/**
 * 获取当前设置（用于壁纸控制中心显示）
 */
const getCurrentSettings = () => {
    return {
        backgroundImage: currentBackgroundImage.value,
        transparency: currentTransparency.value
    }
}

/**
 * 重置为默认设置
 */
const resetToDefaults = async () => {
    await applyBackgroundImage(DEFAULTS.BACKGROUND_IMAGE, true)
    applyTransparency(DEFAULTS.TRANSPARENCY, true)
    console.log('[BackgroundSettings] 已重置为默认设置')
}

// ==================== 导出 Composable ====================

/**
 * useBackgroundSettings composable
 * 
 * 提供背景设置的读取、更新和持久化功能
 */
export function useBackgroundSettings() {
    return {
        // 响应式状态（只读）
        currentBackgroundImage: readonly(currentBackgroundImage),
        currentTransparency: readonly(currentTransparency),
        isInitialized: readonly(isInitialized),
        lastError: readonly(lastError),

        // 核心方法
        loadAndApplySettings,
        applyBackgroundImage: (filename) => applyBackgroundImage(filename, true),
        applyTransparency: (transparency) => applyTransparency(transparency, true),
        getCurrentSettings,
        resetToDefaults,

        // 常量
        DEFAULTS,
        STORAGE_KEYS
    }
}

// 导出初始化函数（供应用启动时调用）
export { loadAndApplySettings as initBackgroundSettings }

// 导出内部函数（供测试或高级用例使用）
export const __internal = {
    safeGetItem,
    safeSetItem,
    validateTransparency,
    applyBackgroundImage,
    applyTransparency
}
