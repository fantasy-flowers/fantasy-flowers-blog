# Vue Blog - 高性能博客系统

<div align="center">

![Vue 3](https://img.shields.io/badge/Vue-3.3.4-brightgreen.svg)
![Vite](https://img.shields.io/badge/Vite-6.0.0-646CFF.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node-%3E%3D16.0.0-339933.svg)

基于 Vue 3 + Vite 构建的现代化、高性能博客系统

[在线演示](https://your-demo-url.com) · [问题反馈](https://github.com/yourusername/vue-blog/issues) · [功能建议](https://github.com/yourusername/vue-blog/issues/new)

</div>

---

## 📋 目录

- [项目简介](#-项目简介)
- [核心特性](#-核心特性)
- [技术栈](#-技术栈)
- [系统要求](#-系统要求)
- [快速开始](#-快速开始)
- [项目结构](#-项目结构)
- [开发指南](#-开发指南)
- [构建部署](#-构建部署)
- [性能优化](#-性能优化)
- [配置说明](#-配置说明)
- [API 文档](#-api-文档)
- [常见问题](#-常见问题)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

---

## 🎯 项目简介

Vue Blog 是一个基于 Vue 3 生态系统构建的现代化博客平台，专注于提供卓越的用户体验和开发体验。项目采用最新的前端技术栈，实现了丰富的功能特性和极致的性能优化。

### 设计理念

- **性能优先**: 通过代码分割、懒加载、图片优化等技术实现极速加载
- **用户体验**: 流畅的动画效果、响应式设计、无障碍访问支持
- **开发友好**: 清晰的代码结构、完善的类型提示、丰富的开发工具
- **可维护性**: 模块化设计、组件复用、统一的代码规范

---

## ✨ 核心特性

### 功能特性

- 📝 **文章管理**: 支持 Markdown 编辑、代码高亮、数学公式、目录生成
- 🏷️ **分类标签**: 灵活的分类和标签系统，支持多维度内容组织
- 🔍 **全文搜索**: 快速准确的文章搜索功能
- 📚 **归档时间线**: 按时间线展示文章归档
- 👥 **友情链接**: 友站链接管理和展示
- 🎨 **主题定制**: 支持背景切换、透明度调节等个性化设置
- 📱 **响应式设计**: 完美适配桌面端、平板和移动设备
- 🌙 **入场动画**: 精美的入场门户效果

### 技术特性

- ⚡ **极速构建**: 基于 Vite 的快速开发和构建体验
- 🎯 **TypeScript 支持**: 完整的类型定义和智能提示
- 📦 **代码分割**: 自动化的路由级代码分割
- 🖼️ **图片优化**: 响应式图片、懒加载、渐进式加载
- 💾 **状态管理**: 基于 Pinia 的现代化状态管理
- 🔄 **路由管理**: Vue Router 4 实现的 SPA 路由
- 🎭 **动画系统**: 丰富的过渡动画和交互效果
- ♿ **无障碍访问**: 遵循 WCAG 标准的可访问性设计
- 🔧 **PWA 支持**: Service Worker 实现离线访问

---

## 🛠️ 技术栈

### 核心框架

- **[Vue 3.3.4](https://vuejs.org/)** - 渐进式 JavaScript 框架
- **[Vite 6.0.0](https://vitejs.dev/)** - 下一代前端构建工具
- **[Vue Router 4.2.4](https://router.vuejs.org/)** - 官方路由管理器
- **[Pinia 2.1.6](https://pinia.vuejs.org/)** - 新一代状态管理库

### UI 框架与样式

- **[Element Plus 2.13.2](https://element-plus.org/)** - Vue 3 组件库
- **[Tailwind CSS 4.1.16](https://tailwindcss.com/)** - 实用优先的 CSS 框架
- **[Font Awesome 7.1.0](https://fontawesome.com/)** - 图标库

### Markdown 与内容处理

- **[markdown-it 14.1.0](https://github.com/markdown-it/markdown-it)** - Markdown 解析器
- **[highlight.js 11.11.1](https://highlightjs.org/)** - 代码语法高亮
- **[KaTeX 0.16.27](https://katex.org/)** - 数学公式渲染
- **[DOMPurify 3.3.1](https://github.com/cure53/DOMPurify)** - HTML 安全过滤

### 开发工具

- **[Vitest 4.0.18](https://vitest.dev/)** - 单元测试框架
- **[Sharp 0.34.5](https://sharp.pixelplumbing.com/)** - 图片处理工具
- **[ESLint](https://eslint.org/)** - 代码质量检查
- **[Prettier](https://prettier.io/)** - 代码格式化工具

---

## 💻 系统要求

### 运行环境

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0 (或使用 yarn、pnpm)
- **浏览器**: 支持 ES2015+ 的现代浏览器

### 推荐配置

- Node.js 18.x 或更高版本
- 使用 pnpm 作为包管理器以获得更好的性能

---

## 🚀 快速开始

### 1. 克隆项目

```bash
# 使用 HTTPS
git clone https://github.com/yourusername/vue-blog.git

# 或使用 SSH
git clone git@github.com:yourusername/vue-blog.git

# 进入项目目录
cd vue-blog
```

### 2. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm (推荐)
pnpm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，配置必要的环境变量
# 主要配置项：
# - VITE_API_BASE_URL: 后端 API 地址
# - VITE_APP_TITLE: 网站标题
# - VITE_SITE_URL: 网站 URL
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看应用。

### 5. 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist` 目录。

---

## 📁 项目结构

```
vue-blog/
├── .kiro/                    # Kiro IDE 配置
├── .vscode/                  # VS Code 配置
├── public/                   # 静态资源
│   ├── background/          # 背景图片
│   ├── icon/                # 图标资源
│   ├── images/              # 响应式图片集
│   └── poem/                # 诗词数据
├── scripts/                  # 构建和工具脚本
│   ├── generateImages.js   # 图片生成脚本
│   ├── optimizeImages.js   # 图片优化脚本
│   └── ...
├── src/
│   ├── api/                 # API 接口层
│   │   ├── config.js       # API 配置
│   │   ├── request.js      # 请求封装
│   │   └── modules/        # 接口模块
│   ├── assets/              # 资源文件
│   ├── components/          # 组件库
│   │   ├── animations/     # 动画组件
│   │   ├── base/           # 基础组件
│   │   ├── business/       # 业务组件
│   │   └── layout/         # 布局组件
│   ├── composables/         # 组合式函数
│   ├── constants/           # 常量定义
│   ├── directives/          # 自定义指令
│   ├── router/              # 路由配置
│   ├── stores/              # 状态管理
│   │   └── modules/        # Store 模块
│   ├── styles/              # 样式文件
│   │   ├── animations/     # 动画样式
│   │   ├── element/        # Element Plus 定制
│   │   └── tailwind/       # Tailwind 配置
│   ├── types/               # 类型定义
│   ├── utils/               # 工具函数
│   ├── views/               # 页面视图
│   │   ├── home/           # 首页
│   │   ├── article/        # 文章页
│   │   ├── category/       # 分类页
│   │   ├── tag/            # 标签页
│   │   ├── archive/        # 归档页
│   │   ├── search/         # 搜索页
│   │   ├── friends/        # 友链页
│   │   ├── about/          # 关于页
│   │   └── error/          # 错误页
│   ├── App.vue              # 根组件
│   └── main.js              # 应用入口
├── .editorconfig            # 编辑器配置
├── .env.example             # 环境变量模板
├── .eslintrc.cjs            # ESLint 配置
├── .gitignore               # Git 忽略文件
├── .prettierrc.json         # Prettier 配置
├── index.html               # HTML 模板
├── jsconfig.json            # JavaScript 配置
├── package.json             # 项目配置
├── postcss.config.js        # PostCSS 配置
├── vite.config.js           # Vite 配置
└── README.md                # 项目文档
```

---

## 📖 开发指南

### 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 构建开发版本
npm run build:dev

# 构建并分析包大小
npm run build:analyze

# 预览生产构建
npm run preview

# 构建后预览
npm run preview:build

# 代码格式化
npm run format

# 检查代码格式
npm run format:check

# 图片生成
npm run images:generate

# 图片优化
npm run images:optimize

# 验证优化效果
npm run verify:optimization

# 完整优化流程
npm run optimize:all

# 清理缓存
npm run clean

# 完全重装
npm run clean:all
```

### 代码规范

项目使用 ESLint 和 Prettier 确保代码质量和一致性：

```bash
# 格式化所有代码
npm run format

# 检查代码格式
npm run format:check
```

### 组件开发

#### 创建新组件

1. 在 `src/components` 相应目录下创建组件文件
2. 使用 Vue 3 Composition API 编写组件
3. 添加必要的 JSDoc 注释
4. 确保组件具有良好的可访问性

示例组件结构：

```vue
<template>
  <div class="my-component">
    <!-- 组件内容 -->
  </div>
</template>

<script setup>
/**
 * MyComponent - 组件描述
 * 
 * @component
 * @example
 * <MyComponent :prop="value" @event="handler" />
 */

import { ref, computed } from 'vue'

// Props 定义
const props = defineProps({
  prop: {
    type: String,
    required: true,
    default: ''
  }
})

// Emits 定义
const emit = defineEmits(['event'])

// 响应式状态
const state = ref(null)

// 计算属性
const computed
Value = computed(() => {
  // 计算逻辑
})

// 方法
const handleEvent = () => {
  emit('event', data)
}
</script>

<style scoped>
.my-component {
  /* 组件样式 */
}
</style>
```

### API 集成

#### 添加新的 API 接口

1. 在 `src/api/modules/` 下创建或编辑模块文件
2. 使用统一的请求封装
3. 添加错误处理

示例：

```javascript
// src/api/modules/example.js
import request from '../request'

/**
 * 获取示例列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getExampleList(params) {
  return request({
    url: '/examples',
    method: 'get',
    params
  })
}

/**
 * 获取示例详情
 * @param {string|number} id - 示例 ID
 * @returns {Promise}
 */
export function getExampleDetail(id) {
  return request({
    url: `/examples/${id}`,
    method: 'get'
  })
}
```

### 状态管理

使用 Pinia 进行状态管理：

```javascript
// src/stores/modules/example.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExampleStore = defineStore('example', () => {
  // State
  const items = ref([])
  const loading = ref(false)
  
  // Getters
  const itemCount = computed(() => items.value.length)
  
  // Actions
  async function fetchItems() {
    loading.value = true
    try {
      const data = await getExampleList()
      items.value = data
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      loading.value = false
    }
  }
  
  return {
    items,
    loading,
    itemCount,
    fetchItems
  }
})
```

### 路由配置

添加新路由：

```javascript
// src/router/index.js
{
  path: '/example',
  name: 'example',
  component: () => import('../views/example/index.vue'),
  meta: {
    requiresEntry: true,
    title: '示例页面'
  }
}
```

---

## 🏗️ 构建部署

### 生产构建

```bash
# 构建生产版本
npm run build

# 构建产物位于 dist/ 目录
```

### 部署到服务器

#### 使用 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/vue-blog/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 处理 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理（如果需要）
    location /api/ {
        proxy_pass http://backend-server:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 使用部署脚本

项目包含 `deploy.sh` 脚本用于自动化部署：

```bash
# 赋予执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

### Docker 部署

创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

构建和运行：

```bash
# 构建镜像
docker build -t vue-blog .

# 运行容器
docker run -d -p 80:80 vue-blog
```

### 环境变量配置

不同环境使用不同的环境变量文件：

- `.env` - 所有环境的默认配置
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

---

## ⚡ 性能优化

### 已实现的优化

#### 1. 代码分割

- 路由级别的懒加载
- 组件按需加载
- 第三方库分离打包

#### 2. 图片优化

- 响应式图片（多尺寸适配）
- WebP 格式支持
- 懒加载和渐进式加载
- 图片预加载策略

#### 3. 资源优化

- Gzip/Brotli 压缩
- CSS 和 JS 压缩混淆
- Tree Shaking 移除未使用代码
- 静态资源 CDN 加速

#### 4. 渲染优化

- 虚拟滚动（长列表）
- 防抖和节流
- 组件缓存（keep-alive）
- GPU 加速动画

#### 5. 网络优化

- HTTP/2 支持
- 资源预加载（preload/prefetch）
- Service Worker 离线缓存
- API 请求缓存

### 性能监控

使用内置的性能监控工具：

```javascript
// 查看性能指标
import { performanceMonitor } from '@/utils/performance'

performanceMonitor.getMetrics()
```

---

## ⚙️ 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:3000/api/v1` | 是 |
| `VITE_APP_TITLE` | 网站标题 | `fantasy_flowers's Blog` | 是 |
| `VITE_APP_DESCRIPTION` | 网站描述 | - | 否 |
| `VITE_SITE_URL` | 网站 URL | `http://localhost:5173` | 是 |
| `VITE_AUTHOR_NAME` | 作者名称 | - | 否 |
| `VITE_ENABLE_COMMENTS` | 启用评论 | `true` | 否 |
| `VITE_ENABLE_ANALYTICS` | 启用分析 | `false` | 否 |
| `VITE_IMAGE_LAZY_LOAD` | 图片懒加载 | `true` | 否 |

### Vite 配置

主要配置项在 `vite.config.js` 中：

```javascript
export default defineConfig({
  plugins: [
    vue(),
    // 自动导入
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia']
    }),
    // 组件自动注册
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    // 构建优化配置
  }
})
```

### Tailwind 配置

在 `tailwind.config.js` 中自定义主题：

```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 自定义配置
    }
  },
  plugins: []
}
```

---

## 📚 API 文档

### 文章接口

#### 获取文章列表

```http
GET /api/v1/articles
```

参数：

| 参数 | 类型 | 说明 | 必填 |
|------|------|------|------|
| page | number | 页码 | 否 |
| pageSize | number | 每页数量 | 否 |
| category | string | 分类 | 否 |
| tag | string | 标签 | 否 |
| keyword | string | 搜索关键词 | 否 |

响应：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

#### 获取文章详情

```http
GET /api/v1/articles/:id
```

响应：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "文章标题",
    "content": "文章内容",
    "category": "分类",
    "tags": ["标签1", "标签2"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 分类接口

#### 获取分类列表

```http
GET /api/v1/categories
```

### 标签接口

#### 获取标签列表

```http
GET /api/v1/tags
```

更多 API 文档请参考 `src/api/modules/` 目录下的接口定义。

---

## ❓ 常见问题

### 开发环境问题

**Q: 启动开发服务器时端口被占用？**

A: 修改 `.env.development` 中的 `VITE_DEV_PORT` 配置，或在启动时指定端口：

```bash
npm run dev -- --port 3000
```

**Q: 热更新不生效？**

A: 检查以下几点：
1. 确保文件保存成功
2. 检查 Vite 配置中的 HMR 设置
3. 尝试重启开发服务器

### 构建问题

**Q: 构建时内存溢出？**

A: 增加 Node.js 内存限制：

```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

**Q: 构建产物过大？**

A: 检查以下优化：
1. 确保启用了代码分割
2. 检查是否有未使用的依赖
3. 使用 `npm run build:analyze` 分析包大小

### 部署问题

**Q: 部署后页面刷新 404？**

A: 配置服务器支持 SPA 路由，参考 [部署到服务器](#使用-nginx) 章节。

**Q: 静态资源加载失败？**

A: 检查 `vite.config.js` 中的 `base` 配置是否正确。

### API 问题

**Q: API 请求跨域？**

A: 在开发环境配置代理：

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://backend-server:3000',
        changeOrigin: true
      }
    }
  }
})
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 遵循项目的 ESLint 和 Prettier 配置
- 编写清晰的提交信息
- 为新功能添加必要的文档
- 确保所有测试通过

### 提交信息规范

使用语义化的提交信息：

```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链相关
```

### 问题反馈

- 使用 [GitHub Issues](https://github.com/yourusername/vue-blog/issues) 报告 bug
- 提供详细的问题描述和复现步骤
- 附上相关的错误信息和截图

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 👥 团队

- **作者**: fantasy_flowers
- **邮箱**: your-email@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)

---

## 🙏 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Element Plus](https://element-plus.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- 以及所有贡献者

---

## 📮 联系方式

- 项目主页: [https://github.com/yourusername/vue-blog](https://github.com/yourusername/vue-blog)
- 问题反馈: [https://github.com/yourusername/vue-blog/issues](https://github.com/yourusername/vue-blog/issues)
- 邮箱: your-email@example.com

---

## 🗺️ 路线图

### v1.1.0 (计划中)

- [ ] 评论系统集成
- [ ] 文章点赞功能
- [ ] 阅读统计
- [ ] RSS 订阅支持

### v1.2.0 (计划中)

- [ ] 多语言支持 (i18n)
- [ ] 暗色模式
- [ ] 文章草稿功能
- [ ] 图片上传优化

### v2.0.0 (规划中)

- [ ] 后台管理系统
- [ ] 用户系统
- [ ] 权限管理
- [ ] 数据分析面板

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star 支持一下！**

Made with ❤️ by fantasy_flowers

</div>
