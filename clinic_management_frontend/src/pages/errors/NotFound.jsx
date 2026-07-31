import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useTitle } from '../../hooks/useTitle'
import { useAuth }  from '../../context/AuthContext'

export default function NotFound() {
  useTitle('404 — Page Not Found')
  const navigate  = useNavigate()
  const { isAuthenticated, dashboardRoute } = useAuth()

  // Auto-redirect authenticated users to their dashboard after 5s
  useEffect(() => {
    if (!isAuthenticated) return
    const timer = setTimeout(() => navigate(dashboardRoute(), { replace: true }), 5000)
    return () => clearTimeout(timer)
  }, [isAuthenticated, navigate, dashboardRoute])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6"
         role="main" aria-labelledby="error-title">
      <div className="text-center max-w-md space-y-6">
        <div aria-hidden="true">
          <p className="text-[120px] font-black text-brand-100 dark:text-brand-900 leading-none select-none">404</p>
        </div>
        <div>
          <h1 id="error-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Page not found
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            {isAuthenticated && ' Redirecting you to your dashboard in 5 seconds…'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            ← Go back
          </button>
          <Link
            to={isAuthenticated ? dashboardRoute() : '/login'}
            className="btn btn-primary"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
          </Link>
        </div>
      </div>
    </div>
  )
}
