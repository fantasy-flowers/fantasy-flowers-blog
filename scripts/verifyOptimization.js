/**
 * 优化验证脚本
 * 检查所有优化是否正确实施
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const checks = []

// 检查函数
async function checkExists(filePath, description) {
  try {
    await fs.access(filePath)
    checks.push({ status: '✅', description, detail: '存在' })
    return true
  } catch {
    checks.push({ status: '❌', description, detail: '不存在' })
    return false
  }
}

async function checkDirectory(dirPath, description) {
  try {
    const stats = await fs.stat(dirPath)
    if (stats.isDirectory()) {
      const files = await fs.readdir(dirPath)
      checks.push({ 
        status: '✅', 
        description, 
        detail: `${files.length} 个文件` 
      })
      return files.length
    }
  } catch {
    checks.push({ status: '❌', description, detail: '目录不存在' })
    return 0
  }
}

async function checkFileContent(filePath, searchString, description) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const found = content.includes(searchString)
    checks.push({ 
      status: found ? '✅' : '❌', 
      description, 
      detail: found ? '已配置' : '未配置' 
    })
    return found
  } catch {
    checks.push({ status: '❌', description, detail: '文件读取失败' })
    return false
  }
}

// 主验证函数
async function verify() {
  console.log('╔════════════════════════════════════════╗')
  console.log('║       性能优化验证脚本                 ║')
  console.log('╚════════════════════════════════════════╝\n')

  // 1. 检查图片优化
  console.log('📸 检查图片优化...')
  await checkDirectory(
    path.join(__dirname, '../public/images/small'),
    '小尺寸图片目录'
  )
  await checkDirectory(
    path.join(__dirname, '../public/images/medium'),
    '中尺寸图片目录'
  )
  await checkDirectory(
    path.join(__dirname, '../public/images/large'),
    '大尺寸图片目录'
  )
  await checkDirectory(
    path.join(__dirname, '../public/thumbnails'),
    '缩略图目录'
  )
  await checkExists(
    path.join(__dirname, '../public/images/manifest.json'),
    '图片清单文件'
  )

  // 2. 检查懒加载组件
  console.log('\n🖼️  检查懒加载组件...')
  await checkExists(
    path.join(__dirname, '../src/components/LazyImage.vue'),
    'LazyImage 组件'
  )

  // 3. 检查代码分割配置
  console.log('\n📦 检查代码分割配置...')
  await checkFileContent(
    path.join(__dirname, '../vite.config.js'),
    'manualChunks',
    'Vite 代码分割配置'
  )
  await checkFileContent(
    path.join(__dirname, '../src/router/index.js'),
    'webpackChunkName',
    '路由懒加载配置'
  )

  // 4. 检查压缩配置
  console.log('\n🗜️  检查压缩配置...')
  await checkFileContent(
    path.join(__dirname, '../vite.config.js'),
    'compression',
    'Gzip/Brotli 压缩配置'
  )
  await checkFileContent(
    path.join(__dirname, '../vite.config.js'),
    'terserOptions',
    'Terser 压缩配置'
  )

  // 5. 检查性能监控组件
  console.log('\n📊 检查性能监控...')
  await checkExists(
    path.join(__dirname, '../src/components/PerformanceStats.vue'),
    'PerformanceStats 组件'
  )

  // 6. 检查脚本命令
  console.log('\n🔧 检查 NPM 脚本...')
  await checkFileContent(
    path.join(__dirname, '../package.json'),
    'optimize:images',
    'optimize:images 脚本'
  )
  await checkFileContent(
    path.join(__dirname, '../package.json'),
    'optimize:all',
    'optimize:all 脚本'
  )

  // 7. 检查依赖包
  console.log('\n📚 检查依赖包...')
  await checkFileContent(
    path.join(__dirname, '../package.json'),
    'vite-plugin-compression2',
    'compression2 插件'
  )
  await checkFileContent(
    path.join(__dirname, '../package.json'),
    'terser',
    'terser 压缩器'
  )

  // 输出结果
  console.log('\n╔════════════════════════════════════════╗')
  console.log('║           验证结果汇总                 ║')
  console.log('╚════════════════════════════════════════╝\n')

  const passed = checks.filter(c => c.status === '✅').length
  const failed = checks.filter(c => c.status === '❌').length
  const total = checks.length

  checks.forEach(check => {
    console.log(`${check.status} ${check.description}: ${check.detail}`)
  })

  console.log('\n' + '─'.repeat(44))
  console.log(`总计: ${total} 项检查`)
  console.log(`✅ 通过: ${passed} 项`)
  console.log(`❌ 失败: ${failed} 项`)
  console.log(`📊 成功率: ${Math.round((passed / total) * 100)}%`)

  if (failed === 0) {
    console.log('\n🎉 所有优化检查通过！')
  } else {
    console.log('\n⚠️  部分优化未完成，请检查失败项。')
  }

  console.log('\n💡 提示:')
  console.log('   - 运行 npm run optimize:images 生成优化图片')
  console.log('   - 运行 npm run build 构建生产版本')
  console.log('   - 访问 /test-optimization.html 测试效果')
}

verify().catch(error => {
  console.error('❌ 验证过程出错:', error)
  process.exit(1)
})
