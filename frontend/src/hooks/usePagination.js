import { useState, useMemo, useCallback } from 'react'

/**
 * Client-side pagination hook.
 *
 * @param {Array}  data     — full array to paginate
 * @param {number} perPage  — items per page (default 10)
 *
 * @returns {
 *   page, setPage, totalPages,
 *   paginated,           — current page's slice
 *   goNext, goPrev,
 *   goFirst, goLast,
 *   resetPage,
 *   rangeStart, rangeEnd, totalItems
 * }
 *
 * Usage:
 *   const { paginated, page, setPage, totalPages } = usePagination(filteredList, 10)
 */
export function usePagination(data = [], perPage = 10) {
  const [page, setPageRaw] = useState(1)

  const totalItems = data.length
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))

  // Clamp page to valid range when data changes
  const page_ = Math.min(page, totalPages)

  const paginated = useMemo(
    () => data.slice((page_ - 1) * perPage, page_ * perPage),
    [data, page_, perPage]
  )

  const setPage     = useCallback((p) => setPageRaw(Math.max(1, Math.min(p, totalPages))), [totalPages])
  const goNext      = useCallback(() => setPage(page_ + 1), [page_, setPage])
  const goPrev      = useCallback(() => setPage(page_ - 1), [page_, setPage])
  const goFirst     = useCallback(() => setPage(1),          [setPage])
  const goLast      = useCallback(() => setPage(totalPages), [setPage, totalPages])
  const resetPage   = useCallback(() => setPageRaw(1),       [])

  const rangeStart = totalItems === 0 ? 0 : (page_ - 1) * perPage + 1
  const rangeEnd   = Math.min(page_ * perPage, totalItems)

  return {
    page: page_,
    setPage,
    totalPages,
    paginated,
    goNext,
    goPrev,
    goFirst,
    goLast,
    resetPage,
    rangeStart,
    rangeEnd,
    totalItems,
  }
}
