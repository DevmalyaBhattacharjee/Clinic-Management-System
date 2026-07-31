import { useState, useCallback, useMemo } from 'react'
import { useApi } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import VitalChip from '../../components/patient/VitalChip'
import patientService from '../../services/patientService'
import { formatDate } from '../../utils/helpers'
import { useTitle } from '../../hooks/useTitle'

const SEARCH_PH = 'Search by complaint diagnosis doctor…'

/* ── Medical timeline entry ── */
function TimelineEntry({ record, onClick, isFirst }) {
  return (
    <div className="flex gap-4">
      {/* Spine */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-brand-500 ring-4 ring-brand-100 mt-1.5 flex-shrink-0"/>
        {!isFirst && <div className="w-0.5 flex-1 bg-slate-100 mt-1"/>}
      </div>
      {/* Card */}
      <div
        onClick={() => onClick(record)}
        className="flex-1 mb-4 bg-white rounded-2xl border border-slate-100 shadow-card p-4 cursor-pointer hover:shadow-card-hover hover:border-brand-200 transition-all"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="font-bold text-slate-800">{record.chiefComplaint}</p>
            <p className="text-xs text-slate-400 mt-0.5">Dr. {record.doctorName} · {formatDate(record.visitDate)}</p>
          </div>
          {record.followUpDate && (
            <span className="badge-green badge flex-shrink-0">Follow-up {formatDate(record.followUpDate)}</span>
          )}
        </div>
        {record.diagnosis && (
          <p className="text-sm text-brand-700 font-semibold mt-1">
            <span className="text-slate-400 font-normal">Dx: </span>{record.diagnosis}
          </p>
        )}
        {record.symptoms && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            <span className="font-medium">Sx: </span>{record.symptoms}
          </p>
        )}
        {record.vitalSigns && (() => {
          try {
            const v = JSON.parse(record.vitalSigns)
            const entries = Object.entries(v).slice(0,3)
            return entries.length ? (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {entries.map(([k,val]) => <VitalChip key={k} keyName={k} value={val}/>)}
              </div>
            ) : null
          } catch { return null }
        })()}
      </div>
    </div>
  )
}

export default function PatientRecords() {
  useTitle('Medical Records')
  const { data: records = [], loading } = useApi(useCallback(() => patientService.getMedicalRecords(), []), { initialData: [] })
  const [search,    setSearch]    = useState('')
  const [yearFilter,setYearFilter]= useState('ALL')
  const [selected,  setSelected]  = useState(null)

  /* ── Derived ── */
  const years = useMemo(() => {
    const ys = [...new Set(records.map(r => r.visitDate?.slice(0,4)).filter(Boolean))].sort((a,b)=>b-a)
    return ['ALL', ...ys]
  }, [records])

  const filtered = useMemo(() => {
    let list = (Array.isArray(records) ? records : [])
    if (yearFilter !== 'ALL') list = list.filter(r => r.visitDate?.startsWith(yearFilter))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.chiefComplaint?.toLowerCase().includes(q) ||
        r.diagnosis?.toLowerCase().includes(q) ||
        r.doctorName?.toLowerCase().includes(q) ||
        r.symptoms?.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a,b) => b.visitDate?.localeCompare(a.visitDate))
  }, [records, search, yearFilter])

  /* ── Vitals parser for detail modal ── */
  const parseVitals = (raw) => {
    if (!raw) return {}
    try { return JSON.parse(raw) } catch { return {} }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Medical Records"
        subtitle={`${records.length} records on file — read-only view`}
      />

      {/* ── Summary row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Total Records',  value: records.length,                                                     color:'bg-violet-50 text-violet-700 border-violet-100' },
          { label:'With Diagnosis', value: records.filter(r=>r.diagnosis).length,                             color:'bg-brand-50 text-brand-700 border-brand-100'   },
          { label:'Follow-ups',     value: records.filter(r=>r.followUpDate).length,                          color:'bg-emerald-50 text-emerald-700 border-emerald-100'},
          { label:'Doctors Seen',   value: new Set(records.map(r=>r.doctorId)).size,                          color:'bg-amber-50 text-amber-700 border-amber-100'   },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border rounded-xl px-4 py-3 ${color}`}>
            <p className="text-2xl font-bold">{loading ? '…' : value}</p>
            <p className="text-xs mt-0.5 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Search + year filter ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={SEARCH_PH} className="input pl-10"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {years.map(y => (
            <button key={y} onClick={() => setYearFilter(y)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${yearFilter===y ? 'bg-brand-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* ── Timeline ── */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse"/>)}</div>
      ) : !filtered.length ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-3">📋</p>
          <p className="text-slate-500 font-medium">{search||yearFilter!=='ALL' ? 'No records match your filters' : 'No medical records on file yet'}</p>
          {(search||yearFilter!=='ALL') && (
            <button onClick={()=>{setSearch('');setYearFilter('ALL')}} className="text-brand-600 text-sm mt-2 hover:text-brand-700">Clear filters</button>
          )}
        </div>
      ) : (
        <div className="pl-2">
          {filtered.map((r, i) => (
            <TimelineEntry key={r.id} record={r} onClick={setSelected} isFirst={i===filtered.length-1}/>
          ))}
        </div>
      )}

      {/* ── Detail Modal ── */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Medical Record" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold text-slate-800 text-lg">{selected.chiefComplaint}</p>
                <p className="text-sm text-slate-400 mt-0.5">Dr. {selected.doctorName} · {formatDate(selected.visitDate)}</p>
              </div>
              {selected.followUpDate && (
                <span className="badge-green badge ml-3 flex-shrink-0">Follow-up: {formatDate(selected.followUpDate)}</span>
              )}
            </div>

            {/* Key details grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ['Diagnosis',     selected.diagnosis],
                ['Symptoms',      selected.symptoms],
                ['Treatment Plan',selected.treatmentPlan],
                ['Lab Tests',     selected.labTests],
              ].filter(([,v]) => v).map(([l,v]) => (
                <div key={l} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{l}</p>
                  <p className="text-sm text-slate-800 leading-relaxed">{v}</p>
                </div>
              ))}
            </div>

            {/* Vitals */}
            {selected.vitalSigns && (() => {
              const vitals = parseVitals(selected.vitalSigns)
              const entries = Object.entries(vitals)
              if (!entries.length) return null
              return (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Vital Signs</p>
                  <div className="flex flex-wrap gap-2">
                    {entries.map(([k,v]) => <VitalChip key={k} keyName={k} value={v}/>)}
                  </div>
                </div>
              )
            })()}

            {/* Notes */}
            {selected.notes && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 mb-1">Doctor's Notes</p>
                <p className="text-sm text-slate-700 leading-relaxed">{selected.notes}</p>
              </div>
            )}

            {/* Allergies alert if present in record */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
              <span>Record ID: #{selected.id}</span>
              <span>·</span>
              <span>Appointment: #{selected.appointmentId || '—'}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
