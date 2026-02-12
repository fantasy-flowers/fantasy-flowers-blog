import { describe, it, expect } from 'vitest'
import { isValidPost, isValidNavItem, isValidPaginationState } from './components.js'

describe('isValidPost', () => {
  it('returns true for a valid post with numeric id', () => {
    expect(isValidPost({ id: 1, title: 'Hello' })).toBe(true)
  })

  it('returns true for a valid post with string id', () => {
    expect(isValidPost({ id: 'abc', title: 'Hello' })).toBe(true)
  })

  it('returns true for a post with optional fields', () => {
    expect(isValidPost({
      id: 1,
      title: 'Hello',
      summary: 'A summary',
      tags: [{ name: 'vue' }]
    })).toBe(true)
  })

  it('returns false for null', () => {
    expect(isValidPost(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isValidPost(undefined)).toBe(false)
  })

  it('returns false when title is missing', () => {
    expect(isValidPost({ id: 1 })).toBe(false)
  })

  it('returns false when id is missing', () => {
    expect(isValidPost({ title: 'Hello' })).toBe(false)
  })

  it('returns false when title is not a string', () => {
    expect(isValidPost({ id: 1, title: 123 })).toBe(false)
  })
})

describe('isValidNavItem', () => {
  it('returns true for a valid nav item', () => {
    expect(isValidNavItem({ path: '/home', label: 'Home' })).toBe(true)
  })

  it('returns true with optional fields', () => {
    expect(isValidNavItem({
      path: '/home',
      label: 'Home',
      icon: 'fa-home',
      routeName: 'home'
    })).toBe(true)
  })

  it('returns false when path is missing', () => {
    expect(isValidNavItem({ label: 'Home' })).toBe(false)
  })

  it('returns false when label is missing', () => {
    expect(isValidNavItem({ path: '/home' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isValidNavItem(null)).toBe(false)
  })
})

describe('isValidPaginationState', () => {
  it('returns true for valid pagination state', () => {
    expect(isValidPaginationState({
      currentPage: 1,
      totalPages: 10,
      pageSize: 20,
      total: 200
    })).toBe(true)
  })

  it('returns false when currentPage is 0', () => {
    expect(isValidPaginationState({
      currentPage: 0,
      totalPages: 10,
      pageSize: 20,
      total: 200
    })).toBe(false)
  })

  it('returns true when totalPages is 0', () => {
    expect(isValidPaginationState({
      currentPage: 1,
      totalPages: 0,
      pageSize: 20,
      total: 0
    })).toBe(true)
  })

  it('returns false when currentPage is not integer', () => {
    expect(isValidPaginationState({
      currentPage: 1.5,
      totalPages: 10,
      pageSize: 20,
      total: 200
    })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isValidPaginationState(null)).toBe(false)
  })
})
