import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useApi } from '../../hooks/useApi'
import StatCard from '../../components/common/StatCard'
import PageHeader from '../../components/common/PageHeader'
import Avatar from '../../components/common/Avatar'
import StatusChip from '../../components/common/StatusChip'
import doctorService from '../../services/doctorService'
import { useAuth } from '../../context/AuthContext'
import { formatDate, formatTime } from '../../utils/helpers'
import { useTitle } from '../../hooks/useTitle'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const APPT_STATUS_ORDER = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

export default function DoctorDashboard() {
  useTitle('Dashboard')
  const { user } = useAuth()

  const { data: today    = [], loading: l1 } = useApi(useCallback(() => doctorService.getTodayAppointments(),    []), { initialData: [] })
  const { data: upcoming = [], loading: l2 } = useApi(useCallback(() => doctorService.getUpcomingAppointments(), []), { initialData: [] })
  const { data: patients = [], loading: l3 } = useApi(useCallback(() => doctorService.getPatients(),            []), { initialData: [] })
  const { data: allAppts = [], loading: l4 } = useApi(useCallback(() => doctorService.getAppointments(),        []), { initialData: [] })

  const anyLoading = l1 || l2 || l3 || l4

  /* ── Derived stats ── */
  const completedToday    = useMemo(() => today.filter(a => a.status === 'COMPLETED').length, [today])
  const inProgressToday   = useMemo(() => today.filter(a => a.status === 'IN_PROGRESS').length, [today])
  const pendingToday      = useMemo(() => today.filter(a => ['SCHEDULED','CONFIRMED'].includes(a.status)).length, [today])

  /* ── Last-7-days trend from allAppts ── */
  const weekTrend = useMemo(() => {
    const todayDate = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(todayDate)
      d.setDate(todayDate.getDate() - (6 - i))
      const dateStr = d.toISOString().split('T')[0]
      const count = allAppts.filter(a => a.appointmentDate === dateStr).length
      return { day: DAYS[d.getDay()], date: dateStr, count }
    })
  }, [allAppts])

  /* ── Status distribution for today ── */
  const todayStatusData = useMemo(() => {
    const counts = {}
    today.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1 })
    return APPT_STATUS_ORDER
      .filter(s => counts[s])
      .map(s => ({ status: s, count: counts[s] }))
  }, [today])

  /* ── Upcoming: next 5 ── */
  const upcomingSlice = useMemo(() =>
    [...upcoming]
      .sort((a, b) => new Date(a.appointmentDate + 'T' + a.appointmentTime) - new Date(b.appointmentDate + 'T' + b.appointmentTime))
      .slice(0, 5)
  , [upcoming])

  /* ── Recent patients ── */
  const recentPatients = useMemo(() => patients.slice(0, 6), [patients])

  const firstName = user?.name?.split(' ').slice(1).join(' ') || user?.name || 'Doctor'

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good day Dr. ${firstName} 👋`}
        subtitle={new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
        action={
          <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
            Live
          </span>
        }
      />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Today's Total"  value={l1 ? '…' : today.length}
          sub={`${pendingToday} pending`}          icon="📅" color="bg-brand-500"/>
        <StatCard title="Completed"      value={l1 ? '…' : completedToday}
          sub="today"                              icon="✅" color="bg-teal-500"/>
        <StatCard title="Upcoming"       value={l2 ? '…' : upcoming.length}
          sub="future appts"                       icon="📋" color="bg-violet-500"/>
        <StatCard title="My Patients"    value={l3 ? '…' : patients.length}
          sub="total treated"                      icon="👤" color="bg-emerald-500"/>
      </div>

      {/* ── Charts row ── */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* 7-day trend */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-800">Appointment Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 7 days</p>
            </div>
            <Link to="/doctor/appointments" className="text-xs text-brand-600 hover:text-brand-700 font-medium">View all →</Link>
          </div>
          {l4 ? (
            <div className="h-52 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={weekTrend}>
                <defs>
                  <linearGradient id="drGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b67f5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b67f5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="day" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip
                  contentStyle={{border:'none',borderRadius:12,boxShadow:'0 8px 24px rgba(0,0,0,.1)',fontSize:12}}
                  formatter={v => [v, 'Appointments']}
                  labelFormatter={(_,p) => p?.[0]?.payload?.date || ''}
                />
                <Area dataKey="count" stroke="#3b67f5" strokeWidth={2.5} fill="url(#drGrad)"
                  dot={{r:4,fill:'#3b67f5',strokeWidth:0}} activeDot={{r:6}}/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Today's status breakdown */}
        <div className="card lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Today's Breakdown</h3>
            <span className="text-xs text-slate-400">{today.length} total</span>
          </div>
          {l1 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
          ) : !todayStatusData.length ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <p className="text-sm">No appointments today</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center space-y-3">
              {todayStatusData.map(({ status, count }) => {
                const pct = Math.round((count / today.length) * 100)
                const barColors = {
                  SCHEDULED:'bg-blue-400', CONFIRMED:'bg-emerald-400',
                  IN_PROGRESS:'bg-amber-400', COMPLETED:'bg-teal-400',
                  CANCELLED:'bg-red-400', NO_SHOW:'bg-slate-300',
                }
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">{status.replace(/_/g,' ')}</span>
                      <span className="font-semibold text-slate-800">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColors[status] || 'bg-slate-400'} transition-all duration-500`} style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Today's schedule + upcoming + recent patients ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Today's schedule */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Today's Schedule</h3>
            <Link to="/doctor/appointments" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Full view →</Link>
          </div>
          {l1 ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"/>)}</div>
          ) : !today.length ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">🗓️</p>
              <p className="text-slate-400">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide pr-1">
              {[...today]
                .sort((a,b) => a.appointmentTime?.localeCompare(b.appointmentTime))
                .map(a => (
                <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                  ${a.status === 'IN_PROGRESS' ? 'border-amber-200 bg-amber-50' :
                    a.status === 'COMPLETED'   ? 'border-teal-100 bg-teal-50/50' :
                    'border-slate-100 bg-white hover:bg-slate-50'}`}>
                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
                    #{a.tokenNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">{a.patientName}</p>
                    <p className="text-xs text-slate-400 truncate">{formatTime(a.appointmentTime)} · {a.reason || 'Consultation'}</p>
                  </div>
                  <StatusChip status={a.status} showDot/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: upcoming + recent patients */}
        <div className="space-y-4">
          {/* Upcoming appointments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Upcoming</h3>
              <Link to="/doctor/appointments" className="text-xs text-brand-600 hover:text-brand-700 font-medium">{upcoming.length} total →</Link>
            </div>
            {l2 ? <p className="text-slate-400 text-sm">Loading…</p>
            : !upcomingSlice.length ? <p className="text-slate-400 text-sm">No upcoming appointments</p>
            : upcomingSlice.map(a => (
              <div key={a.id} className="flex items-center gap-2.5 py-2.5 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-700 font-bold text-xs flex-shrink-0">
                  #{a.tokenNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{a.patientName}</p>
                  <p className="text-xs text-slate-400">{formatDate(a.appointmentDate)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent patients */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Recent Patients</h3>
              <Link to="/doctor/patients" className="text-xs text-brand-600 hover:text-brand-700 font-medium">All →</Link>
            </div>
            {l3 ? <p className="text-slate-400 text-sm">Loading…</p>
            : !recentPatients.length ? <p className="text-slate-400 text-sm">No patients yet</p>
            : recentPatients.map(p => (
              <div key={p.id} className="flex items-center gap-2.5 py-2 border-b border-slate-50 last:border-0">
                <Avatar name={p.name} size="sm"/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.patientNumber}</p>
                </div>
                {p.bloodGroup && (
                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded flex-shrink-0">{p.bloodGroup}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
