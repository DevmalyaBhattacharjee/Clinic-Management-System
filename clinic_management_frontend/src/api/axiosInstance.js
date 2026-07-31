import axios from 'axios'
import { TOKEN_KEY } from '../utils/constants'
import { storage } from '../utils/helpers'

// ─── Base instance ────────────────────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ─── Request interceptor — attach JWT ─────────────────────────────────────────
axiosInstance.interceptors.request.use(
  config => {
    const token = storage.get(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// ─── Response interceptor — handle 401 globally ───────────────────────────────
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const status = error?.response?.status

    if (status === 401) {
      // Token expired or missing — clear storage and bounce to login
      storage.clear()
      // Avoid import cycle: navigate via window location
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?session=expired'
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
