import { useState, useEffect } from 'react'

/**
 * Debounces a value — delays updating until the user stops changing it.
 *
 * @param {any}    value   — The value to debounce
 * @param {number} delay   — Milliseconds to wait (default 300)
 * @returns The debounced value
 *
 * Usage:
 *   const debouncedSearch = useDebounce(search, 400)
 *   useEffect(() => { fetchResults(debouncedSearch) }, [debouncedSearch])
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
