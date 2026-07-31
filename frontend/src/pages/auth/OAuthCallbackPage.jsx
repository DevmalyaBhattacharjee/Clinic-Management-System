import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth }  from '../../context/AuthContext'
import { useTitle } from '../../hooks/useTitle'
import authService  from '../../services/authService'
import Spinner      from '../../components/common/Spinner'

/**
 * OAuthCallbackPage  —  /oauth2/callback
 *
 * The Spring Boot OAuth2SuccessHandler redirects here after Google
 * authentication succeeds, with JWT and user info as query params:
 *
 *   /oauth2/callback?token=JWT&name=Alice&email=...&role=PATIENT&userId=5&picture=...
 *
 * This page:
 *  1. Reads the query params
 *  2. Stores the JWT via authService.handleOAuthCallback()
 *  3. Updates AuthContext state
 *  4. Redirects to the appropriate role dashboard
 *
 * If there's an error param, it shows a friendly error and redirects to /login.
 */
export default function OAuthCallbackPage() {
  useTitle('Signing you in…')

  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const { setAuthFromOAuth } = useAuth()
  const processed  = useRef(false)   // prevent double-processing in StrictMode

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    // Check for error from backend
    const oauthError = params.get('oauth_error')
    if (oauthError) {
      navigate(`/login?oauth_error=${encodeURIComponent(oauthError)}`, { replace: true })
      return
    }

    const token   = params.get('token')
    const userId  = params.get('userId')
    const name    = params.get('name')
    const email   = params.get('email')
    const role    = params.get('role')
    const picture = params.get('picture') || null

    if (!token || !role) {
      navigate('/login?oauth_error=Invalid+OAuth2+response', { replace: true })
      return
    }

    // Store JWT and user data
    const userData = authService.handleOAuthCallback({ token, userId, name, email, role, picture })

    // Update AuthContext so ProtectedRoute sees the user immediately
    setAuthFromOAuth(userData)

    // Redirect to role-appropriate dashboard
    const dashboards = {
      ADMIN:        '/admin/dashboard',
      DOCTOR:       '/doctor/dashboard',
      PATIENT:      '/patient/dashboard',
      RECEPTIONIST: '/receptionist/dashboard',
    }
    navigate(dashboards[role] || '/login', { replace: true })
  }, [params, navigate, setAuthFromOAuth])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-4"
         role="status" aria-label="Completing sign in">
      <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/40 rounded-2xl
                      flex items-center justify-center mb-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             className="w-8 h-8 text-brand-600 dark:text-brand-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      </div>
      <Spinner size="lg"/>
      <p className="text-sm text-slate-500 dark:text-slate-400">Completing sign in…</p>
    </div>
  )
}
