import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { compression } from 'vite-plugin-compression2'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Gzip 压缩
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024, // 只压缩大于 1KB 的文件
      deleteOriginalAssets: false
    }),
    // Brotli 压缩（更高压缩率）
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
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
        drop_console: true, // 生产环境移除 console
        drop_debugger: true,
        pure_funcs: ['console.log'] // 移除特定函数调用
      }
    },

    rollupOptions: {
      output: {
        // 代码分割策略
        manualChunks: {
          // Vue 核心库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 工具库
          'utils': [
            './src/utils/imageOptimizer.js',
            './src/utils/imageLoadQueue.js',
            './src/utils/smartPreloader.js'
          ],
          // 组件库
          'components': [
            './src/components/business/BackgroundSelector.vue',
            './src/components/business/BackgroundOpacityControl.vue',
            './src/components/layout/AppSidebar.vue'
          ]
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
})
