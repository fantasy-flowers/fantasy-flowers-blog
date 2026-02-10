/**
 * Service Worker for Image Caching
 * Enhanced with intelligent caching, LRU eviction, and dynamic size management
 */

const CACHE_VERSION = 'v3'
const IMAGE_CACHE_NAME = `blog-images-${CACHE_VERSION}`
const STATIC_CACHE_NAME = `blog-static-${CACHE_VERSION}`
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days
const MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days

// 动态缓存容量（根据设备内存）
const MAX_CACHE_SIZE = (() => {
  if (typeof navigator !== 'undefined' && navigator.deviceMemory) {
    if (navigator.deviceMemory > 8) return 200
    if (navigator.deviceMemory > 4) return 100
    return 50
  }
  return 50
})()

// 静态资源缓存列表（扩展范围）
const STATIC_CACHE = [
  '/',
  '/youno.webp',
  '/thumbnails/youno.webp',
  '/manifest.json'
]

// LRU tracking
const cacheAccessLog = new Map()

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[Service Worker] Caching static resources')
        return cache.addAll(STATIC_CACHE).catch(err => {
          console.warn('[Service Worker] Failed to cache some static resources:', err)
        })
      }),
      caches.open(IMAGE_CACHE_NAME)
    ])
  )
  
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 保留当前版本的缓存
          if (cacheName !== IMAGE_CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  self.clients.claim()
})

// Fetch event - serve from cache with network fallback and LRU management
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // 处理静态资源（HTML, CSS, JS）
  if (request.url.match(/\.(html|css|js)$/i) || url.pathname === '/') {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request)
        
        if (cachedResponse) {
          // 后台更新策略
          fetch(request).then(response => {
            if (response.ok) {
              cache.put(request, response.clone())
            }
          }).catch(() => {})
          
          return cachedResponse
        }
        
        // 网络优先，失败则返回缓存
        try {
          const networkResponse = await fetch(request)
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone())
          }
          return networkResponse
        } catch (error) {
          return cachedResponse || new Response('Offline', { status: 503 })
        }
      })
    )
    return
  }
  
  // 处理图片资源
  if (!request.url.match(/\.(webp|jpg|jpeg|png|gif|avif)$/i)) {
    return
  }
  
  event.respondWith(
    caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
      // Try cache first
      const cachedResponse = await cache.match(request)
      
      if (cachedResponse) {
        // Update LRU access log
        cacheAccessLog.set(request.url, Date.now())
        
        // Check if cache is expired
        const cachedDate = new Date(cachedResponse.headers.get('date'))
        const now = new Date()
        
        if (now - cachedDate < CACHE_EXPIRY) {
          console.log('[Service Worker] Serving from cache:', url.pathname)
          
          // Refresh in background if older than 1 day
          if (now - cachedDate > 24 * 60 * 60 * 1000) {
            fetch(request).then(response => {
              if (response.ok) {
                cache.put(request, response.clone())
              }
            }).catch(() => {})
          }
          
          return cachedResponse
        }
      }
      
      // Fetch from network
      try {
        console.log('[Service Worker] Fetching from network:', url.pathname)
        const networkResponse = await fetch(request)
        
        // Cache successful responses
        if (networkResponse.ok) {
          // Check cache size before adding
          await manageCacheSize(cache)
          
          // Add to cache with metadata
          const responseToCache = networkResponse.clone()
          await cache.put(request, responseToCache)
          cacheAccessLog.set(request.url, Date.now())
        }
        
        return networkResponse
      } catch (error) {
        console.error('[Service Worker] Fetch failed:', error)
        
        // Return cached response even if expired
        if (cachedResponse) {
          return cachedResponse
        }
        
        throw error
      }
    })
  )
})

/**
 * Manage cache size using LRU eviction
 */
async function manageCacheSize(cache) {
  const keys = await cache.keys()
  
  if (keys.length >= MAX_CACHE_SIZE) {
    // Find least recently used items
    const sortedKeys = keys
      .map(key => ({
        key,
        lastAccess: cacheAccessLog.get(key.url) || 0
      }))
      .sort((a, b) => a.lastAccess - b.lastAccess)
    
    // Remove oldest 20% of items
    const itemsToRemove = Math.ceil(keys.length * 0.2)
    for (let i = 0; i < itemsToRemove; i++) {
      await cache.delete(sortedKeys[i].key)
      cacheAccessLog.delete(sortedKeys[i].key.url)
      console.log('[Service Worker] Evicted from cache:', sortedKeys[i].key.url)
    }
  }
}

/**
 * Clean expired cache entries
 */
async function cleanExpiredCache(cache) {
  const keys = await cache.keys()
  const now = Date.now()
  
  for (const request of keys) {
    const response = await cache.match(request)
    if (response) {
      const cachedDate = new Date(response.headers.get('date'))
      if (now - cachedDate.getTime() > MAX_CACHE_AGE) {
        await cache.delete(request)
        cacheAccessLog.delete(request.url)
        console.log('[Service Worker] Removed expired:', request.url)
      }
    }
  }
}

// Message event - handle cache management
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      Promise.all([
        caches.delete(IMAGE_CACHE_NAME),
        caches.delete(STATIC_CACHE_NAME)
      ]).then(() => {
        cacheAccessLog.clear()
        console.log('[Service Worker] All caches cleared')
        event.ports[0].postMessage({ success: true })
      })
    )
  }
  
  if (event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      Promise.all([
        caches.open(IMAGE_CACHE_NAME),
        caches.open(STATIC_CACHE_NAME)
      ]).then(async ([imageCache, staticCache]) => {
        const imageKeys = await imageCache.keys()
        const staticKeys = await staticCache.keys()
        event.ports[0].postMessage({ 
          imageSize: imageKeys.length,
          staticSize: staticKeys.length,
          total: imageKeys.length + staticKeys.length
        })
      })
    )
  }
  
  if (event.data.type === 'CLEAN_EXPIRED') {
    event.waitUntil(
      Promise.all([
        caches.open(IMAGE_CACHE_NAME).then(cleanExpiredCache),
        caches.open(STATIC_CACHE_NAME).then(cleanExpiredCache)
      ]).then(() => {
        event.ports[0].postMessage({ success: true })
      })
    )
  }
  
  if (event.data.type === 'GET_CACHE_STATS') {
    event.waitUntil(
      Promise.all([
        caches.open(IMAGE_CACHE_NAME),
        caches.open(STATIC_CACHE_NAME)
      ]).then(async ([imageCache, staticCache]) => {
        const imageKeys = await imageCache.keys()
        const staticKeys = await staticCache.keys()
        const stats = {
          imageItems: imageKeys.length,
          staticItems: staticKeys.length,
          totalItems: imageKeys.length + staticKeys.length,
          maxSize: MAX_CACHE_SIZE,
          accessLogSize: cacheAccessLog.size,
          deviceMemory: typeof navigator !== 'undefined' ? navigator.deviceMemory : 'unknown'
        }
        event.ports[0].postMessage(stats)
      })
    )
  }
})

// Periodic cache cleanup (every 6 hours)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(
      Promise.all([
        caches.open(IMAGE_CACHE_NAME).then(cleanExpiredCache),
        caches.open(STATIC_CACHE_NAME).then(cleanExpiredCache)
      ])
    )
  }
})

console.log('[Service Worker] Initialized with dynamic cache size:', MAX_CACHE_SIZE)
