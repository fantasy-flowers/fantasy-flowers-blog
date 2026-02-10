<template>
  <EntryAnimation @after-leave="onAnimationComplete">
    <div 
      v-if="!isHidden" 
      class="entry-gate" 
      :class="{ 'fade-out': isAnimating }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-title"
      aria-describedby="entry-subtitle"
    >
      <div class="entry-background" aria-hidden="true"></div>
      <div class="entry-content">
        <div class="entry-avatar-container">
          <img 
            src="/head/head.webp" 
            alt="fantasy_flowers blog avatar - a decorative profile image" 
            class="entry-avatar"
            @error="handleImageError"
            role="img"
          >
        </div>
        
        <div class="entry-title-section">
          <h1 id="entry-title" class="entry-title">fantasy_flowers's Blog</h1>
          <p id="entry-subtitle" class="entry-subtitle">欢迎来到我的个人博客</p>
        </div>
        
        <button 
          class="entry-button"
          @click="handleEnterClick"
          @keydown="handleKeydown"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
          ref="entryButtonRef"
          :class="{ 'touch-active': isTouchActive }"
          type="button"
          aria-label="进入博客 - 点击或按回车键进入主博客页面"
          :aria-describedby="isAnimating ? 'loading-message' : undefined"
          :disabled="isAnimating"
        >
          <span class="entry-button-text" aria-hidden="true">进入博客</span>
          <i class="fa fa-arrow-right entry-button-icon" aria-hidden="true"></i>
        </button>
        
        <!-- Screen reader only loading message -->
        <div 
          v-if="isAnimating" 
          id="loading-message" 
          class="sr-only"
          aria-live="polite"
        >
          正在进入博客，请稍候...
        </div>
        
        <!-- Screen reader instructions -->
        <div class="sr-only" aria-live="polite">
          博客入口页面。使用回车键或点击按钮进入主博客。
        </div>
      </div>
    </div>
  </EntryAnimation>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import SessionManager from '@/utils/SessionManager.js'
import EntryAnimation from '@/components/animations/EntryAnimation.vue'

// Component state
const isAnimating = ref(false)
const isHidden = ref(false)
const isTouchActive = ref(false)
const entryButtonRef = ref(null)
const pendingRoute = ref({ path: '/' })

// Router for navigation
const router = useRouter()

// Emit events to parent component
const emit = defineEmits(['enter'])

