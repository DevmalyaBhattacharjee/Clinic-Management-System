import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/constants'

const QUICK_LINKS = {
  [ROLES.ADMIN]: [
    { label:'Dashboard',     path:'/admin/dashboard',     icon:'🏠' },
    { label:'Doctors',       path:'/admin/doctors',       icon:'🩺' },
    { label:'Patients',      path:'/admin/patients',      icon:'👥' },
    { label:'Appointments',  path:'/admin/appointments',  icon:'📅' },
    { label:'Receptionists', path:'/admin/receptionists', icon:'💼' },
  ],
  [ROLES.DOCTOR]: [
    { label:'Dashboard',       path:'/doctor/dashboard',     icon:'🏠' },
    { label:'Appointments',    path:'/doctor/appointments',  icon:'📅' },
    { label:'My Patients',     path:'/doctor/patients',      icon:'👥' },
    { label:'Medical Records', path:'/doctor/records',       icon:'📋' },
    { label:'Prescriptions',   path:'/doctor/prescriptions', icon:'💊' },
    { label:'Schedule',        path:'/doctor/availability',  icon:'🗓️' },
  ],
  [ROLES.PATIENT]: [
    { label:'Dashboard',       path:'/patient/dashboard',     icon:'🏠' },
    { label:'Appointments',    path:'/patient/appointments',  icon:'📅' },
    { label:'Medical Records', path:'/patient/records',       icon:'📋' },
    { label:'Prescriptions',   path:'/patient/prescriptions', icon:'💊' },
    { label:'Bills',           path:'/patient/bills',         icon:'🧾' },
  ],
  [ROLES.RECEPTIONIST]: [
    { label:'Dashboard',    path:'/receptionist/dashboard',    icon:'🏠' },
    { label:'Patients',     path:'/receptionist/patients',     icon:'👥' },
    { label:'Appointments', path:'/receptionist/appointments', icon:'📅' },
    { label:'Billing',      path:'/receptionist/billing',      icon:'🧾' },
    { label:'Doctors',      path:'/receptionist/doctors',      icon:'🩺' },
  ],
}

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery]   = useState('')
  const [cursor, setCursor] = useState(0)
  const { user }            = useAuth()
  const navigate            = useNavigate()
  const inputRef            = useRef(null)

  const links = QUICK_LINKS[user?.role] || []
  const filtered = query.trim()
    ? links.filter(l => l.label.toLowerCase().includes(query.toLowerCase()))
    : links

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Keyboard Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        open ? onClose() : null
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c+1, filtered.length-1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c-1, 0)) }
    if (e.key === 'Enter' && filtered[cursor]) {
      navigate(filtered[cursor].path)
      onClose()
    }
    if (e.key === 'Escape') onClose()
  }

  const go = (path) => { navigate(path); onClose() }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity:0, scale:.96, y:-20 }}
            animate={{ opacity:1, scale:1, y:0 }}
            exit={{ opacity:0, scale:.96, y:-20 }}
            transition={{ duration:.15, ease:'easeOut' }}
            className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setCursor(0) }}
                  onKeyDown={handleKey}
                  placeholder="Search pages, actions…"
                  className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm outline-none"
                />
                <kbd className="hidden sm:block text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 font-mono">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto scrollbar-hide py-2">
                {filtered.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No results for "{query}"</p>
                ) : (
                  <>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 pb-1">
                      {query ? 'Results' : 'Quick Navigation'}
                    </p>
                    {filtered.map((item, i) => (
                      <button
                        key={item.path}
                        onClick={() => go(item.path)}
                        onMouseEnter={() => setCursor(i)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                          ${cursor === i ? 'bg-brand-50 dark:bg-brand-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                      >
                        <span className="text-xl w-7 text-center">{item.icon}</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                        {cursor === i && (
                          <span className="ml-auto text-[10px] text-slate-400">↵ Enter</span>
                        )}
                      </button>
                    ))}
                  </>
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-4 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><kbd className="font-mono bg-slate-100 dark:bg-slate-700 px-1 rounded">↑↓</kbd> navigate</span>
                <span className="flex items-center gap-1"><kbd className="font-mono bg-slate-100 dark:bg-slate-700 px-1 rounded">↵</kbd> open</span>
                <span className="flex items-center gap-1"><kbd className="font-mono bg-slate-100 dark:bg-slate-700 px-1 rounded">esc</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
