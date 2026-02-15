# Vue Blog

<div align="center">

![Vue 3](https://img.shields.io/badge/Vue-3.3.4-42b883?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-6.0.0-646cff?style=flat-square&logo=vite)
![Pinia](https://img.shields.io/badge/Pinia-2.1.6-ffd859?style=flat-square&logo=pinia)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.16-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

基于 Vue 3 + Vite 构建的现代化高性能博客系统

[在线演示](https://your-demo-url.com) · [问题反馈](https://github.com/yourusername/vue-blog/issues) · [功能建议](https://github.com/yourusername/vue-blog/issues/new)

</div>

---

## 📖 目录

- [项目简介](#-项目简介)
- [核心特性](#-核心特性)
- [技术栈](#-技术栈)
- [系统架构](#-系统架构)
- [快速开始](#-快速开始)
- [项目结构](#-项目结构)
- [开发指南](#-开发指南)
- [构建部署](#-构建部署)
- [性能优化](#-性能优化)
- [浏览器支持](#-浏览器支持)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

---

## 🎯 项目简介

Vue Blog 是一个基于 Vue 3 生态系统构建的现代化博客前端应用，采用最新的前端技术栈和工程化实践，提供流畅的用户体验和优秀的性能表现。

### 设计理念

- **性能优先**: 采用懒加载、虚拟滚动、图片优化等多种性能优化策略
- **用户体验**: 流畅的动画效果、响应式设计、渐进式加载
- **工程化**: 模块化架构、代码规范、自动化工具链
- **可维护性**: 清晰的代码结构、完善的注释、统一的编码风格

---

## ✨ 核心特性

### 功能特性

- 📝 **文章管理**: 支持 Markdown 渲染、代码高亮、数学公式、目录导航
- 🏷️ **分类标签**: 多维度内容组织，支持分类和标签筛选
- 🔍 **全文搜索**: 快速搜索文章内容，支持关键词高亮
- 📱 **响应式设计**: 完美适配桌面端、平板、移动端
- 🎨 **主题定制**: 支持背景图片切换、透明度调节
- 🚀 **入场动画**: 精美的入场门户效果，提升用户体验
- 👥 **友链管理**: 友情链接展示与管理
- 📄 **归档时间线**: 按时间线展示文章归档

### 技术特性

- ⚡ **极速开发**: 基于 Vite 的快速热更新
- 🎯 **组合式 API**: 使用 Vue 3 Composition API
- 📦 **状态管理**: Pinia 轻量级状态管理
- 🛣️ **路由管理**: Vue Router 4 动态路由
- 🎭 **组件库**: Element Plus UI 组件
- 🎨 **样式方案**: TailwindCSS 原子化 CSS
- 📐 **代码规范**: ESLint + Prettier 统一代码风格
- 🔧 **自动导入**: 组件和 API 自动导入

---

## 🛠️ 技术栈

### 核心框架

| 技术 | 版本 | 说明 |
|------|------|------|
| [Vue 3](https://vuejs.org/) | 3.3.4 | 渐进式 JavaScript 框架 |
| [Vite](https://vitejs.dev/) | 6.0.0 | 下一代前端构建工具 |
| [Vue Router](https://router.vuejs.org/) | 4.2.4 | Vue.js 官方路由管理器 |
| [Pinia](https://pinia.vuejs.org/) | 2.1.6 | Vue 状态管理库 |

### UI 与样式

| 技术 | 版本 | 说明 |
|------|------|------|
| [Element Plus](https://element-plus.org/) | 2.13.2 | Vue 3 组件库 |
| [TailwindCSS](https://tailwindcss.com/) | 4.1.16 | 原子化 CSS 框架 |
| [FontAwesome](https://fontawesome.com/) | 7.1.0 | 图标库 |

### 功能库

| 技术 | 版本 | 说明 |
|------|------|------|
| [Axios](https://axios-http.com/) | 1.13.5 | HTTP 客户端 |
| [Markdown-it](https://github.com/markdown-it/markdown-it) | 14.1.0 | Markdown 解析器 |
| [Highlight.js](https://highlightjs.org/) | 11.11.1 | 代码语法高亮 |
| [KaTeX](https://katex.org/) | 0.16.27 | 数学公式渲染 |
| [DOMPurify](https://github.com/cure53/DOMPurify) | 3.3.1 | XSS 防护 |

### 开发工具

| 技术 | 说明 |
|------|------|
| [Sharp](https://sharp.pixelplumbing.com/) | 图片处理与优化 |
| [Terser](https://terser.org/) | JavaScript 压缩 |
| [Vitest](https://vitest.dev/) | 单元测试框架 |

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户界面层                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  首页    │  │  文章    │  │  归档    │  │  关于   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      组件层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  布局    │  │  业务    │  │  基础    │  │  动画   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      状态管理层 (Pinia)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  博客    │  │  侧边栏  │  │  主题    │  │  用户   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      API 服务层                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  文章    │  │  分类    │  │  标签    │  │  配置   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      后端 API                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0 (或使用 yarn、pnpm)
- **操作系统**: Windows / macOS / Linux

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/yourusername/vue-blog.git
cd vue-blog
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，配置 API 地址等信息
```

4. **启动开发服务器**

```bash
npm run dev
```

5. **访问应用**

打开浏览器访问: `http://localhost:5173`

### Docker 部署（可选）

```bash
# 构建镜像
docker build -t vue-blog .

# 运行容器
docker run -p 80:80 vue-blog
```

---

## 📁 项目结构

```
vue-blog/
├── .kiro/                      # Kiro IDE 配置
├── .vscode/                    # VS Code 配置
├── public/                     # 静态资源
│   ├── background/            # 背景图片
│   ├── config/                # 配置文件
│   ├── icon/                  # 图标资源
│   ├── images/                # 响应式图片
│   │   ├── small/            # 小尺寸
│   │   ├── medium/           # 中尺寸
│   │   ├── large/            # 大尺寸
│   │   └── xlarge/           # 超大尺寸
│   └── poem/                  # 诗词数据
├── scripts/                    # 工具脚本
│   ├── generateImages.js     # 图片生成
│   ├── optimizeImages.js     # 图片优化
│   └── verifyConfig.js       # 配置验证
├── src/
│   ├── api/                   # API 接口
│   │   ├── index.js          # API 配置
│   │   └── modules/          # 模块化接口
│   ├── assets/                # 资源文件
│   ├── components/            # 组件
│   │   ├── animations/       # 动画组件
│   │   ├── base/             # 基础组件
│   │   ├── business/         # 业务组件
│   │   └── layout/           # 布局组件
│   ├── composables/           # 组合式函数
│   ├── router/                # 路由配置
│   │   ├── index.js          # 路由主文件
│   │   └── guards.js         # 路由守卫
│   ├── stores/                # 状态管理
│   │   ├── index.js          # Store 入口
│   │   └── modules/          # 模块化 Store
│   ├── utils/                 # 工具函数
│   ├── views/                 # 页面视图
│   │   ├── home/             # 首页
│   │   ├── article/          # 文章
│   │   ├── archive/          # 归档
│   │   ├── category/         # 分类
│   │   ├── tag/              # 标签
│   │   ├── search/           # 搜索
│   │   ├── friends/          # 友链
│   │   ├── about/            # 关于
│   │   └── error/            # 错误页
│   ├── App.vue                # 根组件
│   └── main.js                # 入口文件
├── .editorconfig              # 编辑器配置
├── .env.example               # 环境变量模板
├── .eslintrc.cjs              # ESLint 配置
├── .gitignore                 # Git 忽略文件
├── .prettierrc.json           # Prettier 配置
├── index.html                 # HTML 模板
├── jsconfig.json              # JavaScript 配置
├── package.json               # 项目配置
├── postcss.config.js          # PostCSS 配置
├── tailwind.config.js         # TailwindCSS 配置
├── vite.config.js             # Vite 配置
└── README.md                  # 项目文档
```

---

## 💻 开发指南

### 开发命令

```bash
# 启动开发服务器
npm run dev

# 代码格式化
npm run format

# 代码格式检查
npm run format:check

# 图片优化
npm run images:optimize

# 配置验证
npm run verify:config
```

### 代码规范

项目使用 ESLint 和 Prettier 进行代码规范管理：

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **EditorConfig**: 编辑器配置统一

### 组件开发规范

1. **组件命名**: 使用 PascalCase，如 `ArticleCard.vue`
2. **文件组织**: 按功能模块划分目录
3. **代码注释**: 关键逻辑添加注释说明
4. **Props 验证**: 定义 Props 类型和默认值
5. **事件命名**: 使用 kebab-case，如 `@update-data`

### 提交规范

使用语义化提交信息：

```
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链相关
```

示例：
```bash
git commit -m "feat: 添加文章搜索功能"
git commit -m "fix: 修复移动端导航栏显示问题"
```

---

## 📦 构建部署

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 构建并预览
npm run preview:build
```

### 构建优化

项目已配置多种构建优化策略：

- **代码分割**: 按路由自动分割代码块
- **Tree Shaking**: 移除未使用的代码
- **资源压缩**: Gzip/Brotli 压缩
- **图片优化**: 响应式图片、WebP 格式
- **缓存策略**: 文件指纹、长期缓存

### 部署方式

#### 1. 静态服务器部署

```bash
# 构建项目
npm run build

# 将 dist 目录部署到服务器
scp -r dist/* user@server:/var/www/html/
```

#### 2. Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 3. Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

#### 4. GitHub Pages 部署

```bash
# 使用部署脚本
bash deploy.sh
```

---

## ⚡ 性能优化

### 已实现的优化策略

#### 1. 加载优化
- ✅ 路由懒加载
- ✅ 组件异步加载
- ✅ 图片懒加载
- ✅ 预加载关键资源
- ✅ 代码分割

#### 2. 渲染优化
- ✅ 虚拟滚动
- ✅ 防抖节流
- ✅ 计算属性缓存
- ✅ Keep-alive 缓存
- ✅ GPU 加速动画

#### 3. 资源优化
- ✅ 响应式图片
- ✅ WebP 格式
- ✅ 图片压缩
- ✅ 代码压缩
- ✅ Gzip/Brotli 压缩

#### 4. 网络优化
- ✅ HTTP/2
- ✅ CDN 加速
- ✅ 资源缓存
- ✅ 请求合并
- ✅ 接口防抖

### 性能指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| FCP | < 1.8s | 首次内容绘制 |
| LCP | < 2.5s | 最大内容绘制 |
| FID | < 100ms | 首次输入延迟 |
| CLS | < 0.1 | 累积布局偏移 |
| TTI | < 3.8s | 可交互时间 |

---

## 🌐 浏览器支持

| 浏览器 | 版本 |
|--------|------|
| Chrome | >= 90 |
| Firefox | >= 88 |
| Safari | >= 14 |
| Edge | >= 90 |

> 注意: 不支持 IE 浏览器

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 开发流程

1. 在 Issues 中讨论新功能或 Bug
2. 获得维护者确认后开始开发
3. 遵循项目代码规范
4. 编写清晰的提交信息
5. 提交 PR 并等待 Review

### 行为准则

- 尊重所有贡献者
- 使用友好和包容的语言
- 接受建设性批评
- 关注对社区最有利的事情

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

---

## 👨‍💻 作者

**fantasy_flowers**

- GitHub: [@fantasy_flowers](https://github.com/fantasy_flowers)
- Email: your-email@example.com

---

## 🙏 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Element Plus](https://element-plus.org/)
- [TailwindCSS](https://tailwindcss.com/)

---

## 📮 联系方式

- 提交 Issue: [GitHub Issues](https://github.com/yourusername/vue-blog/issues)
- 邮件联系: your-email@example.com
- 微信公众号: vue-blog-official

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star 支持一下！**

Made with ❤️ by fantasy_flowers

</div>
