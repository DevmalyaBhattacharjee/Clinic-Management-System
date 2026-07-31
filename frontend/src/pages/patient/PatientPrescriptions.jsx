import { useState, useCallback, useMemo } from 'react'
import { useApi } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import patientService from '../../services/patientService'
import { formatDate } from '../../utils/helpers'
import Pagination from '../../components/common/Pagination'
import { useTitle } from '../../hooks/useTitle'

const PER_PAGE = 9

/* ── Rx card ── */
function PrescriptionCard({ prx, onClick }) {
  const daysLeft = prx.isActive && prx.prescriptionDate && prx.duration
    ? Math.max(0, prx.duration - Math.floor((new Date() - new Date(prx.prescriptionDate)) / 86400000))
    : null

  return (
    <div
      onClick={() => onClick(prx)}
      className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all hover:shadow-card-hover
        ${prx.isActive ? 'border-emerald-200 hover:border-emerald-300' : 'border-slate-100 opacity-70 hover:border-slate-200'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">💊</div>
        <span className={`badge flex-shrink-0 ${prx.isActive ? 'badge-green' : 'badge-slate'}`}>
          {prx.isActive ? 'Active' : 'Ended'}
        </span>
      </div>
      <p className="font-bold text-slate-800 text-sm leading-tight">{prx.medicationName}</p>
      <p className="text-xs text-brand-600 font-semibold mt-0.5">{prx.dosage}</p>
      <p className="text-xs text-slate-400 mt-1">{prx.frequency} · {prx.route || 'Oral'}</p>
      {prx.isActive && daysLeft !== null && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Progress</span>
            <span>{daysLeft} days left</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${daysLeft < 5 ? 'bg-red-400' : daysLeft < 10 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${Math.max(5, Math.min(100, (daysLeft / prx.duration) * 100))}%` }}
            />
          </div>
        </div>
      )}
      <p className="text-[10px] text-slate-400 mt-2">By {prx.doctorName} · {formatDate(prx.prescriptionDate)}</p>
    </div>
  )
}

export default function PatientPrescriptions() {
  useTitle('My Prescriptions')
  const { data: allPrx = [], loading } = useApi(useCallback(() => patientService.getPrescriptions(), []), { initialData: [] })
  const [filter,   setFilter]   = useState('ACTIVE')
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    let list = (Array.isArray(allPrx) ? allPrx : [])
    if (filter === 'ACTIVE')   list = list.filter(p =>  p.isActive)
    if (filter === 'INACTIVE') list = list.filter(p => !p.isActive)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.medicationName?.toLowerCase().includes(q) ||
        p.doctorName?.toLowerCase().includes(q)
      )
    }
    return list
  }, [allPrx, filter, search])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)
  const active     = useMemo(() => allPrx.filter(p=>p.isActive).length, [allPrx])
  const ended      = useMemo(() => allPrx.filter(p=>!p.isActive).length, [allPrx])

  return (
    <div className="space-y-5">
      <PageHeader title="Prescriptions" subtitle="All medications prescribed by your doctors"/>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Total',  value: allPrx.length, color:'bg-brand-50 text-brand-700 border-brand-100' },
          { label:'Active', value: active,         color:'bg-emerald-50 text-emerald-700 border-emerald-100' },
          { label:'Ended',  value: ended,          color:'bg-slate-50 text-slate-600 border-slate-200' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border rounded-xl px-4 py-3 ${color}`}>
            <p className="text-2xl font-bold">{loading ? '…' : value}</p>
            <p className="text-xs mt-0.5 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {[['ACTIVE','Active'],['INACTIVE','Ended'],['ALL','All']].map(([v,l]) => (
            <button key={v} onClick={()=>{setFilter(v);setPage(1)}}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                ${filter===v?'bg-white text-slate-800 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
            placeholder="Search medication doctor…" className="input pl-10"/>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({length:6}).map((_,i)=><div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : !paginated.length ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-3">💊</p>
          <p className="text-slate-500 font-medium">
            {search ? 'No prescriptions match your search' : filter==='ACTIVE' ? 'No active prescriptions' : 'No prescriptions found'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginated.map(p => (
              <PrescriptionCard key={p.id} prx={p} onClick={setSelected}/>
            ))}
          </div>
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage}/>
        </>
      )}

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Prescription Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border-2 ${selected.isActive ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">💊</div>
                <div>
                  <p className="font-black text-slate-800 text-xl">{selected.medicationName}</p>
                  <p className="text-sm font-bold text-brand-700">{selected.dosage}</p>
                  <span className={`badge mt-1 ${selected.isActive ? 'badge-green' : 'badge-slate'}`}>
                    {selected.isActive ? 'Active' : 'Ended'}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Frequency',   selected.frequency],
                ['Duration',    `${selected.duration} days`],
                ['Route',       selected.route || 'Oral'],
                ['Prescribed by',selected.doctorName],
                ['Date',        formatDate(selected.prescriptionDate)],
                ['Record ID',   selected.medicalRecordId ? `#${selected.medicalRecordId}` : '—'],
              ].map(([l,v]) => (
                <div key={l} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">{l}</p>
                  <p className="text-sm font-semibold text-slate-800">{v || '—'}</p>
                </div>
              ))}
            </div>
            {selected.instructions && (
              <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl">
                <p className="text-xs font-semibold text-brand-600 mb-1">Instructions</p>
                <p className="text-sm text-slate-700">{selected.instructions}</p>
              </div>
            )}
            {selected.precautions && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 mb-1">⚠ Precautions</p>
                <p className="text-sm text-slate-700">{selected.precautions}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
