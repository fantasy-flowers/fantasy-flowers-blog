<template>
  <div class="entry-title">
    <h1 class="entry-title__heading">{{ title }}</h1>
    <p v-if="subtitle" class="entry-title__subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup>
/**
 * EntryTitle - 博客入口页标题展示组件
 *
 * 从 EntryGate.vue 提取的标题区域，展示博客标题（含彩虹渐变文字动画）
 * 和可选的副标题。
 *
 * @component
 * @example
 * <EntryTitle title="fantasy_flowers's Blog" subtitle="欢迎来到我的个人博客" />
 */

// ==================== Props 定义 ====================
defineProps({
  /** 博客标题 */
  title: {
    type: String,
    required: true
  },
  /** 博客副标题 */
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
/* Block */
.entry-title {
  text-align: center;
}

/* Element: heading with rainbow gradient animation */
.entry-title__heading {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, #ff9a9e, #fad0c4, #fad0c4, #fbc2eb, #a18cd1, #fbc2eb);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: entry-title-rainbow 8s linear infinite;
}

/* Element: subtitle */
.entry-title__subtitle {
  font-size: 1.1rem;
  color: var(--blog-gray);
  font-weight: 400;
}

/* Rainbow text animation */
@keyframes entry-title-rainbow {
  to {
    background-position: 200% center;
  }
}

/* ==================== Responsive ==================== */

@media (max-width: 1024px) {
  .entry-title__heading {
    font-size: 2.25rem;
  }
}

@media (max-width: 768px) {
  .entry-title__heading {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }

  .entry-title__subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 640px) {
  .entry-title__heading {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .entry-title__heading {
    font-size: 1.75rem;
    line-height: 1.2;
  }

  .entry-title__subtitle {
    font-size: 0.9rem;
  }
}

@media (max-width: 360px) {
  .entry-title__heading {
    font-size: 1.5rem;
  }

  .entry-title__subtitle {
    font-size: 0.85rem;
  }
}

@media (min-width: 1920px) {
  .entry-title__heading {
    font-size: 3rem;
  }

  .entry-title__subtitle {
    font-size: 1.25rem;
  }
}

@media (min-width: 2560px) {
  .entry-title__heading {
    font-size: 3.5rem;
  }

  .entry-title__subtitle {
    font-size: 1.4rem;
  }
}

@media (max-height: 500px) and (orientation: landscape) {
  .entry-title__heading {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }

  .entry-title__subtitle {
    font-size: 0.85rem;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .entry-title__heading {
    animation: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .entry-title__heading {
    background: none;
    color: CanvasText;
  }

  .entry-title__subtitle {
    color: CanvasText;
  }
}
</style>
