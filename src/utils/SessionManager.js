/**
 * SessionManager - 管理博客访问会话状态和访问类型检测
 * 
 * 此工具处理：
 * - 使用 sessionStorage 检测新访问与页面刷新
 * - 管理浏览器标签页内的会话持久性
 * - 会话超时逻辑（30分钟）
 * - 生成唯一的会话 ID
 * 
 * 关键行为：
 * - sessionStorage 在每个浏览器标签页中是隔离的
 * - 新标签页 = 无 sessionStorage = 显示入场门户
 * - 同一标签页刷新 = sessionStorage 保留 = 跳过入场门户
 */

class SessionManager {
  // 存储键
  static STORAGE_KEYS = {
    SESSION_ID: 'blog_session_id',
    HAS_ENTERED: 'blog_has_entered',
    ENTRY_TIMESTAMP: 'blog_entry_timestamp',
    SHOW_ENTRY: 'blog_show_entry'
  }

  // 会话超时时间（毫秒）（30分钟）
  static SESSION_TIMEOUT = 30 * 60 * 1000

  /**
   * 初始化会话管理器 - 必须在 Vue 应用挂载前调用
   * 这将根据 sessionStorage 状态确定是否应显示入场门户
   * 
   * 逻辑：
   * - 如果 sessionStorage 中存在 HAS_ENTERED → 这是刷新，不显示入场
   * - 如果 sessionStorage 中不存在 HAS_ENTERED → 这是首次访问或新标签页，显示入场
   */
  static initialize() {
    try {
      const hasEntered = this.safeStorageOperation('get', 'session', this.STORAGE_KEYS.HAS_ENTERED)

      console.log('SessionManager.initialize: Checking session state', { hasEntered })

      if (hasEntered === 'true') {
        // User has already entered in this tab session (refresh scenario)
        this.safeStorageOperation('set', 'session', this.STORAGE_KEYS.SHOW_ENTRY, 'false')
        console.log('SessionManager.initialize: Refresh detected - entry gate will NOT show')
        return false
      } else {
        // First visit or new tab - show entry gate
        this.safeStorageOperation('set', 'session', this.STORAGE_KEYS.SHOW_ENTRY, 'true')
        console.log('SessionManager.initialize: First visit/new tab detected - entry gate WILL show')
        return true
      }
    } catch (error) {
      console.error('SessionManager.initialize: Error during initialization', error)
      // On error, default to showing entry gate for safety
      return true
    }
  }

  /**
   * 生成唯一的会话 ID
   * @returns {string} 唯一的会话标识符
   */
  static generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * 检查是否应显示入场门户
   * 由 Vue 组件调用以确定初始可见性
   * @returns {boolean} 如果应显示入场门户则返回 true
   */
  static shouldShowEntryGate() {
    try {
      const showEntry = this.safeStorageOperation('get', 'session', this.STORAGE_KEYS.SHOW_ENTRY)
      return showEntry === 'true'
    } catch (error) {
      console.warn('SessionManager.shouldShowEntryGate: Error checking state', error)
      return true // Default to showing
    }
  }

  /**
   * 检查是否为新访问（非页面刷新）
   * 使用 sessionStorage HAS_ENTERED 标志作为主要指标
   * @returns {boolean} 如果是新访问则返回 true
   */
  static isFirstVisit() {
    try {
      const hasEntered = this.safeStorageOperation('get', 'session', this.STORAGE_KEYS.HAS_ENTERED)
      return hasEntered !== 'true'
    } catch (error) {
      console.warn('SessionManager.isFirstVisit: Error detecting visit type', error)
      return true // Default to first visit on error
    }
  }

  /**
   * 检查用户是否有活动会话（已进入并未超时）
   * @returns {boolean} 如果会话处于活动状态则返回 true
   */
  static hasActiveSession() {
    try {
      const hasEntered = this.safeStorageOperation('get', 'session', this.STORAGE_KEYS.HAS_ENTERED)
      const entryTimestamp = this.safeStorageOperation('get', 'local', this.STORAGE_KEYS.ENTRY_TIMESTAMP)

      if (hasEntered !== 'true' || !entryTimestamp) {
        return false
      }

      // Validate timestamp format
      const lastEntry = parseInt(entryTimestamp, 10)
      if (isNaN(lastEntry) || lastEntry <= 0) {
        console.warn('SessionManager: Invalid timestamp detected, clearing corrupted session')
        this.clearSession()
        return false
      }

      // Check if session has timed out
      const now = Date.now()

      if (now - lastEntry > this.SESSION_TIMEOUT) {
        // Session expired, clear it
        this.clearSession()
        return false
      }

      return true
    } catch (error) {
      console.warn('SessionManager.hasActiveSession: Error checking session', error)
      return false
    }
  }

