import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Avatar from '../../components/common/Avatar'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { APP_NAME } from '../../utils/constants'
import { useTitle } from '../../hooks/useTitle'

function SettingSection({ title, description, children }) {
  return (
    <div className="card">
      <div className="border-b border-slate-100 pb-4 mb-5">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {description && <p className="text-sm text-slate-400 mt-0.5">{description}</p>}
      </div>
      {children}
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
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2
          ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
          ${checked ? 'translate-x-5' : 'translate-x-0'}`}/>
      </button>
    </div>
  )
}

export default function AdminSettings() {
  useTitle('Settings')
  const { user, logout } = useAuth()
  const { addToast }     = useToast()
  const navigate         = useNavigate()

  const [logoutConfirm, setLogoutConfirm] = useState(false)

  // Notification preferences (local state — no backend endpoint)
  const [notifs, setNotifs] = useState({
    newAppointment:   true,
    appointmentCancel:true,
    newPatient:       true,
    systemAlerts:     false,
  })

  // Display preferences
  const [display, setDisplay] = useState({
    compactTables: false,
    show24h:       false,
  })

  const handleLogout = () => {
    logout()
    addToast('Logged out successfully', 'success')
    navigate('/login')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Settings" subtitle="Manage your admin account and system preferences"/>

      {/* Admin, profile, card */}
      <SettingSection title="Admin Profile" description="Your administrator account information">
        <div className="flex items-center gap-4 mb-5">
          <Avatar name={user?.name} size="xl"/>
          <div>
            <p className="font-bold text-slate-800 text-lg">{user?.name}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
              🛡️ Administrator
            </span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">User ID</p>
            <p className="font-mono text-sm text-slate-700">#{user?.userId}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Role</p>
            <p className="text-sm font-medium text-violet-700">{user?.role}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-400 mb-0.5">Email</p>
            <p className="text-sm text-slate-700">{user?.email}</p>
          </div>
        </div>
        <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Profile editing</span> for admin accounts is managed by the system. Contact your database administrator to update credentials.
          </p>
        </div>
      </SettingSection>

      {/* Notification, preferences */}
      <SettingSection title="Notification Preferences" description="Choose what events trigger notifications (saved locally)">
        <ToggleRow
          label="New appointments"
          description="Alert when a new appointment is booked"
          checked={notifs.newAppointment}
          onChange={v => { setNotifs(n=>({...n,newAppointment:v})); addToast('Preference saved','success') }}
        />
        <ToggleRow
          label="Appointment cancellations"
          description="Alert when an appointment is cancelled or no-show"
          checked={notifs.appointmentCancel}
          onChange={v => { setNotifs(n=>({...n,appointmentCancel:v})); addToast('Preference saved','success') }}
        />
        <ToggleRow
          label="New patient registrations"
          description="Alert when a new patient account is created"
          checked={notifs.newPatient}
          onChange={v => { setNotifs(n=>({...n,newPatient:v})); addToast('Preference saved','success') }}
        />
        <ToggleRow
          label="System alerts"
          description="Critical system notifications"
          checked={notifs.systemAlerts}
          onChange={v => { setNotifs(n=>({...n,systemAlerts:v})); addToast('Preference saved','success') }}
        />
      </SettingSection>

      {/* Display, preferences */}
      <SettingSection title="Display Preferences" description="Customize how data is shown">
        <ToggleRow
          label="Compact table rows"
          description="Reduce row padding for denser data views"
          checked={display.compactTables}
          onChange={v => { setDisplay(d=>({...d,compactTables:v})); addToast('Preference saved','success') }}
        />
        <ToggleRow
          label="24-hour time format"
          description="Show times as 14:30 instead of 2:30 PM"
          checked={display.show24h}
          onChange={v => { setDisplay(d=>({...d,show24h:v})); addToast('Preference saved','success') }}
        />
      </SettingSection>

      {/* System, info */}
      <SettingSection title="System Information">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ['Application',  APP_NAME],
            ['Backend',      'Spring Boot 3.2'],
            ['Auth',         'JWT (24h sessions)'],
            ['Database',     'MySQL 8.x'],
            ['API Version',  'v1.0.0'],
            ['Frontend',     'React 18 + Vite'],
          ].map(([k,v]) => (
            <div key={k} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
              <span className="text-xs text-slate-400 font-medium">{k}</span>
              <span className="text-xs text-slate-700 font-mono">{v}</span>
            </div>
          ))}
        </div>
      </SettingSection>

      {/* Danger, zone */}
      <SettingSection title="Session">
        <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-red-700">Sign out of all devices</p>
            <p className="text-xs text-red-500 mt-0.5">This will invalidate your current session immediately.</p>
          </div>
          <Button variant="danger" onClick={() => setLogoutConfirm(true)}>
            Sign Out
          </Button>
        </div>
      </SettingSection>

      <ConfirmDialog
        open={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign out?"
        message="You will be redirected to the login page. Your session will end."
        confirmLabel="Sign Out"
        variant="danger"
      />
    </div>
  )
}
