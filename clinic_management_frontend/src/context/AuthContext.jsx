import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import authService from '../services/authService'
import { ROLE_DASHBOARDS } from '../utils/constants'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,            setUser]    = useState(null)
  const [loading,         setLoading] = useState(true)   // hydrating from storage
  const [isAuthenticated, setIsAuth]  = useState(false)
  const logoutTimerRef = useRef(null)

  /** Schedule auto-logout when JWT expires */
  const scheduleAutoLogout = useCallback((ttlSeconds) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
    if (ttlSeconds <= 0) return
    logoutTimerRef.current = setTimeout(() => {
      authService.logout()
      setUser(null)
      setIsAuth(false)
      // Reload to /login so the user sees a clear "session expired" state
      window.location.href = '/login?reason=expired'
    }, ttlSeconds * 1000)
  }, [])

  /** Hydrate auth state from localStorage on every page load / refresh */
  useEffect(() => {
    const storedUser  = authService.getUser()
    const isValid     = authService.isAuthenticated()   // also handles expired JWTs
    const ttl         = authService.getTokenTTL()

    if (storedUser && isValid) {
      setUser(storedUser)
      setIsAuth(true)
      scheduleAutoLogout(ttl)
    } else {
      // Token missing or expired — wipe storage silently
      authService.logout()
    }
    setLoading(false)

    return () => { if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current) }
  }, [scheduleAutoLogout])

  /** Login — calls POST /api/auth/login */
  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    const u = { userId: data.userId, name: data.name, email: data.email, role: data.role }
    setUser(u)
    setIsAuth(true)
    scheduleAutoLogout(authService.getTokenTTL())
    return data
  }, [scheduleAutoLogout])

  /**
   * setAuthFromOAuth — called by OAuthCallbackPage after Google sign-in.
   * Receives already-persisted user data (authService.handleOAuthCallback
   * already stored the JWT in localStorage).
   */
  const setAuthFromOAuth = useCallback((userData) => {
    const u = {
      userId:          userData.userId,
      name:            userData.name,
      email:           userData.email,
      role:            userData.role,
      profileImageUrl: userData.picture || userData.profileImageUrl || null,
    }
    setUser(u)
    setIsAuth(true)
    scheduleAutoLogout(authService.getTokenTTL())
  }, [scheduleAutoLogout])

  /** Logout — clears storage + context */
  const logout = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
    authService.logout()
    setUser(null)
    setIsAuth(false)
  }, [])

  /** Refresh user metadata from storage (e.g. after profile update) */
  const refreshUser = useCallback(() => {
    const stored = authService.getUser()
    if (stored) setUser(stored)
  }, [])

  const dashboardRoute = useCallback(
    () => user ? (ROLE_DASHBOARDS[user.role] || '/') : '/login',
    [user]
  )

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated,
      login, logout, refreshUser, dashboardRoute,
      setAuthFromOAuth,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export default AuthContext
