import { useCallback } from 'react'
import { useNotifications } from '../context/NotificationContext'
import { useToast }         from '../context/ToastContext'

/**
 * useNotify — combines toast + persistent notification in one call.
 *
 * Usage:
 *   const { notify, notifyError } = useNotify()
 *
 *   notify('Appointment booked', {
 *     type:  'appointment',
 *     title: 'Appointment booked',
 *     body:  `Dr. Smith — 10:00 AM`,
 *     toast: 'success',    // toast type (default: 'success')
 *   })
 *
 *   notifyError('Failed to load patients')
 */
export function useNotify() {
  const { addNotif }  = useNotifications()
  const { addToast }  = useToast()

  const notify = useCallback((message, options = {}) => {
    const {
      type  = 'system',
      title = message,
      body  = '',
      toast = 'success',
      silent = false,      // true → persist notification but no toast
    } = options

    addToast(message, toast)
    if (!silent) {
      addNotif({ type, title, body })
    }
  }, [addNotif, addToast])

  const notifyError = useCallback((message) => {
    addToast(message || 'An error occurred', 'error')
  }, [addToast])

  return { notify, notifyError }
}
