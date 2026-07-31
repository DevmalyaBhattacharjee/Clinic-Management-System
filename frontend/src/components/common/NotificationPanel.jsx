import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../../context/NotificationContext'

const ICONS = {
  appointment: { emoji:'📅', bg:'bg-brand-100 dark:bg-brand-900/40', text:'text-brand-600 dark:text-brand-300' },
  billing:     { emoji:'💳', bg:'bg-emerald-100 dark:bg-emerald-900/40', text:'text-emerald-600' },
  patient:     { emoji:'👤', bg:'bg-violet-100 dark:bg-violet-900/40', text:'text-violet-600' },
  system:      { emoji:'⚙️', bg:'bg-slate-100 dark:bg-slate-700', text:'text-slate-600' },
}

export default function NotificationPanel({ onClose }) {
  const { notifs, unreadCount, markRead, markAllRead, dismiss, clearAll } = useNotifications()

  return (
    <motion.div
      initial={{ opacity:0, y:-8, scale:.97 }}
      animate={{ opacity:1, y:0, scale:1 }}
      exit={{ opacity:0, y:-8, scale:.97 }}
      transition={{ duration:.15, ease:'easeOut' }}
      className="absolute right-0 top-full mt-2 w-96 max-h-[480px] flex flex-col
                 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium transition-colors">
              Mark all read
            </button>
          )}
          {notifs.length > 0 && (
            <button onClick={clearAll}
              className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence>
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl mb-2">🔔</span>
              <p className="text-sm text-slate-400">No notifications</p>
            </div>
          ) : notifs.map(n => {
            const meta = ICONS[n.type] || ICONS.system
            return (
              <motion.div
                key={n.id}
                initial={{ opacity:0, x:20 }}
                animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:-20, height:0, padding:0 }}
                transition={{ duration:.2 }}
                onClick={() => markRead(n.id)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0
                  ${!n.read ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}
              >
                <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0 text-base`}>
                  {meta.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium leading-snug ${!n.read ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                      {n.title}
                    </p>
                    <button onClick={e => { e.stopPropagation(); dismiss(n.id) }}
                      className="text-slate-300 hover:text-red-400 transition-colors mt-0.5 flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{n.body}</p>
                  <p className="text-[10px] text-slate-300 dark:text-slate-500 mt-1">{n.time}</p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1.5"/>}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
