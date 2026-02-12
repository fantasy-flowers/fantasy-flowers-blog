import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useFocusTrap, useKeyboardNavigation, announceToScreenReader } from './useAccessibility.js'

// Mock onUnmounted since we're not in a component context
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return { ...actual, onUnmounted: vi.fn() }
})

describe('useFocusTrap', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <input id="input1" type="text" />
      <button id="btn2">Button 2</button>
    `
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('activates and sets isActive to true', () => {
    const containerRef = ref(container)
    const { activate, isActive } = useFocusTrap(containerRef)

    activate()
    expect(isActive.value).toBe(true)
  })

  it('deactivates and sets isActive to false', () => {
    const containerRef = ref(container)
    const { activate, deactivate, isActive } = useFocusTrap(containerRef)

    activate()
    deactivate()
    expect(isActive.value).toBe(false)
  })

  it('focuses first focusable element on activate', () => {
    const containerRef = ref(container)
    const { activate } = useFocusTrap(containerRef)

    activate()
    expect(document.activeElement).toBe(container.querySelector('#btn1'))
  })

  it('does not double-activate', () => {
    const containerRef = ref(container)
    const { activate, isActive } = useFocusTrap(containerRef)

    activate()
    activate() // second call should be no-op
    expect(isActive.value).toBe(true)
  })

  it('wraps focus from last to first on Tab', () => {
    const containerRef = ref(container)
    const { activate } = useFocusTrap(containerRef)

    activate()
    const btn2 = container.querySelector('#btn2')
    btn2.focus()

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    const preventSpy = vi.spyOn(event, 'preventDefault')
    document.dispatchEvent(event)

    expect(preventSpy).toHaveBeenCalled()
    expect(document.activeElement).toBe(container.querySelector('#btn1'))
  })

  it('wraps focus from first to last on Shift+Tab', () => {
    const containerRef = ref(container)
    const { activate } = useFocusTrap(containerRef)

    activate()
    const btn1 = container.querySelector('#btn1')
    btn1.focus()

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
    const preventSpy = vi.spyOn(event, 'preventDefault')
    document.dispatchEvent(event)

    expect(preventSpy).toHaveBeenCalled()
    expect(document.activeElement).toBe(container.querySelector('#btn2'))
  })

  it('restores previously focused element on deactivate', () => {
    const externalBtn = document.createElement('button')
    externalBtn.id = 'external'
    document.body.appendChild(externalBtn)
    externalBtn.focus()

    const containerRef = ref(container)
    const { activate, deactivate } = useFocusTrap(containerRef)

    activate()
    deactivate()

    expect(document.activeElement).toBe(externalBtn)
    document.body.removeChild(externalBtn)
  })
})

describe('useKeyboardNavigation', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.innerHTML = `
      <button data-nav-item>Item 1</button>
      <button data-nav-item>Item 2</button>
      <button data-nav-item>Item 3</button>
    `
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('moves focus down on ArrowDown (vertical)', () => {
    const containerRef = ref(container)
    const { handleKeyDown } = useKeyboardNavigation({ containerRef })

    const items = container.querySelectorAll('[data-nav-item]')
    items[0].focus()

    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    vi.spyOn(event, 'preventDefault')
    handleKeyDown(event)

    expect(document.activeElement).toBe(items[1])
  })

  it('moves focus up on ArrowUp (vertical)', () => {
    const containerRef = ref(container)
    const { handleKeyDown } = useKeyboardNavigation({ containerRef })

    const items = container.querySelectorAll('[data-nav-item]')
    items[1].focus()

    const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
    vi.spyOn(event, 'preventDefault')
    handleKeyDown(event)

    expect(document.activeElement).toBe(items[0])
  })

  it('loops from last to first on ArrowDown', () => {
    const containerRef = ref(container)
    const { handleKeyDown } = useKeyboardNavigation({ containerRef, loop: true })

    const items = container.querySelectorAll('[data-nav-item]')
    items[2].focus()

    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    vi.spyOn(event, 'preventDefault')
    handleKeyDown(event)

    expect(document.activeElement).toBe(items[0])
  })

  it('focuses first item on Home key', () => {
    const containerRef = ref(container)
    const { handleKeyDown } = useKeyboardNavigation({ containerRef })

    const items = container.querySelectorAll('[data-nav-item]')
    items[2].focus()

    const event = new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
    vi.spyOn(event, 'preventDefault')
    handleKeyDown(event)

    expect(document.activeElement).toBe(items[0])
  })

  it('focuses last item on End key', () => {
    const containerRef = ref(container)
    const { handleKeyDown } = useKeyboardNavigation({ containerRef })

    const items = container.querySelectorAll('[data-nav-item]')
    items[0].focus()

    const event = new KeyboardEvent('keydown', { key: 'End', bubbles: true })
    vi.spyOn(event, 'preventDefault')
    handleKeyDown(event)

    expect(document.activeElement).toBe(items[2])
  })

  it('uses ArrowLeft/ArrowRight for horizontal orientation', () => {
    const containerRef = ref(container)
    const { handleKeyDown } = useKeyboardNavigation({
      containerRef,
      orientation: 'horizontal'
    })

    const items = container.querySelectorAll('[data-nav-item]')
    items[0].focus()

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    vi.spyOn(event, 'preventDefault')
    handleKeyDown(event)

    expect(document.activeElement).toBe(items[1])
  })
})

describe('announceToScreenReader', () => {
  it('creates and removes an aria-live element', async () => {
    vi.useFakeTimers()

    announceToScreenReader('Test message')

    const liveRegion = document.querySelector('[aria-live="polite"]')
    expect(liveRegion).not.toBeNull()
    expect(liveRegion.textContent).toBe('Test message')

    vi.advanceTimersByTime(1000)

    expect(document.querySelector('[aria-live="polite"]')).toBeNull()

    vi.useRealTimers()
  })

  it('supports assertive priority', () => {
    vi.useFakeTimers()

    announceToScreenReader('Urgent message', 'assertive')

    const liveRegion = document.querySelector('[aria-live="assertive"]')
    expect(liveRegion).not.toBeNull()
    expect(liveRegion.textContent).toBe('Urgent message')

    vi.advanceTimersByTime(1000)
    vi.useRealTimers()
  })
})
