/**
 * Parses and displays vital signs from a JSON string field.
 * e.g. '{"bp":"140/90","pulse":"85","temp":"98.6","weight":"70kg"}'
 */
const VITALS_META = {
  bp:     { label: 'Blood Pressure', unit: 'mmHg', icon: '❤️' },
  pulse:  { label: 'Pulse',          unit: 'bpm',  icon: '💓' },
  temp:   { label: 'Temperature',    unit: '°F',   icon: '🌡️' },
  weight: { label: 'Weight',         unit: '',     icon: '⚖️' },
  spo2:   { label: 'SpO₂',           unit: '%',    icon: '🫁' },
  rr:     { label: 'Resp. Rate',     unit: '/min', icon: '🌬️' },
}

export default function VitalSignsDisplay({ vitalSigns }) {
  if (!vitalSigns) return null
  let data = {}
  try { data = JSON.parse(vitalSigns) } catch { return <p className="text-xs text-slate-400 italic">Invalid vitals format</p> }
  const entries = Object.entries(data)
  if (!entries.length) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {entries.map(([key, value]) => {
        const meta = VITALS_META[key.toLowerCase()] || { label: key, unit: '', icon: '📊' }
        return (
          <div key={key} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">{meta.icon}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{meta.label}</span>
            </div>
            <p className="text-sm font-bold text-slate-800">{value}<span className="text-xs text-slate-400 font-normal ml-0.5">{meta.unit}</span></p>
          </div>
        )
      })}
    </div>
  )
}
