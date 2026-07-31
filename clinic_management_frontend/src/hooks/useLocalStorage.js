import { useState, useCallback, useEffect } from 'react'

/**
 * Persistent state backed by localStorage with JSON serialisation.
 * Safe: catches JSON parse errors, handles SSR.
 *
 * Usage:
 *   const [value, setValue, remove] = useLocalStorage('my-key', defaultValue)
 */
export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const toStore = value instanceof Function ? value(stored) : value
      setStored(toStore)
      localStorage.setItem(key, JSON.stringify(toStore))
    } catch (err) {
      console.warn(`useLocalStorage: failed to set "${key}"`, err)
    }
  }, [key, stored])

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setStored(initialValue)
    } catch { /* noop */ }
  }, [key, initialValue])

  return [stored, setValue, remove]
}
