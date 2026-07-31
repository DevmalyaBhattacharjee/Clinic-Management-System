import { useState, useMemo, useCallback } from 'react'

/**
 * Generic list filter hook.
 *
 * @param {Array}    data        — full data array
 * @param {Function} filterFn   — (item, filters) => boolean
 * @param {Object}   initial    — initial filter values
 *
 * Usage:
 *   const { filtered, filters, setFilter, clearFilters } = useFilter(
 *     patients,
 *     (p, f) =>
 *       (f.status === 'ALL' || p.status === f.status) &&
 *       (!f.search || p.name.toLowerCase().includes(f.search.toLowerCase())),
 *     { status: 'ALL', search: '' }
 *   )
 */
export function useFilter(data = [], filterFn, initial = {}) {
  const [filters, setFilters] = useState(initial)

  const filtered = useMemo(
    () => data.filter(item => filterFn(item, filters)),
    [data, filters, filterFn]
  )

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => setFilters(initial), [initial])

  const isFiltered = JSON.stringify(filters) !== JSON.stringify(initial)

  return { filtered, filters, setFilter, setFilters, clearFilters, isFiltered }
}
