import axiosInstance from './axiosInstance'

const base = '/api/patient'

const patientService = {
  /* ── Registration & Profile ──────────────────────── */
  register:               (data) => axiosInstance.post(`${base}/register`, data),
  getProfile:             ()     => axiosInstance.get(`${base}/profile`),
  updateProfile:          (data) => axiosInstance.put(`${base}/profile`, data),

  /* ── Doctors (for browsing & booking) ───────────── */
  getDoctors:             ()     => axiosInstance.get(`${base}/doctors`),
  getDoctorsBySpec:       (spec) => axiosInstance.get(`${base}/doctors/specialization/${encodeURIComponent(spec)}`),
  getDoctorById:          (id)   => axiosInstance.get(`${base}/doctors/${id}`),

  /* ── Appointments ────────────────────────────────── */
  getAppointments:        ()     => axiosInstance.get(`${base}/appointments`),
  getAppointmentById:     (id)   => axiosInstance.get(`${base}/appointments/${id}`),
  getUpcoming:            ()     => axiosInstance.get(`${base}/appointments/upcoming`),
  getPast:                ()     => axiosInstance.get(`${base}/appointments/past`),
  // BookAppointmentRequest: { doctorId, appointmentDate, appointmentTime, reason, notes? }
  bookAppointment:        (data) => axiosInstance.post(`${base}/appointments`, data),
  cancelAppointment:      (id)   => axiosInstance.delete(`${base}/appointments/${id}`),

  /* ── Medical Records (read-only for patient) ─────── */
  getMedicalRecords:      ()     => axiosInstance.get(`${base}/medical-records`),
  getMedicalRecordById:   (id)   => axiosInstance.get(`${base}/medical-records/${id}`),

  /* ── Prescriptions ───────────────────────────────── */
  getPrescriptions:       ()     => axiosInstance.get(`${base}/prescriptions`),
  getActivePrescriptions: ()     => axiosInstance.get(`${base}/prescriptions/active`),
  getPrescriptionById:    (id)   => axiosInstance.get(`${base}/prescriptions/${id}`),

  /* ── Bills ───────────────────────────────────────── */
  getBills:               ()     => axiosInstance.get(`${base}/bills`),
  getBillById:            (id)   => axiosInstance.get(`${base}/bills/${id}`),
  getBillByNumber:        (num)  => axiosInstance.get(`${base}/bills/number/${encodeURIComponent(num)}`),
  getUnpaidBills:         ()     => axiosInstance.get(`${base}/bills/unpaid`),
  getPaidBills:           ()     => axiosInstance.get(`${base}/bills/paid`),
  getOutstanding:         ()     => axiosInstance.get(`${base}/bills/outstanding`),
}

export default patientService
