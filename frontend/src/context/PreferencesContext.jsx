import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const PreferencesContext = createContext(null)

const DEFAULTS = {
  sidebarCollapsed:  false,
  compactMode:       false,
  animationsEnabled: true,
  dateFormat:        'MMM DD, YYYY',
  currency:          'INR',
  notifSound:        false,
  autoRefresh:       false,
  refreshInterval:   60,
}

export const PreferencesProvider = ({ children }) => {
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('clinic_prefs')
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
    } catch { return DEFAULTS }
  })

  useEffect(() => {
    localStorage.setItem('clinic_prefs', JSON.stringify(prefs))
  }, [prefs])

  const set = useCallback((key, value) => {
    setPrefs(p => ({ ...p, [key]: value }))
  }, [])

  const reset = useCallback(() => setPrefs(DEFAULTS), [])

  return (
    <PreferencesContext.Provider value={{ prefs, set, reset }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be inside PreferencesProvider')
  return ctx
}
