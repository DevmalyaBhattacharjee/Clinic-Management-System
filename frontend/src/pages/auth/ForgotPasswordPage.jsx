import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Input    from '../../components/common/Input'
import Button   from '../../components/common/Button'
import { APP_NAME }                    from '../../utils/constants'
import { validate, required, isEmail } from '../../utils/validation'
import { getErrorMessage }             from '../../utils/helpers'
import { useTitle }                    from '../../hooks/useTitle'
import authService                     from '../../services/authService'

export default function ForgotPasswordPage() {
  useTitle('Forgot Password')

  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const validate_ = useCallback((val) => {
    const errs = validate({ email: val }, { email: [required('Email'), isEmail] })
    return errs.email || ''
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    const err = validate_(email)
    if (err) { setError(err); return }

    setLoading(true)
    try {
      await authService.forgotPassword(email)
      // Backend ALWAYS returns 200 regardless of email existence.
      // This prevents user-enumeration — we always show success.
      setSent(true)
    } catch (err) {
      // Network-level failure only (500, offline, etc.)
      setError(getErrorMessage(err) || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/20 to-slate-100
                    dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
                    flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Back */}
        <Link to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400
                     hover:text-slate-700 dark:hover:text-slate-200 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to sign in
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 text-lg">{APP_NAME}</span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
                        shadow-card p-7">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form"
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                transition={{ duration:.2 }}>

                {/* Icon */}
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/40 rounded-2xl
                                flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none"
                       viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Forgot your password?
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  Enter your registered email and we'll send a secure reset link. It expires in 30 minutes.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <Input
                    label="Email address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      if (touched) setError(validate_(e.target.value))
                    }}
                    onBlur={() => { setTouched(true); setError(validate_(email)) }}
                    error={touched && error}
                    placeholder="alice@example.com"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                  <Button type="submit" loading={loading} className="w-full mt-5" size="lg">
                    {loading ? 'Sending…' : 'Send reset link'}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success"
                initial={{ opacity:0, scale:.97 }} animate={{ opacity:1, scale:1 }}
                transition={{ duration:.25 }}
                className="text-center">

                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl
                                flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  Check your inbox
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                  If{' '}
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {email}
                  </span>
                  {' '}is registered, you'll receive a reset link within a few minutes.
                </p>
                <p className="text-xs text-slate-400 mb-6">
                  Didn't receive it? Check your spam folder. The link expires in 30 minutes.
                </p>

                <div className="space-y-2">
                  <Button
                    onClick={() => { setSent(false); setEmail(''); setError(''); setTouched(false) }}
                    variant="secondary" className="w-full">
                    Try a different email
                  </Button>
                  <Link to="/login"
                    className="block text-sm font-semibold text-brand-600 hover:text-brand-700
                               dark:text-brand-400 transition-colors mt-3">
                    Back to sign in
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Need help? Contact your clinic administrator.
        </p>
      </div>
    </div>
  )
}
