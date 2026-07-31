import axiosInstance from './axiosInstance'

const base = '/api/doctor'

const doctorService = {
  /* ── Appointments ────────────────────────────────────────────────── */
  getAppointments:          ()          => axiosInstance.get(`${base}/appointments`),
  getTodayAppointments:     ()          => axiosInstance.get(`${base}/appointments/today`),
  getUpcomingAppointments:  ()          => axiosInstance.get(`${base}/appointments/upcoming`),
  getAppointmentsByDate:    (date)      => axiosInstance.get(`${base}/appointments/date/${date}`),
  // status passed as ?status=VALUE query param (per spec)
  updateAppointmentStatus:  (id, status)=> axiosInstance.patch(`${base}/appointments/${id}/status?status=${status}`),
  // notes passed as ?notes=VALUE query param (per spec)
  addAppointmentNotes:      (id, notes) => axiosInstance.patch(`${base}/appointments/${id}/notes?notes=${encodeURIComponent(notes)}`),

  /* ── Patients ────────────────────────────────────────────────────── */
  getPatients:              ()          => axiosInstance.get(`${base}/patients`),
  getPatientById:           (id)        => axiosInstance.get(`${base}/patients/${id}`),

  /* ── Medical Records ─────────────────────────────────────────────── */
  getMedicalRecords:        ()          => axiosInstance.get(`${base}/medical-records`),
  getMedicalRecordById:     (id)        => axiosInstance.get(`${base}/medical-records/${id}`),
  getPatientMedicalRecords: (patientId) => axiosInstance.get(`${base}/medical-records/patient/${patientId}`),
  createMedicalRecord:      (data)      => axiosInstance.post(`${base}/medical-records`, data),
  updateMedicalRecord:      (id, data)  => axiosInstance.put(`${base}/medical-records/${id}`, data),

  /* ── Prescriptions ───────────────────────────────────────────────── */
  getPrescriptions:         ()          => axiosInstance.get(`${base}/prescriptions`),
  getPrescriptionById:      (id)        => axiosInstance.get(`${base}/prescriptions/${id}`),
  getPatientPrescriptions:  (patientId) => axiosInstance.get(`${base}/prescriptions/patient/${patientId}`),
  createPrescription:       (data)      => axiosInstance.post(`${base}/prescriptions`, data),
  updatePrescription:       (id, data)  => axiosInstance.put(`${base}/prescriptions/${id}`, data),
  deactivatePrescription:   (id)        => axiosInstance.patch(`${base}/prescriptions/${id}/deactivate`),

  /* ── Availability ────────────────────────────────────────────────── */
  getAvailability:          ()          => axiosInstance.get(`${base}/availability`),
  getUpcomingAvailability:  ()          => axiosInstance.get(`${base}/availability/upcoming`),
  getAvailabilityByDate:    (date)      => axiosInstance.get(`${base}/availability/date/${date}`),
  setAvailability:          (data)      => axiosInstance.post(`${base}/availability`, data),
  deleteAvailability:       (id)        => axiosInstance.delete(`${base}/availability/${id}`),
}

export default doctorService
