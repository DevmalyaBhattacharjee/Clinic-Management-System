import { APPOINTMENT_STATUS_COLORS, BILL_STATUS_COLORS } from './constants'

export const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}

export const formatTime = (t) => {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const d = new Date(); d.setHours(+h, +m)
  return d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })
}

export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', minimumFractionDigits:0 })
    .format(n ?? 0)

export const appointmentStatusClass = (s) => APPOINTMENT_STATUS_COLORS[s] || 'badge-slate'
export const billStatusClass         = (s) => BILL_STATUS_COLORS[s]        || 'badge-slate'

export const truncate = (s, len = 40) =>
  s && s.length > len ? s.slice(0, len) + '…' : (s || '')

export const initials = (name = '') =>
  name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()

/**
 * Extract the most human-readable error message from an Axios error.
 * Handles Spring Boot's standard ErrorResponse { status, message, timestamp }.
 */
export const getErrorMessage = (err) => {
  // Spring Boot ErrorResponse format
  if (err?.response?.data?.message) return err.response.data.message
  // Fallback: Axios network message
  if (err?.message) return err.message
  return 'Something went wrong. Please try again.'
}

// Alias used by useApi / useMutation hooks
export const parseApiError = getErrorMessage

// Email + password helpers used by legacy pages
export const validateEmail    = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
export const validatePassword  = (v) => v && v.length >= 6
