import { useState, useEffect, useCallback, useRef } from 'react'
import { parseApiError } from '../utils/helpers'

/**
 * Generic API hook.
 *
 * @param {Function} apiFn     — function returning a Promise (axios call)
 * @param {Object}   options
 *   immediate    {boolean}  — call on mount (default: true)
 *   initialData  {any}      — initial value AND the null-safety fallback.
 *                             If the API returns null (some backends do this
 *                             for empty lists), we fall back to initialData
 *                             so callers never receive null when they passed
 *                             initialData: [].
 *
 * @returns { data, loading, error, execute, reset, setData }
 */
export function useApi(apiFn, { immediate = true, initialData = undefined } = {}) {
  const [data,    setData]    = useState(initialData)
  const [loading, setLoading] = useState(!!immediate)
  const [error,   setError]   = useState(null)

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const execute = useCallback(async (...args) => {
    if (!mountedRef.current) return
    setLoading(true)
    setError(null)
    try {
      const response = await apiFn(...args)
      const raw = response?.data ?? response

      // If the backend returns null (e.g. empty list represented as null),
      // fall back to initialData rather than storing null.
      // This prevents `.reduce()`, `.filter()`, `.length` crashes downstream.
      const result = raw === null || raw === undefined ? initialData : raw

      if (mountedRef.current) setData(result)
      return result
    } catch (err) {
      const msg = parseApiError(err)
      if (mountedRef.current) {
        setError(msg)
        // Reset to initialData on error so array defaults work even after failure
        setData(initialData)
      }
      throw err
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [apiFn, initialData])

  useEffect(() => {
    if (immediate) execute()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reset = useCallback(() => {
    setData(initialData)
    setError(null)
    setLoading(false)
  }, [initialData])

  return { data, loading, error, execute, reset, setData }
}

/**
 * Mutation hook (POST / PUT / PATCH / DELETE).
 * Does NOT auto-run on mount.
 */
export function useMutation(apiFn) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiFn(...args)
      return response?.data ?? response
    } catch (err) {
      const msg = parseApiError(err)
      if (mountedRef.current) setError(msg)
      throw err
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [apiFn])

  const reset = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  return { mutate, loading, error, reset }
}
