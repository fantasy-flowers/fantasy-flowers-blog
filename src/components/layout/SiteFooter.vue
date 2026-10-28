<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-info">
        <!-- 版权信息 -->
        <p class="copyright">
          © {{ currentYear }} {{ siteName }}. All Rights Reserved.
        </p>
        
        <!-- 备案信息 -->
        <div class="beian-info" v-if="beianNumber">
          <a 
            href="https://beian.miit.gov.cn/" 
            target="_blank" 
            rel="noopener noreferrer"
            class="beian-link"
          >
            {{ beianNumber }}
          </a>
        </div>
        
        <!-- 技术支持链接 -->
        <div class="powered-by">
          <span>Powered by</span>
          <a href="https://vuejs.org/" target="_blank" rel="noopener noreferrer" class="tech-link">Vue</a>
          <span>&</span>
          <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer" class="tech-link">Vite</a>
        </div>
        
        <!-- 社交媒体链接 -->
        <div class="social-links" v-if="showSocialLinks">
          <a 
            v-for="social in socialLinks" 
            :key="social.name"
            :href="social.url" 
            target="_blank" 
            rel="noopener noreferrer"
            :title="social.name"
            class="social-link"
          >
            <i :class="social.icon"></i>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBlogStore } from '@/stores/modules/blog'

const blogStore = useBlogStore()

// 当前年份
const currentYear = computed(() => new Date().getFullYear())

// 站点名称 - 从store中获取
const siteName = computed(() => blogStore.systemConfig?.site_name )

// 备案号 - 从store中获取
const beianNumber = computed(() => blogStore.systemConfig?.beian_number)

// 是否显示社交链接
const showSocialLinks = ref(true)

// 社交媒体链接列表
const socialLinks = computed(() => {
  const links = []
  
  // 从 systemConfig 获取 GitHub 链接
  if (blogStore.systemConfig?.github_link) {
    links.push({
      name: 'GitHub',
      url: blogStore.systemConfig.github_link,
      icon: 'fab fa-github'
    })
  }
  
  // 添加 RSS 链接
  links.push({
    name: 'RSS',
    url: '/rss.xml',
    icon: 'fas fa-rss'
  })
  
  // 添加 Sitemap 链接
  links.push({
    name: 'Sitemap',
    url: '/sitemap.xml',
    icon: 'fas fa-sitemap'
  })
  
  return links
})


</script>

<style scoped>
.site-footer {
  width: 100%;
  background: transparent;
  position: relative;
  margin-top: auto;
  padding: 1rem 0;
  color: var(--blog-gray);
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 0.01rem;
  align-items: center;
}

.copyright {
  color: var(--blog-gray);
  font-weight: 400;
  margin: 0;
  letter-spacing: 0.3px;
  font-size: 0.75rem;
}

.beian-info {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.beian-link {
  color: var(--blog-blue-light);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.7rem;
}

.beian-link:hover {
  color: var(--blog-blue);
  text-decoration: underline;
}

.powered-by {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--blog-gray);
  font-size: 0.7rem;
}

.tech-link {
  color: var(--blog-purple);
  text-decoration: none;
  font-weight: 400;
  transition: all 0.3s ease;
  position: relative;
  font-size: 0.7rem;
}

.tech-link::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--blog-purple), var(--blog-pink));
  transition: width 0.3s ease;
}

.tech-link:hover {
  color: #A78BFA;
}

.tech-link:hover::after {
  width: 100%;
}

.social-links {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.3rem;
}

.social-link {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.15);
  color: #A78BFA;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.75rem;
  border: 1px solid var(--blog-purple-soft);
}

.social-link:hover {
  background: var(--blog-purple-mid);
  color: var(--blog-purple-light);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px var(--blog-purple-soft);
}

.social-link i {
  transition: transform 0.3s ease;
}

.social-link:hover i {
  transform: scale(1.1);
}

/* 响应式设计：超大屏幕 (≥1921px) */
@media (min-width: 1921px) {
  .site-footer {
    padding: 1.2rem 0;
    font-size: 0.8rem;
  }
  
  .footer-content {
    max-width: 1400px;
    padding: 0 1.5rem;
  }
  
  .footer-info {
    gap: 0.5rem;
  }
  
  .social-link {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
}

/* 响应式设计：大屏幕 (1441px - 1920px) */
@media (min-width: 1441px) and (max-width: 1920px) {
  .site-footer {
    padding: 1.1rem 0;
  }
  
  .footer-content {
    max-width: 1300px;
  }
}

/* 响应式设计：标准桌面 (1201px - 1440px) */
@media (min-width: 1201px) and (max-width: 1440px) {
  .site-footer {
    padding: 1rem 0;
  }
}

/* 响应式设计：小桌面 (1025px - 1200px) */
@media (min-width: 1025px) and (max-width: 1200px) {
  .footer-content {
    max-width: 1000px;
    padding: 0 1rem;
  }
}

/* 响应式设计：平板 (769px - 1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
  .site-footer {
    padding: 0.9rem 0;
    font-size: 0.7rem;
  }
  
  .footer-content {
    padding: 0 1rem;
  }
  
  .footer-info {
    gap: 0.35rem;
  }
  
  .social-link {
    width: 26px;
    height: 26px;
    font-size: 0.7rem;
  }
}

/* 响应式设计：大型手机 (481px - 768px) */
@media (min-width: 481px) and (max-width: 768px) {
  .site-footer {
    padding: 0.8rem 0;
    font-size: 0.65rem;
  }
  
  .footer-content {
    padding: 0 0.8rem;
  }
  
  .footer-info {
    gap: 0.3rem;
  }
  
  .powered-by {
    flex-wrap: wrap;
    justify-content: center;
    font-size: 0.65rem;
  }
  
  .social-link {
    width: 24px;
    height: 24px;
    font-size: 0.65rem;
  }
}

/* 响应式设计：标准手机 (321px - 480px) */
@media (min-width: 321px) and (max-width: 480px) {
  .site-footer {
    padding: 0.7rem 0;
    font-size: 0.6rem;
  }
  
  .footer-content {
    padding: 0 0.6rem;
  }
  
  .footer-info {
    gap: 0.25rem;
  }
  
  .copyright {
    font-size: 0.65rem;
  }
  
  .beian-link,
  .powered-by {
    font-size: 0.6rem;
  }
  
  .social-links {
    gap: 0.4rem;
  }
  
  .social-link {
    width: 22px;
    height: 22px;
    font-size: 0.6rem;
  }
}

/* 响应式设计：小屏手机 (≤320px) */
@media (max-width: 320px) {
  .site-footer {
    padding: 0.6rem 0;
    font-size: 0.55rem;
  }
  
  .footer-content {
    padding: 0 0.5rem;
  }
  
  .footer-info {
    gap: 0.2rem;
  }
  
  .copyright {
    font-size: 0.6rem;
  }
  
  .beian-link,
  .powered-by {
    font-size: 0.55rem;
  }
  
  .social-links {
    gap: 0.3rem;
    margin-top: 0.2rem;
  }
  
  .social-link {
    width: 20px;
    height: 20px;
    font-size: 0.55rem;
  }
}
</style>
