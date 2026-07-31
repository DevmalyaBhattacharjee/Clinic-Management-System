/**
 * Skeleton — shimmer placeholder for loading states.
 *
 * <Skeleton />               — single line
 * <Skeleton type="card" />   — card block
 * <Skeleton type="table" rows={5} />
 * <Skeleton type="stat" />   — stat card
 * <Skeleton type="avatar" /> — circle avatar
 */
function ShimmerBar({ h = 'h-4', w = 'w-full', rounded = 'rounded-lg' }) {
  return (
    <div className={`${h} ${w} ${rounded} skeleton`} />
  )
}

export default function Skeleton({ type = 'line', rows = 3, count = 1, className = '' }) {
  if (type === 'avatar') {
    return <div className={`w-10 h-10 rounded-full skeleton ${className}`} />
  }

  if (type === 'stat') {
    return (
      <div className={`card space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <ShimmerBar h="h-4" w="w-24" />
          <div className="w-9 h-9 rounded-xl skeleton" />
        </div>
        <ShimmerBar h="h-8" w="w-32" />
        <ShimmerBar h="h-3" w="w-20" />
      </div>
    )
  }

  if (type === 'card') {
    return (
      <div className={`card space-y-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <ShimmerBar h="h-4" w="w-3/4" />
            <ShimmerBar h="h-3" w="w-1/2" />
          </div>
        </div>
        <ShimmerBar h="h-3" />
        <ShimmerBar h="h-3" w="w-5/6" />
        <ShimmerBar h="h-3" w="w-4/6" />
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className={`space-y-2 ${className}`}>
        <ShimmerBar h="h-10" rounded="rounded-xl" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <ShimmerBar h="h-4" w="w-24" />
            <ShimmerBar h="h-4" w="w-32" />
            <ShimmerBar h="h-4" w="w-20" />
            <ShimmerBar h="h-4" w="w-28" />
            <ShimmerBar h="h-4" w="w-16 ml-auto" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <ShimmerBar h="h-3.5" w="w-3/4" />
              <ShimmerBar h="h-2.5" w="w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // default: lines
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerBar key={i} h="h-4" w={i === count - 1 ? 'w-3/4' : 'w-full'} />
      ))}
    </div>
  )
}
