/**
 * 节流 composable
 * @param {Function} fn - 需要节流的函数
 * @param {number} delay - 节流间隔（毫秒）
 * @returns {Function} 节流后的函数
 */
export function useThrottle(fn, delay = 100) {
  let lastCall = 0
  let timeoutId = null

  return function (...args) {
    const now = Date.now()
    const remaining = delay - (now - lastCall)

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastCall = now
      fn.apply(this, args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        timeoutId = null
        fn.apply(this, args)
      }, remaining)
    }
  }
}
