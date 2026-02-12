import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EntryAvatar from './EntryAvatar.vue'

describe('EntryAvatar', () => {
  it('renders an image with the given src', () => {
    const wrapper = mount(EntryAvatar, {
      props: { src: '/head/head.webp' }
    })
    const img = wrapper.find('.entry-avatar__image')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/head/head.webp')
  })

  it('applies the alt text to the image', () => {
    const wrapper = mount(EntryAvatar, {
      props: { src: '/head/head.webp', alt: 'My avatar' }
    })
    expect(wrapper.find('.entry-avatar__image').attributes('alt')).toBe('My avatar')
  })

  it('uses default alt text when not provided', () => {
    const wrapper = mount(EntryAvatar, {
      props: { src: '/head/head.webp' }
    })
    expect(wrapper.find('.entry-avatar__image').attributes('alt')).toBe('Blog avatar')
  })

  it('applies the size to the container and image', () => {
    const wrapper = mount(EntryAvatar, {
      props: { src: '/head/head.webp', size: 80 }
    })
    const container = wrapper.find('.entry-avatar')
    expect(container.attributes('style')).toContain('width: 80px')
    expect(container.attributes('style')).toContain('height: 80px')

    const img = wrapper.find('.entry-avatar__image')
    expect(img.attributes('style')).toContain('width: 80px')
    expect(img.attributes('style')).toContain('height: 80px')
  })

  it('uses default size of 120px', () => {
    const wrapper = mount(EntryAvatar, {
      props: { src: '/head/head.webp' }
    })
    const container = wrapper.find('.entry-avatar')
    expect(container.attributes('style')).toContain('width: 120px')
    expect(container.attributes('style')).toContain('height: 120px')
  })

  it('shows CSS gradient fallback after all image sources fail', async () => {
    const wrapper = mount(EntryAvatar, {
      props: { src: '/head/nonexistent.webp' }
    })

    // Simulate image errors through the fallback chain
    // primary → backup → SVG → CSS gradient
    const img = wrapper.find('.entry-avatar__image')
    await img.trigger('error')
    await img.trigger('error')
    await img.trigger('error')

    // After all fallbacks exhausted, should show CSS gradient fallback div
    expect(wrapper.find('.entry-avatar__fallback').exists()).toBe(true)
    expect(wrapper.find('.entry-avatar__image').exists()).toBe(false)
  })

  it('has role="img" on the image element', () => {
    const wrapper = mount(EntryAvatar, {
      props: { src: '/head/head.webp' }
    })
    expect(wrapper.find('.entry-avatar__image').attributes('role')).toBe('img')
  })

  it('has role="img" and aria-label on the fallback element', async () => {
    const wrapper = mount(EntryAvatar, {
      props: { src: '/bad.webp', alt: 'Test avatar' }
    })

    // Exhaust all fallbacks
    const img = wrapper.find('.entry-avatar__image')
    await img.trigger('error')
    await img.trigger('error')
    await img.trigger('error')

    const fallback = wrapper.find('.entry-avatar__fallback')
    expect(fallback.attributes('role')).toBe('img')
    expect(fallback.attributes('aria-label')).toBe('Test avatar')
  })
})
