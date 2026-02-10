<template>
  <div 
    class="tag-card"
    :style="{ animationDelay: `${index * 0.05}s` }"
    @click="navigateToTag"
  >
    <div class="tag-info">
      <span class="tag-prefix">#</span>
      <span class="tag-name">{{ tag.name }}</span>
    </div>
    <div class="tag-count">
      <span>+ {{ tag.count }}</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  tag: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.name !== undefined && value.count !== undefined
    }
  },
  index: {
    type: Number,
    default: 0
  }
})

const router = useRouter()

const navigateToTag = () => {
  router.push({ name: 'tag', params: { name: props.tag.name } })
}
</script>

<style scoped>
.tag-card {
  background-color: rgba(30, 42, 58, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.6s ease-out both;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tag-card:hover {
  background-color: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
}

.tag-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.tag-prefix {
  color: rgb(185, 75, 128);
  font-size: 1.2rem;
  font-weight: bold;
  flex-shrink: 0;
}

.tag-name {
  color: #F8FAFC;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-count {
  background-color: rgba(59, 130, 246, 0.3);
  border-radius: 999px;
  padding: 3px 10px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.tag-count span {
  color: #F8FAFC;
  font-size: 0.85rem;
  font-weight: 500;
}

.tag-card:hover .tag-count {
  background-color: rgba(59, 130, 246, 0.5);
  transform: scale(1.05);
}

.tag-card:hover .tag-prefix {
  color: rgb(210, 100, 153);
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tag-card {
    padding: 10px 14px;
  }
  
  .tag-prefix {
    font-size: 1.1rem;
  }
  
  .tag-name {
    font-size: 0.95rem;
  }
  
  .tag-count span {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .tag-card {
    padding: 8px 12px;
  }
  
  .tag-prefix {
    font-size: 1rem;
  }
  
  .tag-name {
    font-size: 0.9rem;
  }
  
  .tag-count {
    padding: 2px 8px;
  }
  
  .tag-count span {
    font-size: 0.75rem;
  }
}
</style>
