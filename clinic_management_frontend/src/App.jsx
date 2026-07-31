import { BrowserRouter } from 'react-router-dom'
import { AuthProvider }         from './context/AuthContext'
import { ToastProvider }        from './context/ToastContext'
import { ThemeProvider }        from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import { PreferencesProvider }  from './context/PreferencesContext'
import ErrorBoundary            from './components/common/ErrorBoundary'
import AppRoutes                from './routes/AppRoutes'
import ToastContainer           from './components/common/ToastContainer'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <PreferencesProvider>
          <AuthProvider>
            <ToastProvider>
              <NotificationProvider>
                <ErrorBoundary>
                  <AppRoutes />
                  <ToastContainer />
                </ErrorBoundary>
              </NotificationProvider>
            </ToastProvider>
          </AuthProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
