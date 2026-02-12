/**
 * @file useAccessibility.js
 * @description 无障碍访问工具组合函数
 *
 * 提供焦点陷阱、键盘导航和 ARIA 属性管理等无障碍功能，
 * 供 EntryGate、AppSidebar、MobileNavigation 等组件复用。
 */

import { onUnmounted, ref } from 'vue'

/**
 * 创建焦点陷阱，将 Tab 焦点限制在指定容器内
 *
 * @param {import('vue').Ref<HTMLElement|null>} containerRef - 容器元素的 ref
 * @returns {{ activate: () => void, deactivate: () => void, isActive: import('vue').Ref<boolean> }}
 *
 * @example
 * const containerRef = ref(null)
 * const { activate, deactivate } = useFocusTrap(containerRef)
 * onMounted(() => activate())
 */
export function useFocusTrap(containerRef) {
  const isActive = ref(false)
  /** @type {HTMLElement|null} */
  let previouslyFocused = null

  const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')

  /**
   * 获取容器内所有可聚焦元素
   * @returns {HTMLElement[]}
   */
  const getFocusableElements = () => {
    if (!containerRef.value) return []
    return Array.from(containerRef.value.querySelectorAll(FOCUSABLE_SELECTOR))
  }

  /**
   * 处理 Tab 键焦点循环
   * @param {KeyboardEvent} event
   */
  const handleKeyDown = (event) => {
    if (event.key !== 'Tab' || !isActive.value) return

    const focusable = getFocusableElements()
    if (focusable.length === 0) {
      event.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  /** 激活焦点陷阱 */
  const activate = () => {
    if (isActive.value) return
    previouslyFocused = /** @type {HTMLElement|null} */ (document.activeElement)
    isActive.value = true
    document.addEventListener('keydown', handleKeyDown)

    // 将焦点移入容器内第一个可聚焦元素
    const focusable = getFocusableElements()
    if (focusable.length > 0) {
      focusable[0].focus()
    }
  }

  /** 停用焦点陷阱并恢复之前的焦点 */
  const deactivate = () => {
    if (!isActive.value) return
    isActive.value = false
    document.removeEventListener('keydown', handleKeyDown)

    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus()
    }
    previouslyFocused = null
  }

  onUnmounted(deactivate)

  return { activate, deactivate, isActive }
}

/**
 * 键盘导航工具，为一组元素提供方向键导航支持
 *
 * @param {Object} options
 * @param {import('vue').Ref<HTMLElement|null>} options.containerRef - 包含导航项的容器 ref
 * @param {string} [options.itemSelector='[role="menuitem"], [data-nav-item]'] - 导航项选择器
 * @param {'vertical'|'horizontal'|'both'} [options.orientation='vertical'] - 导航方向
 * @param {boolean} [options.loop=true] - 是否循环导航
 * @returns {{ handleKeyDown: (event: KeyboardEvent) => void, focusItem: (index: number) => void }}
 *
 * @example
 * const containerRef = ref(null)
 * const { handleKeyDown } = useKeyboardNavigation({ containerRef })
 */
export function useKeyboardNavigation(options = {}) {
  const {
    containerRef,
    itemSelector = '[role="menuitem"], [data-nav-item]',
    orientation = 'vertical',
    loop = true
  } = options

  /**
   * 获取所有导航项元素
   * @returns {HTMLElement[]}
   */
  const getItems = () => {
    if (!containerRef?.value) return []
    return Array.from(containerRef.value.querySelectorAll(itemSelector))
  }

  /**
   * 聚焦指定索引的导航项
   * @param {number} index
   */
  const focusItem = (index) => {
    const items = getItems()
    if (items.length === 0) return

    let targetIndex = index
    if (loop) {
      targetIndex = ((index % items.length) + items.length) % items.length
    } else {
      targetIndex = Math.max(0, Math.min(index, items.length - 1))
    }

    items[targetIndex]?.focus()
  }

  /**
   * 获取当前聚焦项的索引
   * @returns {number}
   */
  const getCurrentIndex = () => {
    const items = getItems()
    return items.indexOf(/** @type {HTMLElement} */ (document.activeElement))
  }

  /**
   * 键盘事件处理器
   * @param {KeyboardEvent} event
   */
  const handleKeyDown = (event) => {
    const currentIndex = getCurrentIndex()
    if (currentIndex === -1) return

    const prevKeys = orientation === 'horizontal' ? ['ArrowLeft'] : ['ArrowUp']
    const nextKeys = orientation === 'horizontal' ? ['ArrowRight'] : ['ArrowDown']

    if (orientation === 'both') {
      prevKeys.push('ArrowLeft', 'ArrowUp')
      nextKeys.push('ArrowRight', 'ArrowDown')
    }

    if (prevKeys.includes(event.key)) {
      event.preventDefault()
      focusItem(currentIndex - 1)
    } else if (nextKeys.includes(event.key)) {
      event.preventDefault()
      focusItem(currentIndex + 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusItem(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      const items = getItems()
      focusItem(items.length - 1)
    }
  }

  return { handleKeyDown, focusItem }
}

/**
 * 向屏幕阅读器发送通知
 *
 * @param {string} message - 通知内容
 * @param {'polite'|'assertive'} [priority='polite'] - 通知优先级
 */
export function announceToScreenReader(message, priority = 'polite') {
  const el = document.createElement('div')
  el.setAttribute('aria-live', priority)
  el.setAttribute('aria-atomic', 'true')
  el.className = 'sr-only'
  Object.assign(el.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0'
  })
  el.textContent = message
  document.body.appendChild(el)

  setTimeout(() => {
    document.body.removeChild(el)
  }, 1000)
}