// Enhanced entry button click handler with comprehensive error handling
const handleEnterClick = async () => {
  if (isAnimating.value) return
  
  isAnimating.value = true
  
  // Announce to screen readers
  announceToScreenReader('正在进入博客...')
  
  try {
    // Validate session manager before proceeding
    const validation = SessionManager.validateSessionData()
    if (!validation.isValid && validation.canRecover) {
      console.log('EntryGate: Attempting session recovery before entry')
      try {
        SessionManager.recoverFromCorruptedSession()
      } catch (recoveryError) {
        console.warn('EntryGate: Session recovery failed, continuing with entry', recoveryError)
      }
    }

    // Mark user as entered in session with error handling
    try {
      SessionManager.markAsEntered()
      console.log('EntryGate: User successfully marked as entered')
    } catch (sessionError) {
      console.error('EntryGate: Failed to mark user as entered, continuing anyway', sessionError)
      // Continue with navigation even if session marking fails
    }
    
    // Clear the entry interface flag with safe operation
    SessionManager.safeStorageOperation('remove', 'session', 'blog_show_entry')
    
    // Get the intended route from storage with enhanced error handling
    let targetRoute = { path: '/' } // Default fallback route
    
    try {
      const intendedRouteData = SessionManager.safeStorageOperation('get', 'session', 'blog_intended_route')
      
      if (intendedRouteData) {
        try {
          const parsedRoute = JSON.parse(intendedRouteData)
          
          // Validate route structure
          if (parsedRoute && typeof parsedRoute.path === 'string') {
            targetRoute = {
              path: parsedRoute.path,
              name: parsedRoute.name || undefined,
              params: parsedRoute.params || {},
              query: parsedRoute.query || {},
              hash: parsedRoute.hash || ''
            }
            console.log('EntryGate: Valid intended route found:', targetRoute.path)
          } else {
            console.warn('EntryGate: Invalid route structure, using default')
          }
          
          // Clean up the stored route
          SessionManager.safeStorageOperation('remove', 'session', 'blog_intended_route')
        } catch (parseError) {
          console.warn('EntryGate: Error parsing intended route, using default', parseError)
          SessionManager.safeStorageOperation('remove', 'session', 'blog_intended_route')
        }
      }
    } catch (storageError) {
      console.warn('EntryGate: Error accessing intended route storage, using default', storageError)
    }
    
    console.log('EntryGate: User entered, navigating to:', targetRoute.path)
    
    // Store pending route for after animation
    pendingRoute.value = targetRoute
    
    // Trigger transition
    isHidden.value = true
    
  } catch (error) {
    console.error('EntryGate: Critical error during entry process', error)
    
    // Reset animation state
    isAnimating.value = false
    
    // Announce error to screen readers
    announceToScreenReader('进入过程中出现错误，正在重试...')
    
    // Emergency fallback with multiple recovery strategies
    setTimeout(() => {
      try {
        // Try to clear any corrupted state
        SessionManager.clearSession()
        
        // Attempt basic navigation
        isHidden.value = true
        emit('enter')
        
        // Use the most basic navigation possible
        router.push('/').catch(routerError => {
          console.error('EntryGate: Emergency router navigation failed', routerError)
          
          // Last resort - force page navigation
          try {
            window.location.href = '/'
          } catch (locationError) {
            console.error('EntryGate: Emergency location navigation failed', locationError)
            window.location.reload()
          }
        })
        
      } catch (emergencyError) {
        console.error('EntryGate: Emergency recovery failed', emergencyError)
        
        // Absolute last resort
        announceToScreenReader('系统错误，正在刷新页面...')
        setTimeout(() => window.location.reload(), 1000)
      }
    }, 300)
  }
}

const onAnimationComplete = async () => {
    try {
        emit('enter')
        
        const targetRoute = pendingRoute.value
        
        // Navigate to the intended route after animation with multiple fallbacks
        const navigationAttempts = [
          // Primary attempt with full route object
          () => router.push({
            path: targetRoute.path,
            name: targetRoute.name,
            params: targetRoute.params,
            query: targetRoute.query,
            hash: targetRoute.hash
          }),
          // Fallback 1: Simple path navigation
          () => router.push(targetRoute.path),
          // Fallback 2: Home page navigation
          () => router.push('/'),
          // Fallback 3: Force page reload as last resort
          () => {
            console.warn('EntryGate: All navigation attempts failed, forcing page reload')
            window.location.href = targetRoute.path || '/'
          }
        ]
        
        let navigationSuccess = false
        
        for (let i = 0; i < navigationAttempts.length && !navigationSuccess; i++) {
          try {
            await navigationAttempts[i]()
            navigationSuccess = true
            console.log(`EntryGate: Navigation successful on attempt ${i + 1}`)
          } catch (navigationError) {
            console.warn(`EntryGate: Navigation attempt ${i + 1} failed:`, navigationError)
            
            if (i === navigationAttempts.length - 1) {
              // Last attempt - execute it without try/catch
              navigationAttempts[i]()
            }
          }
        }
    } catch (animationError) {
        console.error('EntryGate: Error during animation/navigation phase', animationError)
        
        // Emergency fallback - force navigation
        try {
          window.location.href = pendingRoute.value.path || '/'
        } catch (emergencyError) {
          console.error('EntryGate: Emergency navigation failed', emergencyError)
          window.location.reload()
        }
    }
}

// Enhanced keyboard navigation handler
const handleKeydown = (event) => {
  if (isAnimating.value) return
  
  switch (event.key) {
    case 'Enter':
    case ' ': // Space key
      event.preventDefault()
      handleEnterClick()
      break
    case 'Escape':
      // Allow escape key to potentially close (for future enhancement)
      event.preventDefault()
      break
  }
}

