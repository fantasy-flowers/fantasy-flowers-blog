<template>
  <div 
    class="category-card"
    :style="{ animationDelay: `${index * 0.05}s` }"
    @click="navigateToCategory"
  >
    <div class="category-icon">
      <i class="fa fa-folder"></i>
    </div>
    <div class="category-info">
      <h3 class="category-name">{{ category.name }}</h3>
      <p class="category-count">{{ category.count }} 篇文章</p>
    </div>
    <div class="category-arrow">
      <i class="fa fa-chevron-right"></i>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  category: {
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

const navigateToCategory = () => {
  router.push({ name: 'category', params: { name: props.category.name } })
}
</script>

<style scoped>
.category-card {
  background-color: rgba(30, 42, 58, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
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

.category-card:hover {
  background-color: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
}

.category-icon {
  width: 50px;
  height: 50px;
  min-width: 50px;
  background-color: rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #93C5FD;
  transition: all 0.3s ease;
}

.category-card:hover .category-icon {
  background-color: rgba(59, 130, 246, 0.4);
  color: #F8FAFC;
  transform: scale(1.1);
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #F8FAFC;
  margin-bottom: 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-count {
  font-size: 0.9rem;
  color: #94A3B8;
  margin: 0;
}

.category-arrow {
  color: #94A3B8;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.category-card:hover .category-arrow {
  color: #93C5FD;
  transform: translateX(4px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .category-card {
    padding: 1.2rem;
  }
  
  .category-icon {
    width: 45px;
    height: 45px;
    min-width: 45px;
    font-size: 1.3rem;
  }
  
  .category-name {
    font-size: 1rem;
  }
  
  .category-count {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .category-card {
    padding: 1rem;
  }
  
  .category-icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
    font-size: 1.2rem;
  }
  
  .category-name {
    font-size: 0.95rem;
  }
  
  .category-count {
    font-size: 0.8rem;
  }
}
</style>
