<template>
  <p class="poem-container">
    {{ displayedText }}<span class="cursor">|</span>
  </p>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { poemAPI } from '@/api'

// 显示的文本内容
const displayedText = ref('')
// 打字机定时器
let typingInterval = null
// 打字速度（毫秒）
const typingSpeed = 100

/**
 * 获取随机诗词并开始打字效果
 */
const fetchAndDisplayPoem = async () => {
  try {
    const data = await poemAPI.getRandomPoem()
    if (data) {
      // 组合诗词内容和作者
      const fullText = `${data.content}——${data.author}`
      startTyping(fullText)
    }
  } catch (error) {
    console.error('获取诗词失败:', error)
    displayedText.value = '加载失败...'
  }
}

/**
 * 开始打字机效果
 * @param {string} text - 要显示的完整文本
 */
const startTyping = (text) => {
  let index = 0
  displayedText.value = ''
  
  // 清除之前的定时器
  if (typingInterval) clearInterval(typingInterval)

  // 设置定时器逐字显示
  typingInterval = setInterval(() => {
    if (index < text.length) {
      displayedText.value += text.charAt(index)
      index++
    } else {
      clearInterval(typingInterval)
    }
  }, typingSpeed)
}

// 组件挂载时获取诗词
onMounted(() => {
  fetchAndDisplayPoem()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (typingInterval) clearInterval(typingInterval)
})
</script>

<style scoped>
.poem-container {
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
  font-weight: 500;
  font-size: clamp(1rem, 2vw, 1.2rem);
  max-width: 600px;
  margin: 0 auto;
  min-height: 1.5em; /* 防止加载时高度塌陷 */
  line-height: 1.6;
}

/* 光标闪烁动画 */
.cursor {
  display: inline-block;
  margin-left: 2px;
  font-weight: bold;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
