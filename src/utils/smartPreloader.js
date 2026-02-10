/**
 * Smart Image Preloader
 * Implements intelligent preloading based on user behavior
 */

import { imageLoadQueue, PRIORITY } from './imageLoadQueue'

export class SmartPreloader {
  constructor() {
    this.hoverTimers = new Map()
    this.hoverDelay = 300 // ms
    this.userPreferences = this.loadUserPreferences()
    this.interactionHistory = []
    this.maxHistorySize = 50
  }

  /**
   * Load user preferences from localStorage
   */
  loadUserPreferences() {
    try {
      const saved = localStorage.getItem('wallpaper-preferences')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }

  /**
   * Save user preferences
   */
  saveUserPreferences() {
    try {
      localStorage.setItem('wallpaper-preferences', JSON.stringify(this.userPreferences))
    } catch (error) {
      console.warn('[Smart Preloader] Failed to save preferences:', error)
    }
  }

  /**
   * Record user interaction
   */
  recordInteraction(imageUrl, action = 'view') {
    const interaction = {
      imageUrl,
      action,
      timestamp: Date.now()
    }

    this.interactionHistory.push(interaction)

    // Keep history size limited
    if (this.interactionHistory.length > this.maxHistorySize) {
      this.interactionHistory.shift()
    }

    // Update preferences
    if (!this.userPreferences[imageUrl]) {
      this.userPreferences[imageUrl] = { views: 0, selections: 0, lastUsed: 0 }
    }

    if (action === 'view') {
      this.userPreferences[imageUrl].views++
    } else if (action === 'select') {
      this.userPreferences[imageUrl].selections++
      this.userPreferences[imageUrl].lastUsed = Date.now()
    }

    this.saveUserPreferences()
  }

  /**
   * Get prediction score for an image
   */
  getPredictionScore(imageUrl) {
    const prefs = this.userPreferences[imageUrl]
    if (!prefs) return 0

    const recencyScore = this.getRecencyScore(prefs.lastUsed)
    const frequencyScore = Math.min(prefs.selections * 10, 50)
    const viewScore = Math.min(prefs.views * 2, 20)

    return recencyScore + frequencyScore + viewScore
  }

  /**
   * Calculate recency score
   */
  getRecencyScore(lastUsed) {
    if (!lastUsed) return 0

    const daysSinceUse = (Date.now() - lastUsed) / (1000 * 60 * 60 * 24)
    
    if (daysSinceUse < 1) return 30
    if (daysSinceUse < 7) return 20
    if (daysSinceUse < 30) return 10
    return 5
  }

  /**
   * Get top predicted images
   */
  getTopPredictions(count = 3) {
    const scores = Object.entries(this.userPreferences)
      .map(([imageUrl, prefs]) => ({
        imageUrl,
        score: this.getPredictionScore(imageUrl)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count)

    return scores.map(s => s.imageUrl)
  }

  /**
   * Preload on hover with delay
   */
  preloadOnHover(imageUrl, loadTask) {
    return {
      onMouseEnter: () => {
        // Clear any existing timer
        if (this.hoverTimers.has(imageUrl)) {
          clearTimeout(this.hoverTimers.get(imageUrl))
        }

        // Set new timer
        const timer = setTimeout(() => {
          console.log(`[Smart Preloader] Hover preload: ${imageUrl}`)
          imageLoadQueue.enqueue(imageUrl, loadTask, PRIORITY.MEDIUM)
          this.recordInteraction(imageUrl, 'hover')
          this.hoverTimers.delete(imageUrl)
        }, this.hoverDelay)

        this.hoverTimers.set(imageUrl, timer)
      },

      onMouseLeave: () => {
        // Cancel preload if user leaves quickly
        if (this.hoverTimers.has(imageUrl)) {
          clearTimeout(this.hoverTimers.get(imageUrl))
          this.hoverTimers.delete(imageUrl)
        }
      }
    }
  }

  /**
   * Preload predicted images
   */
  async preloadPredicted(imageLoader, imageNames) {
    const topPredictions = this.getTopPredictions(3)
    
    console.group('%c🔮 Smart Preloader - Predictions', 'color: #8B5CF6; font-weight: bold')
    console.log('Top predictions:', topPredictions)
    console.groupEnd()

    for (const imageUrl of topPredictions) {
      const imageName = imageUrl.split('/').pop()
      if (imageNames.includes(imageName)) {
        const loadTask = () => imageLoader.loadImage(imageName)
        imageLoadQueue.enqueue(imageUrl, loadTask, PRIORITY.LOW)
      }
    }
  }

  /**
   * Preload adjacent images (next/prev in list)
   */
  preloadAdjacent(currentIndex, imageNames, imageLoader, range = 2) {
    const start = Math.max(0, currentIndex - range)
    const end = Math.min(imageNames.length, currentIndex + range + 1)

    for (let i = start; i < end; i++) {
      if (i !== currentIndex) {
        const imageName = imageNames[i]
        const loadTask = () => imageLoader.loadImage(imageName)
        const priority = Math.abs(i - currentIndex) === 1 ? PRIORITY.MEDIUM : PRIORITY.LOW
        
        imageLoadQueue.enqueue(`/${imageName}`, loadTask, priority)
      }
    }
  }

  /**
   * Clear all hover timers
   */
  clearHoverTimers() {
    this.hoverTimers.forEach(timer => clearTimeout(timer))
    this.hoverTimers.clear()
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalInteractions: this.interactionHistory.length,
      uniqueImages: Object.keys(this.userPreferences).length,
      topPredictions: this.getTopPredictions(5),
      queueStatus: imageLoadQueue.getStatus()
    }
  }
}

// Singleton instance
export const smartPreloader = new SmartPreloader()