// Screen reader announcement utility
const announceToScreenReader = (message) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'assertive')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Touch interaction handlers for mobile
const handleTouchStart = () => {
  isTouchActive.value = true
}

const handleTouchEnd = () => {
  setTimeout(() => {
    isTouchActive.value = false
  }, 150)
}

// Enhanced image error handling with multiple fallback strategies
const handleImageError = (event) => {
  console.warn('Avatar image failed to load, attempting fallback strategies')
  
  const img = event.target
  const fallbackSources = [
    '/background/12.webp', // Try absolute path
    '/background/12.webp', // Try public path
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzNCODJGNjtzdG9wLW9wYWNpdHk6MC44Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOTMzM0VBO3N0b3Atb3BhY2l0eTowLjgiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=' // SVG fallback
  ]
  
  // Try next fallback source if available
  const currentSrc = img.src
  const currentIndex = fallbackSources.findIndex(src => currentSrc.includes(src.split('/').pop()))
  
  if (currentIndex < fallbackSources.length - 1) {
    const nextSrc = fallbackSources[currentIndex + 1]
    console.log('Trying fallback image source:', nextSrc)
    img.src = nextSrc
  } else {
    // All fallbacks failed, hide image and show CSS fallback
    console.warn('All avatar fallback sources failed, using CSS fallback')
    img.style.display = 'none'
    img.parentElement.classList.add('avatar-fallback-active')
  }
}

// Background image error handling
const handleBackgroundError = () => {
  console.warn('Background image failed to load, using fallback gradient')
  const backgroundElement = document.querySelector('.entry-background')
  if (backgroundElement) {
    backgroundElement.classList.add('background-fallback')
  }
}

// Enhanced focus management for accessibility
onMounted(() => {
  // Check if background image loads successfully
  const img = new Image()
  img.onload = () => {
    console.log('Background image loaded successfully')
  }
  img.onerror = handleBackgroundError
  img.src = new URL('/background/12.webp', import.meta.url).href
  
  // Store the previously focused element to restore later
  const previouslyFocusedElement = document.activeElement
  
  // Auto-focus the entry button for keyboard navigation after animation
  setTimeout(() => {
    if (entryButtonRef.value) {
      entryButtonRef.value.focus()
      
      // Announce the interface to screen readers
      announceToScreenReader('博客入口页面已加载。按回车键进入博客。')
    }
  }, 600) // Wait for entrance animation to complete
  
  // Trap focus within the entry gate for accessibility
  const handleFocusTrap = (event) => {
    if (!entryButtonRef.value || isHidden.value) return
    
    // If tab is pressed and we're not on the button, focus the button
    if (event.key === 'Tab') {
      event.preventDefault()
      entryButtonRef.value.focus()
    }
  }
  
  // Add focus trap listener
  document.addEventListener('keydown', handleFocusTrap)
  
  // Cleanup function to restore focus and remove listeners
  const cleanup = () => {
    document.removeEventListener('keydown', handleFocusTrap)
    
    // Restore focus to previously focused element when component unmounts
    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus()
    }
  }
  
  // Store cleanup function for onUnmounted
  onUnmounted(cleanup)
})
</script>

<style scoped>
/* Full-screen overlay with Windows-style design */
.entry-gate {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Animation handled by EntryAnimation component */
}

/* Background with same image as blog */
.entry-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/background/12.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.entry-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(2px); /* 保留用于入口遮罩 */
}

/* Centered content container */
.entry-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 500px;
  padding: 2rem;
}

/* Avatar styling matching sidebar */
.entry-avatar-container {
  margin-bottom: 2rem;
  position: relative;
}

.entry-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
  animation: avatarGlow 2s ease-in-out infinite alternate;
  transition: transform 0.3s ease;
}

/* Enhanced avatar fallback system */
.entry-avatar-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(147, 51, 234, 0.6));
  border: 3px solid rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
  display: none;
  z-index: 1;
  animation: avatarGlow 2s ease-in-out infinite alternate;
}

