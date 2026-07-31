import { useState, useCallback, useMemo } from 'react'
import { useApi, useMutation } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Avatar from '../../components/common/Avatar'
import StatusChip from '../../components/common/StatusChip'
import TokenBadge from '../../components/receptionist/TokenBadge'
import PatientSearchBox from '../../components/receptionist/PatientSearchBox'
import { useToast } from '../../context/ToastContext'
import { useNotify } from '../../hooks/useNotify'
import receptionistService from '../../services/receptionistService'
import { formatDate, formatTime, getErrorMessage } from '../../utils/helpers'
import { validate, required } from '../../utils/validation'
import Pagination from '../../components/common/Pagination'
import { useTitle } from '../../hooks/useTitle'

const PER_PAGE   = 12
const TODAY      = new Date().toISOString().split('T')[0]
const STATUSES   = ['SCHEDULED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW']
const TIME_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
                    '12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00']

const STATUS_COLORS = {
  SCHEDULED:'border-blue-200 bg-blue-50',
  CONFIRMED:'border-emerald-200 bg-emerald-50',
  IN_PROGRESS:'border-amber-200 bg-amber-50',
  COMPLETED:'border-teal-100 bg-teal-50/40',
  CANCELLED:'border-slate-100 bg-slate-50 opacity-50',
  NO_SHOW:'border-slate-100 bg-slate-50 opacity-50',
}

const CHECK_IN_FLOW = {
  SCHEDULED:   { next:'CONFIRMED',    label:'Check-in',      color:'btn-primary'   },
  CONFIRMED:   { next:'IN_PROGRESS',  label:'Start Session', color:'btn-primary'   },
  IN_PROGRESS: { next:'COMPLETED',    label:'Complete',      color:'bg-teal-600 text-white hover:bg-teal-700 btn' },
}

