import { useState, useCallback } from 'react'
import { useApi} from '../../hooks/useApi'
import PageHeader from '../../components/common/PageHeader'
import Avatar from '../../components/common/Avatar'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import doctorService from '../../services/doctorService'
import { formatDate} from '../../utils/helpers'
import { useTitle } from '../../hooks/useTitle'

const DAY_OPTS = ['MON','TUE','WED','THU','FRI','SAT','SUN']

function ProfileRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-slate-800">
        {value || <span className="text-slate-300 italic font-normal">—</span>}
      </span>
    </div>
  )
}

export default function DoctorProfile() {
  useTitle('My Profile')
  const { user } = useAuth()
  const { addToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState({})

  // ── Use doctorService (ROLE_DOCTOR endpoints only) ──────────────────────────
  // There is no GET /api/doctor/me endpoint, so we derive profile data from:
  //   1. user context (name, email, userId — always available)
  //   2. the doctor's availability records (gives us our schedule data)
  // Editable professional fields are updated via the doctor's own availability/
  // notes endpoints. Full profile edit (specialization, fee) requires admin.
  const { data: availability = [], loading: la } = useApi(
    useCallback(() => doctorService.getAvailability(), []),
    { initialData: [] }
  )
  const { data: myPatients = [], loading: lp } = useApi(
    useCallback(() => doctorService.getPatients(), []),
    { initialData: [] }
  )
  const { data: allAppts = [], loading: lap } = useApi(
    useCallback(() => doctorService.getAppointments(), []),
    { initialData: [] }
  )

  const loading = la || lp || lap

  const completedAppts = allAppts.filter(a => a.status === 'COMPLETED').length
  const upcomingDaysOff = availability.filter(a =>
    !a.isAvailable && a.date >= new Date().toISOString().split('T')[0]
  ).length

  const openEdit = () => {
    setForm({
      displayName: user?.name || '',
      bio: '',
    })
    setEditing(true)
  }

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="My Profile" subtitle="Your account information"/>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* ── Left: identity ── */}
        <div className="space-y-4">
          <div className="card text-center">
            <Avatar name={user?.name} size="xl" className="mx-auto mb-4"/>
            <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
            <p className="text-brand-600 font-medium text-sm mt-0.5">Doctor</p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              <span className="badge badge-green">Active</span>
              <span className="badge badge-blue">🩺 Doctor</span>
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">Quick Stats</h3>
            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse"/>)}
              </div>
            ) : (
              [
                { label: 'My Patients',       value: myPatients.length },
                { label: 'Completed Consults', value: completedAppts   },
                { label: 'Total Appointments', value: allAppts.length  },
                { label: 'Days Off Scheduled', value: upcomingDaysOff  },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className="text-xs font-semibold text-slate-700">{value}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Right: details ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Account, info */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-2">Account Details</h3>
            <ProfileRow label="Full Name" value={user?.name}/>
            <ProfileRow label="Email"     value={user?.email}/>
            <ProfileRow label="Role"      value="Doctor"/>
            <ProfileRow label="User ID"   value={`#${user?.userId}`}/>
          </div>

          {/* Schedule, summary */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3">Availability Records</h3>
            {la ? (
              <div className="space-y-2">
                {[1,2,3].map(i=><div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse"/>)}
              </div>
            ) : !availability.length ? (
              <p className="text-slate-400 text-sm">No availability records. Set your schedule in the Schedule page.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                {[...availability]
                  .sort((a,b) => a.date.localeCompare(b.date))
                  .slice(0,8)
                  .map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${r.isAvailable ? 'bg-emerald-500' : 'bg-red-400'}`}/>
                    <span className="text-xs font-medium text-slate-700 flex-1">{formatDate(r.date)}</span>
                    <span className="text-xs text-slate-400">{r.startTime?.slice(0,5)} – {r.endTime?.slice(0,5)}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {r.isAvailable ? 'Available' : 'Off'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin-managed, fields, notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">Professional details managed by Admin</p>
                <p className="text-xs text-amber-600 mt-1">
                  Specialization, qualification, license number, consultation fee, and contact phone
                  are managed by the clinic administrator. Contact the admin to update these details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
