import { Component } from 'react'
import { Link } from 'react-router-dom'

/**
 * Global Error Boundary — catches unhandled JS errors in the component tree.
 * Prevents the entire app from crashing on unexpected exceptions.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 *   // With custom fallback:
 *   <ErrorBoundary fallback={<MyFallback />}>
 *     <ComponentThatMightCrash />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    // In production, send to error tracking (Sentry, Datadog, etc.)
    if (import.meta.env.VITE_ENV === 'production') {
      console.error('[ErrorBoundary]', error, errorInfo)
    } else {
      console.error('[ErrorBoundary] Caught error:', error)
      console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      const isDev = import.meta.env.VITE_ENV !== 'production'
      const msg   = this.state.error?.message || 'An unexpected error occurred'

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6" role="alert" aria-live="assertive">
          <div className="w-full max-w-lg text-center space-y-6">
            {/* Icon */}
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Something went wrong</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
                An unexpected error occurred. Please try refreshing the page or contact support if the issue persists.
              </p>
            </div>

            {/* Dev-only error details */}
            {isDev && (
              <details className="text-left bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <summary className="text-sm font-semibold text-red-700 dark:text-red-400 cursor-pointer">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 text-xs text-red-600 dark:text-red-300 overflow-auto max-h-40 whitespace-pre-wrap">
                  {msg}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="btn btn-primary"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="btn btn-secondary"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
