/**
 * Service Worker Manager
 * Handles service worker registration and communication
 */

export class ServiceWorkerManager {
  constructor() {
    this.registration = null
    this.isSupported = 'serviceWorker' in navigator
  }

  /**
   * Register service worker
   */
  async register() {
    if (!this.isSupported) {
      console.warn('%c[Service Worker] Not supported in this browser', 'color: #F59E0B')
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log(
        '%c[Service Worker] ✓ Registered successfully',
        'color: #10B981; font-weight: bold',
        `\nScope: ${this.registration.scope}`
      )

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing
        console.log('%c[Service Worker] Update found', 'color: #3B82F6')

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log(
              '%c[Service Worker] New version installed - Refresh to update',
              'color: #EC4899; font-weight: bold'
            )
          }
        })
      })

      return true
    } catch (error) {
      console.error('%c[Service Worker] Registration failed', 'color: #EF4444', error)
      return false
    }
  }

  /**
   * Unregister service worker
   */
  async unregister() {
    if (!this.registration) return false

    try {
      const success = await this.registration.unregister()
      console.log('[SW Manager] Service Worker unregistered:', success)
      return success
    } catch (error) {
      console.error('[SW Manager] Unregistration failed:', error)
      return false
    }
  }

  /**
   * Clear cache
   */
  async clearCache() {
    if (!this.registration || !this.registration.active) {
      console.warn('%c[Service Worker] No active service worker', 'color: #F59E0B')
      return false
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          console.log('%c[Service Worker] ✓ Cache cleared', 'color: #10B981; font-weight: bold')
        }
        resolve(event.data.success)
      }

      this.registration.active.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      )
    })
  }

  /**
   * Get cache size
   */
  async getCacheSize() {
    if (!this.registration || !this.registration.active) {
      return 0
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.size)
      }

      this.registration.active.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      )
    })
  }
}

// Singleton instance
export const swManager = new ServiceWorkerManager()
