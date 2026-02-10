import { createRouter, createWebHistory } from 'vue-router'
import { setupGuards } from './guards'

// 使用懒加载优化首屏加载
// 首页使用预加载以提升首次访问体验
const HomeView = () => import(/* webpackChunkName: "home" */ '../views/home/index.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresEntry: true }
    },
    {
      path: '/post/:id',
      name: 'post-detail',
      // 按需加载，使用 webpackChunkName 命名 chunk
      component: () => import(/* webpackChunkName: "post" */ '../views/article/detail.vue'),
      meta: { requiresEntry: true }
    },
    {
      path: '/archive',
      name: 'archive',
      component: () => import(/* webpackChunkName: "archive" */ '../views/archive/index.vue'),
      meta: { requiresEntry: true }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ '../views/about/index.vue'),
      meta: { requiresEntry: true }
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import(/* webpackChunkName: "categories" */ '../views/category/list.vue'),
      meta: { requiresEntry: true }
    },
    {
      path: '/category/:name',
      name: 'category',
      component: () => import(/* webpackChunkName: "category" */ '../views/category/detail.vue'),
      meta: { requiresEntry: true }
    },
    {
      path: '/tags',
      name: 'tags',
      component: () => import(/* webpackChunkName: "tags" */ '../views/tag/list.vue'),
      meta: { requiresEntry: true }
    },
    {
      path: '/tag/:name',
      name: 'tag',
      component: () => import(/* webpackChunkName: "tag" */ '../views/tag/detail.vue'),
      meta: { requiresEntry: true }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import(/* webpackChunkName: "search" */ '../views/search/index.vue'),
      meta: { requiresEntry: true }
    },
    {
      path: '/friends',
      name: 'friends',
      component: () => import(/* webpackChunkName: "friends" */ '../views/friends/index.vue'),
      meta: { requiresEntry: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import(/* webpackChunkName: "not-found" */ '../views/error/404.vue'),
      meta: { requiresEntry: true }
    }
  ]
})

// 设置路由守卫
setupGuards(router)

export default router