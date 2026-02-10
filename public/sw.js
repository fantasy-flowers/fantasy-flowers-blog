/**
 * Service Worker for Vue Blog
 * Implements cache-first strategy for image resources
 * Version: 1.0.0
 */

const CACHE_NAME = 'vue-blog-images-v1';
const STATIC_CACHE_NAME = 'vue-blog-static-v1';

// 需要缓存的图片类型
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
// 需要缓存的静态资源类型
const STATIC_EXTENSIONS = ['.css', '.js', '.woff', '.woff2', '.ttf', '.eot'];

/**
 * 安装事件 - 预缓存关键资源
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    // 跳过等待，立即激活
    self.skipWaiting();
});

/**
 * 激活事件 - 清理旧缓存
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => {
                        // 删除旧版本的缓存
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
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        // 如果网络请求失败，尝试返回缓存（即使过期）
        const cachedFallback = await caches.match(request);
        if (cachedFallback) {
            return cachedFallback;
        }
        throw error;
    }
}

/**
 * 网络优先策略 - 适用于需要最新数据的资源
 */
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
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

    // 处理上传目录的图片资源 - 使用缓存优先策略
    if (isUploadRequest(url) && isImageRequest(url)) {
        event.respondWith(cacheFirst(event.request, CACHE_NAME));
        return;
    }

    // 处理其他图片资源
    if (isImageRequest(url)) {
        event.respondWith(cacheFirst(event.request, CACHE_NAME));
        return;
    }

    // 处理静态资源（CSS, JS, 字体等）
    if (isStaticRequest(url)) {
        event.respondWith(cacheFirst(event.request, STATIC_CACHE_NAME));
        return;
    }
});

/**
 * 消息事件 - 用于接收来自主线程的消息
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                console.log('[Service Worker] All caches cleared');
            })
        );
    }

    if (event.data && event.data.type === 'GET_CACHE_INFO') {
        caches.keys().then((cacheNames) => {
            Promise.all(
                cacheNames.map(async (cacheName) => {
                    const cache = await caches.open(cacheName);
                    const keys = await cache.keys();
                    return { name: cacheName, count: keys.length };
                })
            ).then((cacheInfo) => {
                event.ports[0].postMessage({ cacheInfo });
            });
        });
    }
});

console.log('[Service Worker] Script loaded');
