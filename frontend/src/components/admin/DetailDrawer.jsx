import { useEffect } from 'react'
import Avatar from '../common/Avatar'

/**
 * Side drawer for viewing entity details without leaving the page.
 */
export default function DetailDrawer({ open, onClose, title, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col
        transform transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  )
}

/** Helper: one labelled row inside a drawer */
export function DrawerRow({ label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <span className={`text-sm text-slate-800 ${mono ? 'font-mono' : 'font-medium'}`}>
        {value || <span className="text-slate-300 font-normal italic">—</span>}
      </span>
    </div>
  )
}
