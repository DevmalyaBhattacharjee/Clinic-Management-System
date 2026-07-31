import { Link } from 'react-router-dom'
import { useTitle } from '../../hooks/useTitle'
import { useAuth  } from '../../context/AuthContext'

export default function Forbidden() {
  useTitle('403 — Access Denied')
  const { dashboardRoute } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6"
         role="main" aria-labelledby="error-title">
      <div className="text-center max-w-md space-y-6">
        <div aria-hidden="true">
          <p className="text-[120px] font-black text-red-100 dark:text-red-900 leading-none select-none">403</p>
        </div>
        <div>
          <h1 id="error-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Access denied
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
            You don't have permission to view this page. If you believe this is a mistake, contact your administrator.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to={dashboardRoute()} className="btn btn-primary">
            Go to My Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
