import axiosInstance from './axiosInstance'

const APT = '/api/doctor/appointments'
const PAT = '/api/doctor/patients'
const MR  = '/api/doctor/medical-records'
const PRX = '/api/doctor/prescriptions'
const AVL = '/api/doctor/availability'

const doctorApi = {
  // ── Appointments ───────────────────────────────────────────────────────────
  getMyAppointments:        ()             => axiosInstance.get(APT),
  getTodayAppointments:     ()             => axiosInstance.get(`${APT}/today`),
  getUpcomingAppointments:  ()             => axiosInstance.get(`${APT}/upcoming`),
  getAppointmentsByDate:    date           => axiosInstance.get(`${APT}/date/${date}`),
  updateAppointmentStatus:  (id, status)   => axiosInstance.patch(`${APT}/${id}/status?status=${status}`),
  addAppointmentNotes:      (id, notes)    => axiosInstance.patch(`${APT}/${id}/notes?notes=${encodeURIComponent(notes)}`),

  // ── Patients ───────────────────────────────────────────────────────────────
  getMyPatients:            ()             => axiosInstance.get(PAT),
  getPatientById:           id             => axiosInstance.get(`${PAT}/${id}`),

  // ── Medical Records ────────────────────────────────────────────────────────
  getMyMedicalRecords:      ()             => axiosInstance.get(MR),
  getMedicalRecordById:     id             => axiosInstance.get(`${MR}/${id}`),
  getPatientMedicalRecords: patientId      => axiosInstance.get(`${MR}/patient/${patientId}`),
  createMedicalRecord:      data           => axiosInstance.post(MR, data),
  updateMedicalRecord:      (id, data)     => axiosInstance.put(`${MR}/${id}`, data),

  // ── Prescriptions ──────────────────────────────────────────────────────────
  getMyPrescriptions:       ()             => axiosInstance.get(PRX),
  getPrescriptionById:      id             => axiosInstance.get(`${PRX}/${id}`),
  getPatientPrescriptions:  patientId      => axiosInstance.get(`${PRX}/patient/${patientId}`),
  createPrescription:       data           => axiosInstance.post(PRX, data),
  updatePrescription:       (id, data)     => axiosInstance.put(`${PRX}/${id}`, data),
  deactivatePrescription:   id             => axiosInstance.patch(`${PRX}/${id}/deactivate`),

  // ── Availability ───────────────────────────────────────────────────────────
  getMyAvailability:        ()             => axiosInstance.get(AVL),
  getUpcomingAvailability:  ()             => axiosInstance.get(`${AVL}/upcoming`),
  getAvailabilityByDate:    date           => axiosInstance.get(`${AVL}/date/${date}`),
  updateAvailability:       data           => axiosInstance.post(AVL, data),
  deleteAvailability:       id             => axiosInstance.delete(`${AVL}/${id}`),
}

export default doctorApi
