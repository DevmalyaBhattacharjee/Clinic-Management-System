import { useState, useCallback, useMemo } from 'react'
import { useApi, useMutation } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { useToast } from '../../context/ToastContext'
import doctorService from '../../services/doctorService'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import { validate, required } from '../../utils/validation'
import { useTitle } from '../../hooks/useTitle'

const DAYS_OF_WEEK = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
const DAY_SHORT    = { MONDAY:'Mon', TUESDAY:'Tue', WEDNESDAY:'Wed', THURSDAY:'Thu', FRIDAY:'Fri', SATURDAY:'Sat', SUNDAY:'Sun' }
const DAY_OPTS     = DAYS_OF_WEEK.map(d => ({ value:d, label:d }))

const BLANK = {
  date: '', dayOfWeek: '',
  startTime: '09:00', endTime: '17:00',
  isAvailable: false, reason: '',
}
const createRules = {
  date:      [required('Date')],
  dayOfWeek: [required('Day of week')],
}

// Map day name to calendar column (0=Mon…6=Sun)
const DAY_COL = { MONDAY:0,TUESDAY:1,WEDNESDAY:2,THURSDAY:3,FRIDAY:4,SATURDAY:5,SUNDAY:6 }

export default function DoctorAvailability() {
  useTitle('Schedule & Availability')
  const { addToast } = useToast()

  const { data: records = [], loading, execute: reload } = useApi(
    useCallback(() => doctorService.getAvailability(), [])
  , { initialData: [] })

  const [open,       setOpen]       = useState(false)
  const [form,       setForm]       = useState(BLANK)
  const [errors,     setErrors]     = useState({})
  const [deleteId,   setDeleteId]   = useState(null)
  const [viewMonth,  setViewMonth]  = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  })

  const { mutate: save,   loading: saving }   = useMutation(useCallback(d => doctorService.setAvailability(d), []))
  const { mutate: remove, loading: removing } = useMutation(useCallback(id => doctorService.deleteAvailability(id), []))

  const setF = k => e => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
  }

  const handleSave = async e => {
    e.preventDefault()
    const errs = validate(form, createRules)
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      await save({
        ...form,
        startTime: form.startTime + ':00',
        endTime:   form.endTime   + ':00',
        isAvailable: form.isAvailable,
      })
      addToast('Availability saved', 'success')
      setOpen(false); setForm(BLANK); setErrors({}); reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  const handleDelete = async () => {
    try {
      await remove(deleteId)
      addToast('Availability record removed', 'success')
      setDeleteId(null); reload()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  // Auto-fill dayOfWeek from selected date
  const handleDateChange = e => {
    const d = e.target.value
    setForm(f => ({ ...f, date:d, dayOfWeek: d ? DAYS_OF_WEEK[new Date(d + 'T00:00:00').getDay() === 0 ? 6 : new Date(d + 'T00:00:00').getDay()-1] : '' }))
    if (errors.date) setErrors(er => ({ ...er, date:'' }))
  }

  // Build calendar grid for current month
  const calendarData = useMemo(() => {
    const [year, month] = viewMonth.split('-').map(Number)
    const daysInMonth   = new Date(year, month, 0).getDate()
    const firstDay      = new Date(year, month-1, 1).getDay()  // 0=Sun

    const cells = []
    // leading blank cells
    const leading = firstDay === 0 ? 6 : firstDay - 1
    for (let i = 0; i < leading; i++) cells.push(null)
    // days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      const rec = records.find(r => r.date === dateStr)
      cells.push({ day:d, date:dateStr, rec })
    }
    return cells
  }, [viewMonth, records])

  const upcomingUnavailable = useMemo(() =>
    records.filter(r => !r.isAvailable && r.date >= new Date().toISOString().split('T')[0])
      .sort((a,b) => a.date.localeCompare(b.date))
  , [records])

  const navigateMonth = dir => {
    const [y,m] = viewMonth.split('-').map(Number)
    const d = new Date(y, m-1+dir, 1)
    setViewMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Schedule & Availability"
        subtitle="Manage your availability calendar"
        action={<Button onClick={() => { setOpen(true); setForm(BLANK); setErrors({}) }}>+ Set Availability</Button>}
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-800">
              {new Date(viewMonth+'-01').toLocaleDateString('en-US',{month:'long',year:'numeric'})}
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex gap-3 text-xs mr-3">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-200 inline-block"/>Available</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-200 inline-block"/>Unavailable</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 border inline-block"/>No record</span>
              </div>
              <button onClick={() => navigateMonth(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button onClick={() => navigateMonth(1)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({length:35}).map((_,i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse"/>)}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((cell, i) => {
                if (!cell) return <div key={i}/>
                const today = new Date().toISOString().split('T')[0]
                const isToday = cell.date === today
                const isPast  = cell.date < today
                return (
                  <div key={cell.date}
                    className={`h-12 rounded-xl border flex flex-col items-center justify-center text-xs cursor-pointer transition-all group
                      ${isToday ? 'border-brand-400 ring-2 ring-brand-100' : ''}
                      ${cell.rec
                        ? cell.rec.isAvailable
                          ? 'bg-emerald-100 border-emerald-200 hover:bg-emerald-200'
                          : 'bg-red-100 border-red-200 hover:bg-red-200'
                        : isPast
                          ? 'bg-slate-50 border-slate-100 opacity-40'
                          : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-brand-50'
                      }`}
                    onClick={() => {
                      if (!cell.rec) {
                        setForm({ ...BLANK, date:cell.date, dayOfWeek: DAYS_OF_WEEK[new Date(cell.date+'T00:00:00').getDay()===0?6:new Date(cell.date+'T00:00:00').getDay()-1] })
                        setOpen(true)
                      }
                    }}
                  >
                    <span className={`font-semibold ${isToday?'text-brand-700':isPast?'text-slate-400':'text-slate-700'}`}>{cell.day}</span>
                    {cell.rec && (
                      <span className={`text-[9px] font-bold ${cell.rec.isAvailable?'text-emerald-700':'text-red-700'}`}>
                        {cell.rec.isAvailable ? 'Avail' : 'Off'}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Upcoming unavailable */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Upcoming Days Off</h3>
            {loading ? <p className="text-slate-400 text-sm">Loading…</p>
            : !upcomingUnavailable.length ? (
              <div className="text-center py-4">
                <p className="text-2xl mb-1">✅</p>
                <p className="text-slate-400 text-sm">No scheduled days off</p>
              </div>
            ) : upcomingUnavailable.slice(0,5).map(r => (
              <div key={r.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-red-400">{DAY_SHORT[r.dayOfWeek]}</span>
                  <span className="text-xs font-bold text-red-700">{new Date(r.date+'T00:00:00').getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{formatDate(r.date)}</p>
                  {r.reason && <p className="text-xs text-slate-400 truncate">{r.reason}</p>}
                </div>
                <button onClick={() => setDeleteId(r.id)} className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                </button>
              </div>
            ))}
          </div>

          {/* All records table */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">All Records ({records.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {records.slice(0,10).map(r => (
                <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${r.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700">{formatDate(r.date)}</p>
                    <p className="text-[10px] text-slate-400">{r.startTime?.slice(0,5)} – {r.endTime?.slice(0,5)}</p>
                  </div>
                  <span className={`text-[10px] font-bold ${r.isAvailable?'text-emerald-600':'text-red-600'}`}>
                    {r.isAvailable ? 'Avail' : 'Off'}
                  </span>
                  <button onClick={() => setDeleteId(r.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                  </button>
                </div>
              ))}
              {!loading && !records.length && <p className="text-slate-400 text-sm text-center py-3">No records yet</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Set Availability Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Set Availability" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Date" type="date" name="date" value={form.date} onChange={handleDateChange} error={errors.date} required
                min={new Date().toISOString().split('T')[0]}/>
            </div>
            <Select label="Day of Week" name="dayOfWeek" value={form.dayOfWeek} onChange={setF('dayOfWeek')} error={errors.dayOfWeek}
              options={DAY_OPTS} required/>
            <div/>
            <Input label="Start Time" type="time" name="startTime" value={form.startTime} onChange={setF('startTime')}/>
            <Input label="End Time"   type="time" name="endTime"   value={form.endTime}   onChange={setF('endTime')}/>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all
            border-red-200 bg-red-50 cursor-pointer"
            onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
          >
            <div className={`w-10 h-6 rounded-full transition-colors relative ${form.isAvailable ? 'bg-red-500' : 'bg-slate-200'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isAvailable ? 'translate-x-4' : ''}`}/>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Mark as Unavailable</p>
              <p className="text-xs text-slate-400">Toggle on to block this day</p>
            </div>
          </div>

          {form.isAvailable && (
            <Input label="Reason" name="reason" value={form.reason} onChange={setF('reason')}
              placeholder="e.g. Medical conference Personal leave…"/>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setOpen(false)} type="button">Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} loading={removing}
        title="Remove Record" message="Remove this availability record? You can add it back anytime."
        confirmLabel="Remove" variant="danger"
      />
    </div>
  )
}
