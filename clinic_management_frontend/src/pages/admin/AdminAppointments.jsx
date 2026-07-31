import { useState, useCallback, useMemo } from 'react'
import { useApi } from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Input from '../../components/common/Input'
import StatusChip from '../../components/common/StatusChip'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import DetailDrawer, { DrawerRow } from '../../components/admin/DetailDrawer'
import { useToast } from '../../context/ToastContext'
import adminService from '../../services/adminService'
import { formatDate, formatTime } from '../../utils/helpers'
import { useTitle } from '../../hooks/useTitle'

const PER_PAGE   = 12
const STATUSES   = ['SCHEDULED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW']

const STATUS_COLOR = {
  SCHEDULED:'bg-blue-50 border-blue-200 text-blue-700',
  CONFIRMED:'bg-emerald-50 border-emerald-200 text-emerald-700',
  IN_PROGRESS:'bg-amber-50 border-amber-200 text-amber-700',
  COMPLETED:'bg-teal-50 border-teal-200 text-teal-700',
  CANCELLED:'bg-red-50 border-red-200 text-red-700',
  NO_SHOW:'bg-slate-50 border-slate-200 text-slate-600',
}

export default function AdminAppointments() {
  useTitle('Appointments')
  const { addToast } = useToast()

  const [tab,     setTab]     = useState('today')  // 'today' | 'all' | 'date'
  const [dateVal, setDateVal] = useState(new Date().toISOString().split('T')[0])
  const [search,  setSearch]  = useState('')
  const [sFilter, setSFilter] = useState('ALL')
  const [page,    setPage]    = useState(1)
  const [viewTarget, setViewTarget] = useState(null)

  const { data: todayAppts = [], loading: lt, execute: reloadToday } = useApi(
    useCallback(() => adminService.getTodayAppointments(), [])
  , { initialData: [] })
  const { data: allAppts   = [], loading: la, execute: reloadAll } = useApi(
    useCallback(() => adminService.getAppointments(), [])
  , { initialData: [] })
  const { data: dateAppts  = [], loading: ld, execute: reloadDate } = useApi(
    useCallback(() => adminService.getAppointmentsByDate(dateVal), [dateVal]),
    { immediate: false }
  , { initialData: [] })

  const rawList = tab === 'today' ? todayAppts : tab === 'date' ? dateAppts : allAppts
  const loading  = tab === 'today' ? lt : tab === 'date' ? ld : la

  const filtered = useMemo(() => {
    let list = (Array.isArray(rawList) ? rawList : [])
    if (sFilter !== 'ALL') list = list.filter(a => a.status === sFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.patientName?.toLowerCase().includes(q) ||
        a.patientNumber?.toLowerCase().includes(q) ||
        a.doctorName?.toLowerCase().includes(q) ||
        a.reason?.toLowerCase().includes(q)
      )
    }
    return list
  }, [rawList, sFilter, search])

  const paginated = useMemo(() => filtered.slice((page-1)*PER_PAGE, page*PER_PAGE), [filtered, page])

  // Status counts for the filter chips
  const statusCounts = useMemo(() => {
    const c = { ALL: rawList.length }
    rawList.forEach(a => { c[a.status] = (c[a.status] || 0) + 1 })
    return c
  }, [rawList])

  const handleDateSearch = () => {
    setTab('date')
    reloadDate()
    setPage(1)
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Appointments" subtitle="View filter and analyse all clinic appointments"/>

      {/* Status summary strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setSFilter(s === sFilter ? 'ALL' : s); setPage(1) }}
            className={`border rounded-xl px-3 py-2.5 text-left transition-all
              ${sFilter === s ? STATUS_COLOR[s] + ' ring-2 ring-offset-1 ring-current' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
            <p className={`text-lg font-black ${sFilter === s ? '' : 'text-slate-800'}`}>
              {loading ? '…' : statusCounts[s] || 0}
            </p>
            <p className={`text-[10px] font-semibold mt-0.5 ${sFilter===s?'':'text-slate-500'}`}>
              {s.replace(/_/g,' ')}
            </p>
          </button>
        ))}
      </div>

      {/* Tab + date picker */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {[['today',"Today's"],['all','All Time']].map(([val, lbl]) => (
            <button key={val} onClick={() => { setTab(val); setSFilter('ALL'); setSearch(''); setPage(1) }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                ${tab === val ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {lbl}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" name="date" value={dateVal} onChange={e => setDateVal(e.target.value)} className="w-44"/>
          <button onClick={handleDateSearch}
            className="btn btn-secondary btn-sm">Search Date</button>
        </div>
        {sFilter !== 'ALL' && (
          <button onClick={() => setSFilter('ALL')} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
            Clear filter ×
          </button>
        )}
      </div>

      <SearchBar value={search} onChange={v=>{setSearch(v);setPage(1)}} onClear={()=>{setSearch('');setPage(1)}}
        placeholder="Search patient doctor reason…"/>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Token','Patient','Doctor','Date','Time','Reason','Status',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/>Loading appointments…</div>
                </td></tr>
              ) : !paginated.length ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <p className="text-slate-400 text-4xl mb-3">📅</p>
                  <p className="text-slate-500 font-medium">No appointments found</p>
                  {(search || sFilter !== 'ALL') && (
                    <button onClick={() => { setSearch(''); setSFilter('ALL') }} className="text-brand-600 text-sm mt-1 hover:text-brand-700">
                      Clear filters
                    </button>
                  )}
                </td></tr>
              ) : paginated.map(a => (
                <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <span className="w-9 h-9 bg-brand-100 text-brand-700 font-bold text-xs rounded-xl flex items-center justify-center">
                      #{a.tokenNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{a.patientName}</p>
                    <p className="text-xs text-slate-400">{a.patientNumber}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{a.doctorName}</p>
                    <p className="text-xs text-slate-400">{a.doctorSpecialization}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(a.appointmentDate)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatTime(a.appointmentTime)}</td>
                  <td className="px-4 py-3">
                    <span className="text-slate-500 text-xs max-w-[160px] truncate block">{a.reason || '—'}</span>
                  </td>
                  <td className="px-4 py-3"><StatusChip status={a.status} type="appt"/></td>
                  <td className="px-4 py-3">
                    <button onClick={() => setViewTarget(a)} className="p-1.5 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Result count + pagination */}
        <div className="px-4 pb-1">
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage}/>
        </div>
      </div>

      {/* Detail Drawer */}
      <DetailDrawer open={!!viewTarget} onClose={() => setViewTarget(null)} title="Appointment Details">
        {viewTarget && (
          <div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mb-4">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700 font-black text-lg">
                #{viewTarget.tokenNumber}
              </div>
              <div>
                <StatusChip status={viewTarget.status} type="appt"/>
                <p className="text-xs text-slate-400 mt-1">{formatDate(viewTarget.appointmentDate)} at {formatTime(viewTarget.appointmentTime)}</p>
              </div>
            </div>
            <DrawerRow label="Patient"        value={viewTarget.patientName}/>
            <DrawerRow label="Patient No."    value={viewTarget.patientNumber} mono/>
            <DrawerRow label="Doctor"         value={viewTarget.doctorName}/>
            <DrawerRow label="Specialization" value={viewTarget.doctorSpecialization}/>
            <DrawerRow label="Date"           value={formatDate(viewTarget.appointmentDate)}/>
            <DrawerRow label="Time"           value={formatTime(viewTarget.appointmentTime)}/>
            <DrawerRow label="Reason"         value={viewTarget.reason}/>
            <DrawerRow label="Notes"          value={viewTarget.notes}/>
            <DrawerRow label="Created"        value={formatDate(viewTarget.createdAt)}/>
          </div>
        )}
      </DetailDrawer>
    </div>
  )
}
