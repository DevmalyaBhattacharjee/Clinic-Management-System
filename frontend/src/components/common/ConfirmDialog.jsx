import { memo } from 'react'
import Modal  from './Modal'
import Button from './Button'

const VARIANT_META = {
  danger:  { bg:'bg-red-100 dark:bg-red-900/30',    color:'text-red-500',   confirmVariant:'danger'  },
  warning: { bg:'bg-amber-100 dark:bg-amber-900/30', color:'text-amber-500', confirmVariant:'primary' },
  info:    { bg:'bg-brand-100 dark:bg-brand-900/30', color:'text-brand-600', confirmVariant:'primary' },
}

const DEFAULT_ICONS = {
  danger: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
    </svg>
  ),
  warning: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
    </svg>
  ),
  info: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
}

const ConfirmDialog = memo(function ConfirmDialog({
  open, onClose, onConfirm, loading = false,
  title = 'Are you sure?', message = 'This action cannot be undone.',
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', icon,
}) {
  const meta = VARIANT_META[variant] || VARIANT_META.danger

  return (
    <Modal open={open} onClose={onClose} title="" size="sm" hideHeader>
      <div className="text-center space-y-4" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className={`w-14 h-14 ${meta.bg} rounded-full flex items-center justify-center mx-auto ${meta.color}`}>
          {icon || DEFAULT_ICONS[variant]}
        </div>
        <div>
          <h3 id="confirm-title" className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={meta.confirmVariant} onClick={onConfirm} loading={loading} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
})

export default ConfirmDialog
