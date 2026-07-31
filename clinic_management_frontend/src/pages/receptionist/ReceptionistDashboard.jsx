import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/common/StatCard'
import Avatar from '../../components/common/Avatar'
import StatusChip from '../../components/common/StatusChip'
import TokenBadge from '../../components/receptionist/TokenBadge'
import receptionistService from '../../services/receptionistService'
import { formatTime, formatCurrency } from '../../utils/helpers'
import { useTitle } from '../../hooks/useTitle'

const STATUS_BAR_COLORS = {
  SCHEDULED:'bg-blue-400', CONFIRMED:'bg-emerald-400', IN_PROGRESS:'bg-amber-400',
  COMPLETED:'bg-teal-400', CANCELLED:'bg-red-400', NO_SHOW:'bg-slate-300',
}

function StatusBar({ label, value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return  (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="font-bold text-slate-800">{value} <span className="text-slate-400 font-normal">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function ReceptionistDashboard() {
  useTitle('Dashboard')
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Receptionist'

  const { data: summary,       loading: ls } = useApi(useCallback(() => receptionistService.getTodaySummary(),      []))
  const { data: todayAppts=[],  loading: la } = useApi(useCallback(() => receptionistService.getTodayAppointments(), []), { initialData: [] })
  const { data: unpaidBills=[],loading: lb  } = useApi(useCallback(() => receptionistService.getUnpaidBills(),       []), { initialData: [] })
  const { data: todayBills=[],  loading: ltb} = useApi(useCallback(() => receptionistService.getTodayBills(),        []), { initialData: [] })
  const { data: patients=[],    loading: lp  } = useApi(useCallback(() => receptionistService.getPatients(),          []), { initialData: [] })

  const s           = summary || {}
  const total       = s.totalAppointments || 0
  const unpaidTotal = useMemo(() => (unpaidBills || []).reduce((sum,b) => sum + (b.finalAmount||0), 0), [unpaidBills])
  const todayRev    = useMemo(() => (todayBills || []).filter(b=>b.status==='PAID').reduce((sum,b) => sum + (b.finalAmount||0), 0), [todayBills])

  // Sort today appointments by time for the queue
  const sortedQueue = useMemo(() =>
    [...todayAppts].sort((a,b) => a.appointmentTime?.localeCompare(b.appointmentTime))
  , [todayAppts])

  // Status chart data
  const statusChartData = useMemo(() => [
    { name:'Scheduled',   count: s.scheduledAppointments   || 0 },
    { name:'Confirmed',   count: s.confirmedAppointments   || 0 },
    { name:'In Progress', count: s.inProgressAppointments  || 0 },
    { name:'Completed',   count: s.completedAppointments   || 0 },
    { name:'Cancelled',   count: s.cancelledAppointments   || 0 },
  ], [s])

  const inProgress  = sortedQueue.filter(a => a.status === 'IN_PROGRESS')
  const waiting     = sortedQueue.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
  const recentPatients = useMemo(() => [...patients].sort((a,b) => b.createdAt?.localeCompare(a.createdAt)).slice(0,5), [patients])

  return (
    <div className="space-y-6">
      {/* ── Greeting, banner ── */}
      <div className="relative bg-gradient-to-br from-amber-600 via-amber-500 to-orange-400 rounded-2xl p-6 overflow-hidden text-white">
        <div className="absolute -right-6 -top-6 w-36 h-36 bg-white/10 rounded-full" />
        <div className="absolute right-10 bottom-0 w-20 h-20 bg-white/5 rounded-full" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-amber-100 text-sm font-medium">Welcome back,</p>
            <h2 className="text-2xl font-black mt-0.5">{firstName} 👋</h2>
            <p className="text-amber-100 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center">
              <p className="text-2xl font-black">{ls ? '…' : total}</p>
              <p className="text-xs text-amber-100 font-medium">Today's Total</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center">
              <p className="text-2xl font-black">{ls ? '…' : (s.inProgressAppointments||0)}</p>
              <p className="text-xs text-amber-100 font-medium">In Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat, cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Today's Queue"   value={ls ? '…' : total}
          sub={`${s.completedAppointments||0} done`}      icon="📋" color="bg-brand-500"/>
        <StatCard title="Waiting Now"     value={ls ? '…' : waiting.length}
          sub="to be seen"                               icon="⏳" color="bg-amber-500"/>
        <StatCard title="Unpaid Bills"    value={lb ? '…' : unpaidBills.length}
          sub={formatCurrency(unpaidTotal)}              icon="💳" color={unpaidBills.length > 0 ? 'bg-red-500' : 'bg-teal-500'}/>
        <StatCard title="Today's Revenue" value={ltb ? '…' : formatCurrency(todayRev)}
          sub={`${todayBills.filter(b=>b.status==='PAID').length} paid`} icon="💰" color="bg-emerald-500"/>
      </div>

      {/* ── Quick, actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to:'/receptionist/patients',     icon:'➕', label:'Register Patient',  color:'border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400'     },
          { to:'/receptionist/appointments', icon:'📅', label:'Book Appointment',  color:'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400'     },
          { to:'/receptionist/billing',      icon:'🧾', label:'Create Bill',       color:'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400'},
          { to:'/receptionist/doctors',      icon:'🩺', label:'Doctor Schedule',   color:'border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-400'  },
        ].map(({ to, icon, label, color }) => (
          <Link key={label} to={to}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all hover:scale-105 ${color}`}>
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-semibold leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── Live, Queue + Charts, row ── */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Today's, queue */}
        <div className="card lg:col-span-3 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Live Queue</h3>
              <p className="text-xs text-slate-400 mt-0.5">{waiting.length} waiting · {inProgress.length} in progress</p>
            </div>
            <Link to="/receptionist/appointments" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Manage →</Link>
          </div>
          {la ? (
            <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"/>)}</div>
          ) : !sortedQueue.length ? (
            <div className="flex flex-col items-center justify-center py-10 flex-1 text-center">
              <p className="text-5xl mb-2">📭</p>
              <p className="text-slate-400 font-medium">Queue is empty for today</p>
              <Link to="/receptionist/appointments" className="btn btn-primary btn-sm mt-3">Book Appointment</Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide pr-1 flex-1">
              {sortedQueue.map(a => (
                <div key={a.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                    ${a.status==='IN_PROGRESS' ? 'border-amber-200 bg-amber-50'
                    : a.status==='COMPLETED'   ? 'border-teal-100 bg-teal-50/40 opacity-60'
                    : a.status==='CANCELLED'   ? 'border-slate-100 bg-slate-50 opacity-40'
                    : 'border-slate-100 bg-white hover:bg-slate-50'}`}>
                  <TokenBadge token={a.tokenNumber} size={a.status==='IN_PROGRESS' ? 'md' : 'sm'}/>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{a.patientName}</p>
                    <p className="text-xs text-slate-400 truncate">{a.doctorName} · {formatTime(a.appointmentTime)}</p>
                  </div>
                  <StatusChip status={a.status} showDot/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status, breakdown, chart */}
        <div className="card lg:col-span-2 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4">Today's Breakdown</h3>
          {ls ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
          ) : (
            <>
              <div className="mb-5 space-y-3.5">
                {[
                  ['Scheduled',   s.scheduledAppointments||0,   'bg-blue-400'   ],
                  ['Confirmed',   s.confirmedAppointments||0,   'bg-emerald-400'],
                  ['In Progress', s.inProgressAppointments||0,  'bg-amber-400'  ],
                  ['Completed',   s.completedAppointments||0,   'bg-teal-400'   ],
                  ['Cancelled',   s.cancelledAppointments||0,   'bg-red-400'    ],
                  ['No Show',     s.noShowAppointments||0,      'bg-slate-300'  ],
                ].map(([l,v,c]) => (
                  <StatusBar key={l} label={l} value={v} total={total} color={c}/>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={statusChartData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                  <XAxis dataKey="name" tick={{fontSize:9,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:9,fill:'#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Tooltip contentStyle={{border:'none',borderRadius:10,fontSize:11}}/>
                  <Bar dataKey="count" fill="#f59e0b" radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      {/* ── Unpaid, bills + Recent, patients ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Unpaid, bills */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Unpaid Bills</h3>
              <p className="text-xs text-slate-400 mt-0.5">Outstanding: {formatCurrency(unpaidTotal)}</p>
            </div>
            <Link to="/receptionist/billing" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Collect →</Link>
          </div>
          {lb ? <p className="text-slate-400 text-sm">Loading…</p>
          : !unpaidBills.length ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-1">✅</p>
              <p className="text-slate-400 text-sm">All, bills, are, cleared</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-hide">
              {unpaidBills.slice(0,6).map(b => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{b.patientName}</p>
                    <p className="text-xs font-mono text-slate-400">{b.billNumber}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-red-600">{formatCurrency(b.finalAmount)}</p>
                    <StatusChip status={b.status}/>
                  </div>
                </div>
              ))}
              {unpaidBills.length > 6 && (
                <p className="text-xs text-center text-slate-400">+{unpaidBills.length-6} more · <Link to="/receptionist/billing" className="text-brand-600">View all</Link></p>
              )}
            </div>
          )}
        </div>

        {/* Recent, registrations */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Recent Patients</h3>
            <Link to="/receptionist/patients" className="text-xs text-brand-600 hover:text-brand-700 font-medium">All patients →</Link>
          </div>
          {lp ? <p className="text-slate-400 text-sm">Loading…</p>
          : !recentPatients.length ? <p className="text-slate-400 text-sm">No, patients, yet</p>
          : recentPatients.map(p => (
            <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
              <Avatar name={p.name} size="sm"/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                <p className="text-xs text-slate-400">{p.patientNumber} · {p.phone}</p>
              </div>
              {p.bloodGroup && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded flex-shrink-0">{p.bloodGroup}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
