import { memo } from 'react'

/**
 * Pagination — memoized UI component.
 *
 * Props:
 *   page      — current 1-based page
 *   total     — total number of items
 *   perPage   — items per page
 *   onChange  — (newPage: number) => void
 *
 * Pair with usePagination hook for full functionality.
 */
const Pagination = memo(function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Showing{' '}
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)}
        </span>
        {' '}of{' '}
        <span className="font-semibold text-slate-600 dark:text-slate-300">{total}</span>
      </p>
      <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300
                     focus-visible:ring-2 focus-visible:ring-brand-400 outline-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm" aria-hidden="true">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                focus-visible:ring-2 focus-visible:ring-brand-400 outline-none
                ${p === page
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300
                     focus-visible:ring-2 focus-visible:ring-brand-400 outline-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  )
})

export default Pagination
