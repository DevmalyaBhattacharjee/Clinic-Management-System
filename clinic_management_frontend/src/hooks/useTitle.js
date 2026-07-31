import { useEffect } from 'react'
import { APP_NAME } from '../utils/constants'

/**
 * Sets document.title with SEO-friendly format:
 *   "<pageTitle> | MediCure"
 *
 * Usage:
 *   useTitle('Dashboard')          → "Dashboard | MediCure"
 *   useTitle('My Appointments')    → "My Appointments | MediCure"
 */
export function useTitle(pageTitle) {
  useEffect(() => {
    const prev = document.title
    document.title = pageTitle ? `${pageTitle} | ${APP_NAME}` : APP_NAME
    return () => { document.title = prev }
  }, [pageTitle])
}
