import axiosInstance from './axiosInstance'

const base = '/api/admin'

const adminService = {
  /* ── Doctors ──────────────────────────────────────────── */
  getDoctors:             ()        => axiosInstance.get(`${base}/doctors`),
  getActiveDoctors:       ()        => axiosInstance.get(`${base}/doctors/active`),
  getDoctorById:          (id)      => axiosInstance.get(`${base}/doctors/${id}`),
  getDoctorsBySpec:       (spec)    => axiosInstance.get(`${base}/doctors/specialization/${encodeURIComponent(spec)}`),
  createDoctor:           (data)    => axiosInstance.post(`${base}/doctors`, data),
  updateDoctor:           (id, d)   => axiosInstance.put(`${base}/doctors/${id}`, d),
  deactivateDoctor:       (id)      => axiosInstance.delete(`${base}/doctors/${id}`),
  activateDoctor:         (id)      => axiosInstance.patch(`${base}/doctors/${id}/activate`),

  /* ── Receptionists ───────────────────────────────────── */
  getReceptionists:       ()        => axiosInstance.get(`${base}/receptionists`),
  getActiveReceptionists: ()        => axiosInstance.get(`${base}/receptionists/active`),
  getReceptionistById:    (id)      => axiosInstance.get(`${base}/receptionists/${id}`),
  createReceptionist:     (data)    => axiosInstance.post(`${base}/receptionists`, data),
  updateReceptionist:     (id, d)   => axiosInstance.put(`${base}/receptionists/${id}`, d),
  deactivateReceptionist: (id)      => axiosInstance.delete(`${base}/receptionists/${id}`),
  activateReceptionist:   (id)      => axiosInstance.patch(`${base}/receptionists/${id}/activate`),

  /* ── Patients ────────────────────────────────────────── */
  getPatients:            ()        => axiosInstance.get(`${base}/patients`),
  getActivePatients:      ()        => axiosInstance.get(`${base}/patients/active`),
  getPatientById:         (id)      => axiosInstance.get(`${base}/patients/${id}`),
  getPatientByNumber:     (num)     => axiosInstance.get(`${base}/patients/number/${num}`),
  deactivatePatient:      (id)      => axiosInstance.patch(`${base}/patients/${id}/deactivate`),
  activatePatient:        (id)      => axiosInstance.patch(`${base}/patients/${id}/activate`),

  /* ── Appointments ────────────────────────────────────── */
  getAppointments:        ()        => axiosInstance.get(`${base}/appointments`),
  getTodayAppointments:   ()        => axiosInstance.get(`${base}/appointments/today`),
  getAppointmentsByDate:  (date)    => axiosInstance.get(`${base}/appointments/date/${date}`),
  getAppointmentsByStatus:(status)  => axiosInstance.get(`${base}/appointments/status/${status}`),
  getAppointmentById:     (id)      => axiosInstance.get(`${base}/appointments/${id}`),
}

export default adminService
