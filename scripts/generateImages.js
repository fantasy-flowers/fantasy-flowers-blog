/**
 * Image Generation Script
 * Generates multiple sizes of wallpaper images for responsive loading
 */

import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SIZES = {
  small: 640,
  medium: 1024,
  large: 1920,
  xlarge: 3840
}

const INPUT_DIR = path.join(__dirname, '../public/background')// 输入目录
const OUTPUT_BASE = path.join(__dirname, '../public/images')// 输出目录

async function ensureDir(dir) {
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

async function generateSizes(inputPath, filename) {
  console.log(`Processing: ${filename}`)
  
  const image = sharp(inputPath)
  const metadata = await image.metadata()
  
  console.log(`  Original: ${metadata.width}x${metadata.height}`)
  
  for (const [sizeName, width] of Object.entries(SIZES)) {
    // Skip if original is smaller than target
    if (metadata.width < width) {
      console.log(`  Skipping ${sizeName} (original too small)`)
      continue
    }
    
    const outputDir = path.join(OUTPUT_BASE, sizeName)
    await ensureDir(outputDir)
    
    const outputPath = path.join(outputDir, filename)
    
    try {
      await image
        .resize(width, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 85 })
        .toFile(outputPath)
      
      const stats = await fs.stat(outputPath)
      const sizeKB = Math.round(stats.size / 1024)
      console.log(`  ✓ ${sizeName}: ${width}px (${sizeKB}KB)`)
    } catch (error) {
      console.error(`  ✗ ${sizeName}: ${error.message}`)
    }
  }
}

async function generateManifest() {
  const manifest = {
    generated: new Date().toISOString(),
    sizes: SIZES,
    images: []
  }
  
  for (const [sizeName] of Object.entries(SIZES)) {
    const sizeDir = path.join(OUTPUT_BASE, sizeName)
    
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
            size: stats.size
          }
        } else {
          manifest.images.push({
            name: file,
            sizes: {
              [sizeName]: {
                path: `/images/${sizeName}/${file}`,
                size: stats.size
              }
            }
          })
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read ${sizeName} directory`)
    }
  }
  
  const manifestPath = path.join(OUTPUT_BASE, 'manifest.json')
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`\n✓ Manifest generated: ${manifestPath}`)
}

async function main() {
  console.log('=== Image Generation Script ===\n')
  
  // Ensure output directories exist
  for (const sizeName of Object.keys(SIZES)) {
    await ensureDir(path.join(OUTPUT_BASE, sizeName))
  }
  
  // Get all webp files from public directory
  const files = await fs.readdir(INPUT_DIR)
  const webpFiles = files.filter(f => f.endsWith('.webp'))
  
  console.log(`Found ${webpFiles.length} images to process\n`)
  
  // Process each image
  for (const file of webpFiles) {
    const inputPath = path.join(INPUT_DIR, file)
    await generateSizes(inputPath, file)
    console.log('')
  }
  
  // Generate manifest
  await generateManifest()
  
  console.log('\n✓ All images processed successfully!')
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
