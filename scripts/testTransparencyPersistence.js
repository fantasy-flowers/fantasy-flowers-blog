/**
 * 透明度持久化测试脚本
 * 验证刷新后透明度是否保持
 */

console.log('🧪 测试透明度持久化功能...\n')

// 测试1: 检查 localStorage
console.log('📦 测试1: localStorage 检查')
const savedTransparency = localStorage.getItem('blog-background-transparency')
if (savedTransparency) {
  const value = parseFloat(savedTransparency)
  console.log('✅ 找到保存的透明度:', (value * 100).toFixed(0) + '%')
  console.log('   原始值:', savedTransparency)
} else {
  console.log('⚠️  未找到保存的透明度，将使用默认值 15%')
}

// 测试2: 检查 CSS 变量
console.log('\n🎨 测试2: CSS 变量检查')
const gradient = getComputedStyle(document.documentElement).getPropertyValue('--body-overlay-gradient')
if (gradient) {
  console.log('✅ CSS 变量已设置')
  console.log('   值:', gradient.trim())
  
  // 提取不透明度值
  const match = gradient.match(/rgba\(15,\s*23,\s*42,\s*([\d.]+)\)/)
  if (match) {
    const opacity = parseFloat(match[1])
    const transparency = 1 - opacity
    console.log('   当前不透明度:', opacity.toFixed(2))
    console.log('   对应透明度:', (transparency * 100).toFixed(0) + '%')
  }
} else {
  console.log('❌ CSS 变量未设置')
}

// 测试3: 对比 localStorage 和 CSS 变量
console.log('\n🔍 测试3: 一致性检查')
if (savedTransparency && gradient) {
  const savedValue = parseFloat(savedTransparency)
  const match = gradient.match(/rgba\(15,\s*23,\s*42,\s*([\d.]+)\)/)
  
  if (match) {
    const cssOpacity = parseFloat(match[1])
    const cssTransparency = 1 - cssOpacity
    const diff = Math.abs(savedValue - cssTransparency)
    
    if (diff < 0.01) {
      console.log('✅ localStorage 和 CSS 变量一致')
      console.log('   保存值:', (savedValue * 100).toFixed(0) + '%')
      console.log('   应用值:', (cssTransparency * 100).toFixed(0) + '%')
    } else {
      console.log('⚠️  localStorage 和 CSS 变量不一致')
      console.log('   保存值:', (savedValue * 100).toFixed(0) + '%')
      console.log('   应用值:', (cssTransparency * 100).toFixed(0) + '%')
      console.log('   差异:', (diff * 100).toFixed(2) + '%')
    }
  }
}

// 测试4: 模拟设置和刷新
console.log('\n🎮 测试4: 模拟设置透明度')

const testValues = [0.3, 0.5, 0.7]
console.log('将依次测试以下透明度值:', testValues.map(v => (v * 100) + '%').join(', '))

let currentIndex = 0

window.testNextTransparency = () => {
  if (currentIndex >= testValues.length) {
    console.log('\n✅ 所有测试值已完成')
    console.log('💡 现在刷新页面 (F5) 验证透明度是否保持')
    return
  }
  
  const testValue = testValues[currentIndex]
  const opacity = 1 - testValue
  const topOpacity = opacity
  const bottomOpacity = Math.min(opacity + 0.15, 1.0)
  
  // 设置 CSS 变量
  document.documentElement.style.setProperty(
    '--body-overlay-gradient',
    `linear-gradient(to bottom, rgba(15, 23, 42, ${topOpacity}), rgba(15, 23, 42, ${bottomOpacity}))`
  )
  
  // 保存到 localStorage
  localStorage.setItem('blog-background-transparency', testValue.toString())
  
  console.log(`\n✅ 已设置透明度为 ${(testValue * 100).toFixed(0)}%`)
  console.log('   顶部不透明度:', topOpacity.toFixed(2))
  console.log('   底部不透明度:', bottomOpacity.toFixed(2))
  console.log('   已保存到 localStorage')
  console.log('\n💡 现在刷新页面 (F5) 验证透明度是否保持为', (testValue * 100).toFixed(0) + '%')
  console.log('   或运行 testNextTransparency() 测试下一个值')
  
  currentIndex++
}

// 测试5: 验证初始化时机
console.log('\n⏱️  测试5: 初始化时机检查')
console.log('检查控制台是否有以下日志:')
console.log('  [BackgroundOpacity] 恢复透明度: XX%')
console.log('  或')
console.log('  [BackgroundOpacity] 使用默认透明度: 15%')

// 等待一下，看看是否有初始化日志
setTimeout(() => {
  console.log('\n' + '='.repeat(50))
  console.log('🎉 测试完成！')
  console.log('='.repeat(50))
  
  console.log('\n📋 测试结果:')
  console.log('1. localStorage:', savedTransparency ? '✅ 已保存' : '⚠️  未保存')
  console.log('2. CSS 变量:', gradient ? '✅ 已设置' : '❌ 未设置')
  console.log('3. 一致性:', savedTransparency && gradient ? '✅ 需验证' : '⚠️  无法验证')
  
  console.log('\n💡 使用说明:')
  console.log('1. 运行 testNextTransparency() 设置测试透明度')
  console.log('2. 刷新页面 (F5)')
  console.log('3. 观察透明度是否保持')
  console.log('4. 重复步骤 1-3 测试不同的透明度值')
  
  console.log('\n🔧 手动测试:')
  console.log('1. 点击右上角滑块图标')
  console.log('2. 调节透明度到任意值')
  console.log('3. 刷新页面')
  console.log('4. 验证透明度是否保持')
  
  console.log('\n📚 相关文档:')
  console.log('- 透明度持久化修复说明.md')
  console.log('- 背景透明度控制说明.md')
}, 500)

// 导出测试函数
if (typeof window !== 'undefined') {
  window.testTransparencyPersistence = () => {
    console.log('🔄 重新运行测试...\n')
    location.reload()
  }
  
  window.resetTransparency = () => {
    localStorage.removeItem('blog-background-transparency')
    console.log('✅ 已清除保存的透明度')
    console.log('💡 刷新页面将使用默认值 15%')
  }
  
  window.setTestTransparency = (transparency) => {
    if (transparency < 0.1 || transparency > 1.0) {
      console.error('❌ 透明度值必须在 0.1 到 1.0 之间')
      return
    }
    
    const opacity = 1 - transparency
    const topOpacity = opacity
    const bottomOpacity = Math.min(opacity + 0.15, 1.0)
    
    document.documentElement.style.setProperty(
      '--body-overlay-gradient',
      `linear-gradient(to bottom, rgba(15, 23, 42, ${topOpacity}), rgba(15, 23, 42, ${bottomOpacity}))`
    )
    
    localStorage.setItem('blog-background-transparency', transparency.toString())
    
    console.log(`✅ 已设置透明度为 ${(transparency * 100).toFixed(0)}%`)
    console.log('💡 刷新页面验证是否保持')
  }
  
  console.log('\n💡 可用命令:')
  console.log('- testNextTransparency() - 测试下一个透明度值')
  console.log('- testTransparencyPersistence() - 重新运行测试')
  console.log('- setTestTransparency(0.5) - 设置透明度为50%')
  console.log('- resetTransparency() - 清除保存的透明度')
}
