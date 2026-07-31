import { useState} from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Avatar from '../../components/common/Avatar'
import Modal from '../../components/common/Modal'
import { APP_NAME } from '../../utils/constants'
import { useTitle } from '../../hooks/useTitle'

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-slate-50 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value || <span className="text-slate-300 italic font-normal">—</span>}</span>
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2
          ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}/>
      </button>
    </div>
  )
}

export default function ReceptionistProfile() {
  useTitle('My Profile')
  const { user, logout } = useAuth()
  const { addToast }     = useToast()
  const navigate         = useNavigate()

  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [notifs, setNotifs] = useState({
    newBookings:   true,
    statusUpdates: true,
    newPatients:   false,
    billAlerts:    true,
  })
  const [display, setDisplay] = useState({
    compactQueue:  false,
    show24h:       false,
    autoRefresh:   false,
  })

  const handleLogout = () => {
    logout()
    addToast('Logged out successfully', 'success')
    navigate('/login')
  }

  const toggleNotif  = (k) => (v) => { setNotifs(n=>({...n,[k]:v}));  addToast('Preference saved','success') }
  const toggleDisplay= (k) => (v) => { setDisplay(d=>({...d,[k]:v})); addToast('Preference saved','success') }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="My Profile" subtitle="Account settings and preferences"/>

      {/* Identity, card */}
      <div className="card">
        <div className="flex items-center gap-5">
          <Avatar name={user?.name} size="xl"/>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                💼 Receptionist
              </span>
              <span className="badge-green badge">Active</span>
            </div>
          </div>
        </div>
        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          {[
            { label:'User ID',     value:`#${user?.userId}` },
            { label:'Role',        value:user?.role          },
            { label:'Session',     value:'JWT · 24h'         },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-slate-800">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Profile changes</span> (name, email, shift, password) are managed by the clinic administrator.
          </p>
        </div>
      </div>

      {/* Notification, prefs */}
      <div className="card">
        <div className="border-b border-slate-100 pb-4 mb-4">
          <h3 className="font-semibold text-slate-800">Notification Preferences</h3>
          <p className="text-sm text-slate-400 mt-0.5">Control what events trigger alerts (saved locally)</p>
        </div>
        <ToggleRow label="New bookings"     description="When a patient books an appointment"  checked={notifs.newBookings}   onChange={toggleNotif('newBookings')}/>
        <ToggleRow label="Status updates"   description="When appointment status changes"       checked={notifs.statusUpdates} onChange={toggleNotif('statusUpdates')}/>
        <ToggleRow label="New patients"     description="When a new patient registers"          checked={notifs.newPatients}   onChange={toggleNotif('newPatients')}/>
        <ToggleRow label="Bill alerts"      description="When a bill is overdue or paid"        checked={notifs.billAlerts}    onChange={toggleNotif('billAlerts')}/>
      </div>

      {/* Display, prefs */}
      <div className="card">
        <div className="border-b border-slate-100 pb-4 mb-4">
          <h3 className="font-semibold text-slate-800">Display Preferences</h3>
          <p className="text-sm text-slate-400 mt-0.5">Customize your workspace</p>
        </div>
        <ToggleRow label="Compact queue rows"  description="Reduce padding in the appointments queue" checked={display.compactQueue} onChange={toggleDisplay('compactQueue')}/>
        <ToggleRow label="24-hour time format" description="Show 14:30 instead of 2:30 PM"           checked={display.show24h}     onChange={toggleDisplay('show24h')}/>
        <ToggleRow label="Auto-refresh queue"  description="Refresh today's queue every 60 seconds"   checked={display.autoRefresh} onChange={toggleDisplay('autoRefresh')}/>
      </div>

      {/* System, info */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">System Information</h3>
        <div className="grid sm:grid-cols-2 gap-x-8">
          {[
            ['Application',    APP_NAME],
            ['Backend',        'Spring Boot 3.2'],
            ['Auth',           'JWT (24h sessions)'],
            ['Role',           'RECEPTIONIST'],
            ['API Version',    'v1.0.0'],
            ['Frontend',       'React 18 + Vite'],
          ].map(([k,v]) => (
            <div key={k} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="text-xs text-slate-400 font-medium">{k}</span>
              <span className="text-xs text-slate-700 font-mono">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Session / logout */}
      <div className="card">
        <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-red-700">Sign out</p>
            <p className="text-xs text-red-500 mt-0.5">Clear your session and return to login</p>
          </div>
          <Button variant="danger" onClick={() => setLogoutConfirm(true)}>Sign Out</Button>
        </div>
      </div>

      {/* Logout, confirm */}
      <Modal open={logoutConfirm} onClose={() => setLogoutConfirm(false)} title="" size="sm">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">Sign out?</h3>
            <p className="text-sm text-slate-500 mt-1.5">You'll be redirected to the login page.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setLogoutConfirm(false)} className="flex-1">Stay</Button>
            <Button variant="danger" onClick={handleLogout} className="flex-1">Sign Out</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
