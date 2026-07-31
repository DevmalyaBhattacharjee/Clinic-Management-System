import { memo } from 'react'

const EmptyState = memo(function EmptyState({
  icon    = '📭',
  title   = 'Nothing here yet',
  message,
  action,
  compact = false,
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-16'}`}
         role="status" aria-label={title}>
      {!compact && (
        <span className="text-5xl mb-3 select-none" role="img" aria-label={title}>{icon}</span>
      )}
      <p className="font-medium text-slate-500 dark:text-slate-400">{title}</p>
      {message && <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">{message}</p>}
      {action  && <div className="mt-4">{action}</div>}
    </div>
  )
})

export default EmptyState
