/** Required field */
export const required = (label = 'This field') =>
  (v) => (!v || !String(v).trim()) ? `${label} is required` : ''

/** Email format */
export const isEmail = (v) =>
  v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address' : ''

/** Minimum length */
export const minLen = (n, label = 'Value') =>
  (v) => v && v.length < n ? `${label} must be at least ${n} characters` : ''

/** Maximum length */
export const maxLen = (n, label = 'Value') =>
  (v) => v && v.length > n ? `${label} must be at most ${n} characters` : ''

/** Phone — 10–15 digits */
export const isPhone = (v) =>
  v && !/^[0-9]{10,15}$/.test(v) ? 'Phone must be 10–15 digits (numbers only)' : ''

/** Date must be in the past */
export const isPastDate = (v) =>
  v && new Date(v) >= new Date() ? 'Date must be in the past' : ''

/** Passwords match */
export const matches = (other, label = 'Passwords') =>
  (v) => v && v !== other ? `${label} do not match` : ''

/**
 * Run a rule map against form values.
 * rules = { fieldName: [validator1, validator2, …] }
 * Returns { fieldName: 'first error' } — only the first failing rule per field.
 */
export const validate = (values, rules) => {
  const errors = {}
  for (const [field, validators] of Object.entries(rules)) {
    for (const fn of validators) {
      const err = fn(values[field])
      if (err) { errors[field] = err; break }
    }
  }
  return errors
}

// ── Password strength ──────────────────────────────────────────────────────────

/**
 * Returns a score 0–4 and label/colour for a password string.
 * 0 = empty, 1 = weak, 2 = fair, 3 = good, 4 = strong
 */
export const passwordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8)              score++
  if (pwd.length >= 12)             score++
  if (/[A-Z]/.test(pwd))           score++
  if (/[0-9]/.test(pwd))           score++
  if (/[^A-Za-z0-9]/.test(pwd))    score++
  // cap at 4
  const capped = Math.min(score, 4)
  const map = [
    { label: '',        color: 'bg-slate-200' },
    { label: 'Weak',    color: 'bg-red-400'   },
    { label: 'Fair',    color: 'bg-amber-400'  },
    { label: 'Good',    color: 'bg-brand-400'  },
    { label: 'Strong',  color: 'bg-emerald-500'},
  ]
  return { score: capped, ...map[capped] }
}
