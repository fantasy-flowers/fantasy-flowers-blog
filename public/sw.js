/**
 * Service Worker for Vue Blog
 * Version: 2.0.0
 * 变更（G5 治理）：
 *  - 缓存名带版本号（v2），activate 时清理所有旧版本 vue-blog-* 缓存
 *  - 上传图片由「缓存优先、永不过期」改为「先返缓存、后台更新」（stale-while-revalidate）
 *  - 增加容量上限（按设备内存 200/100/50 条），超限按访问序淘汰最旧 20%
 *  - 与 serviceWorkerManager.js 的消息协议对齐：CLEAR_CACHE → {success}，GET_CACHE_SIZE → {size}
 */

const CACHE_NAME = 'vue-blog-images-v2';
const STATIC_CACHE_NAME = 'vue-blog-static-v2';

// 需要缓存的图片类型
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
// 需要缓存的静态资源类型
const STATIC_EXTENSIONS = ['.css', '.js', '.woff', '.woff2', '.ttf', '.eot'];

// 缓存容量上限（条数），按设备内存分档
const deviceMemory = (typeof navigator !== 'undefined' && navigator.deviceMemory) || 0;
const MAX_CACHE_SIZE = deviceMemory > 8 ? 200 : (deviceMemory > 4 ? 100 : 50);

// 访问序记录（LRU 淘汰依据）
const cacheAccessLog = new Map();

/**
 * 记录一次缓存访问
 */
function recordAccess(url) {
  cacheAccessLog.set(url, Date.now());
}

/**
 * 容量控制：超过上限时按访问时间淘汰最旧的一批（约 20%）
 */
async function enforceCacheLimit(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= MAX_CACHE_SIZE) return;

  const target = Math.floor(MAX_CACHE_SIZE * 0.8);
  const excess = keys.length - target;
  const sorted = [...keys].sort(
    (a, b) => (cacheAccessLog.get(a.url) || 0) - (cacheAccessLog.get(b.url) || 0)
  );

  for (let i = 0; i < excess && i < sorted.length; i++) {
    cacheAccessLog.delete(sorted[i].url);
    await cache.delete(sorted[i]);
  }
  console.log(`[Service Worker] Evicted ${Math.min(excess, sorted.length)} entries from ${cacheName}`);
}

/**
 * 安装事件
 */
self.addEventListener('install', () => {
  console.log('[Service Worker] Installing...');
  // 跳过等待，立即激活
  self.skipWaiting();
});

/**
 * 激活事件 - 清理旧版本缓存（缓存名版本化，非当前版本的 vue-blog-* 全部删除）
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('vue-blog-') &&
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      // 立即接管所有客户端
      return self.clients.claim();
    })
  );
});

/**
 * 判断是否是图片资源
 */
function isImageRequest(url) {
  return IMAGE_EXTENSIONS.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

/**
 * 判断是否是静态资源
 */
function isStaticRequest(url) {
  return STATIC_EXTENSIONS.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

/**
 * 判断是否是上传目录的资源
 */
function isUploadRequest(url) {
  return url.pathname.includes('/uploads/');
}

/**
 * 缓存优先策略 - 适用于不常变化的资源
 */
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    recordAccess(request.url);
    console.log('[Service Worker] Cache hit:', request.url);
    return cachedResponse;
  }

  console.log('[Service Worker] Cache miss, fetching:', request.url);
  try {
    const networkResponse = await fetch(request);

    // 只缓存成功的响应
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      // 克隆响应，因为响应流只能读取一次
      await cache.put(request, networkResponse.clone());
      recordAccess(request.url);
      await enforceCacheLimit(cacheName);
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    throw error;
  }
}

/**
 * 先返缓存、后台更新策略（stale-while-revalidate）
 * 适用于需要可更新的资源（上传图片）：
 *  - 命中缓存立即返回，避免白闪（禁止 network-first）
 *  - 同时后台拉取新资源并更新缓存，下次访问即新图
 */
async function staleWhileRevalidate(request, cacheName, event) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    recordAccess(request.url);
    console.log('[Service Worker] Cache hit (background refresh):', request.url);

    // 后台拉取最新资源并更新缓存，不阻塞本次响应
    const updatePromise = fetch(request).then(async (networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        const cache = await caches.open(cacheName);
        await cache.put(request, networkResponse.clone());
        recordAccess(request.url);
        await enforceCacheLimit(cacheName);
      }
    }).catch((error) => {
      console.log('[Service Worker] Background refresh failed:', request.url, error);
    });
    event.waitUntil(updatePromise);

    return cachedResponse;
  }

  // 缓存未命中：走网络并写入缓存
  console.log('[Service Worker] Cache miss, fetching:', request.url);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
      recordAccess(request.url);
      await enforceCacheLimit(cacheName);
    }
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    throw error;
  }
}

/**
 * Fetch 事件 - 拦截网络请求
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 只处理 GET 请求
  if (event.request.method !== 'GET') {
    return;
  }

  // 跳过 API 请求
  if (url.pathname.includes('/api/')) {
    return;
  }

  // 上传目录的图片：先返缓存、后台更新（可随后台更新刷新，不再永久陈旧）
  if (isUploadRequest(url) && isImageRequest(url)) {
    event.respondWith(staleWhileRevalidate(event.request, CACHE_NAME, event));
    return;
  }

  // 其他图片资源：缓存优先
  if (isImageRequest(url)) {
    event.respondWith(cacheFirst(event.request, CACHE_NAME));
    return;
  }

  // 静态资源（CSS, JS, 字体等）：缓存优先
  if (isStaticRequest(url)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE_NAME));
    return;
  }
});

/**
 * 消息事件 - 用于接收来自主线程的消息（协议与 src/utils/serviceWorkerManager.js 对齐）
 */
self.addEventListener('message', (event) => {
  const type = event.data && event.data.type;

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        cacheAccessLog.clear();
        console.log('[Service Worker] All caches cleared');
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }

  if (type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map(async (cacheName) => {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            return keys.length;
          })
        );
      }).then((counts) => {
        const size = counts.reduce((sum, count) => sum + count, 0);
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ size });
        }
      })
    );
  }

  if (type === 'GET_CACHE_INFO') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map(async (cacheName) => {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            return { name: cacheName, count: keys.length };
          })
        );
      }).then((cacheInfo) => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ cacheInfo });
        }
      })
    );
  }
});

console.log('[Service Worker] Script loaded');
