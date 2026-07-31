import { useState, useRef, useEffect } from 'react'
import { useAuth }          from '../../context/AuthContext'
import { useTheme }         from '../../context/ThemeContext'
import { useNotifications } from '../../context/NotificationContext'
import { ROLE_META }        from '../../utils/constants'
import Avatar               from '../common/Avatar'
import ThemeSwitcher        from '../common/ThemeSwitcher'
import NotificationPanel    from '../common/NotificationPanel'
import GlobalSearch         from '../common/GlobalSearch'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

export default function Navbar({ onMenuClick }) {
  const { user }          = useAuth()
  const { isDark }        = useTheme()
  const { unreadCount }   = useNotifications()
  const meta              = user ? (ROLE_META[user.role] || {}) : {}

  const [notifOpen,  setNotifOpen]  = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const notifRef = useRef(null)

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    if (notifOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  // Ctrl+K opens global search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <header className="h-14 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700
                         px-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-20
                         transition-colors duration-300">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 lg:hidden transition-colors"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Good {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Global search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-400
                       hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
            aria-label="Open search (Ctrl+K)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span className="hidden md:block text-xs">Search</span>
            <kbd className="hidden md:block text-[10px] bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Theme switcher */}
          <div className="hidden sm:block">
            <ThemeSwitcher/>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 ring-2 ring-white dark:ring-slate-800">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)}/>}
          </div>

          {/* Role pill */}
          {meta.label && (
            <span className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bg||'bg-brand-50'} ${meta.text||'text-brand-700'}`}>
              <span>{meta.icon}</span>
              <span className="hidden lg:block">{meta.label}</span>
            </span>
          )}

          <Avatar name={user?.name} src={user?.profileImageUrl} size="sm"/>
        </div>
      </header>

      {/* Global search modal */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)}/>
    </>
  )
}
