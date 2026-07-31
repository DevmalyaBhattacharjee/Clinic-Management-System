/**
 * Loader — full-area skeleton/spinner replacing 9+ inline loading spinners.
 *
 * Props:
 *   type     'spinner' | 'skeleton' | 'rows' | 'cards'  (default: 'spinner')
 *   count    number of skeleton items (default 3)
 *   text     label shown next to spinner (default 'Loading…')
 *   fullPage centres in full viewport
 */
import Spinner from './Spinner'

function SkeletonCard() {
  return <div className="h-24 bg-slate-100 rounded-2xl animate-pulse"/>
}
function SkeletonRow() {
  return <div className="h-14 bg-slate-100 rounded-xl animate-pulse"/>
}

export default function Loader({
  type     = 'spinner',
  count    = 3,
  text     = 'Loading…',
  fullPage = false,
}) {
  if (type === 'skeleton' || type === 'cards') {
    return (
      <div className={`grid ${type === 'cards' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-3`}>
        {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i}/>)}
      </div>
    )
  }

  if (type === 'rows') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => <SkeletonRow key={i}/>)}
      </div>
    )
  }

  // default: centred spinner
  return (
    <div className={`flex items-center justify-center gap-3 ${fullPage ? 'min-h-screen' : 'py-16'}`}>
      <Spinner size="md"/>
      <span className="text-sm text-slate-400">{text}</span>
    </div>
  )
}
