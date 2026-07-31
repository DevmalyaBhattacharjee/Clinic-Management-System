import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({
  open,
  onClose,
  title,
  children,
  size       = 'md',
  footer,
  hideHeader = false,
  bodyClass  = '',
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && open) onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const widths = {
    sm:   'max-w-sm',
    md:   'max-w-lg',
    lg:   'max-w-2xl',
    xl:   'max-w-4xl',
    full: 'max-w-full h-full rounded-none',
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:.2 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity:0, scale:.95, y:16 }}
            animate={{ opacity:1, scale:1, y:0 }}
            exit={{ opacity:0, scale:.95, y:8 }}
            transition={{ type:'spring', stiffness:400, damping:30 }}
            className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full ${widths[size]}
                        overflow-hidden flex flex-col max-h-[90vh]`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {!hideHeader && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                  </svg>
                </button>
              </div>
            )}
            <div className={`flex-1 overflow-y-auto p-6 ${bodyClass}`}>{children}</div>
            {footer && (
              <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
