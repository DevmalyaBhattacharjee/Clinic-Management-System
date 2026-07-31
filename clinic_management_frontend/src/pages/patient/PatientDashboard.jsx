import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/common/StatCard'
import StatusChip from '../../components/common/StatusChip'
import patientService from '../../services/patientService'
import { formatDate, formatTime, formatCurrency } from '../../utils/helpers'
import { useTitle } from '../../hooks/useTitle'

function QuickLink({ to, icon, label, color }) {
  return (
    <Link to={to} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:scale-105 ${color}`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-semibold text-center leading-tight">{label}</span>
    </Link>
  )
}

export default function PatientDashboard() {
  useTitle('Dashboard')
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Patient'

  const { data: upcoming      = [], loading: lu } = useApi(useCallback(() => patientService.getUpcoming(),            []), { initialData: [] })
  const { data: records       = [], loading: lr } = useApi(useCallback(() => patientService.getMedicalRecords(),      []), { initialData: [] })
  const { data: prescriptions = [], loading: lp } = useApi(useCallback(() => patientService.getActivePrescriptions(), []), { initialData: [] })
  const { data: bills         = [], loading: lb } = useApi(useCallback(() => patientService.getBills(),               []), { initialData: [] })
  const { data: outstanding,        loading: lo } = useApi(useCallback(() => patientService.getOutstanding(),         []), { initialData: [] })
  const { data: profile,            loading: lpf} = useApi(useCallback(() => patientService.getProfile(),             []), { initialData: [] })

  const unpaidBills  = useMemo(() => bills.filter(b => b.status === 'UNPAID' || b.status === 'PARTIALLY_PAID'), [bills])
  const nextAppt     = useMemo(() =>
    [...upcoming].sort((a,b) => (a.appointmentDate+a.appointmentTime).localeCompare(b.appointmentDate+b.appointmentTime))[0]
  , [upcoming])
  const activePrx    = useMemo(() => prescriptions.filter(p => p.isActive), [prescriptions])

  return (
    <div className="space-y-6">
      {/* ── Greeting, banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 rounded-2xl p-6 text-white">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full"/>
        <div className="absolute -right-2 bottom-0 w-24 h-24 bg-white/5 rounded-full"/>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-brand-200 text-sm font-medium">Good day,</p>
            <h2 className="text-2xl font-black mt-0.5">{firstName}!</h2>
            <p className="text-brand-100 text-sm mt-1">
              {profile?.patientNumber
                ? <span>Patient, ID: <code className="bg-white/20 px-1.5 py-0.5 rounded font-mono">{profile.patientNumber}</code></span>
                : 'Welcome to your health portal'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {nextAppt ? (
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                <p className="text-xs text-brand-200 font-medium">Next, appointment</p>
                <p className="font-bold text-sm mt-0.5">{nextAppt.doctorName}</p>
                <p className="text-xs text-brand-100">{formatDate(nextAppt.appointmentDate)} · {formatTime(nextAppt.appointmentTime)}</p>
              </div>
            ) : (
              <Link to="/patient/appointments"
                className="bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-4 py-3 border border-white/25 text-sm font-semibold">
                Book appointment →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat, cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Upcoming Appts"  value={lu ? '…' : upcoming.length}      sub="scheduled"         icon="📅" color="bg-brand-500"/>
        <StatCard title="Medical Records" value={lr ? '…' : records.length}       sub="on file"           icon="📋" color="bg-violet-500"/>
        <StatCard title="Active Rx"       value={lp ? '…' : activePrx.length}     sub="prescriptions"     icon="💊" color="bg-emerald-500"/>
        <StatCard
          title="Outstanding"
          value={lo ? '…' : formatCurrency(outstanding ?? 0)}
          sub={unpaidBills.length ? `${unpaidBills.length} unpaid bill${unpaidBills.length > 1 ? 's' : ''}` : 'all clear'}
          icon="💳"
          color={outstanding > 0 ? 'bg-red-500' : 'bg-teal-500'}
        />
      </div>

      {/* ── Quick, actions ── */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Quick Actions</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <QuickLink to="/patient/appointments" icon="➕" label="Book Appointment"    color="border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400"/>
          <QuickLink to="/patient/appointments" icon="📅" label="My Appointments"     color="border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-400"/>
          <QuickLink to="/patient/prescriptions"icon="💊" label="Prescriptions"       color="border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400"/>
          <QuickLink to="/patient/records"      icon="📋" label="Medical Records"     color="border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-400"/>
          <QuickLink to="/patient/bills"        icon="🧾" label="Bills & Payments"    color="border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400"/>
          <QuickLink to="/patient/profile"      icon="👤" label="My Profile"          color="border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400"/>
        </div>
      </div>

      {/* ── Outstanding, alert ── */}
      {outstanding > 0 && (
        <div className="flex items-start gap-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-700">Outstanding Balance: {formatCurrency(outstanding)}</p>
            <p className="text-sm text-red-500 mt-0.5">You have {unpaidBills.length} unpaid bill{unpaidBills.length > 1 ? 's' : ''}. Please contact the reception to clear dues.</p>
          </div>
          <Link to="/patient/bills" className="btn btn-danger btn-sm flex-shrink-0">View Bills</Link>
        </div>
      )}

      {/* ── Main, content, row ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Upcoming, appointments */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Upcoming Appointments</h3>
            <Link to="/patient/appointments" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Book / Manage →</Link>
          </div>
          {lu ? (
            <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"/>)}</div>
          ) : !upcoming.length ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-4xl mb-2">📅</p>
              <p className="text-slate-500 font-medium">No upcoming appointments</p>
              <Link to="/patient/appointments" className="btn btn-primary btn-sm mt-3">Book Now</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0,4).map(a => (
                <div key={a.id} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors
                  ${a.status === 'CONFIRMED' ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}>
                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-700 font-black text-xs">#{a.tokenNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{a.doctorName}</p>
                    <p className="text-xs text-slate-400">{a.doctorSpecialization} · {formatDate(a.appointmentDate)} at {formatTime(a.appointmentTime)}</p>
                  </div>
                  <StatusChip status={a.status} showDot/>
                </div>
              ))}
              {upcoming.length > 4 && (
                <p className="text-xs text-center text-slate-400 pt-1">
                  +{upcoming.length - 4} more · <Link to="/patient/appointments" className="text-brand-600 hover:text-brand-700">View all</Link>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: active, prescriptions + recent, bills */}
        <div className="space-y-4">
          {/* Active, Prescriptions */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Active Rx</h3>
              <Link to="/patient/prescriptions" className="text-xs text-brand-600 hover:text-brand-700 font-medium">All →</Link>
            </div>
            {lp ? <p className="text-slate-400 text-sm">Loading…</p>
            : !activePrx.length ? <p className="text-slate-400 text-sm">No, active, prescriptions</p>
            : activePrx.slice(0,4).map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 text-sm">💊</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{p.medicationName}</p>
                  <p className="text-xs text-slate-400">{p.dosage} · {p.frequency}</p>
                </div>
                <span className="badge-green badge flex-shrink-0">Active</span>
              </div>
            ))}
          </div>

          {/* Recent, bills */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Recent Bills</h3>
              <Link to="/patient/bills" className="text-xs text-brand-600 hover:text-brand-700 font-medium">All →</Link>
            </div>
            {lb ? <p className="text-slate-400 text-sm">Loading…</p>
            : !bills.length ? <p className="text-slate-400 text-sm">No, bills, yet</p>
            : bills.slice(0,3).map(b => (
              <div key={b.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-slate-500 truncate">{b.billNumber}</p>
                  <p className="text-sm font-bold text-slate-800">{formatCurrency(b.finalAmount)}</p>
                </div>
                <StatusChip status={b.status}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent, medical, activity ── */}
      {records.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Recent, Medical, Activity</h3>
            <Link to="/patient/records" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Full, history →</Link>
          </div>
          <div className="space-y-3">
            {records.slice(0,3).map(r => (
              <div key={r.id} className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">🏥</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-semibold text-slate-800">{r.chiefComplaint}</p>
                    <span className="text-xs text-slate-400">{formatDate(r.visitDate)}</span>
                  </div>
                  {r.diagnosis && <p className="text-xs text-brand-600 font-medium mt-0.5">Dx: {r.diagnosis}</p>}
                  <p className="text-xs text-slate-400 mt-0.5">Dr. {r.doctorName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
