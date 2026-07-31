import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute  from '../components/auth/ProtectedRoute'
import RoleRoute       from '../components/auth/RoleRoute'
import DashboardLayout from '../components/layout/DashboardLayout'
import { ROLES }       from '../utils/constants'
import Spinner         from '../components/common/Spinner'

/* ── Page-level lazy imports ─────────────────────────────────────── */
// Auth (small — eager is fine but lazy for consistency)
const LoginPage          = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage       = lazy(() => import('../pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('../pages/auth/ResetPasswordPage'))
const OAuthCallbackPage  = lazy(() => import('../pages/auth/OAuthCallbackPage'))

// Error pages
const NotFound     = lazy(() => import('../pages/errors/NotFound'))
const Unauthorized = lazy(() => import('../pages/errors/Unauthorized'))
const Forbidden    = lazy(() => import('../pages/errors/Forbidden'))

// Admin
const AdminDashboard     = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminDoctors       = lazy(() => import('../pages/admin/AdminDoctors'))
const AdminPatients      = lazy(() => import('../pages/admin/AdminPatients'))
const AdminReceptionists = lazy(() => import('../pages/admin/AdminReceptionists'))
const AdminAppointments  = lazy(() => import('../pages/admin/AdminAppointments'))
const AdminSettings      = lazy(() => import('../pages/admin/AdminSettings'))

// Doctor
const DoctorDashboard     = lazy(() => import('../pages/doctor/DoctorDashboard'))
const DoctorAppointments  = lazy(() => import('../pages/doctor/DoctorAppointments'))
const DoctorPatients      = lazy(() => import('../pages/doctor/DoctorPatients'))
const DoctorRecords       = lazy(() => import('../pages/doctor/DoctorRecords'))
const DoctorPrescriptions = lazy(() => import('../pages/doctor/DoctorPrescriptions'))
const DoctorAvailability  = lazy(() => import('../pages/doctor/DoctorAvailability'))
const DoctorProfile       = lazy(() => import('../pages/doctor/DoctorProfile'))

// Patient
const PatientDashboard     = lazy(() => import('../pages/patient/PatientDashboard'))
const PatientAppointments  = lazy(() => import('../pages/patient/PatientAppointments'))
const PatientRecords       = lazy(() => import('../pages/patient/PatientRecords'))
const PatientPrescriptions = lazy(() => import('../pages/patient/PatientPrescriptions'))
const PatientBills         = lazy(() => import('../pages/patient/PatientBills'))
const PatientProfile       = lazy(() => import('../pages/patient/PatientProfile'))

// Receptionist
const ReceptionistDashboard    = lazy(() => import('../pages/receptionist/ReceptionistDashboard'))
const ReceptionistPatients     = lazy(() => import('../pages/receptionist/ReceptionistPatients'))
const ReceptionistAppointments = lazy(() => import('../pages/receptionist/ReceptionistAppointments'))
const ReceptionistBilling      = lazy(() => import('../pages/receptionist/ReceptionistBilling'))
const ReceptionistDoctors      = lazy(() => import('../pages/receptionist/ReceptionistDoctors'))
const ReceptionistProfile      = lazy(() => import('../pages/receptionist/ReceptionistProfile'))

/* ── Full-screen loading fallback ────────────────────────────────── */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg"/>
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader/>}>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
        <Route path="/401"             element={<Unauthorized />} />
        <Route path="/oauth2/callback"  element={<OAuthCallbackPage />} />
        <Route path="/403"             element={<Forbidden />} />

        {/* ── Admin ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
            <Route element={<DashboardLayout role={ROLES.ADMIN} />}>
              <Route path="/admin/dashboard"     element={<AdminDashboard />} />
              <Route path="/admin/doctors"       element={<AdminDoctors />} />
              <Route path="/admin/patients"      element={<AdminPatients />} />
              <Route path="/admin/receptionists" element={<AdminReceptionists />} />
              <Route path="/admin/appointments"  element={<AdminAppointments />} />
              <Route path="/admin/settings"      element={<AdminSettings />} />
            </Route>
          </Route>
        </Route>

        {/* ── Doctor ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute roles={[ROLES.DOCTOR]} />}>
            <Route element={<DashboardLayout role={ROLES.DOCTOR} />}>
              <Route path="/doctor/dashboard"     element={<DoctorDashboard />} />
              <Route path="/doctor/appointments"  element={<DoctorAppointments />} />
              <Route path="/doctor/patients"      element={<DoctorPatients />} />
              <Route path="/doctor/records"       element={<DoctorRecords />} />
              <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
              <Route path="/doctor/availability"  element={<DoctorAvailability />} />
              <Route path="/doctor/profile"       element={<DoctorProfile />} />
            </Route>
          </Route>
        </Route>

        {/* ── Patient ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute roles={[ROLES.PATIENT]} />}>
            <Route element={<DashboardLayout role={ROLES.PATIENT} />}>
              <Route path="/patient/dashboard"     element={<PatientDashboard />} />
              <Route path="/patient/appointments"  element={<PatientAppointments />} />
              <Route path="/patient/records"       element={<PatientRecords />} />
              <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
              <Route path="/patient/bills"         element={<PatientBills />} />
              <Route path="/patient/profile"       element={<PatientProfile />} />
            </Route>
          </Route>
        </Route>

        {/* ── Receptionist ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute roles={[ROLES.RECEPTIONIST]} />}>
            <Route element={<DashboardLayout role={ROLES.RECEPTIONIST} />}>
              <Route path="/receptionist/dashboard"    element={<ReceptionistDashboard />} />
              <Route path="/receptionist/patients"     element={<ReceptionistPatients />} />
              <Route path="/receptionist/appointments" element={<ReceptionistAppointments />} />
              <Route path="/receptionist/billing"      element={<ReceptionistBilling />} />
              <Route path="/receptionist/doctors"      element={<ReceptionistDoctors />} />
              <Route path="/receptionist/profile"      element={<ReceptionistProfile />} />
            </Route>
          </Route>
        </Route>

        <Route path="/"  element={<Navigate to="/login" replace />} />
        <Route path="*"  element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
