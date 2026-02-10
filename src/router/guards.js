import SessionManager from '../utils/SessionManager.js'

/**
 * 设置路由守卫
 * @param {import('vue-router').Router} router - Vue Router 实例
 */
export function setupGuards(router) {
    /**
     * 入场门户处理的导航守卫
     * 
     * 入场门户的可见性现在在此运行之前确定（在 index.html 脚本中）
     * 此守卫仅处理特定于路由的逻辑并存储预期的路由
     */
    router.beforeEach((to, _from, next) => {
        console.log('路由守卫: 导航至', to.path, '来自', _from?.path || 'initial')

        try {
            // 检查路由是否需要入场保护
            const requiresEntry = to.meta?.requiresEntry !== false

            if (requiresEntry) {
                // 检查是否应该显示入场门户（已由 index.html 确定）
                const shouldShowEntry = SessionManager.shouldShowEntryGate()

                console.log('路由守卫: 路由需要入场，应显示:', shouldShowEntry)

                if (shouldShowEntry) {
                    // 存储入场后的预期路由
                    const routeData = {
                        path: to.path,
                        name: to.name,
                        params: to.params || {},
                        query: to.query || {},
                        hash: to.hash || ''
                    }

                    try {
                        const routeJson = JSON.stringify(routeData)
                        SessionManager.safeStorageOperation('set', 'session', 'blog_intended_route', routeJson)
                        console.log('路由守卫: 已存储预期路由:', to.path)
                    } catch (jsonError) {
                        console.error('路由守卫: 序列化路由数据出错', jsonError)
                    }
                }
            }

            // 始终继续导航
            next()
        } catch (error) {
            console.error('路由守卫: 导航守卫出错', error)
            next() // 即使出错也始终继续
        }
    })
}
