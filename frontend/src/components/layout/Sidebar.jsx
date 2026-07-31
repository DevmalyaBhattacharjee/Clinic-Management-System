import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth }        from '../../context/AuthContext'
import { useToast }       from '../../context/ToastContext'
import { usePreferences } from '../../context/PreferencesContext'
import { ROLES, ROLE_META, APP_NAME } from '../../utils/constants'
import Avatar from '../common/Avatar'
import ThemeSwitcher from '../common/ThemeSwitcher'

const I = ({ d, d2 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
    <path d={d}/>{d2 && <path d={d2}/>}
  </svg>
)

const NAV = {
  [ROLES.ADMIN]: [
    { to:'/admin/dashboard',     label:'Dashboard',    d:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to:'/admin/doctors',       label:'Doctors',      d:'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { to:'/admin/patients',      label:'Patients',     d:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { to:'/admin/receptionists', label:'Receptionists',d:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { to:'/admin/appointments',  label:'Appointments', d:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to:'/admin/settings',      label:'Settings',     d:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', d2:'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ],
  [ROLES.DOCTOR]: [
    { to:'/doctor/dashboard',     label:'Dashboard',      d:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to:'/doctor/appointments',  label:'Appointments',   d:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to:'/doctor/patients',      label:'My Patients',    d:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { to:'/doctor/records',       label:'Medical Records',d:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { to:'/doctor/prescriptions', label:'Prescriptions',  d:'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { to:'/doctor/availability',  label:'Schedule',       d:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { to:'/doctor/profile',       label:'My Profile',     d:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ],
  [ROLES.PATIENT]: [
    { to:'/patient/dashboard',     label:'Dashboard',      d:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to:'/patient/appointments',  label:'Appointments',   d:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to:'/patient/records',       label:'Medical Records',d:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { to:'/patient/prescriptions', label:'Prescriptions',  d:'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { to:'/patient/bills',         label:'Billing',        d:'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z' },
    { to:'/patient/profile',       label:'My Profile',     d:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ],
  [ROLES.RECEPTIONIST]: [
    { to:'/receptionist/dashboard',    label:'Dashboard',   d:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to:'/receptionist/patients',     label:'Patients',    d:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { to:'/receptionist/appointments', label:'Appointments',d:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to:'/receptionist/billing',      label:'Billing',     d:'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z' },
    { to:'/receptionist/doctors',      label:'Doctors',     d:'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { to:'/receptionist/profile',      label:'My Profile',  d:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', d2:'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ],
}

export default function Sidebar({ role, open, onClose }) {
  const { user, logout }   = useAuth()
  const { addToast }       = useToast()
  const { prefs, set }     = usePreferences()
  const navigate           = useNavigate()
  const links              = NAV[role] || []
  const meta               = ROLE_META[role] || {}
  const collapsed          = prefs.sidebarCollapsed

  const handleLogout = () => {
    logout()
    addToast('Logged out successfully', 'success')
    navigate('/login')
  }

  return (
    <>
      {open && (
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="fixed inset-0 bg-slate-900/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration:.25, ease:'easeInOut' }}
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-slate-800
          border-r border-slate-100 dark:border-slate-700 z-30 flex flex-col
          transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
          overflow-hidden
        `}
      >
        {/* Brand */}
        <div className="px-3 pt-5 pb-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between min-h-[65px]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${meta.color||'from-brand-500 to-brand-700'} flex items-center justify-center shadow-sm flex-shrink-0`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            {!collapsed && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.1 }} className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{APP_NAME}</p>
                <p className="text-[10px] text-slate-400 leading-tight truncate">{meta.label||'Portal'}</p>
              </motion.div>
            )}
          </div>
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => set('sidebarCollapsed', !collapsed)}
            className="hidden lg:flex p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors flex-shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-hide">
          {links.map((link, i) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              title={collapsed ? link.label : undefined}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
              }
            >
              <I d={link.d} d2={link.d2}/>
              {!collapsed && <span className="truncate">{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: theme + user */}
        <div className="px-2 py-3 border-t border-slate-50 dark:border-slate-700 space-y-1">
          {/* Theme toggle in sidebar for mobile */}
          {!collapsed && (
            <div className="flex items-center justify-between px-3 py-2 lg:hidden">
              <span className="text-xs text-slate-500 dark:text-slate-400">Dark mode</span>
              <ThemeSwitcher/>
            </div>
          )}
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2">
              <Avatar name={user?.name} src={user?.profileImageUrl} size="sm"/>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign Out' : undefined}
            className={`sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 ${collapsed ? 'justify-center px-2' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  )
}
