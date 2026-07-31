import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../../context/ToastContext'

const TOAST_STYLES = {
  success: { bar:'bg-emerald-500', bg:'bg-white dark:bg-slate-800', icon:'✓', iconBg:'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' },
  error:   { bar:'bg-red-500',     bg:'bg-white dark:bg-slate-800', icon:'✕', iconBg:'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' },
  warning: { bar:'bg-amber-500',   bg:'bg-white dark:bg-slate-800', icon:'!', iconBg:'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' },
  info:    { bar:'bg-brand-500',   bg:'bg-white dark:bg-slate-800', icon:'i', iconBg:'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400' },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => {
          const s = TOAST_STYLES[t.type] || TOAST_STYLES.info
          return (
            <motion.div
              key={t.id}
              initial={{ opacity:0, x:60, scale:.9 }}
              animate={{ opacity:1, x:0, scale:1 }}
              exit={{ opacity:0, x:60, scale:.9 }}
              transition={{ type:'spring', stiffness:400, damping:30 }}
              className={`${s.bg} rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden pointer-events-auto`}
            >
              <div className={`h-1 ${s.bar}`}/>
              <div className="flex items-start gap-3 px-4 py-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${s.iconBg}`}>
                  {s.icon}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 flex-1 leading-snug pt-0.5">{t.message}</p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0 mt-0.5"
                  aria-label="Dismiss"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