/* Show fallback when image fails or when explicitly activated */
.entry-avatar[style*="display: none"] ~ .entry-avatar-container::before,
.entry-avatar-container:has(.entry-avatar[style*="display: none"])::before,
.entry-avatar-container.avatar-fallback-active::before {
  display: block;
}

/* Add icon to fallback avatar */
.entry-avatar-container.avatar-fallback-active::after {
  content: '👤';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  z-index: 2;
  opacity: 0.8;
}

/* Background fallback system */
.entry-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/background/12.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  /* Fallback background color in case image fails */
  background-color: #0f172a;
}

/* Enhanced background fallback with gradient */
.entry-background.background-fallback {
  background-image: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
}

/* Title section with gradient text */
.entry-title-section {
  margin-bottom: 3rem;
}

.entry-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, #ff9a9e, #fad0c4, #fad0c4, #fbc2eb, #a18cd1, #fbc2eb);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: rainbow-text 8s linear infinite;
}

.entry-subtitle {
  font-size: 1.1rem;
  color: #94A3B8;
  font-weight: 400;
}

/* Prominent entry button with Windows-style design and touch-friendly sizing */
.entry-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: rgba(59, 130, 246, 0.8);
  border: 2px solid rgba(59, 130, 246, 0.6);
  border-radius: 8px;
  color: #F8FAFC;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 200px;
  min-height: 48px; /* Touch-friendly minimum size */
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  animation: buttonPulse 3s ease-in-out infinite;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.entry-button:hover {
  background: rgba(59, 130, 246, 1.0);
  border-color: #3B82F6;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  animation: none;
}

.entry-button:active,
.entry-button.touch-active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.4);
  background: rgba(59, 130, 246, 0.9);
}

.entry-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5), 0 4px 15px rgba(59, 130, 246, 0.3);
}

.entry-button:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5), 0 4px 15px rgba(59, 130, 246, 0.3);
}

.entry-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}

/* Touch-specific enhancements */
@media (hover: none) and (pointer: coarse) {
  .entry-button {
    min-height: 56px; /* Larger touch target on touch devices */
    padding: 1.25rem 3rem;
    font-size: 1.2rem;
  }
  
  .entry-button:hover {
    transform: none; /* Disable hover effects on touch devices */
    background: rgba(59, 130, 246, 0.8);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  }
}

