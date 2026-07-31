import axios from 'axios'
import { API_URL, TOKEN_KEY, USER_KEY } from '../utils/constants'

/* ── Retry configuration ─────────────────────────────────────────── */
const MAX_RETRIES  = 2
const RETRY_DELAY  = 800  // ms — doubles each attempt
const RETRY_CODES  = new Set([408, 429, 500, 502, 503, 504])

function shouldRetry(error) {
  if (!error.response) return true                      // network error
  return RETRY_CODES.has(error.response.status)
}

function retryDelay(attempt) {
  return RETRY_DELAY * Math.pow(2, attempt - 1)         // exponential back-off
}

/* ── Request deduplication (cancel identical in-flight GETs) ─────── */
const pendingRequests = new Map()

function getRequestKey(config) {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`
}

/* ── Create base instance ────────────────────────────────────────── */
function createInstance(withAuth = true) {
  const instance = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  })

  /* ── Request interceptor ── */
  instance.interceptors.request.use(
    (config) => {
      // Attach JWT
      if (withAuth) {
        const token = localStorage.getItem(TOKEN_KEY)
        if (token) config.headers.Authorization = `Bearer ${token}`
      }

      // Add retry metadata
      config.__retryCount  = config.__retryCount  || 0
      config.__requestTime = Date.now()

      // Deduplicate identical GET requests
      if (config.method === 'get') {
        const key = getRequestKey(config)
        if (pendingRequests.has(key)) {
          const controller = new AbortController()
          config.signal = controller.signal
          controller.abort('Duplicate request cancelled')
        } else {
          const controller = new AbortController()
          config.signal = controller.signal
          pendingRequests.set(key, controller)
          config.__requestKey = key
        }
      }

      return config
    },
    (error) => Promise.reject(error)
  )

  /* ── Response interceptor ── */
  instance.interceptors.response.use(
    (response) => {
      // Clean up pending request tracker
      if (response.config.__requestKey) {
        pendingRequests.delete(response.config.__requestKey)
      }
      return response
    },
    async (error) => {
      const config = error.config

      // Clean up pending tracker on error too
      if (config?.__requestKey) {
        pendingRequests.delete(config.__requestKey)
      }

      // Skip cancelled requests silently
      if (axios.isCancel(error)) {
        return Promise.reject(error)
      }

      const status = error.response?.status

      // Auto-retry with exponential back-off
      if (config && shouldRetry(error) && (config.__retryCount || 0) < MAX_RETRIES) {
        config.__retryCount = (config.__retryCount || 0) + 1
        const delay = retryDelay(config.__retryCount)
        await new Promise(resolve => setTimeout(resolve, delay))
        return instance(config)
      }

      // 401 — expired session
      if (status === 401 && withAuth) {
        const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password']
        const onPublicPage = publicPaths.some(p => window.location.pathname.startsWith(p))
        if (!onPublicPage) {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          window.location.href = '/login?reason=expired'
        }
      }

      // 403 — insufficient role
      if (status === 403 && withAuth) {
        window.location.href = '/403'
      }

      return Promise.reject(error)
    }
  )

  return instance
}

/* ── Exports ─────────────────────────────────────────────────────── */
const axiosInstance = createInstance(true)   // authenticated
export const publicAxios = createInstance(false) // public (no JWT)

export default axiosInstance
