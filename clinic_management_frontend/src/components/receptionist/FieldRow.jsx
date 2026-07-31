export default function FieldRow({ label, value, mono = false, highlight = false }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-brand-700' : 'text-slate-800'} ${mono ? 'font-mono' : ''}`}>
        {value || <span className="text-slate-300 italic font-normal text-xs">—</span>}
      </span>
    </div>
  )
}
