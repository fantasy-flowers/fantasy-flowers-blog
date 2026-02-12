import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SidebarHeader from './SidebarHeader.vue'

describe('SidebarHeader', () => {
  const defaults = {
    avatarSrc: '/head/head.webp',
    name: 'fantasy_flowers',
    slogan: '热爱生活，热爱编程',
    collapsed: false
  }

  it('renders with default props', () => {
    const wrapper = mount(SidebarHeader)
    expect(wrapper.find('.sidebar-header__name').text()).toBe(defaults.name)
    expect(wrapper.find('.sidebar-header__slogan').text()).toBe(defaults.slogan)
    expect(wrapper.find('.sidebar-header__avatar-img').attributes('src')).toBe(defaults.avatarSrc)
  })

  it('renders custom name, slogan, and avatar', () => {
    const wrapper = mount(SidebarHeader, {
      props: { avatarSrc: '/custom.png', name: 'Alice', slogan: 'Hello world' }
    })
    expect(wrapper.find('.sidebar-header__name').text()).toBe('Alice')
    expect(wrapper.find('.sidebar-header__slogan').text()).toBe('Hello world')
    expect(wrapper.find('.sidebar-header__avatar-img').attributes('src')).toBe('/custom.png')
  })

  it('sets alt text from name prop', () => {
    const wrapper = mount(SidebarHeader, { props: { name: 'Bob' } })
    expect(wrapper.find('.sidebar-header__avatar-img').attributes('alt')).toBe('Bob avatar')
  })

  it('hides text when collapsed', () => {
    const wrapper = mount(SidebarHeader, { props: { collapsed: true } })
    expect(wrapper.find('.sidebar-header__text--hidden').exists()).toBe(true)
  })

  it('shows text when not collapsed', () => {
    const wrapper = mount(SidebarHeader, { props: { collapsed: false } })
    expect(wrapper.find('.sidebar-header__text--hidden').exists()).toBe(false)
  })

  it('emits toggle on button click', async () => {
    const wrapper = mount(SidebarHeader)
    await wrapper.find('.sidebar-header__toggle').trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('emits toggle on Enter key', async () => {
    const wrapper = mount(SidebarHeader)
    await wrapper.find('.sidebar-header__toggle').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('emits toggle on Space key', async () => {
    const wrapper = mount(SidebarHeader)
    await wrapper.find('.sidebar-header__toggle').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('has correct aria-label when expanded', () => {
    const wrapper = mount(SidebarHeader, { props: { collapsed: false } })
    const toggle = wrapper.find('.sidebar-header__toggle')
    expect(toggle.attributes('aria-label')).toBe('收起侧边栏')
    expect(toggle.attributes('aria-expanded')).toBe('true')
  })

  it('has correct aria-label when collapsed', () => {
    const wrapper = mount(SidebarHeader, { props: { collapsed: true } })
    const toggle = wrapper.find('.sidebar-header__toggle')
    expect(toggle.attributes('aria-label')).toBe('展开侧边栏')
    expect(toggle.attributes('aria-expanded')).toBe('false')
  })

  it('toggle has role="button" and tabindex', () => {
    const wrapper = mount(SidebarHeader)
    const toggle = wrapper.find('.sidebar-header__toggle')
    expect(toggle.attributes('role')).toBe('button')
    expect(toggle.attributes('tabindex')).toBe('0')
  })

  it('applies collapsed modifier class on toggle when collapsed', () => {
    const wrapper = mount(SidebarHeader, { props: { collapsed: true } })
    expect(wrapper.find('.sidebar-header__toggle--collapsed').exists()).toBe(true)
  })

  it('does not apply collapsed modifier class on toggle when expanded', () => {
    const wrapper = mount(SidebarHeader, { props: { collapsed: false } })
    expect(wrapper.find('.sidebar-header__toggle--collapsed').exists()).toBe(false)
  })
})
