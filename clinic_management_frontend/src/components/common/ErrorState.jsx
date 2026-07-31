/**
 * ErrorState — extracted from inline error divs across pages.
 *
 * Props:
 *   message  human-readable error string
 *   onRetry  optional retry callback — shows "Try again" button
 *   compact  smaller variant for inside cards
 */
export default function ErrorState({ message, onRetry, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-6' : 'py-14'}`}>
      {!compact && <span className="text-5xl mb-3 select-none" role="img" aria-label="Error">⚠️</span>}
      <p className="font-semibold text-red-600">{message || 'Something went wrong'}</p>
      <p className="text-sm text-slate-400 mt-1">Please check your connection and try again.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 btn btn-secondary btn-sm"
        >
          Try again
        </button>
      )}
    </div>
  )
}
