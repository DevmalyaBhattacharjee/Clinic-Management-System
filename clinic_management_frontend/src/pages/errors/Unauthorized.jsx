import { Link } from 'react-router-dom'
import { useTitle } from '../../hooks/useTitle'

export default function Unauthorized() {
  useTitle('401 — Session Expired')

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6"
         role="main" aria-labelledby="error-title">
      <div className="text-center max-w-md space-y-6">
        <div aria-hidden="true">
          <p className="text-[120px] font-black text-amber-100 dark:text-amber-900 leading-none select-none">401</p>
        </div>
        <div>
          <h1 id="error-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Session expired
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Your session has expired. Please sign in again to continue.
          </p>
        </div>
        <Link to="/login" className="btn btn-primary inline-flex">
          Sign In
        </Link>
      </div>
    </div>
  )
}
