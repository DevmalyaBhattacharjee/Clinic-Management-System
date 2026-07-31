export default function Spinner({ size = 'md', color = 'brand' }) {
  const sizes = { sm:'w-4 h-4 border-2', md:'w-7 h-7 border-2', lg:'w-10 h-10 border-[3px]', xl:'w-14 h-14 border-4' }
  const colors = { brand:'border-brand-600 border-t-transparent', white:'border-white border-t-transparent', slate:'border-slate-400 border-t-transparent' }
  return (
    <div className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`} role="status">
      <span className="sr-only">Loading…</span>
    </div>
  )
}
