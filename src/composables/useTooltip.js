/**
 * @file useTooltip.js
 * @description 提示框功能的可复用组合函数
 * @author fantasy_flowers
 * @date 2026-02-02
 * 
 * 功能说明：
 * 1. 提供统一的提示框显示/隐藏逻辑
 * 2. 支持条件控制（如：仅在侧边栏收起时显示）
 * 3. 自动管理提示框状态和目标元素位置信息
 * 4. 符合企业级代码规范，提高代码复用性和可维护性
 */

import { ref } from 'vue'

/**
 * 提示框功能组合函数
 * @param {Object} options - 配置选项
 * @param {Function} options.shouldShow - 是否应该显示提示框的判断函数，返回布尔值
 * @returns {Object} 包含提示框状态和控制方法的对象
 */
export function useTooltip(options = {}) {
    const {
        shouldShow = () => true // 默认总是显示
    } = options

    // 提示框状态
    const tooltipState = ref({
        show: false,        // 是否显示提示框
        text: '',          // 提示文本内容
        targetRect: null   // 目标元素的位置信息
    })

    /**
     * 显示提示框
     * @param {Event} event - 鼠标事件对象
     * @param {String} text - 提示文本内容
     */
    const showTooltip = (event, text) => {
        // 检查是否满足显示条件
        if (!shouldShow()) {
            return
        }

        // 获取目标元素的位置信息
        const targetRect = event.currentTarget.getBoundingClientRect()

        // 更新提示框状态
        tooltipState.value = {
            show: true,
            text,
            targetRect
        }
    }

    /**
     * 隐藏提示框
     */
    const hideTooltip = () => {
        tooltipState.value.show = false
    }

    /**
     * 重置提示框状态
     */
    const resetTooltip = () => {
        tooltipState.value = {
            show: false,
            text: '',
            targetRect: null
        }
    }

    // 返回提示框状态和控制方法
    return {
        tooltipState,       // 提示框状态（响应式）
        showTooltip,       // 显示提示框方法
        hideTooltip,       // 隐藏提示框方法
        resetTooltip       // 重置提示框方法
    }
}

/**
 * 导出默认配置
 */
export default useTooltip
