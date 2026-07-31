import { useState, useCallback, useMemo } from 'react'
import { useApi, useMutation } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Avatar from '../../components/common/Avatar'
import StatusChip from '../../components/common/StatusChip'
import DoctorCard from '../../components/patient/DoctorCard'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import patientService from '../../services/patientService'
import { useToast } from '../../context/ToastContext'
import { formatDate, formatTime, formatCurrency, getErrorMessage } from '../../utils/helpers'
import Pagination from '../../components/common/Pagination'
import { useTitle } from '../../hooks/useTitle'

const PER_PAGE = 8
const TODAY = new Date().toISOString().split('T')[0]

/* ── Mini calendar for date picking ── */
function MiniCalendar({ selectedDate, onSelect, minDate, availableDays }) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(minDate || TODAY)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })
  const [y,m] = viewMonth.split('-').map(Number)
  const daysInMonth = new Date(y,m,0).getDate()
  const firstDay   = new Date(y,m-1,1).getDay()
  const leading    = firstDay === 0 ? 6 : firstDay - 1

  const DAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su']
  const DAY_ABBR = { MON:1,TUE:2,WED:3,THU:4,FRI:5,SAT:6,SUN:0 }

  const availableNums = useMemo(() => {
    if (!availableDays) return null
    return new Set(availableDays.split(',').map(d => DAY_ABBR[d.trim()]).filter(n => n !== undefined))
  }, [availableDays])

  const nav = dir => {
    const d = new Date(y, m-1+dir, 1)
    setViewMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)
  }

  const cells = []
  for (let i = 0; i < leading; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const jsDay  = new Date(dateStr + 'T00:00:00').getDay()
    const isPast = dateStr < (minDate || TODAY)
    const unavail = availableNums && !availableNums.has(jsDay)
    cells.push({ d, dateStr, isPast, unavail })
  }

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-slate-800 text-sm">
          {new Date(viewMonth+'-01').toLocaleDateString('en-US',{month:'long',year:'numeric'})}
        </p>
        <div className="flex gap-1">
          <button onClick={() => nav(-1)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button onClick={() => nav(1)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_LABELS.map(l => <div key={l} className="text-center text-[10px] font-bold text-slate-400 py-1">{l}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i}/>
          const isSelected = cell.dateStr === selectedDate
          const disabled   = cell.isPast || cell.unavail
          return (
            <button
              key={cell.dateStr}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelect(cell.dateStr)}
              className={`h-8 w-full rounded-lg text-xs font-medium transition-all
                ${isSelected   ? 'bg-brand-600 text-white shadow-sm'                        :
                  disabled     ? 'text-slate-300 cursor-not-allowed'                        :
                  cell.dateStr === TODAY ? 'ring-2 ring-brand-300 text-brand-700 font-bold' :
                  'hover:bg-brand-50 text-slate-700 hover:text-brand-700'}`}
            >
              {cell.d}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Time slot picker ── */
const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','14:00','14:30','15:00','15:30','16:00','16:30',
]

function TimeSlotPicker({ selected, onSelect, availableFrom, availableTo }) {
  const fromH = availableFrom ? parseInt(availableFrom.split(':')[0]) : 9
    const toH   = availableTo   ? parseInt(availableTo.split(':')[0])   : 17
    const slots = TIME_SLOTS.filter(t => {
    const h = parseInt(t.split(':')[0])
    return h >= fromH && h < toH
  })

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map(t => (
        <button key={t}
          type="button"
          onClick={() => onSelect(t + ':00')}
          className={`py-2 rounded-xl text-xs font-semibold border transition-all
            ${selected === t + ':00'
              ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50'}`}
        >
          {formatTime(t + ':00')}
        </button>
      ))}
    </div>
  )
}

