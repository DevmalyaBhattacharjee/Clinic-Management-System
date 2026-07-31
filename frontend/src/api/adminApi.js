import axiosInstance from './axiosInstance'

const D  = '/api/admin/doctors'
const R  = '/api/admin/receptionists'
const P  = '/api/admin/patients'
const A  = '/api/admin/appointments'

const adminApi = {
  // ── Doctors ────────────────────────────────────────────────────────────────
  getAllDoctors:              ()         => axiosInstance.get(D),
  getActiveDoctors:          ()         => axiosInstance.get(`${D}/active`),
  getDoctorById:             id         => axiosInstance.get(`${D}/${id}`),
  getDoctorsBySpecialization: spec      => axiosInstance.get(`${D}/specialization/${spec}`),
  createDoctor:              data       => axiosInstance.post(D, data),
  updateDoctor:              (id, data) => axiosInstance.put(`${D}/${id}`, data),
  deleteDoctor:              id         => axiosInstance.delete(`${D}/${id}`),
  activateDoctor:            id         => axiosInstance.patch(`${D}/${id}/activate`),

  // ── Receptionists ──────────────────────────────────────────────────────────
  getAllReceptionists:        ()         => axiosInstance.get(R),
  getActiveReceptionists:    ()         => axiosInstance.get(`${R}/active`),
  getReceptionistById:       id         => axiosInstance.get(`${R}/${id}`),
  createReceptionist:        data       => axiosInstance.post(R, data),
  updateReceptionist:        (id, data) => axiosInstance.put(`${R}/${id}`, data),
  deleteReceptionist:        id         => axiosInstance.delete(`${R}/${id}`),
  activateReceptionist:      id         => axiosInstance.patch(`${R}/${id}/activate`),

  // ── Patients ───────────────────────────────────────────────────────────────
  getAllPatients:             ()         => axiosInstance.get(P),
  getActivePatients:         ()         => axiosInstance.get(`${P}/active`),
  getPatientById:            id         => axiosInstance.get(`${P}/${id}`),
  getPatientByNumber:        num        => axiosInstance.get(`${P}/number/${num}`),
  activatePatient:           id         => axiosInstance.patch(`${P}/${id}/activate`),
  deactivatePatient:         id         => axiosInstance.patch(`${P}/${id}/deactivate`),

  // ── Appointments ───────────────────────────────────────────────────────────
  getAllAppointments:         ()         => axiosInstance.get(A),
  getTodayAppointments:      ()         => axiosInstance.get(`${A}/today`),
  getAppointmentsByDate:     date       => axiosInstance.get(`${A}/date/${date}`),
  getAppointmentsByStatus:   status     => axiosInstance.get(`${A}/status/${status}`),
  getAppointmentById:        id         => axiosInstance.get(`${A}/${id}`),
}

export default adminApi
