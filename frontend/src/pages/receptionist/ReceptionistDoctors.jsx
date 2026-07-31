import { useState, useCallback, useMemo } from 'react'
import { useApi } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import Avatar from '../../components/common/Avatar'
import FieldRow from '../../components/receptionist/FieldRow'
import receptionistService from '../../services/receptionistService'
import { formatCurrency, formatTime } from '../../utils/helpers'
import { useTitle } from '../../hooks/useTitle'

const DAY_ABBR = { MON:'Mon', TUE:'Tue', WED:'Wed', THU:'Thu', FRI:'Fri', SAT:'Sat', SUN:'Sun' }
const DAY_ALL  = ['MON','TUE','WED','THU','FRI','SAT','SUN']

function AvailabilityBadge({ day, active }) {
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold transition-colors
      ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-300'}`}>
      {DAY_ABBR[day]}
    </div>
  )
}

export default function ReceptionistDoctors() {
  useTitle('Doctors')
  const { data: doctors=[], loading } = useApi(useCallback(() => receptionistService.getDoctors(), []), { initialData: [] })

  const [search,  setSearch]  = useState('')
  const [specF,   setSpecF]   = useState('ALL')
  const [viewDoc, setViewDoc] = useState(null)
  const [docAppts,setDocAppts]= useState([])
  const [loadingAppts,setLoadingAppts]= useState(false)

  const specializations = useMemo(() =>
    ['ALL', ...new Set(doctors.map(d=>d.specialization).filter(Boolean)).values()]
  , [doctors])

  const filtered = useMemo(() => {
    let list = (Array.isArray(doctors) ? doctors : [])
    if (specF !== 'ALL') list = list.filter(d => d.specialization === specF)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(d => d.name?.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q))
    }
    return list
  }, [doctors, search, specF])

  const openDoc = async (doc) => {
    setViewDoc(doc)
    setLoadingAppts(true)
    try {
      const res = await receptionistService.getAppointmentsByDoctor(doc.id)
      const today = new Date().toISOString().split('T')[0]
      setDocAppts((res.data||[]).filter(a=>a.appointmentDate>=today).slice(0,5))
    } catch { setDocAppts([]) }
    finally { setLoadingAppts(false) }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Doctors" subtitle={`${doctors.length} active doctors`}/>

      {/* Search + spec filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search doctor specialization…" className="input pl-10"/>
        </div>
        <select value={specF} onChange={e=>setSpecF(e.target.value)} className="input w-auto min-w-[180px]">
          {specializations.map(s=><option key={s} value={s}>{s==='ALL'?'All Specializations':s}</option>)}
        </select>
      </div>

      {/* Spec chips */}
      <div className="flex flex-wrap gap-2">
        {specializations.slice(0,8).map(s => (
          <button key={s} onClick={()=>setSpecF(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${specF===s?'bg-brand-600 text-white shadow-sm':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {s==='ALL'?'All':s}
          </button>
        ))}
      </div>

      {/* Doctor cards grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length:6}).map((_,i)=><div key={i} className="h-52 bg-slate-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : !filtered.length ? (
        <div className="card text-center py-14">
          <p className="text-5xl mb-3">🩺</p>
          <p className="text-slate-500 font-medium">{search||specF!=='ALL' ? 'No doctors match your filters' : 'No doctors found'}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => {
            const activeDays = new Set(doc.availableDays?.split(',').map(d=>d.trim()) || [])
            return (
              <button key={doc.id} onClick={() => openDoc(doc)}
                className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:border-brand-200 transition-all text-left overflow-hidden">
                {/* Gradient header */}
                <div className="h-2 bg-gradient-to-r from-brand-500 to-brand-400"/>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar name={doc.name} size="lg"/>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{doc.name}</p>
                      <p className="text-xs font-semibold text-brand-600">{doc.specialization}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{doc.qualification}</p>
                    </div>
                  </div>
                  {/* Availability days */}
                  <div className="flex gap-1 mb-3">
                    {DAY_ALL.map(d => <AvailabilityBadge key={d} day={d} active={activeDays.has(d)}/>)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      {doc.availableFrom?.slice(0,5)} – {doc.availableTo?.slice(0,5)}
                    </div>
                    {doc.consultationFee && (
                      <span className="font-black text-slate-800">₹{doc.consultationFee}</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Doctor Detail Modal ── */}
      <Modal open={!!viewDoc} onClose={() => setViewDoc(null)} title="Doctor Details" size="lg">
        {viewDoc && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-brand-50 to-violet-50 rounded-xl border border-brand-100">
              <Avatar name={viewDoc.name} size="xl"/>
              <div>
                <h3 className="font-bold text-slate-800 text-xl">{viewDoc.name}</h3>
                <p className="text-brand-600 font-semibold">{viewDoc.specialization}</p>
                <p className="text-xs text-slate-400">{viewDoc.qualification}</p>
                <span className="badge-green badge mt-1">{viewDoc.status}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-6">
              <FieldRow label="Email"       value={viewDoc.email}/>
              <FieldRow label="Phone"       value={viewDoc.phone}/>
              <FieldRow label="License No." value={viewDoc.licenseNumber} mono/>
              <FieldRow label="Experience"  value={viewDoc.yearsOfExperience ? `${viewDoc.yearsOfExperience} years` : null}/>
              <FieldRow label="Consult. Fee" value={viewDoc.consultationFee ? formatCurrency(viewDoc.consultationFee) : null} highlight/>
              <FieldRow label="Hours"       value={`${viewDoc.availableFrom?.slice(0,5) || '—'} – ${viewDoc.availableTo?.slice(0,5) || '—'}`}/>
            </div>

            {/* Availability calendar */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Weekly Availability</p>
              <div className="flex gap-2 flex-wrap">
                {DAY_ALL.map(d => {
                  const active = viewDoc.availableDays?.split(',').map(x=>x.trim()).includes(d)
                  return (
                    <div key={d} className={`flex-1 min-w-[40px] h-10 rounded-xl flex items-center justify-center text-xs font-bold
                      ${active ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200' : 'bg-slate-100 text-slate-300 border-2 border-transparent'}`}>
                      {DAY_ABBR[d]}
                    </div>
                  )
                })}
              </div>
            </div>

            {viewDoc.biography && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-1">Biography</p>
                <p className="text-sm text-slate-700 leading-relaxed">{viewDoc.biography}</p>
              </div>
            )}

            {/* Upcoming appointments for this doctor */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Upcoming Appointments</p>
              {loadingAppts ? <p className="text-slate-400 text-sm">Loading…</p>
              : !docAppts.length ? <p className="text-slate-400 text-sm">No upcoming appointments</p>
              : docAppts.map(a => (
                <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                  <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-700 font-bold text-xs">#{a.tokenNumber}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{a.patientName}</p>
                    <p className="text-xs text-slate-400">{formatDate ? new Date(a.appointmentDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : a.appointmentDate} · {formatTime(a.appointmentTime)}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.status==='COMPLETED'?'bg-teal-100 text-teal-700':a.status==='CANCELLED'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
