import { useState, useCallback, useMemo } from 'react'
import { useApi, useMutation } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Avatar from '../../components/common/Avatar'
import StatusChip from '../../components/common/StatusChip'
import SearchBar from '../../components/common/SearchBar'
import { useToast } from '../../context/ToastContext'
import doctorService from '../../services/doctorService'
import { formatDate, formatTime, getErrorMessage } from '../../utils/helpers'
import Pagination from '../../components/common/Pagination'
import Spinner from '../../components/common/Spinner'
import { useTitle } from '../../hooks/useTitle'

const PER_PAGE = 10
const STATUSES = ['SCHEDULED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW']

const STATUS_COLORS = {
  SCHEDULED:'bg-blue-600', CONFIRMED:'bg-emerald-600', IN_PROGRESS:'bg-amber-500',
  COMPLETED:'bg-teal-600', CANCELLED:'bg-red-600', NO_SHOW:'bg-slate-400',
}

export default function DoctorAppointments() {
  useTitle('Appointments')
  const { addToast } = useToast()

  const { data: today    = [], loading: lt, execute: reloadToday }    = useApi(useCallback(() => doctorService.getTodayAppointments(),    []), { initialData: [] })
  const { data: upcoming = [], loading: lu, execute: reloadUpcoming } = useApi(useCallback(() => doctorService.getUpcomingAppointments(), []), { initialData: [] })
  const { data: all      = [], loading: la, execute: reloadAll }      = useApi(useCallback(() => doctorService.getAppointments(),         []), { initialData: [] })

  const [tab,         setTab]         = useState('today')     // 'today' | 'upcoming' | 'all'
  const [dateVal,     setDateVal]     = useState(new Date().toISOString().split('T')[0])
  const [search,      setSearch]      = useState('')
  const [statusFilter,setStatusFilter]= useState('ALL')
  const [page,        setPage]        = useState(1)
  const [selected,    setSelected]    = useState(null)        // appointment for detail modal
  const [notesModal,  setNotesModal]  = useState(null)        // appointment for notes modal
  const [noteText,    setNoteText]    = useState('')

  const { mutate: updateStatus, loading: updatingStatus } = useMutation(
    useCallback((id, status) => doctorService.updateAppointmentStatus(id, status), [])
  )
  const { mutate: saveNotes, loading: savingNotes } = useMutation(
    useCallback((id, notes) => doctorService.addAppointmentNotes(id, notes), [])
  )

  const { data: dateAppts = [], loading: ld, execute: fetchDate } = useApi(
    useCallback(() => doctorService.getAppointmentsByDate(dateVal), [dateVal]),
    { immediate: false }
  , { initialData: [] })

  const rawList = tab === 'today' ? today : tab === 'upcoming' ? upcoming : tab === 'date' ? dateAppts : all
  const dataLoading = tab === 'today' ? lt : tab === 'upcoming' ? lu : tab === 'date' ? ld : la

  const reloadCurrent = () => {
    if (tab === 'today')    reloadToday()
    if (tab === 'upcoming') reloadUpcoming()
    if (tab === 'all')      reloadAll()
    if (tab === 'date')     fetchDate()
  }

  const filtered = useMemo(() => {
    let list = (Array.isArray(rawList) ? rawList : [])
    if (statusFilter !== 'ALL') list = list.filter(a => a.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.patientName?.toLowerCase().includes(q) ||
        a.patientNumber?.toLowerCase().includes(q) ||
        a.reason?.toLowerCase().includes(q)
      )
    }
    return list.sort((a,b) => {
      const da = a.appointmentDate + 'T' + (a.appointmentTime || '')
      const db = b.appointmentDate + 'T' + (b.appointmentTime || '')
      return da.localeCompare(db)
    })
  }, [rawList, statusFilter, search])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const statusCounts = useMemo(() => {
    const c = { ALL: rawList.length }
    rawList.forEach(a => { c[a.status] = (c[a.status] || 0) + 1 })
    return c
  }, [rawList])

  const handleStatusChange = async (apptId, newStatus) => {
    try {
      await updateStatus(apptId, newStatus)
      addToast('Status updated', 'success')
      reloadCurrent()
      if (selected?.id === apptId) setSelected(prev => ({ ...prev, status: newStatus }))
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  const handleSaveNotes = async () => {
    try {
      await saveNotes(notesModal.id, noteText)
      addToast('Notes saved', 'success')
      setNotesModal(null)
      reloadCurrent()
    } catch (err) { addToast(getErrorMessage(err), 'error') }
  }

  const openNotes = (appt) => { setNotesModal(appt); setNoteText(appt.notes || '') }

  return (
    <div className="space-y-5">
      <PageHeader title="Appointments" subtitle="Manage and update all your appointments"/>

      {/* Status summary chips */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[['ALL', 'All', 'bg-slate-600'], ...STATUSES.map(s => [s, s.replace(/_/g,' '), STATUS_COLORS[s]])].map(([val, label, color]) => (
          <button key={val}
            onClick={() => { setStatusFilter(val); setPage(1) }}
            className={`rounded-xl border p-2.5 text-left transition-all
              ${statusFilter === val
                ? 'border-transparent text-white shadow-sm ' + color
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'}`}>
            <p className="text-lg font-black leading-none">{dataLoading ? '…' : statusCounts[val] || 0}</p>
            <p className="text-[9px] font-bold uppercase tracking-wide mt-1 opacity-80 truncate">{label}</p>
          </button>
        ))}
      </div>

      {/* Tab bar + date picker */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {[['today','Today'],['upcoming','Upcoming'],['all','All Time']].map(([v,l]) => (
            <button key={v} onClick={() => { setTab(v); setStatusFilter('ALL'); setSearch(''); setPage(1) }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                ${tab===v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" name="date" value={dateVal} onChange={e => setDateVal(e.target.value)} className="w-44"/>
          <button onClick={() => { setTab('date'); fetchDate(); setPage(1) }}
            className="btn btn-secondary btn-sm">Search</button>
        </div>
      </div>

      <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search patient reason…"/>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Token','Patient','Date','Time','Reason','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataLoading ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-400"><Spinner size="md"/><span className="text-sm">Loading…</span></div>
                </td></tr>
              ) : !paginated.length ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <div className="text-slate-300 text-5xl mb-3">📅</div>
                  <p className="text-slate-500 font-medium">No appointments found</p>
                  {(search || statusFilter !== 'ALL') && (
                    <button onClick={() => { setSearch(''); setStatusFilter('ALL') }}
                      className="text-brand-600 text-sm mt-1 hover:text-brand-700">Clear filters</button>
                  )}
                </td></tr>
              ) : paginated.map(a => (
                <tr key={a.id} className={`border-b border-slate-50 transition-colors
                  ${a.status === 'IN_PROGRESS' ? 'bg-amber-50/40' :
                    a.status === 'COMPLETED'   ? 'bg-teal-50/30'   : 'hover:bg-slate-50/70'}`}>
                  <td className="px-4 py-3">
                    <div className="w-9 h-9 bg-brand-100 text-brand-700 font-bold text-xs rounded-xl flex items-center justify-center">
                      #{a.tokenNumber}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.patientName} size="sm"/>
                      <div>
                        <p className="font-semibold text-slate-800">{a.patientName}</p>
                        <p className="text-xs text-slate-400">{a.patientNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(a.appointmentDate)}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{formatTime(a.appointmentTime)}</td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <span className="text-slate-500 text-xs truncate block">{a.reason || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {/* Inline status dropdown */}
                    <select
                      value={a.status}
                      onChange={e => handleStatusChange(a.id, e.target.value)}
                      disabled={updatingStatus}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 cursor-pointer"
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelected(a)} title="View details"
                        className="p-1.5 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <button onClick={() => openNotes(a)} title="Add notes"
                        className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage}/>
      </div>

      {/* ── Detail Modal ── */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Appointment Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700 font-black text-lg">
                #{selected.tokenNumber}
              </div>
              <div>
                <StatusChip status={selected.status} showDot/>
                <p className="text-xs text-slate-400 mt-1">{formatDate(selected.appointmentDate)} at {formatTime(selected.appointmentTime)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Patient',      selected.patientName],
                ['Patient No.',  selected.patientNumber],
                ['Date',         formatDate(selected.appointmentDate)],
                ['Time',         formatTime(selected.appointmentTime)],
                ['Reason',       selected.reason],
                ['Token',        `#${selected.tokenNumber}`],
              ].map(([l,v]) => (
                <div key={l} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">{l}</p>
                  <p className="text-sm font-semibold text-slate-800">{v || '—'}</p>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-600 font-semibold mb-1">Notes</p>
                <p className="text-sm text-slate-700">{selected.notes}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="label text-xs">Update Status</label>
                <select value={selected.status}
                  onChange={e => handleStatusChange(selected.id, e.target.value)}
                  className="input text-sm">
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <button onClick={() => { openNotes(selected); setSelected(null) }}
                className="btn btn-secondary btn-sm mt-5">
                Add Notes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Notes Modal ── */}
      <Modal open={!!notesModal} onClose={() => setNotesModal(null)} title={`Notes — ${notesModal?.patientName}`} size="md">
        {notesModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-sm">
              <span className="font-bold text-brand-600">#{notesModal.tokenNumber}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600">{formatDate(notesModal.appointmentDate)}</span>
              <span className="text-slate-400">·</span>
              <StatusChip status={notesModal.status}/>
            </div>
            <div>
              <label className="label">Clinical Notes</label>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                rows={6}
                placeholder="Enter clinical observations examination findings and recommendations…"
                className="input resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setNotesModal(null)}>Cancel</Button>
              <Button onClick={handleSaveNotes} loading={savingNotes}>Save Notes</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
