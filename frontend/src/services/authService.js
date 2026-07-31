import axiosInstance, { publicAxios } from './axiosInstance'
import { TOKEN_KEY, USER_KEY, API_URL } from '../utils/constants'

/**
 * authService
 *
 * Handles all authentication flows:
 *  - Email/password login
 *  - Patient self-registration
 *  - Forgot password (email reset link)
 *  - Reset password (token + new password)
 *  - Google OAuth2 (token received via redirect callback)
 *  - Logout
 *  - Token validation
 */
const authService = {

  // ── Standard email/password login ─────────────────────────────────────────
  login: async (email, password) => {
    const res = await publicAxios.post('/api/auth/login', { email, password })
    const { token, role, userId, name, email: userEmail } = res.data
    authService._persist({ token, userId, name, email: userEmail, role })
    return res.data
  },

  // ── Patient self-registration ──────────────────────────────────────────────
  register: async (payload) => {
    const res = await publicAxios.post('/api/patient/register', payload)
    return res.data
  },

  // ── Forgot password ────────────────────────────────────────────────────────
  /**
   * POST /api/auth/forgot-password  { email }
   *
   * Always returns 200 regardless of whether the email exists (prevents
   * user enumeration). The frontend always shows the "check your inbox" state.
   */
  forgotPassword: async (email) => {
    const res = await publicAxios.post('/api/auth/forgot-password', {
      email: email.trim().toLowerCase(),
    })
    return res.data
  },

  // ── Reset password ─────────────────────────────────────────────────────────
  /**
   * POST /api/auth/reset-password  { token, newPassword }
   *
   * Returns 200 on success, 400 on invalid/expired token.
   * Throws AxiosError on 400 — caller handles error display.
   */
  resetPassword: async (token, newPassword) => {
    const res = await publicAxios.post('/api/auth/reset-password', {
      token,
      newPassword,
    })
    return res.data
  },

  // ── Google OAuth2 ──────────────────────────────────────────────────────────
  /**
   * Returns the Google OAuth2 authorisation URL.
   * The browser navigates here; Spring handles the redirect to Google.
   *
   * After Google redirects back to /login/oauth2/code/google,
   * Spring's OAuth2SuccessHandler runs and redirects to:
   *   {frontendUrl}/oauth2/callback?token=JWT&name=...&role=...
   *
   * The OAuthCallbackPage reads those params and stores the JWT.
   */
  getGoogleLoginUrl: () => {
    return `${API_URL}/oauth2/authorization/google`
  },

  /**
   * Called by OAuthCallbackPage after the backend redirects back.
   * Stores the JWT and user info from URL query params.
   */
  handleOAuthCallback: ({ token, userId, name, email, role, picture }) => {
    authService._persist({ token, userId: parseInt(userId, 10), name, email, role, picture })
    return { token, userId: parseInt(userId, 10), name, email, role, picture }
  },

  // ── Session management ─────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  getToken:  () => localStorage.getItem(TOKEN_KEY),

  getUser: () => {
    try   { return JSON.parse(localStorage.getItem(USER_KEY)) }
    catch { return null }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return false
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        authService.logout()
        return false
      }
      return true
    } catch { return false }
  },

  getTokenTTL: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return 0
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]))
      return exp ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : 0
    } catch { return 0 }
  },

  // ── Private helpers ────────────────────────────────────────────────────────
  _persist: ({ token, userId, name, email, role, picture = null }) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify({
      userId, name, email, role,
      ...(picture ? { profileImageUrl: picture } : {}),
    }))
  },
}

export default authService