  /**
   * 标记用户已进入博客
   * 设置会话标记和时间戳
   * 当用户点击“进入博客”按钮时调用此方法
   */
  static markAsEntered() {
    try {
      const sessionId = this.generateSessionId()
      const timestamp = Date.now().toString()

      // Set HAS_ENTERED in sessionStorage - this is the key flag for refresh detection
      this.safeStorageOperation('set', 'session', this.STORAGE_KEYS.HAS_ENTERED, 'true')
      this.safeStorageOperation('set', 'session', this.STORAGE_KEYS.SESSION_ID, sessionId)

      // Clear the SHOW_ENTRY flag since user has now entered
      this.safeStorageOperation('set', 'session', this.STORAGE_KEYS.SHOW_ENTRY, 'false')

      // Store timestamp in localStorage for session timeout tracking
      this.safeStorageOperation('set', 'local', this.STORAGE_KEYS.ENTRY_TIMESTAMP, timestamp)
      this.safeStorageOperation('set', 'local', this.STORAGE_KEYS.SESSION_ID, sessionId)

      console.log('SessionManager.markAsEntered: User marked as entered with session ID:', sessionId)
    } catch (error) {
      console.error('SessionManager.markAsEntered: Error marking user as entered', error)
      // Don't throw - allow the application to continue functioning
    }
  }

  /**
   * 清除所有会话数据
   * 用于注销、超时或错误恢复
   */
  static clearSession() {
    try {
      // Clear sessionStorage
      Object.values(this.STORAGE_KEYS).forEach(key => {
        sessionStorage.removeItem(key)
      })

      // Clear localStorage (except page load marker which is session-specific)
      localStorage.removeItem(this.STORAGE_KEYS.ENTRY_TIMESTAMP)
      localStorage.removeItem(this.STORAGE_KEYS.SESSION_ID)

      console.log('SessionManager: Session data cleared')
    } catch (error) {
      console.error('SessionManager: Error clearing session data', error)
    }
  }

  /**
   * 获取当前会话 ID
   * @returns {string|null} 当前会话 ID，如果没有活动会话则返回 null
   */
  static getCurrentSessionId() {
    try {
      return this.safeStorageOperation('get', 'session', this.STORAGE_KEYS.SESSION_ID) ||
        this.safeStorageOperation('get', 'local', this.STORAGE_KEYS.SESSION_ID)
    } catch (error) {
      console.warn('SessionManager: Error getting session ID', error)
      return null
    }
  }

  /**
   * 获取会话信息用于调试
   * @returns {object} 会话状态信息
   */
  static getSessionInfo() {
    try {
      const hasEntered = this.safeStorageOperation('get', 'session', this.STORAGE_KEYS.HAS_ENTERED)
      const showEntry = this.safeStorageOperation('get', 'session', this.STORAGE_KEYS.SHOW_ENTRY)
      const sessionId = this.getCurrentSessionId()
      const entryTimestamp = this.safeStorageOperation('get', 'local', this.STORAGE_KEYS.ENTRY_TIMESTAMP)

      const now = Date.now()
      const lastEntry = entryTimestamp ? parseInt(entryTimestamp, 10) : null
      const timeUntilExpiry = lastEntry ? this.SESSION_TIMEOUT - (now - lastEntry) : null

      return {
        hasEntered: hasEntered === 'true',
        showEntry: showEntry === 'true',
        sessionId,
        entryTimestamp: lastEntry,
        timeUntilExpiry,
        isExpired: timeUntilExpiry !== null && timeUntilExpiry <= 0,
        isFirstVisit: this.isFirstVisit(),
        hasActiveSession: this.hasActiveSession()
      }
    } catch (error) {
      console.error('SessionManager: Error getting session info', error)
      return {
        error: error.message,
        hasEntered: false,
        showEntry: true,
        hasActiveSession: false,
        isFirstVisit: true
      }
    }
  }

