import axiosInstance from './axiosInstance'

const PAT = '/api/receptionist/patients'
const APT = '/api/receptionist/appointments'
const BIL = '/api/receptionist/bills'
const DOC = '/api/receptionist/doctors'

const receptionistApi = {
  // ── Patients ───────────────────────────────────────────────────────────────
  registerWalkIn:           data       => axiosInstance.post(`${PAT}/register`, data),
  getAllPatients:            ()         => axiosInstance.get(PAT),
  searchPatients:           name       => axiosInstance.get(`${PAT}/search?name=${encodeURIComponent(name)}`),
  getPatientById:           id         => axiosInstance.get(`${PAT}/${id}`),
  getPatientByNumber:       num        => axiosInstance.get(`${PAT}/number/${num}`),

  // ── Appointments ───────────────────────────────────────────────────────────
  bookAppointment:          data       => axiosInstance.post(APT, data),
  getTodayAppointments:     ()         => axiosInstance.get(`${APT}/today`),
  getTodaySummary:          ()         => axiosInstance.get(`${APT}/today/summary`),
  getAppointmentsByDate:    date       => axiosInstance.get(`${APT}/date/${date}`),
  getAppointmentsByPatient: patientId  => axiosInstance.get(`${APT}/patient/${patientId}`),
  getAppointmentsByDoctor:  doctorId   => axiosInstance.get(`${APT}/doctor/${doctorId}`),
  getAppointmentById:       id         => axiosInstance.get(`${APT}/${id}`),
  updateAppointmentStatus:  (id, data) => axiosInstance.put(`${APT}/${id}/status`, data),
  cancelAppointment:        id         => axiosInstance.delete(`${APT}/${id}`),

  // ── Billing ────────────────────────────────────────────────────────────────
  createBill:               data       => axiosInstance.post(BIL, data),
  getAllBills:               ()         => axiosInstance.get(BIL),
  getTodayBills:            ()         => axiosInstance.get(`${BIL}/today`),
  getUnpaidBills:           ()         => axiosInstance.get(`${BIL}/unpaid`),
  getBillsByPatient:        patientId  => axiosInstance.get(`${BIL}/patient/${patientId}`),
  getBillById:              id         => axiosInstance.get(`${BIL}/${id}`),
  getBillByNumber:          num        => axiosInstance.get(`${BIL}/number/${num}`),
  updatePayment:            (id, data) => axiosInstance.put(`${BIL}/${id}/payment`, data),
  getPatientOutstanding:    patientId  => axiosInstance.get(`${BIL}/patient/${patientId}/outstanding`),

  // ── Doctors (browse) ───────────────────────────────────────────────────────
  getAllDoctors:             ()         => axiosInstance.get(DOC),
  getDoctorsBySpecialization: spec     => axiosInstance.get(`${DOC}/specialization/${spec}`),
  getDoctorById:            id         => axiosInstance.get(`${DOC}/${id}`),
}

export default receptionistApi
