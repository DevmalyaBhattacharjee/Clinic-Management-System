import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'
import { useApi } from '../../hooks/useApi'
import StatCard from '../../components/common/StatCard'
import PageHeader from '../../components/common/PageHeader'
import StatusChip from '../../components/common/StatusChip'
import adminService from '../../services/adminService'
import { formatDate, formatTime } from '../../utils/helpers'
import { useTitle } from '../../hooks/useTitle'

const APPT_STATUS_COLORS = {
  SCHEDULED:'#3b67f5', CONFIRMED:'#10b981', IN_PROGRESS:'#f59e0b',
  COMPLETED:'#14b8a6', CANCELLED:'#ef4444', NO_SHOW:'#94a3b8',
}
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function AdminDashboard() {
  useTitle('Dashboard')
  const { data: doctors      = [], loading: ld } = useApi(useCallback(() => adminService.getDoctors(), []), { initialData: [] })
  const { data: patients     = [], loading: lp } = useApi(useCallback(() => adminService.getPatients(), []), { initialData: [] })
  const { data: receptionists= [], loading: lr } = useApi(
    useCallback(async () => {
      // Try the full list; fall back to active-only if the endpoint returns an error
      try { return await adminService.getReceptionists() }
      catch { return await adminService.getActiveReceptionists() }
    }, []),
    { initialData: [] }
  )
  const { data: todayAppts   = [], loading: la } = useApi(useCallback(() => adminService.getTodayAppointments(), []), { initialData: [] })
  const { data: allAppts     = [], loading: laa} = useApi(useCallback(() => adminService.getAppointments(), []), { initialData: [] })

  const loading = ld || lp || lr || la

  /* ── Derived analytics ── */
  const activeDoctors      = useMemo(() => doctors.filter(d => d.status === 'ACTIVE').length, [doctors])
  const activePatients     = useMemo(() => patients.filter(p => p.status === 'ACTIVE').length, [patients])
  const activeReceptionists= useMemo(() => receptionists.filter(r => r.status === 'ACTIVE').length, [receptionists])

  // Appointment status distribution for pie
  const apptStatusData = useMemo(() => {
    const counts = {}
    allAppts.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: APPT_STATUS_COLORS[name] || '#94a3b8' }))
  }, [allAppts])

  // Today's appointment status
  const todayStatusCounts = useMemo(() => {
    const c = {}
    todayAppts.forEach(a => { c[a.status] = (c[a.status] || 0) + 1 })
    return c
  }, [todayAppts])

  // Last 7 days appointment trend from allAppts
  const weekTrend = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (6 - i))
      const dateStr = d.toISOString().split('T')[0]
      const count = allAppts.filter(a => a.appointmentDate === dateStr).length
      return { day: DAYS[d.getDay()], count, date: dateStr }
    })
  }, [allAppts])

  // Specialization distribution
  const specData = useMemo(() => {
    const c = {}
    doctors.forEach(d => { if (d.specialization) c[d.specialization] = (c[d.specialization] || 0) + 1 })
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }))
  }, [doctors])

  // Recent 5 appointments for activity feed
  const recentAppts = useMemo(() =>
    [...allAppts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)
  , [allAppts])

  // Quick stats
  const completedToday  = todayStatusCounts['COMPLETED']  || 0
  const pendingToday    = (todayStatusCounts['SCHEDULED'] || 0) + (todayStatusCounts['CONFIRMED'] || 0)
  const cancelledToday  = todayStatusCounts['CANCELLED']  || 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Real-time clinic overview"
        action={
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse inline-block"/>
            Live data
          </span>
        }
      />

      {/* ── Row 1: Key stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Doctors"   value={loading ? '…' : doctors.length}
          sub={`${activeDoctors} active`}
          icon="🩺" color="bg-brand-500"
        />
        <StatCard
          title="Total Patients"  value={loading ? '…' : patients.length}
          sub={`${activePatients} active`}
          icon="🧑‍⚕️" color="bg-emerald-500"
        />
        <StatCard
          title="Today's Appts"  value={loading ? '…' : todayAppts.length}
          sub={`${completedToday} done · ${pendingToday} pending`}
          icon="📅" color="bg-violet-500"
        />
        <StatCard
          title="Receptionists"  value={loading ? '…' : receptionists.length}
          sub={`${activeReceptionists} active`}
          icon="💼" color="bg-amber-500"
        />
      </div>

      {/* ── Row 2: Charts ── */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* 7-day area trend */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-800">Appointment Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 7 days</p>
            </div>
            <Link to="/admin/appointments" className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
              View all →
            </Link>
          </div>
          {laa ? (
            <div className="h-52 flex items-center justify-center text-slate-400 text-sm">Loading chart…</div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={weekTrend}>
                <defs>
                  <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b67f5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b67f5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="day" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip contentStyle={{border:'none',borderRadius:12,boxShadow:'0 8px 24px rgba(0,0,0,.1)',fontSize:12}}
                  formatter={v => [v, 'Appointments']}/>
                <Area dataKey="count" name="Appointments" stroke="#3b67f5" strokeWidth={2.5} fill="url(#apptGrad)" dot={{r:4,fill:'#3b67f5'}} activeDot={{r:6}}/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Appointment status pie */}
        <div className="card lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Status Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">All appointments</p>
            </div>
          </div>
          {laa ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
          ) : !apptStatusData.length ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <div className="flex-1 flex flex-col">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={apptStatusData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" paddingAngle={3}>
                    {apptStatusData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip contentStyle={{border:'none',borderRadius:10,fontSize:12}}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {apptStatusData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: color}}/>
                    <span className="text-slate-500 truncate">{name.replace(/_/g,' ')}</span>
                    <span className="font-semibold text-slate-700 ml-auto">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Specialization bar + Today's schedule ── */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Specialization bar */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">Doctors by Specialization</h3>
          {ld ? (
            <p className="text-slate-400 text-sm">Loading…</p>
          ) : !specData.length ? (
            <p className="text-slate-400 text-sm">No doctors yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={specData} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
                <XAxis type="number" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:'#64748b'}} axisLine={false} tickLine={false} width={90}/>
                <Tooltip contentStyle={{border:'none',borderRadius:10,fontSize:12}}/>
                <Bar dataKey="value" name="Doctors" fill="#3b67f5" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Today's appointments list */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Today's Schedule</h3>
              <p className="text-xs text-slate-400 mt-0.5">{todayAppts.length} appointments</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(todayStatusCounts).map(([s, c]) => (
                <StatusChip key={s} status={s} type="appt"/>
              )).slice(0, 3)}
            </div>
          </div>
          {la ? (
            <p className="text-slate-400 text-sm py-4">Loading…</p>
          ) : !todayAppts.length ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">📅</p>
              <p className="text-slate-400 text-sm">No appointments scheduled today</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {todayAppts.slice(0, 8).map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
                    #{a.tokenNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{a.patientName}</p>
                    <p className="text-xs text-slate-400 truncate">{a.doctorName} · {formatTime(a.appointmentTime)}</p>
                  </div>
                  <StatusChip status={a.status} type="appt"/>
                </div>
              ))}
              {todayAppts.length > 8 && (
                <p className="text-xs text-center text-slate-400 pt-1">
                  +{todayAppts.length - 8} more ·{' '}
                  <Link to="/admin/appointments" className="text-brand-600 hover:text-brand-700">View all</Link>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Recent activity + quick actions ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent appointments */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Recent Appointments</h3>
          {laa ? (
            <p className="text-slate-400 text-sm">Loading…</p>
          ) : !recentAppts.length ? (
            <p className="text-slate-400 text-sm">No appointments yet</p>
          ) : (
            <div className="space-y-3">
              {recentAppts.map(a => (
                <div key={a.id} className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">{a.patientName}</span>
                      {' → '}
                      <span className="text-brand-600">{a.doctorName}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(a.appointmentDate)} · {a.reason}</p>
                  </div>
                  <StatusChip status={a.status} type="appt"/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to:'/admin/doctors',       icon:'🩺', label:'Manage Doctors',       color:'hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700' },
              { to:'/admin/patients',      icon:'🧑‍⚕️', label:'View Patients',        color:'hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700' },
              { to:'/admin/receptionists', icon:'💼', label:'Receptionists',         color:'hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700' },
              { to:'/admin/appointments',  icon:'📅', label:'All Appointments',      color:'hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700' },
              { to:'/admin/doctors',       icon:'➕', label:'Add New Doctor',        color:'hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700' },
              { to:'/admin/settings',      icon:'⚙️', label:'System Settings',       color:'hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700' },
            ].map(({ to, icon, label, color }) => (
              <Link key={label} to={to}
                className={`flex items-center gap-2.5 p-3.5 border border-slate-200 rounded-xl transition-all text-sm font-medium text-slate-600 ${color}`}>
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            ))}
          </div>

          {/* Mini stats strip */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
            {[
              { label:'Cancelled today',  value: cancelledToday,  color:'text-red-600'    },
              { label:'In progress',      value: todayStatusCounts['IN_PROGRESS'] || 0, color:'text-amber-600' },
              { label:'No-show today',    value: todayStatusCounts['NO_SHOW']     || 0, color:'text-slate-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-2 bg-slate-50 rounded-xl">
                <p className={`text-xl font-bold ${color}`}>{loading ? '…' : value}</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
