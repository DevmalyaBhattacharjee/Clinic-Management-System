import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import './index.css'

/* ── Security: Content Security Policy meta tag ── */
const cspMeta = document.createElement('meta')
cspMeta.httpEquiv = 'Content-Security-Policy'
cspMeta.content   = [
  "default-src 'self'",
  `connect-src 'self' ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "script-src 'self'",
  "frame-ancestors 'none'",
].join('; ')
document.head.appendChild(cspMeta)

/* ── SEO: base meta tags ── */
const appName = import.meta.env.VITE_APP_NAME || 'MediCure'
document.title = appName

const setMeta = (name, content, prop = false) => {
  const existing = prop
    ? document.querySelector(`meta[property="${name}"]`)
    : document.querySelector(`meta[name="${name}"]`)
  const el = existing || document.createElement('meta')
  if (prop) el.setAttribute('property', name)
  else      el.name = name
  el.content = content
  if (!existing) document.head.appendChild(el)
}

setMeta('description', `${appName} — Clinic Management System. Manage appointments, patients, records and billing.`)
setMeta('author',      'MediCure Team')
setMeta('robots',      'noindex, nofollow')   // don't index SPA (add index for public pages only)
setMeta('viewport',    'width=device-width, initial-scale=1.0')
setMeta('theme-color', '#2347ea')
// Open Graph
setMeta('og:title',       appName,                           true)
setMeta('og:description', 'Clinic Management System',        true)
setMeta('og:type',        'website',                         true)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
