import axiosInstance from './axiosInstance'

const REG = '/api/patient/register'
const PRO = '/api/patient/profile'
const DOC = '/api/patient/doctors'
const APT = '/api/patient/appointments'
const MR  = '/api/patient/medical-records'
const PRX = '/api/patient/prescriptions'
const BIL = '/api/patient/bills'

const patientApi = {
  // ── Registration (no token required) ───────────────────────────────────────
  register:                 data     => axiosInstance.post(REG, data),

  // ── Profile ────────────────────────────────────────────────────────────────
  getProfile:               ()       => axiosInstance.get(PRO),
  updateProfile:            data     => axiosInstance.put(PRO, data),

  // ── Doctors (browse) ───────────────────────────────────────────────────────
  getAllDoctors:             ()       => axiosInstance.get(DOC),
  getDoctorsBySpecialization: spec   => axiosInstance.get(`${DOC}/specialization/${spec}`),
  getDoctorById:            id       => axiosInstance.get(`${DOC}/${id}`),

  // ── Appointments ───────────────────────────────────────────────────────────
  getMyAppointments:        ()       => axiosInstance.get(APT),
  getUpcomingAppointments:  ()       => axiosInstance.get(`${APT}/upcoming`),
  getPastAppointments:      ()       => axiosInstance.get(`${APT}/past`),
  getAppointmentById:       id       => axiosInstance.get(`${APT}/${id}`),
  bookAppointment:          data     => axiosInstance.post(APT, data),
  cancelAppointment:        id       => axiosInstance.delete(`${APT}/${id}`),

  // ── Medical Records (read-only) ────────────────────────────────────────────
  getMyMedicalRecords:      ()       => axiosInstance.get(MR),
  getMedicalRecordById:     id       => axiosInstance.get(`${MR}/${id}`),

  // ── Prescriptions (read-only) ──────────────────────────────────────────────
  getMyPrescriptions:       ()       => axiosInstance.get(PRX),
  getActivePrescriptions:   ()       => axiosInstance.get(`${PRX}/active`),
  getPrescriptionById:      id       => axiosInstance.get(`${PRX}/${id}`),

  // ── Bills (read-only) ─────────────────────────────────────────────────────
  getMyBills:               ()       => axiosInstance.get(BIL),
  getUnpaidBills:           ()       => axiosInstance.get(`${BIL}/unpaid`),
  getPaidBills:             ()       => axiosInstance.get(`${BIL}/paid`),
  getBillById:              id       => axiosInstance.get(`${BIL}/${id}`),
  getBillByNumber:          num      => axiosInstance.get(`${BIL}/number/${num}`),
  getOutstandingAmount:     ()       => axiosInstance.get(`${BIL}/outstanding`),
}

export default patientApi