  /**
   * 更新进入时间戳以延长会话
   * 用于保持活跃用户的登录状态
   */
  static extendSession() {
    try {
      if (this.hasActiveSession()) {
        const timestamp = Date.now().toString()
        this.safeStorageOperation('set', 'local', this.STORAGE_KEYS.ENTRY_TIMESTAMP, timestamp)
        console.log('SessionManager: Session extended')
        return true
      }
      return false
    } catch (error) {
      console.error('SessionManager: Error extending session', error)
      return false
    }
  }

  /**
   * 验证会话数据完整性
   * @returns {object} 包含状态和问题的验证结果
   */
  static validateSessionData() {
    const validation = {
      isValid: true,
      issues: [],
      canRecover: true
    }

    try {
      // Check if storage is available
      if (typeof Storage === 'undefined') {
        validation.isValid = false
        validation.canRecover = false
        validation.issues.push('Browser storage not supported')
        return validation
      }

      // Test storage accessibility
      try {
        sessionStorage.setItem('test', 'test')
        sessionStorage.removeItem('test')
      } catch (error) {
        validation.isValid = false
        validation.issues.push('sessionStorage not accessible: ' + error.message)
      }

      try {
        localStorage.setItem('test', 'test')
        localStorage.removeItem('test')
      } catch (error) {
        validation.isValid = false
        validation.issues.push('localStorage not accessible: ' + error.message)
      }

      // Validate existing session data format
      const entryTimestamp = localStorage.getItem(this.STORAGE_KEYS.ENTRY_TIMESTAMP)
      if (entryTimestamp && (isNaN(parseInt(entryTimestamp, 10)) || parseInt(entryTimestamp, 10) <= 0)) {
        validation.isValid = false
        validation.issues.push('Invalid entry timestamp format')
      }

      const sessionId = this.getCurrentSessionId()
      if (sessionId && (typeof sessionId !== 'string' || sessionId.length < 10)) {
        validation.isValid = false
        validation.issues.push('Invalid session ID format')
      }

      return validation
    } catch (error) {
      validation.isValid = false
      validation.canRecover = false
      validation.issues.push('Validation error: ' + error.message)
      return validation
    }
  }

  /**
   * 通过清除和重新初始化来从损坏的会话数据中恢复
   * 当会话检测失败时调用此方法
   */
  static recoverFromCorruptedSession() {
    try {
      console.log('SessionManager: Attempting to recover from corrupted session data')

      // Clear all potentially corrupted data
      this.clearSession()

      // Verify storage is working by testing write/read operations
      const testKey = 'blog_storage_test'
      const testValue = 'test_' + Date.now()

      // Test sessionStorage
      sessionStorage.setItem(testKey, testValue)
      const sessionTest = sessionStorage.getItem(testKey)
      sessionStorage.removeItem(testKey)

      if (sessionTest !== testValue) {
        throw new Error('sessionStorage is not functioning properly')
      }

      // Test localStorage
      localStorage.setItem(testKey, testValue)
      const localTest = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)

      if (localTest !== testValue) {
        throw new Error('localStorage is not functioning properly')
      }

      console.log('SessionManager: Storage recovery successful')
      return true
    } catch (error) {
      console.error('SessionManager: Storage recovery failed', error)
      throw new Error(`Session recovery failed: ${error.message}`)
    }
  }

  /**
   * 带有回退处理的安全存储操作包装器
   * @param {string} operation - 'get', 'set', 或 'remove'
   * @param {string} storageType - 'session' 或 'local'
   * @param {string} key - 存储键
   * @param {string} value - 用于 set 操作的值
   * @returns {any} 操作结果或失败时返回 null
   */
  static safeStorageOperation(operation, storageType, key, value = null) {
    try {
      const storage = storageType === 'session' ? sessionStorage : localStorage

      switch (operation) {
        case 'get':
          return storage.getItem(key)
        case 'set':
          storage.setItem(key, value)
          return true
        case 'remove':
          storage.removeItem(key)
          return true
        default:
          throw new Error(`Unknown operation: ${operation}`)
      }
    } catch (error) {
      console.warn(`SessionManager: Safe storage operation failed (${operation} ${storageType} ${key})`, error)
      return null
    }
  }
}

export default SessionManager