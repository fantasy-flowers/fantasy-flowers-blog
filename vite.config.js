import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { compression } from 'vite-plugin-compression2'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 配置文件不在客户端打包管线内，import.meta.env 不可用；用 loadEnv 读取功能开关
  const env = loadEnv(mode, process.cwd(), '')
  const dropConsole = env.VITE_DROP_CONSOLE !== 'false'

  return {
  plugins: [
    vue(),
    // Gzip 压缩（A7：Nginx 部署仅启用 gzip，无 brotli 模块；只产 .gz 单格式）
    // 注意：该插件选项名是 algorithms（数组），默认同时产出 gzip+brotli
    compression({
      algorithms: ['gzip'],
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024, // 只压缩大于 1KB 的文件
      deleteOriginalAssets: false
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    headers: {
      // Cache static assets for 1 year
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  build: {
    // 启用 CSS 代码分割
    cssCodeSplit: true,

    // 优化构建
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: dropConsole, // 由 VITE_DROP_CONSOLE 控制（默认移除）
        drop_debugger: true,
        pure_funcs: ['console.log'] // 移除特定函数调用
      }
    },

    rollupOptions: {
      output: {
        // 代码分割策略（A8 重做）：
        // - vue-vendor：Vue 核心库
        // - highlight：highlight.js 独立异步 chunk（随 MarkdownRenderer 同路由组并行加载，渲染时机不变）
        // - 侧栏（AppSidebar 家族）由 App.vue 静态引入 → 保持首屏 eager；
        // - 壁纸面板（BackgroundSelector/BackgroundGrid/BackgroundPreview/BackgroundOpacityControl）
        //   仅由 BackgroundSet 的 defineAsyncComponent 触达 → rollup 自动拆为异步 chunk，
        //   不再通过 manualChunks 拉进首屏。
        manualChunks: {
          // Vue 核心库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 语法高亮库（约 1MB 全量构建，独立 chunk 避免污染 MarkdownRenderer 业务 chunk）
          'highlight': ['highlight.js']
        },

        // 优化资源文件命名
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]

          // 图片资源
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }

          // CSS 文件
          if (ext === 'css') {
            return `assets/css/[name]-[hash][extname]`
          }

          return `assets/[name]-[hash][extname]`
        },

        // 优化 chunk 文件命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },

    // 优化 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,

    // 启用源码映射（可选，生产环境可关闭）
    sourcemap: false,

    // 资源内联限制（小于 4KB 的资源会被内联为 base64）
    assetsInlineLimit: 4096
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
    exclude: []
  }
  }
})
