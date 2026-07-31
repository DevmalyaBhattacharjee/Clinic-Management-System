import { memo, useCallback } from 'react'

const SearchBar = memo(function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search…',
  children,
  className   = '',
  noPad       = false,
}) {
  const handleClear = useCallback(() => {
    if (onClear) onClear()
    else onChange('')
  }, [onClear, onChange])

  return (
    <div className={`flex flex-wrap items-center gap-3 ${noPad ? '' : 'mb-4'} ${className}`}>
      <div className="relative flex-1 min-w-[180px] max-w-sm">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="input pl-10 pr-9"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        )}
      </div>
      {children}
    </div>
  )
})

export default SearchBar
