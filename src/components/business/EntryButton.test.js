import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import EntryButton from './EntryButton.vue'

describe('EntryButton', () => {
  it('renders with default text', () => {
    const wrapper = mount(EntryButton)
    expect(wrapper.find('.entry-button__text').text()).toBe('进入博客')
  })

  it('renders with custom text', () => {
    const wrapper = mount(EntryButton, { props: { text: 'Enter Blog' } })
    expect(wrapper.find('.entry-button__text').text()).toBe('Enter Blog')
  })

  it('emits click event on button click', async () => {
    const wrapper = mount(EntryButton)
    await wrapper.find('.entry-button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('emits click on Enter key', async () => {
    const wrapper = mount(EntryButton)
    await wrapper.find('.entry-button').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('emits click on Space key', async () => {
    const wrapper = mount(EntryButton)
    await wrapper.find('.entry-button').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click on other keys', async () => {
    const wrapper = mount(EntryButton)
    await wrapper.find('.entry-button').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(EntryButton, { props: { disabled: true } })
    expect(wrapper.find('.entry-button').attributes('disabled')).toBeDefined()
  })

  it('is disabled when loading prop is true', () => {
    const wrapper = mount(EntryButton, { props: { loading: true } })
    expect(wrapper.find('.entry-button').attributes('disabled')).toBeDefined()
  })

  it('sets aria-busy when loading', () => {
    const wrapper = mount(EntryButton, { props: { loading: true } })
    expect(wrapper.find('.entry-button').attributes('aria-busy')).toBe('true')
  })

  it('sets aria-busy to false when not loading', () => {
    const wrapper = mount(EntryButton)
    expect(wrapper.find('.entry-button').attributes('aria-busy')).toBe('false')
  })

  it('applies default aria-label', () => {
    const wrapper = mount(EntryButton)
    expect(wrapper.find('.entry-button').attributes('aria-label')).toBe(
      '进入博客 - 点击或按回车键进入主博客页面'
    )
  })

  it('applies custom aria-label', () => {
    const wrapper = mount(EntryButton, { props: { ariaLabel: 'Custom label' } })
    expect(wrapper.find('.entry-button').attributes('aria-label')).toBe('Custom label')
  })

  it('has type="button" attribute', () => {
    const wrapper = mount(EntryButton)
    expect(wrapper.find('.entry-button').attributes('type')).toBe('button')
  })

  it('applies touch-active class on touchstart and removes on touchend', async () => {
    vi.useFakeTimers()
    const wrapper = mount(EntryButton)
    const btn = wrapper.find('.entry-button')

    await btn.trigger('touchstart')
    expect(btn.classes()).toContain('entry-button--touch-active')

    await btn.trigger('touchend')
    vi.advanceTimersByTime(200)
    await wrapper.vm.$nextTick()
    expect(btn.classes()).not.toContain('entry-button--touch-active')

    vi.useRealTimers()
  })
})
