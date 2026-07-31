USE clinic_db;

-- ============================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- ============================================

-- Users: Composite index for role-based queries
CREATE INDEX idx_role_status ON users(role, status);

-- Appointments: Common query patterns
CREATE INDEX idx_doctor_date_status ON appointments(doctor_id, appointment_date, status);
CREATE INDEX idx_patient_date ON appointments(patient_id, appointment_date);
CREATE INDEX idx_date_status ON appointments(appointment_date, status);

-- Medical Records: Patient history queries
CREATE INDEX idx_patient_doctor_date ON medical_records(patient_id, doctor_id, visit_date);
CREATE INDEX idx_doctor_date ON medical_records(doctor_id, visit_date);

-- Prescriptions: Active medication queries
CREATE INDEX idx_patient_active ON prescriptions(patient_id, is_active);
CREATE INDEX idx_doctor_date ON prescriptions(doctor_id, prescription_date);

-- Bills: Payment tracking
CREATE INDEX idx_patient_status ON bills(patient_id, status);
CREATE INDEX idx_date_status ON bills(bill_date, status);

-- Full-text search indexes (optional, for name search)
ALTER TABLE users ADD FULLTEXT INDEX idx_fulltext_name (name);