const META = {
  bp:     { label:'BP',         unit:'mmHg', icon:'❤️',  color:'bg-red-50 border-red-100 text-red-800'      },
  pulse:  { label:'Pulse',      unit:'bpm',  icon:'💓',  color:'bg-rose-50 border-rose-100 text-rose-800'   },
  temp:   { label:'Temp',       unit:'°F',   icon:'🌡️', color:'bg-orange-50 border-orange-100 text-orange-800'},
  weight: { label:'Weight',     unit:'',     icon:'⚖️',  color:'bg-blue-50 border-blue-100 text-blue-800'   },
  spo2:   { label:'SpO₂',       unit:'%',    icon:'🫁',  color:'bg-teal-50 border-teal-100 text-teal-800'   },
  rr:     { label:'Resp. Rate', unit:'/min', icon:'🌬️', color:'bg-sky-50 border-sky-100 text-sky-800'       },
}
export default function VitalChip({ keyName, value }) {
  const m = META[keyName?.toLowerCase()] || { label:keyName, unit:'', icon:'📊', color:'bg-slate-50 border-slate-100 text-slate-700' }
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${m.color}`}>
      <span className="text-base leading-none">{m.icon}</span>
      <div>
        <p className="text-[10px] font-semibold opacity-60 leading-none">{m.label}</p>
        <p className="text-sm font-bold leading-tight">{value}<span className="text-[10px] font-normal ml-0.5">{m.unit}</span></p>
      </div>
    </div>
  )
}
