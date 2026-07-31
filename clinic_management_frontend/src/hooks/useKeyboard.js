import { useEffect, useCallback } from 'react'

/**
 * Register keyboard shortcuts declaratively.
 *
 * @param {Object} shortcuts — map of "Key" or "ctrl+k" → handler function
 * @param {boolean} enabled  — toggle shortcuts off (e.g. when modal is open)
 *
 * Usage:
 *   useKeyboard({
 *     'ctrl+k': () => setSearchOpen(true),
 *     'Escape': () => setOpen(false),
 *     'n':      () => setCreateOpen(true),
 *   })
 */
export function useKeyboard(shortcuts = {}, enabled = true) {
  const handler = useCallback((e) => {
    if (!enabled) return

    // Build key string
    const parts = []
    if (e.ctrlKey || e.metaKey) parts.push('ctrl')
    if (e.shiftKey)              parts.push('shift')
    if (e.altKey)                parts.push('alt')
    parts.push(e.key.toLowerCase())
    const combo = parts.join('+')

    const fn = shortcuts[combo] || shortcuts[e.key]
    if (fn) {
      // Don't fire when user is typing in an input
      const tag = e.target?.tagName
      if (['INPUT','TEXTAREA','SELECT'].includes(tag) && !['Escape','ctrl+k'].includes(combo)) return
      e.preventDefault()
      fn(e)
    }
  }, [shortcuts, enabled])

  useEffect(() => {
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handler])
}
