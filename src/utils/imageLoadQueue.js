/**
 * Image Load Queue with Priority Management
 * Implements intelligent image loading with priority-based queue
 */

export const PRIORITY = {
  CRITICAL: 100,  // Current visible images
  HIGH: 75,       // User interaction triggered
  MEDIUM: 50,     // Hover preload
  LOW: 25,        // Background preload
  IDLE: 0         // Idle time preload
}

export class ImageLoadQueue {
  constructor(maxConcurrent = 3) {
    this.queue = []
    this.active = 0
    this.maxConcurrent = maxConcurrent
    this.loadingTasks = new Map()
    this.completedTasks = new Set()
  }

  /**
   * Add task to queue with priority
   */
  enqueue(imageUrl, loadTask, priority = PRIORITY.MEDIUM) {
    // Skip if already completed
    if (this.completedTasks.has(imageUrl)) {
      return Promise.resolve()
    }

    // Return existing promise if already loading
    if (this.loadingTasks.has(imageUrl)) {
      return this.loadingTasks.get(imageUrl)
    }

    // Create promise for this task
    const taskPromise = new Promise((resolve, reject) => {
      this.queue.push({
        imageUrl,
        loadTask,
        priority,
        resolve,
        reject
      })

      // Sort by priority (higher first)
      this.queue.sort((a, b) => b.priority - a.priority)
    })

    this.loadingTasks.set(imageUrl, taskPromise)
    this.processQueue()

    return taskPromise
  }

  /**
   * Process queue
   */
  async processQueue() {
    if (this.active >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    this.active++
    const task = this.queue.shift()

    try {
      const result = await task.loadTask()
      this.completedTasks.add(task.imageUrl)
      task.resolve(result)
    } catch (error) {
      task.reject(error)
    } finally {
      this.active--
      this.loadingTasks.delete(task.imageUrl)
      this.processQueue()
    }
  }

  /**
   * Update priority of pending task
   */
  updatePriority(imageUrl, newPriority) {
    const taskIndex = this.queue.findIndex(t => t.imageUrl === imageUrl)
    if (taskIndex !== -1) {
      this.queue[taskIndex].priority = newPriority
      this.queue.sort((a, b) => b.priority - a.priority)
    }
  }

  /**
   * Clear queue
   */
  clear() {
    this.queue = []
    this.loadingTasks.clear()
    this.completedTasks.clear()
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queued: this.queue.length,
      active: this.active,
      completed: this.completedTasks.size
    }
  }
}

// Singleton instance
export const imageLoadQueue = new ImageLoadQueue()