.entry-button-text {
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

.entry-button-icon {
  transition: transform 0.3s ease;
}

.entry-button:hover .entry-button-icon {
  transform: translateX(4px);
}

/* .fade-out class removed as it's handled by EntryAnimation */

/* Enhanced responsive design with more breakpoints */

/* Large tablets and small desktops */
@media (max-width: 1024px) {
  .entry-content {
    padding: 2rem 1.5rem;
    max-width: 85%;
  }
  
  .entry-avatar {
    width: 110px;
    height: 110px;
    animation: avatarGlow 2s ease-in-out infinite alternate;
  }
  
  .entry-title {
    font-size: 2.25rem;
    animation: rainbow-text 8s linear infinite;
  }
  
  .entry-button {
    min-height: 50px;
    padding: 1rem 2.25rem;
    font-size: 1.1rem;
    min-width: 190px;
  }
}

/* Tablets */
@media (max-width: 768px) {
  .entry-content {
    padding: 1.5rem;
    max-width: 90%;
  }
  
  .entry-avatar {
    width: 100px;
    height: 100px;
    animation: avatarGlow 2s ease-in-out infinite alternate;
  }
  
  .entry-title {
    font-size: 2rem;
    margin-bottom: 0.75rem;
    animation: rainbow-text 8s linear infinite;
  }
  
  .entry-subtitle {
    font-size: 1rem;
  }
  
  .entry-title-section {
    margin-bottom: 2.5rem;
  }
  
  .entry-button {
    padding: 1rem 2rem;
    font-size: 1rem;
    min-width: 180px;
    min-height: 52px;
  }
}

/* Large phones */
@media (max-width: 640px) {
  .entry-content {
    padding: 1.25rem;
    max-width: 95%;
  }
  
  .entry-avatar {
    width: 90px;
    height: 90px;
  }
  
  .entry-title {
    font-size: 1.75rem;
  }
}

/* Small phones */
@media (max-width: 480px) {
  .entry-content {
    padding: 1rem;
    max-width: 100%;
  }
  
  .entry-avatar-container {
    margin-bottom: 1.5rem;
  }
  
  .entry-avatar {
    width: 80px;
    height: 80px;
    animation: avatarGlow 2s ease-in-out infinite alternate;
  }
  
  .entry-title {
    font-size: 1.75rem;
    line-height: 1.2;
    animation: rainbow-text 8s linear infinite;
  }
  
  .entry-subtitle {
    font-size: 0.9rem;
  }
  
  .entry-title-section {
    margin-bottom: 2rem;
  }
  
  .entry-button {
    padding: 1rem 1.5rem;
    font-size: 0.95rem;
    min-width: 160px;
    min-height: 56px;
    gap: 0.5rem;
  }
}

/* Very small phones */
@media (max-width: 360px) {
  .entry-content {
    padding: 0.75rem;
  }
  
  .entry-avatar {
    width: 70px;
    height: 70px;
    animation: avatarGlow 2s ease-in-out infinite alternate;
  }
  
  .entry-title {
    font-size: 1.5rem;
    animation: rainbow-text 8s linear infinite;
  }
  
  .entry-subtitle {
    font-size: 0.85rem;
  }
  
  .entry-button {
    padding: 0.875rem 1.25rem;
    font-size: 0.9rem;
    min-width: 140px;
    min-height: 56px;
  }
}

/* High resolution screens */
@media (min-width: 1920px) {
  .entry-avatar {
    width: 140px;
    height: 140px;
    animation: avatarGlow 2s ease-in-out infinite alternate;
  }
  
  .entry-title {
    font-size: 3rem;
    animation: rainbow-text 8s linear infinite;
  }
  
  .entry-subtitle {
    font-size: 1.25rem;
  }
  
  .entry-button {
    padding: 1.25rem 3rem;
    font-size: 1.25rem;
    min-width: 240px;
    min-height: 60px;
  }
}

/* Ultra-wide screens */
@media (min-width: 2560px) {
  .entry-avatar {
    width: 160px;
    height: 160px;
    animation: avatarGlow 2s ease-in-out infinite alternate;
  }
  
  .entry-title {
    font-size: 3.5rem;
    animation: rainbow-text 8s linear infinite;
  }
  
  .entry-subtitle {
    font-size: 1.4rem;
  }
  
  .entry-button {
    padding: 1.5rem 3.5rem;
    font-size: 1.4rem;
    min-width: 280px;
    min-height: 70px;
  }
}

/* Landscape orientation on mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .entry-content {
    padding: 1rem;
    max-width: 80%;
  }
  
  .entry-avatar-container {
    margin-bottom: 1rem;
  }
  
  .entry-avatar {
    width: 60px;
    height: 60px;
    animation: avatarGlow 2s ease-in-out infinite alternate;
  }
  
  .entry-title {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
    animation: rainbow-text 8s linear infinite;
  }
  
  .entry-subtitle {
    font-size: 0.85rem;
  }
  
  .entry-title-section {
    margin-bottom: 1.5rem;
  }
  
  .entry-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    min-height: 44px;
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .entry-gate {
    animation: none;
  }
  
  .entry-avatar {
    animation: none;
  }
  
  .entry-title {
    animation: none;
  }
  
  .entry-button {
    animation: none;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
  }
}

/* Screen reader only utility class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .entry-button {
    border: 3px solid;
    background: ButtonFace;
    color: ButtonText;
  }
  
  .entry-button:focus {
    outline: 3px solid Highlight;
    outline-offset: 2px;
  }
  
  .entry-title {
    background: none;
    color: CanvasText;
  }
  
  .entry-subtitle {
    color: CanvasText;
  }
}
</style>