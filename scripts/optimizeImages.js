/**
 * 图片优化脚本 - 高级压缩和优化
 * 包含：图片压缩、格式转换、缩略图生成
 */

import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置
const CONFIG = {
  // 响应式图片尺寸
  sizes: {
    small: { width: 640, quality: 80 },
    medium: { width: 1024, quality: 82 },
    large: { width: 1920, quality: 85 },
    xlarge: { width: 3840, quality: 88 }
  },
  // 缩略图配置
  thumbnail: {
    width: 150,
    height: 100,
    quality: 75
  },
  // 输入输出目录
  inputDir: path.join(__dirname, '../public'),
  outputBase: path.join(__dirname, '../public/images'),
  thumbnailDir: path.join(__dirname, '../public/thumbnails')
}

// 确保目录存在
async function ensureDir(dir) {
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

// 生成响应式图片
async function generateResponsiveImages(inputPath, filename) {
  console.log(`📸 处理图片: ${filename}`)
  
  const image = sharp(inputPath)
  const metadata = await image.metadata()
  
  console.log(`   原始尺寸: ${metadata.width}x${metadata.height} (${Math.round(metadata.size / 1024)}KB)`)
  
  let totalSaved = 0
  const originalSize = metadata.size
  
  for (const [sizeName, config] of Object.entries(CONFIG.sizes)) {
    // 跳过比原图大的尺寸
    if (metadata.width < config.width) {
      console.log(`   ⏭️  跳过 ${sizeName} (原图较小)`)
      continue
    }
    
    const outputDir = path.join(CONFIG.outputBase, sizeName)
    await ensureDir(outputDir)
    
    const outputPath = path.join(outputDir, filename)
    
    try {
      await image
        .clone()
        .resize(config.width, null, {
          fit: 'inside',
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3 // 使用高质量缩放算法
        })
        .webp({ 
          quality: config.quality,
          effort: 6 // 更高的压缩努力度
        })
        .toFile(outputPath)
      
      const stats = await fs.stat(outputPath)
      const sizeKB = Math.round(stats.size / 1024)
      const saved = originalSize - stats.size
      totalSaved += saved
      
      console.log(`   ✅ ${sizeName}: ${config.width}px → ${sizeKB}KB`)
    } catch (error) {
      console.error(`   ❌ ${sizeName}: ${error.message}`)
    }
  }
  
  return totalSaved
}

// 生成缩略图
async function generateThumbnail(inputPath, filename) {
  const outputPath = path.join(CONFIG.thumbnailDir, filename)
  
  try {
    await sharp(inputPath)
      .resize(CONFIG.thumbnail.width, CONFIG.thumbnail.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ 
        quality: CONFIG.thumbnail.quality,
        effort: 6
      })
      .toFile(outputPath)
    
    const stats = await fs.stat(outputPath)
    const sizeKB = Math.round(stats.size / 1024)
    
    console.log(`   🖼️  缩略图: ${CONFIG.thumbnail.width}x${CONFIG.thumbnail.height} → ${sizeKB}KB`)
    
    return stats.size
  } catch (error) {
    console.error(`   ❌ 缩略图生成失败: ${error.message}`)
    return 0
  }
}

// 生成清单文件
async function generateManifest() {
  const manifest = {
    generated: new Date().toISOString(),
    sizes: CONFIG.sizes,
    images: []
  }
  
  for (const [sizeName] of Object.entries(CONFIG.sizes)) {
    const sizeDir = path.join(CONFIG.outputBase, sizeName)
    
    try {
      const files = await fs.readdir(sizeDir)
      const webpFiles = files.filter(f => f.endsWith('.webp'))
      
      for (const file of webpFiles) {
        const filePath = path.join(sizeDir, file)
        const stats = await fs.stat(filePath)
        
        const existing = manifest.images.find(img => img.name === file)
        if (existing) {
          existing.sizes[sizeName] = {
            path: `/images/${sizeName}/${file}`,
            size: stats.size,
            sizeKB: Math.round(stats.size / 1024)
          }
        } else {
          manifest.images.push({
            name: file,
            sizes: {
              [sizeName]: {
                path: `/images/${sizeName}/${file}`,
                size: stats.size,
                sizeKB: Math.round(stats.size / 1024)
              }
            }
          })
        }
      }
    } catch (error) {
      console.warn(`⚠️  无法读取 ${sizeName} 目录`)
    }
  }
  
  const manifestPath = path.join(CONFIG.outputBase, 'manifest.json')
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`\n📋 清单文件已生成: ${manifestPath}`)
  
  return manifest
}

// 主函数
async function main() {
  console.log('╔════════════════════════════════════════╗')
  console.log('║     图片优化脚本 - 开始执行           ║')
  console.log('╚════════════════════════════════════════╝\n')
  
  const startTime = Date.now()
  
  // 确保输出目录存在
  await ensureDir(CONFIG.thumbnailDir)
  for (const sizeName of Object.keys(CONFIG.sizes)) {
    await ensureDir(path.join(CONFIG.outputBase, sizeName))
  }
  
  // 获取所有 webp 文件
  const files = await fs.readdir(CONFIG.inputDir)
  const webpFiles = files.filter(f => f.endsWith('.webp'))
  
  console.log(`📁 找到 ${webpFiles.length} 个图片文件\n`)
  
  let totalSaved = 0
  let processedCount = 0
  
  // 处理每个图片
  for (const file of webpFiles) {
    const inputPath = path.join(CONFIG.inputDir, file)
    
    // 生成响应式图片
    const saved = await generateResponsiveImages(inputPath, file)
    totalSaved += saved
    
    // 生成缩略图
    await generateThumbnail(inputPath, file)
    
    processedCount++
    console.log('')
  }
  
  // 生成清单
  const manifest = await generateManifest()
  
  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)
  
  console.log('\n╔════════════════════════════════════════╗')
  console.log('║          优化完成统计                  ║')
  console.log('╚════════════════════════════════════════╝')
  console.log(`✅ 处理图片数: ${processedCount}`)
  console.log(`💾 节省空间: ${Math.round(totalSaved / 1024 / 1024)}MB`)
  console.log(`⏱️  总耗时: ${duration}秒`)
  console.log(`📊 生成图片变体: ${manifest.images.length * Object.keys(CONFIG.sizes).length}`)
  console.log('\n✨ 所有图片优化完成！')
}

main().catch(error => {
  console.error('❌ 错误:', error)
  process.exit(1)
})
