import axiosInstance from './axiosInstance'

const base = '/api/receptionist'

const receptionistService = {
  /* ── Patients ──────────────────────────────────────────────────── */
  // POST body: WalkInPatientRegistrationRequest (required: name,email,phone,dateOfBirth,gender)
  registerWalkIn:        (data)  => axiosInstance.post(`${base}/patients/register`, data),
  getPatients:           ()      => axiosInstance.get(`${base}/patients`),
  // ?name=<query>
  searchPatients:        (name)  => axiosInstance.get(`${base}/patients/search?name=${encodeURIComponent(name)}`),
  getPatientById:        (id)    => axiosInstance.get(`${base}/patients/${id}`),
  getPatientByNumber:    (num)   => axiosInstance.get(`${base}/patients/number/${encodeURIComponent(num)}`),

  /* ── Appointments ──────────────────────────────────────────────── */
  // POST body: ReceptionistBookAppointmentRequest (required: patientId,doctorId,appointmentDate,appointmentTime,reason)
  bookAppointment:       (data)  => axiosInstance.post(`${base}/appointments`, data),
  getTodayAppointments:  ()      => axiosInstance.get(`${base}/appointments/today`),
  getTodaySummary:       ()      => axiosInstance.get(`${base}/appointments/today/summary`),
  getAppointmentsByDate: (date)  => axiosInstance.get(`${base}/appointments/date/${date}`),
  getAppointmentsByPatient:(id)  => axiosInstance.get(`${base}/appointments/patient/${id}`),
  getAppointmentsByDoctor: (id)  => axiosInstance.get(`${base}/appointments/doctor/${id}`),
  getAppointmentById:    (id)    => axiosInstance.get(`${base}/appointments/${id}`),
  cancelAppointment:     (id)    => axiosInstance.delete(`${base}/appointments/${id}`),
  // PUT body: UpdateAppointmentStatusRequest { status (required), notes? }
  updateStatus:          (id, d) => axiosInstance.put(`${base}/appointments/${id}/status`, d),

  /* ── Billing ───────────────────────────────────────────────────── */
  getBills:              ()      => axiosInstance.get(`${base}/bills`),
  getTodayBills:         ()      => axiosInstance.get(`${base}/bills/today`),
  getUnpaidBills:        ()      => axiosInstance.get(`${base}/bills/unpaid`),
  getBillsByPatient:     (id)    => axiosInstance.get(`${base}/bills/patient/${id}`),
  getBillById:           (id)    => axiosInstance.get(`${base}/bills/${id}`),
  getBillByNumber:       (num)   => axiosInstance.get(`${base}/bills/number/${encodeURIComponent(num)}`),
  getPatientOutstanding: (id)    => axiosInstance.get(`${base}/bills/patient/${id}/outstanding`),
  // POST body: CreateBillRequest (required: patientId, billDate)
  createBill:            (data)  => axiosInstance.post(`${base}/bills`, data),
  // PUT body: UpdateBillPaymentRequest { status (required), paymentMethod?, paymentDate?, transactionId?, notes? }
  updatePayment:         (id, d) => axiosInstance.put(`${base}/bills/${id}/payment`, d),

  /* ── Doctors ───────────────────────────────────────────────────── */
  getDoctors:            ()      => axiosInstance.get(`${base}/doctors`),
  getDoctorsBySpec:      (spec)  => axiosInstance.get(`${base}/doctors/specialization/${encodeURIComponent(spec)}`),
  getDoctorById:         (id)    => axiosInstance.get(`${base}/doctors/${id}`),
}

export default receptionistService