export default function ReceptionistAppointments() {
  useTitle('Appointments')
  const { notify, notifyError } = useNotify()

  const { data: todayAppts=[], loading:lt, execute:reloadToday  } = useApi(useCallback(() => receptionistService.getTodayAppointments(),  []))
  const { data: doctors=[],    loading:ld                        } = useApi(useCallback(() => receptionistService.getDoctors(),             []))
  const { data: summary,       loading:ls                        } = useApi(useCallback(() => receptionistService.getTodaySummary(),        []))
  const { data: dateAppts=[],  loading:lda, execute:fetchDate    } = useApi(
    useCallback(() => receptionistService.getAppointmentsByDate(dateVal), []),
    { immediate: false }
  )

  const [tab,        setTab]       = useState('queue')   // 'queue' | 'date' | 'all'
  const [dateVal,    setDateVal]   = useState(TODAY)
  const [search,     setSearch]    = useState('')
  const [sFilter,    setSFilter]   = useState('ALL')
  const [dFilter,    setDFilter]   = useState('ALL')
  const [page,       setPage]      = useState(1)
  const [bookOpen,   setBookOpen]  = useState(false)
  const [viewAppt,   setViewAppt]  = useState(null)
  const [cancelId,   setCancelId]  = useState(null)
  const [selPatient, setSelPatient]= useState(null)
  const [bookForm,   setBookForm]  = useState({ doctorId:'', appointmentDate:TODAY, appointmentTime:'', reason:'', notes:'' })
  const [bookErrors, setBookErrors]= useState({})

  const { mutate: book,       loading: booking    } = useMutation(useCallback(d   => receptionistService.bookAppointment(d), []))
  const { mutate: updateStat, loading: updating   } = useMutation(useCallback((id,d) => receptionistService.updateStatus(id,d), []))
  const { mutate: cancelAppt, loading: canceling  } = useMutation(useCallback(id  => receptionistService.cancelAppointment(id), []))

  const rawList  = tab === 'queue' ? todayAppts : tab === 'date' ? dateAppts : todayAppts
  const loading  = tab === 'queue' ? lt : tab === 'date' ? lda : lt

  const filtered = useMemo(() => {
    let list = (Array.isArray(rawList) ? rawList : [])
    if (sFilter !== 'ALL') list = list.filter(a => a.status === sFilter)
    if (dFilter !== 'ALL') list = list.filter(a => a.doctorId?.toString() === dFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.patientName?.toLowerCase().includes(q) ||
        a.patientNumber?.toLowerCase().includes(q) ||
        a.doctorName?.toLowerCase().includes(q) ||
        a.reason?.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a,b) => a.appointmentTime?.localeCompare(b.appointmentTime))
  }, [rawList, sFilter, dFilter, search])

  const totalPages    = Math.ceil(filtered.length / PER_PAGE)
  const paginated     = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)
  const statusCounts  = useMemo(() => {
    const c = {}; rawList.forEach(a => { c[a.status]=(c[a.status]||0)+1 }); return c
  }, [rawList])
  const s             = summary || {}

  const setBF = k => e => { setBookForm(f=>({...f,[k]:e.target.value})); if(bookErrors[k]) setBookErrors(er=>{const n={...er};delete n[k];return n}) }

  const handleBook = async e => {
    e.preventDefault()
    const errs = validate(bookForm, {
      doctorId:        [required('Doctor')],
      appointmentDate: [required('Date')],
      appointmentTime: [required('Time')],
      reason:          [required('Reason')],
    })
    if (!selPatient) errs.patient = 'Select a patient'
    if (Object.keys(errs).length) { setBookErrors(errs); return }
    try {
      await book({
        patientId:       selPatient.id,
        doctorId:        +bookForm.doctorId,
        appointmentDate: bookForm.appointmentDate,
        appointmentTime: bookForm.appointmentTime + ':00',
        reason:          bookForm.reason,
        notes:           bookForm.notes || undefined,
      })
      notify('Appointment booked', { type:'appointment', title:'Appointment booked', body:`Token #${res?.tokenNumber || ''} assigned` })
      setBookOpen(false)
      setSelPatient(null)
      setBookForm({ doctorId:'', appointmentDate:TODAY, appointmentTime:'', reason:'', notes:'' })
      reloadToday()
    } catch (err) { notifyError(getErrorMessage(err)) }
  }

  const handleStatusUpdate = async (appt, nextStatus, notes='') => {
    try {
      await updateStat(appt.id, { status: nextStatus, notes: notes || undefined })
      notify(`Status updated → ${nextStatus.replace(/_/g,' ')}`, { type:'appointment', title:'Appointment status updated', body:`Changed to ${nextStatus.replace(/_/g,' ')}` })
      reloadToday()
      if (viewAppt?.id === appt.id) setViewAppt(prev => ({ ...prev, status: nextStatus }))
    } catch (err) { notifyError(getErrorMessage(err)) }
  }

  const handleCancel = async () => {
    try {
      await cancelAppt(cancelId)
      notify('Appointment cancelled', { type:'appointment', title:'Appointment cancelled', body:'Slot is now available' })
      setCancelId(null); reloadToday()
    } catch (err) { notifyError(getErrorMessage(err)) }
  }

  const selectedDoctor = useMemo(() => doctors.find(d => d.id?.toString() === bookForm.doctorId), [doctors, bookForm.doctorId])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Appointments"
        subtitle="Manage today's queue and book appointments"
        action={<Button onClick={() => setBookOpen(true)}>+ Book Appointment</Button>}
      />

      {/* Summary, chips */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
        {[['ALL','All',(s.totalAppointments||0),'bg-slate-600'], ...STATUSES.map(st=>[st,st.replace(/_/g,' '),statusCounts[st]||0,{SCHEDULED:'bg-blue-600',CONFIRMED:'bg-emerald-600',IN_PROGRESS:'bg-amber-500',COMPLETED:'bg-teal-600',CANCELLED:'bg-red-600',NO_SHOW:'bg-slate-400'}[st]])].map(([val,label,cnt,color]) => (
          <button key={val}
            onClick={() => { setSFilter(val); setPage(1) }}
            className={`rounded-xl border p-2.5 text-left transition-all text-white ${sFilter===val ? color + ' shadow-md' : 'bg-white border-slate-200 !text-slate-600 hover:border-slate-300'}`}>
            <p className="text-lg font-black leading-none">{loading ? '…' : cnt}</p>
            <p className="text-[9px] font-bold uppercase tracking-wide mt-1 truncate opacity-90">{label}</p>
          </button>
        ))}
      </div>

      {/* Tab, bar + date + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {[['queue',"Today's Queue"],['date','By Date']].map(([v,l]) => (
            <button key={v} onClick={() => { setTab(v); setSFilter('ALL'); setPage(1) }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab===v?'bg-white text-slate-800 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>{l}</button>
          ))}
        </div>
        {tab === 'date' && (
          <div className="flex items-center gap-2">
            <Input type="date" name="date" value={dateVal} onChange={e=>setDateVal(e.target.value)} className="w-44"/>
            <button onClick={()=>{fetchDate();setPage(1)}} className="btn btn-secondary btn-sm">Search</button>
          </div>
        )}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search patient doctor…" className="input pl-10"/>
        </div>
        {!ld && doctors.length > 0 && (
          <select value={dFilter} onChange={e=>{setDFilter(e.target.value);setPage(1)}} className="input w-auto min-w-[160px] text-sm">
            <option value="ALL">All Doctors</option>
            {doctors.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
      </div>

      {/* Appointment, list / queue */}
      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i=><div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse"/>)}</div>
      ) : !paginated.length ? (
        <div className="card text-center py-14">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-slate-500 font-medium">{search||sFilter!=='ALL' ? 'No appointments match your filters' : 'No appointments for this period'}</p>
          {(search||sFilter!=='ALL') && <button onClick={()=>{setSearch('');setSFilter('ALL')}} className="text-brand-600 text-sm mt-2 hover:text-brand-700">Clear filters</button>}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginated.map(a => {
              const flow = CHECK_IN_FLOW[a.status]
              return (
                <div key={a.id}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${STATUS_COLORS[a.status] || 'border-slate-100 bg-white'}`}>
                  <TokenBadge token={a.tokenNumber} size={a.status==='IN_PROGRESS'?'md':'sm'}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800">{a.patientName}</p>
                      <span className="text-xs text-slate-400">{a.patientNumber}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {a.doctorName} · {formatTime(a.appointmentTime)} · {a.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusChip status={a.status} showDot/>
                    {/* Quick, status, dropdown */}
                    <select
                      value={a.status}
                      onChange={e => handleStatusUpdate(a, e.target.value)}
                      disabled={updating}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 cursor-pointer hidden sm:block"
                    >
                      {STATUSES.map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                    </select>
                    {/* Quick, action, button
                    for  check-in, flow */}
                    {flow && (
                      <button onClick={() => handleStatusUpdate(a, flow.next)}
                        className={`btn btn-sm ${flow.color} whitespace-nowrap`}
                        disabled={updating}
                      >
                        {flow.label}
                      </button>
                    )}
                    <button onClick={() => setViewAppt(a)}
                      className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-brand-600 transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                    {(a.status==='SCHEDULED'||a.status==='CONFIRMED') && (
                      <button onClick={() => setCancelId(a.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage}/>
        </>
      )}

      {/* ── Book, Appointment, Modal ── */}
      <Modal open={bookOpen} onClose={() => setBookOpen(false)} title="Book Appointment" size="lg">
        <form onSubmit={handleBook} className="space-y-4">
          {/* Patient, search */}
          <div>
            <label className="label">Patient <span className="text-red-500">*</span></label>
            {selPatient ? (
              <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-xl border border-brand-200">
                <Avatar name={selPatient.name} size="sm"/>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{selPatient.name}</p>
                  <p className="text-xs text-slate-400">{selPatient.patientNumber} · {selPatient.phone}</p>
                </div>
                <button type="button" onClick={() => setSelPatient(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            ) : (
              <div>
                <PatientSearchBox onSelect={p => { setSelPatient(p); setBookErrors(er=>{const n={...er};delete n.patient;return n}) }} autoFocus/>
                {bookErrors.patient && <p className="mt-1 text-xs text-red-500">⚠ {bookErrors.patient}</p>}
              </div>
            )}
          </div>

          {/* Doctor */}
          <div>
            <label className="label">Doctor <span className="text-red-500">*</span></label>
            <select value={bookForm.doctorId} onChange={setBF('doctorId')}
              className={`input ${bookErrors.doctorId?'input-error':''}`}>
              <option value="">Select doctor…</option>
              {doctors.map(d=><option key={d.id} value={d.id}>{d.name} — {d.specialization} (₹{d.consultationFee})</option>)}
            </select>
            {bookErrors.doctorId && <p className="mt-1 text-xs text-red-500">⚠ {bookErrors.doctorId}</p>}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date <span className="text-red-500">*</span></label>
              <input type="date" value={bookForm.appointmentDate} onChange={setBF('appointmentDate')} min={TODAY}
                className={`input ${bookErrors.appointmentDate?'input-error':''}`}/>
              {bookErrors.appointmentDate && <p className="mt-1 text-xs text-red-500">⚠ {bookErrors.appointmentDate}</p>}
            </div>
            <div>
              <label className="label">Time <span className="text-red-500">*</span></label>
              <select value={bookForm.appointmentTime} onChange={setBF('appointmentTime')}
                className={`input ${bookErrors.appointmentTime?'input-error':''}`}>
                <option value="">Select time…</option>
                {TIME_SLOTS.filter(t => {
                  if (!selectedDoctor) return true
                  const  h = parseInt(t.split(':')[0])
                  const from = parseInt((selectedDoctor.availableFrom||'09').split(':')[0])
                  const to   = parseInt((selectedDoctor.availableTo||'17').split(':')[0])
                  return h >= from && h < to
                }).map(t=><option key={t} value={t}>{formatTime(t+':00')}</option>)}
              </select>
              {bookErrors.appointmentTime && <p className="mt-1 text-xs text-red-500">⚠ {bookErrors.appointmentTime}</p>}
            </div>
          </div>

          {/* Reason + Notes */}
          <div>
            <label className="label">Reason <span className="text-red-500">*</span></label>
            <input type="text" value={bookForm.reason} onChange={setBF('reason')}
              placeholder="Chief complaint / reason for visit…"
              className={`input ${bookErrors.reason?'input-error':''}`}/>
            {bookErrors.reason && <p className="mt-1 text-xs text-red-500">⚠ {bookErrors.reason}</p>}
          </div>
          <div>
            <label className="label">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea value={bookForm.notes} onChange={setBF('notes')} rows={2} className="input resize-none" placeholder="Walk-in patient special requirements…"/>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setBookOpen(false)} type="button">Cancel</Button>
            <Button type="submit" loading={booking}>Book Appointment</Button>
          </div>
        </form>
      </Modal>

      {/* ── Appointment, Detail, Modal ── */}
      <Modal open={!!viewAppt} onClose={() => setViewAppt(null)} title="Appointment Details" size="md">
        {viewAppt && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <TokenBadge token={viewAppt.tokenNumber} size="lg"/>
              <div>
                <StatusChip status={viewAppt.status} showDot/>
                <p className="font-bold text-slate-800 mt-1">{viewAppt.patientName}</p>
                <p className="text-xs text-slate-400">{viewAppt.patientNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Doctor',     viewAppt.doctorName],
                ['Spec.',      viewAppt.doctorSpecialization],
                ['Date',       formatDate(viewAppt.appointmentDate)],
                ['Time',       formatTime(viewAppt.appointmentTime)],
                ['Reason',     viewAppt.reason],
                ['Token',      `#${viewAppt.tokenNumber}`],
              ].map(([l,v]) => (
                <div key={l} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">{l}</p>
                  <p className="text-sm font-semibold text-slate-800">{v || '—'}</p>
                </div>
              ))}
            </div>
            {viewAppt.notes && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs font-bold text-amber-700 mb-1">Notes</p>
                <p className="text-sm text-slate-700">{viewAppt.notes}</p>
              </div>
            )}
            {/* Status, flow, actions */}
            {CHECK_IN_FLOW[viewAppt.status] && (
              <div className="flex gap-3">
                {viewAppt.status!=='COMPLETED' && (
                  <button onClick={() => { handleStatusUpdate(viewAppt, CHECK_IN_FLOW[viewAppt.status].next); setViewAppt(null) }}
                    className={`flex-1 ${CHECK_IN_FLOW[viewAppt.status].color}`}
                  >
                    {CHECK_IN_FLOW[viewAppt.status].label}
                  </button>
                )}
              </div>
            )}
            <div>
              <label className="label text-xs">Update Status</label>
              <select value={viewAppt.status}
                onChange={e => { handleStatusUpdate(viewAppt, e.target.value); setViewAppt(prev=>({...prev,status:e.target.value})) }}
                className="input text-sm">
                {STATUSES.map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Cancel, Confirm ── */}
      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="" size="sm">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">Cancel Appointment?</h3>
            <p className="text-sm text-slate-500 mt-1">This will cancel the appointment and free the slot.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setCancelId(null)} className="flex-1">Keep</Button>
            <Button variant="danger" onClick={handleCancel} loading={canceling} className="flex-1">Cancel Appointment</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
