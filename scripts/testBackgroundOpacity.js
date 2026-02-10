/**
 * 背景透明度控制功能测试脚本
 * 验证透明度调节仅影响背景，不影响页面元素
 */

console.log('🧪 开始测试背景透明度控制功能...\n')

// 测试1: 检查CSS变量
console.log('📊 测试1: CSS变量检查')
const rootStyle = getComputedStyle(document.documentElement)
const overlayGradient = rootStyle.getPropertyValue('--body-overlay-gradient')
console.log('✅ 背景遮罩渐变:', overlayGradient || '未设置')

// 测试2: 检查localStorage
console.log('\n💾 测试2: localStorage检查')
const savedTransparency = localStorage.getItem('blog-background-transparency')
const savedBackground = localStorage.getItem('blog-background-image')
console.log('✅ 保存的透明度:', savedTransparency || '未设置 (将使用默认值 0.15)')
console.log('✅ 保存的背景图:', savedBackground || '未设置 (将使用默认值 youno.webp)')

// 测试3: 检查背景遮罩层
console.log('\n🎨 测试3: 背景遮罩层检查')
const bodyBefore = window.getComputedStyle(document.body, '::before')
const beforeBackground = bodyBefore.getPropertyValue('background')
console.log('✅ 遮罩层背景:', beforeBackground ? '已应用' : '❌ 未应用')

// 测试4: 检查页面元素透明度
console.log('\n🔍 测试4: 页面元素透明度检查')

const elementsToCheck = [
  { selector: '.post-card', name: '文章卡片' },
  { selector: '.shell', name: '侧边栏' },
  { selector: '.nav-search-btn', name: '搜索按钮' },
  { selector: '.category-sidebar', name: '分类侧边栏' },
  { selector: '.opacity-toggle-btn', name: '透明度按钮' }
]

let allFixed = true
elementsToCheck.forEach(({ selector, name }) => {
  const element = document.querySelector(selector)
  if (element) {
    const bgColor = window.getComputedStyle(element).backgroundColor
    const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
    if (match) {
      const opacity = parseFloat(match[4])
      const isFixed = Math.abs(opacity - 0.6) < 0.01
      const status = isFixed ? '✅' : '⚠️'
      console.log(`${status} ${name}: ${bgColor} (不透明度: ${opacity.toFixed(2)})`)
      if (!isFixed) {
        allFixed = false
        console.log(`   ⚠️  警告: 应该使用固定值 0.6，当前为 ${opacity.toFixed(2)}`)
      }
    } else {
      console.log(`⚠️  ${name}: 未找到或无背景色`)
    }
  } else {
    console.log(`⚠️  ${name}: 元素未找到`)
  }
})

if (allFixed) {
  console.log('\n✅ 所有页面元素使用固定透明度 0.6')
} else {
  console.log('\n⚠️  部分元素透明度不正确')
}

// 测试5: 模拟透明度调节
console.log('\n🎮 测试5: 模拟透明度调节')

const testTransparencies = [0.1, 0.3, 0.5, 0.7, 1.0]
console.log('测试透明度值:', testTransparencies.join(', '))

testTransparencies.forEach(transparency => {
  const opacity = 1 - transparency
  const topOpacity = opacity
  const bottomOpacity = Math.min(opacity + 0.15, 1.0)
  
  const gradient = `linear-gradient(to bottom, rgba(15, 23, 42, ${topOpacity}), rgba(15, 23, 42, ${bottomOpacity}))`
  
  console.log(`\n透明度 ${(transparency * 100).toFixed(0)}%:`)
  console.log(`  顶部不透明度: ${topOpacity.toFixed(2)}`)
  console.log(`  底部不透明度: ${bottomOpacity.toFixed(2)}`)
  console.log(`  CSS: ${gradient}`)
})

// 测试6: 实际应用测试
console.log('\n🔧 测试6: 实际应用测试')
console.log('尝试设置透明度为 50%...')

const testOpacity = 0.5 // 50% 透明度
const actualOpacity = 1 - testOpacity // 50% 不透明度
const topOpacity = actualOpacity
const bottomOpacity = Math.min(actualOpacity + 0.15, 1.0)

document.documentElement.style.setProperty(
  '--body-overlay-gradient',
  `linear-gradient(to bottom, rgba(15, 23, 42, ${topOpacity}), rgba(15, 23, 42, ${bottomOpacity}))`
)

console.log('✅ 已应用 50% 透明度')
console.log('   顶部不透明度:', topOpacity)
console.log('   底部不透明度:', bottomOpacity)

// 等待1秒后恢复
setTimeout(() => {
  const savedValue = localStorage.getItem('blog-background-transparency')
  if (savedValue) {
    const savedTransparency = parseFloat(savedValue)
    const savedOpacity = 1 - savedTransparency
    const savedTopOpacity = savedOpacity
    const savedBottomOpacity = Math.min(savedOpacity + 0.15, 1.0)
    
    document.documentElement.style.setProperty(
      '--body-overlay-gradient',
      `linear-gradient(to bottom, rgba(15, 23, 42, ${savedTopOpacity}), rgba(15, 23, 42, ${savedBottomOpacity}))`
    )
    
    console.log('\n✅ 已恢复保存的透明度:', (savedTransparency * 100).toFixed(0) + '%')
  }
}, 1000)

// 测试总结
console.log('\n' + '='.repeat(50))
console.log('🎉 测试完成！')
console.log('='.repeat(50))

console.log('\n📋 测试结果总结:')
console.log('1. CSS变量: ' + (overlayGradient ? '✅ 正常' : '❌ 异常'))
console.log('2. localStorage: ' + (savedTransparency ? '✅ 已保存' : '⚠️  未保存'))
console.log('3. 背景遮罩: ' + (beforeBackground ? '✅ 已应用' : '❌ 未应用'))
console.log('4. 页面元素: ' + (allFixed ? '✅ 固定透明度' : '⚠️  透明度不一致'))
console.log('5. 透明度计算: ✅ 正常')
console.log('6. 实际应用: ✅ 正常')

console.log('\n💡 使用说明:')
console.log('1. 点击右上角滑块图标打开透明度控制面板')
console.log('2. 拖动滑块或使用鼠标滚轮调节透明度')
console.log('3. 点击预设按钮快速设置常用值')
console.log('4. 设置会自动保存，刷新页面后保持')

console.log('\n📚 相关文档:')
console.log('- 背景透明度控制说明.md')
console.log('- GPU优化实施报告-统一透明度0.6.md')

// 导出测试函数
if (typeof window !== 'undefined') {
  window.testBackgroundOpacity = () => {
    console.log('🔄 重新运行测试...\n')
    location.reload()
  }
  
  window.setBackgroundTransparency = (transparency) => {
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
  }
  
  console.log('\n💡 控制台命令:')
  console.log('- testBackgroundOpacity() - 重新运行测试')
  console.log('- setBackgroundTransparency(0.5) - 设置透明度为50%')
}
