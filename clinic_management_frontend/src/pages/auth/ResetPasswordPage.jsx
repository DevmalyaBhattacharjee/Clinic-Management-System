import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Input    from '../../components/common/Input'
import Button   from '../../components/common/Button'
import { APP_NAME }                                    from '../../utils/constants'
import { validate, required, minLen, passwordStrength } from '../../utils/validation'
import { getErrorMessage }                              from '../../utils/helpers'
import { useTitle }                                     from '../../hooks/useTitle'
import authService                                      from '../../services/authService'

// ── Password strength indicator ───────────────────────────────────────────────
function PasswordStrengthBar({ password }) {
  const { score, label, color } = passwordStrength(password)
  if (!password) return null
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300
            ${i <= score ? color : 'bg-slate-200 dark:bg-slate-700'}`}/>
        ))}
      </div>
      <p className={`text-xs font-semibold ${{
        1:'text-red-500', 2:'text-amber-500', 3:'text-brand-600', 4:'text-emerald-600'
      }[score] || 'text-slate-400'}`}>
        {label && `Strength: ${label}`}
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  useTitle('Reset Password')

  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const token      = params.get('token')

  const [form,     setForm]    = useState({ newPassword: '', confirmPassword: '' })
  const [errors,   setErrors]  = useState({})
  const [touched,  setTouched] = useState({})
  const [loading,  setLoading] = useState(false)
  const [done,     setDone]    = useState(false)
  const [tokenErr, setTokenErr]= useState('')

  // Validate token presence immediately
  useEffect(() => {
    if (!token || token.trim() === '') {
      setTokenErr('No reset token found in the URL. Please use the link from your email.')
    }
  }, [token])

  const getRules = useCallback(() => ({
    newPassword: [
      required('New password'),
      minLen(8, 'Password'),
    ],
    confirmPassword: [
      required('Confirm password'),
      (v) => v !== form.newPassword ? 'Passwords do not match' : '',
    ],
  }), [form.newPassword])

  const set = (field) => (e) => {
    const val = e.target.value
    setForm(f => ({ ...f, [field]: val }))
    if (touched[field]) {
      const errs = validate({ ...form, [field]: val }, getRules())
      setErrors(er => ({ ...er, [field]: errs[field] || '' }))
    }
  }

  const blur = (field) => () => {
    setTouched(t => ({ ...t, [field]: true }))
    const errs = validate(form, getRules())
    setErrors(er => ({ ...er, [field]: errs[field] || '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const rules = getRules()
    setTouched({ newPassword: true, confirmPassword: true })
    const errs = validate(form, rules)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await authService.resetPassword(token, form.newPassword)
      setDone(true)
    } catch (err) {
      const status = err?.response?.status
      if (status === 400) {
        const msg = err.response?.data?.message || 'This reset link is invalid or has expired.'
        setTokenErr(msg)
      } else {
        setErrors({ newPassword: getErrorMessage(err) || 'Something went wrong. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Shell / wrapper ───────────────────────────────────────────────────────
  const Shell = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/20 to-slate-100
                    dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
                    flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400
                     hover:text-slate-700 dark:hover:text-slate-200 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to sign in
        </Link>
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800
                          flex items-center justify-center shadow">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 text-lg">{APP_NAME}</span>
        </div>
        {children}
      </div>
    </div>
  )

  // ── Invalid / expired token ───────────────────────────────────────────────
  if (tokenErr) {
    return (
      <Shell>
        <motion.div initial={{ opacity:0, scale:.97 }} animate={{ opacity:1, scale:1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200
                     dark:border-slate-700 shadow-card p-7 text-center">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full
                          flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Invalid or expired link
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {tokenErr} Reset links are valid for 30 minutes.
          </p>
          <Link to="/forgot-password" className="btn btn-primary block mb-3">
            Request a new link
          </Link>
          <Link to="/login"
            className="text-sm text-brand-600 dark:text-brand-400 font-semibold
                       hover:text-brand-700 transition-colors">
            Back to sign in
          </Link>
        </motion.div>
      </Shell>
    )
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <Shell>
        <motion.div initial={{ opacity:0, scale:.97 }} animate={{ opacity:1, scale:1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200
                     dark:border-slate-700 shadow-card p-7 text-center">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full
                          flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Password reset!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full" size="lg">
            Sign in now
          </Button>
        </motion.div>
      </Shell>
    )
  }

  // ── Reset form ────────────────────────────────────────────────────────────
  return (
    <Shell>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200
                      dark:border-slate-700 shadow-card p-7">
        <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/40 rounded-2xl
                        flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
          </svg>
        </div>

        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
          Set new password
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Choose a strong password — at least 8 characters with a mix of letters, numbers, and symbols.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <Input
              label="New password"
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={set('newPassword')}
              onBlur={blur('newPassword')}
              error={touched.newPassword && errors.newPassword}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
              autoFocus
            />
            <PasswordStrengthBar password={form.newPassword}/>
          </div>

          <Input
            label="Confirm new password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            onBlur={blur('confirmPassword')}
            error={touched.confirmPassword && errors.confirmPassword}
            placeholder="Repeat your password"
            required
            autoComplete="new-password"
          />

          <Button type="submit" loading={loading} className="w-full mt-1" size="lg">
            {loading ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </div>
    </Shell>
  )
}