export default function PatientAppointments() {
  useTitle('My Appointments')
  const { addToast } = useToast()

  /* ── Data ── */
  const { data: upcoming = [], loading: lu, execute: reloadUpcoming } = useApi(useCallback(() => patientService.getUpcoming(),     []), { initialData: [] })
  const { data: past     = [], loading: lp, execute: reloadPast     } = useApi(useCallback(() => patientService.getPast(),         []), { initialData: [] })
  const { data: doctors  = [], loading: ld }                          = useApi(useCallback(() => patientService.getDoctors(),       []), { initialData: [] })

  /* ── State ── */
  const [tab,         setTab]         = useState('upcoming')
  const [search,      setSearch]      = useState('')
  const [specFilter,  setSpecFilter]  = useState('ALL')
  const [bookOpen,    setBookOpen]    = useState(false)
  const [bookStep,    setBookStep]    = useState(1)   // 1=doctor, 2=datetime, 3=confirm
  const [selDoctor,   setSelDoctor]   = useState(null)
  const [selDate,     setSelDate]     = useState('')
  const [selTime,     setSelTime]     = useState('')
  const [reason,      setReason]      = useState('')
  const [notes,       setNotes]       = useState('')
  const [cancelTarget,setCancelTarget]= useState(null)
  const [viewAppt,    setViewAppt]    = useState(null)
  const [page,        setPage]        = useState(1)
  const [doctorSearch,setDoctorSearch]= useState('')

  /* ── Mutations ── */
  const { mutate: book,   loading: booking  } = useMutation(useCallback(data => patientService.bookAppointment(data),  []))
  const { mutate: cancel, loading: canceling} = useMutation(useCallback(id   => patientService.cancelAppointment(id),  []))

  const rawList = tab === 'upcoming' ? upcoming : past

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    let list = (Array.isArray(rawList) ? rawList : [])
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.doctorName?.toLowerCase().includes(q) ||
        a.doctorSpecialization?.toLowerCase().includes(q) ||
        a.reason?.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a,b) => {
      const da = a.appointmentDate + a.appointmentTime
    const db = b.appointmentDate + b.appointmentTime
    return tab === 'upcoming' ? da.localeCompare(db) : db.localeCompare(da)
    })
  }, [rawList, search, tab])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  /* ── Doctor filtering for booking ── */
  const specializations = useMemo(() => ['ALL',...new Set(doctors.map(d=>d.specialization).filter(Boolean))], [doctors])
  const filteredDoctors  = useMemo(() => {
    let list = doctors
    if (specFilter !== 'ALL') list = list.filter(d => d.specialization === specFilter)
    if (doctorSearch.trim()) {
      const q = doctorSearch.toLowerCase()
      list = list.filter(d => d.name?.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q))
    }
    return list
  }, [doctors, specFilter, doctorSearch])

  /* ── Booking handlers ── */
  const openBook = (doctor) => {
    setSelDoctor(doctor || null)
    setSelDate(''); setSelTime(''); setReason(''); setNotes('')
    setBookStep(doctor ? 2 : 1)
    setBookOpen(true)
  }

  const handleBook = async () => {
    if (!selDoctor || !selDate || !selTime || !reason.trim()) {
      addToast('Please fill all required fields', 'error'); return
    }
    try {
      await book({ doctorId: selDoctor.id, appointmentDate: selDate, appointmentTime: selTime, reason, notes })
      addToast('Appointment booked successfully! 🎉', 'success')
      setBookOpen(false)
      reloadUpcoming()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  const handleCancel = async () => {
    try {
      await cancel(cancelTarget.id)
      addToast('Appointment cancelled', 'success')
      setCancelTarget(null)
      reloadUpcoming(); reloadPast()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  const resetBook = () => { setBookOpen(false); setSelDoctor(null); setBookStep(1) }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Appointments"
        subtitle="Book manage and track all your appointments"
        action={<Button onClick={() => openBook(null)}>+ Book Appointment</Button>}
      />

      {/* Summary, strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Upcoming',    value: upcoming.length,                                          color:'bg-brand-50 text-brand-700 border-brand-100'   },
          { label:'Completed',   value: past.filter(a=>a.status==='COMPLETED').length,            color:'bg-teal-50 text-teal-700 border-teal-100'      },
          { label:'Cancelled',   value: past.filter(a=>a.status==='CANCELLED').length,            color:'bg-red-50 text-red-700 border-red-100'         },
          { label:'Total',       value: upcoming.length + past.length,                            color:'bg-slate-50 text-slate-700 border-slate-200'   },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border rounded-xl px-4 py-3 ${color}`}>
            <p className="text-2xl font-bold">{lu||lp ? '…' : value}</p>
            <p className="text-xs mt-0.5 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Tab + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {[['upcoming','Upcoming'],['past','History']].map(([v,l]) => (
            <button key={v} onClick={() => { setTab(v); setPage(1); setSearch('') }}
              className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all
                ${tab===v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
            placeholder="Search doctor reason…" className="input pl-10"/>
        </div>
      </div>

      {/* Appointment, list */}
      {(lu && tab==='upcoming') || (lp && tab==='past') ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse"/>)}</div>
      ) : !paginated.length ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-3">📅</p>
          <p className="text-slate-500 font-medium">{search ? 'No appointments match your search' : tab==='upcoming' ? 'No upcoming appointments' : 'No past appointments'}</p>
          {tab==='upcoming' && !search && <Button onClick={() => openBook(null)} className="mt-4">Book Your First Appointment</Button>}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map(a => (
              <div key={a.id}
                className={`flex items-center gap-4 p-4 bg-white rounded-2xl border-2 transition-all hover:shadow-card-hover cursor-pointer
                  ${a.status==='CONFIRMED' ? 'border-emerald-200' : a.status==='IN_PROGRESS' ? 'border-amber-200' : 'border-slate-100'}`}
                onClick={() => setViewAppt(a)}
              >
                {/* Date, block */}
                <div className="flex-shrink-0 w-14 h-14 bg-brand-50 rounded-xl flex flex-col items-center justify-center border border-brand-100">
                  <span className="text-[10px] font-bold text-brand-400 uppercase">{new Date(a.appointmentDate+'T00:00').toLocaleDateString('en-US',{month:'short'})}</span>
                  <span className="text-xl font-black text-brand-700 leading-none">{new Date(a.appointmentDate+'T00:00').getDate()}</span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800">{a.doctorName}</p>
                    <span className="badge-blue badge text-[10px]">{a.doctorSpecialization}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {formatTime(a.appointmentTime)} · Token #{a.tokenNumber} · {a.reason}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusChip status={a.status} showDot/>
                  {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED') && tab === 'upcoming' && (
                    <button onClick={e => { e.stopPropagation(); setCancelTarget(a) }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                      title="Cancel"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage}/>
        </>
      )}

      {/* ── Book, Appointment, Modal (3-step) ── */}
      <Modal open={bookOpen} onClose={resetBook} title="Book Appointment" size="xl">
        {/* Step, indicators */}
        <div className="flex items-center gap-0 mb-6">
          {[['1','Find Doctor'],['2','Pick Date & Time'],['3','Confirm']].map(([n,l],i) => (
            <div key={n} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${bookStep > i+1 ? 'bg-emerald-500 text-white' : bookStep === i+1 ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-slate-100 text-slate-400'}`}>
                  {bookStep > i+1
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    : n}
                </div>
                <span className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${bookStep===i+1?'text-brand-600':bookStep>i+1?'text-emerald-600':'text-slate-400'}`}>{l}</span>
              </div>
              {i < 2 && <div className={`h-0.5 w-12 mx-1 mb-4 ${bookStep > i+1 ? 'bg-emerald-400' : 'bg-slate-200'}`}/>}
            </div>
          ))}
        </div>

        {/* Step, 1: Choose, doctor */}
        {bookStep === 1 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input type="text" value={doctorSearch} onChange={e=>setDoctorSearch(e.target.value)} placeholder="Search doctor…" className="input pl-10"/>
              </div>
              <select value={specFilter} onChange={e=>setSpecFilter(e.target.value)} className="input w-auto min-w-[160px]">
                {specializations.map(s=><option key={s} value={s}>{s==='ALL'?'All Specializations':s}</option>)}
              </select>
            </div>
            {ld ? (
              <div className="grid sm:grid-cols-2 gap-3">{[1,2,3,4].map(i=><div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse"/>)}</div>
            ) : !filteredDoctors.length ? (
              <div className="text-center py-8 text-slate-400">No doctors match your search</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto scrollbar-hide pr-1">
                {filteredDoctors.map(d => (
                  <DoctorCard key={d.id}
                    doctor={d}
                    selected={selDoctor?.id === d.id}
                    onBook={doc => { setSelDoctor(doc); setBookStep(2) }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step, 2: Date & time */}
        {bookStep === 2 && selDoctor && (
          <div className="space-y-5">
            {/* Selected, doctor, summary */}
            <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-xl border border-brand-100">
              <Avatar name={selDoctor.name} size="md"/>
              <div>
                <p className="font-semibold text-slate-800">{selDoctor.name}</p>
                <p className="text-xs text-brand-600">{selDoctor.specialization} · {formatCurrency(selDoctor.consultationFee || 0)}</p>
              </div>
              <button onClick={() => setBookStep(1)} className="ml-auto btn btn-ghost btn-sm text-xs">Change</button>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Calendar */}
              <div>
                <p className="label mb-3">Select Date</p>
                <MiniCalendar
                  selectedDate={selDate}
                  onSelect={date => { setSelDate(date); setSelTime('') }}
                  minDate={TODAY}
                  availableDays={selDoctor.availableDays}
                />
              </div>
              {/* Time */}
              <div>
                <p className="label mb-3">Select Time{selDate && <span className="text-slate-400 ml-1 font-normal">for {formatDate(selDate)}</span>}</p>
                {selDate ? (
                  <TimeSlotPicker selected={selTime}
                    onSelect={setSelTime}
                    availableFrom={selDoctor.availableFrom}
                    availableTo={selDoctor.availableTo}
                  />
                ) : (
                  <div className="flex items-center justify-center h-40 text-slate-300 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                    Pick a date first
                  </div>
                )}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="label">Reason for visit <span className="text-red-500">*</span></label>
              <input type="text" value={reason} onChange={e=>setReason(e.target.value)}
                className="input" placeholder="Describe your main concern…"/>
            </div>
            <div>
              <label className="label">Additional notes <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
                className="input resize-none" placeholder="Prefer morning slot bring reports etc."/>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setBookStep(1)}>← Back</Button>
              <Button
                onClick={() => { if (!selDate||!selTime||!reason.trim()) { addToast('Select date time and enter a reason','error'); return } setBookStep(3) }}
                className="flex-1"
              >
                Review Booking →
              </Button>
            </div>
          </div>
        )}

        {/* Step, 3: Confirm */}
        {bookStep === 3 && selDoctor && (
          <div className="space-y-4">
            <div className="p-5 bg-gradient-to-br from-brand-50 to-violet-50 rounded-2xl border border-brand-100 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={selDoctor.name} size="lg"/>
                <div>
                  <p className="font-bold text-slate-800">{selDoctor.name}</p>
                  <p className="text-sm text-brand-600 font-medium">{selDoctor.specialization}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['📅 Date',       formatDate(selDate)],
                  ['⏰ Time',       formatTime(selTime)],
                  ['💬 Reason',     reason],
                  ['💰 Fee',        formatCurrency(selDoctor.consultationFee || 0)],
                ].map(([l,v]) => (
                  <div key={l} className="bg-white rounded-xl p-3 border border-brand-100">
                    <p className="text-xs text-slate-400 mb-0.5">{l}</p>
                    <p className="text-sm font-semibold text-slate-800">{v}</p>
                  </div>
                ))}
              </div>
              {notes && (
                <div className="bg-white rounded-xl p-3 border border-brand-100">
                  <p className="text-xs text-slate-400 mb-0.5">📝 Notes</p>
                  <p className="text-sm text-slate-700">{notes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setBookStep(2)}>← Edit</Button>
              <Button onClick={handleBook} loading={booking} className="flex-1">
                Confirm Booking ✓
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Appointment, detail, modal ── */}
      <Modal open={!!viewAppt} onClose={() => setViewAppt(null)} title="Appointment Details" size="md">
        {viewAppt && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <div className="w-14 h-14 bg-brand-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-[10px] text-brand-400 font-bold uppercase">{new Date(viewAppt.appointmentDate+'T00:00').toLocaleDateString('en-US',{month:'short'})}</span>
                <span className="text-xl font-black text-brand-700">{new Date(viewAppt.appointmentDate+'T00:00').getDate()}</span>
              </div>
              <div>
                <StatusChip status={viewAppt.status} showDot/>
                <p className="text-sm font-bold text-slate-800 mt-1">{viewAppt.doctorName}</p>
                <p className="text-xs text-slate-400">{viewAppt.doctorSpecialization}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Time',     formatTime(viewAppt.appointmentTime)],
                ['Token',    `#${viewAppt.tokenNumber}`],
                ['Reason',   viewAppt.reason],
                ['Booked on',formatDate(viewAppt.createdAt)],
              ].map(([l,v]) => (
                <div key={l} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">{l}</p>
                  <p className="text-sm font-semibold text-slate-800">{v || '—'}</p>
                </div>
              ))}
            </div>
            {viewAppt.notes && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-600 font-semibold mb-1">Notes</p>
                <p className="text-sm text-slate-700">{viewAppt.notes}</p>
              </div>
            )}
            {(viewAppt.status === 'SCHEDULED' || viewAppt.status === 'CONFIRMED') && (
              <Button variant="danger" onClick={() => { setViewAppt(null); setCancelTarget(viewAppt) }} className="w-full">
                Cancel Appointment
              </Button>
            )}
          </div>
        )}
      </Modal>

      {/* ── Cancel, confirm ── */}
      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        loading={canceling}
        appointmentInfo={cancelTarget ? { doctorName: cancelTarget.doctorName, date: formatDate(cancelTarget.appointmentDate) } : null}
      />
    </div>
  )
}
