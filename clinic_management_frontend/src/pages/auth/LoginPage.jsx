import React, { useState, useCallback } from 'react'

import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { ROLES, ROLE_META, APP_NAME } from '../../utils/constants'
import { validate, required, isEmail } from '../../utils/validation'
import { getErrorMessage } from '../../utils/helpers'
import authService from '../../services/authService'
import { useTitle } from '../../hooks/useTitle'

function RoleCard({ role, selected, onClick }) {
  const m = ROLE_META[role]
  return (
    <button
      type="button"
      onClick={() => onClick(role)}
      className={`
        flex items-center gap-2.5 p-3 rounded-xl border-2 w-full text-left
        transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400
        ${selected
          ? `${m.bg} ${m.border} ${m.text} shadow-sm`
          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}
    >
      <span className="text-lg leading-none">{m.icon}</span>
      <span className="text-sm font-semibold">{m.label}</span>
      {selected && (
        <span className="ml-auto">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
        </span>
      )}
    </button>
  )
}

const DEMO_CREDS = {
  [ROLES.ADMIN]:        { email: 'admin@clinic.com',         password: 'admin123'        },
  [ROLES.DOCTOR]:       { email: 'john.smith@clinic.com',    password: 'doctor123'       },
  [ROLES.PATIENT]:      { email: 'alice.anderson@email.com', password: 'patient123'      },
  [ROLES.RECEPTIONIST]: { email: 'mary.williams@clinic.com', password: 'receptionist123' },
}

const loginRules = {
  email:    [required('Email'), isEmail],
  password: [required('Password')],
}

// ── Google Sign-In Button ──────────────────────────────────────────────────────
function GoogleButton() {
  const [loading, setLoading] = React.useState(false)

  const handleGoogleLogin = () => {
    setLoading(true)
    // Navigate directly to Spring's OAuth2 authorization endpoint
    // Spring redirects to Google, then back to our /oauth2/callback
    window.location.href = authService.getGoogleLoginUrl()
  }

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                 border-2 border-slate-200 dark:border-slate-600
                 bg-white dark:bg-slate-700
                 text-slate-700 dark:text-slate-200
                 text-sm font-semibold
                 hover:border-slate-300 dark:hover:border-slate-500
                 hover:bg-slate-50 dark:hover:bg-slate-600
                 transition-all duration-200
                 disabled:opacity-60 disabled:cursor-not-allowed
                 focus-visible:ring-2 focus-visible:ring-brand-400 outline-none"
      aria-label="Continue with Google"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-slate-300 border-t-brand-500 rounded-full animate-spin"/>
      ) : (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      {loading ? 'Redirecting to Google…' : 'Continue with Google'}
    </button>
  )
}

export default function LoginPage() {
  // ── ALL hooks must be called first, unconditionally ──────────────────────────
  useTitle('Sign In')
  const [role,    setRole]    = useState(ROLES.ADMIN)
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)

  const { login, isAuthenticated, loading: authLoading, dashboardRoute } = useAuth()
  const { addToast } = useToast()
  const navigate     = useNavigate()
  const [searchParams] = useSearchParams()
  const oauthError = searchParams.get('oauth_error')
  const [params]     = useSearchParams()

  // useCallback must be here — before any early returns
  const fillDemo = useCallback(() => {
    const d = DEMO_CREDS[role]
    setForm(d)
    setErrors({})
  }, [role])

  const handleRoleChange = useCallback((r) => {
    setRole(r)
    setForm({ email: '', password: '' })
    setErrors({})
    setTouched({})
  }, [])

  const set = useCallback((field) => (e) => {
    const val = e.target.value
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(er => { const n = { ...er }; delete n[field]; return n })
  }, [errors])

  const blur = useCallback((field) => () => {
    setTouched(t => ({ ...t, [field]: true }))
    const errs = validate(form, loginRules)
    if (errs[field]) setErrors(er => ({ ...er, [field]: errs[field] }))
  }, [form])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const errs = validate(form, loginRules)
    if (Object.keys(errs).length) {
      setErrors(errs)
      setTouched({ email: true, password: true })
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      addToast('Welcome back! 👋', 'success')
      navigate(dashboardRoute(), { replace: true })
    } catch (err) {
      addToast(getErrorMessage(err) || 'Invalid email or password', 'error')
      setErrors({ password: 'Invalid email or password' })
    } finally {
      setLoading(false)
    }
  }, [form, login, addToast, navigate, dashboardRoute])

  // ── Early returns AFTER all hooks ────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"/>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={dashboardRoute()} replace />
  }

  const sessionExpired = params.get('reason') === 'expired'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/30 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🏥</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">{APP_NAME}</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Session expired banner */}
        {sessionExpired && (
          <div className="mb-4 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p className="text-sm text-amber-700 font-medium">Your session expired. Please sign in again.</p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {/* Role selector */}
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sign in as</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(ROLES).map(r => (
                <RoleCard key={r} role={r} selected={role === r} onClick={handleRoleChange}/>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={set('email')}
              onBlur={blur('email')}
              error={touched.email ? errors.email : ''}
              placeholder="you@clinic.com"
              required
              autoComplete="email"
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={set('password')}
              onBlur={blur('password')}
              error={touched.password ? errors.password : ''}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <button
              type="button"
              onClick={fillDemo}
              className="w-full text-xs text-brand-600 hover:text-brand-700 font-medium py-1 transition-colors"
            >
              Fill demo credentials for {ROLE_META[role]?.label} →
            </button>

            <Button type="submit" loading={loading} fullWidth size="lg">
              Sign in
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-700"/>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-slate-800 px-3 text-xs text-slate-400">
                or continue with
              </span>
            </div>
          </div>

          {/* Google Sign-In */}
          <GoogleButton/>

          {/* OAuth error display */}
          {oauthError && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <p className="text-xs text-red-700 dark:text-red-300">{decodeURIComponent(oauthError)}</p>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              New patient?{' '}
              <Link to="/register" className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-semibold transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} {APP_NAME} · All rights reserved
        </p>
      </div>
    </div>
  )
}
