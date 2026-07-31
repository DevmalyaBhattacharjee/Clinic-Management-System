USE clinic_db;

-- ============================================
-- ANALYZE AND OPTIMIZE TABLES
-- ============================================

-- Analyze tables for query optimization
ANALYZE TABLE users;
ANALYZE TABLE doctors;
ANALYZE TABLE patients;
ANALYZE TABLE receptionists;
ANALYZE TABLE appointments;
ANALYZE TABLE medical_records;
ANALYZE TABLE prescriptions;
ANALYZE TABLE doctor_availability;
ANALYZE TABLE bills;

-- ============================================
-- USEFUL VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Complete Doctor Information
CREATE OR REPLACE VIEW view_doctors_complete AS
SELECT
    d.id as doctor_id,
    u.id as user_id,
    u.name,
    u.email,
    u.phone,
    u.address,
    u.status,
    d.specialization,
    d.qualification,
    d.license_number,
    d.years_of_experience,
    d.consultation_fee,
    d.available_from,
    d.available_to,
    d.available_days,
    d.biography,
    d.created_at,
    d.updated_at
FROM doctors d
         INNER JOIN users u ON d.user_id = u.id;

-- View: Complete Patient Information
CREATE OR REPLACE VIEW view_patients_complete AS
SELECT
    p.id as patient_id,
    u.id as user_id,
    u.name,
    u.email,
    u.phone,
    u.address,
    u.status,
    p.patient_number,
    p.date_of_birth,
    p.gender,
    p.blood_group,
    p.emergency_contact,
    p.emergency_contact_name,
    p.medical_history,
    p.allergies,
    p.created_at,
    p.updated_at
FROM patients p
         INNER JOIN users u ON p.user_id = u.id;

-- View: Today's Appointments Summary
CREATE OR REPLACE VIEW view_today_appointments AS
SELECT
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.token_number,
    p.patient_number,
    pu.name as patient_name,
    pu.phone as patient_phone,
    du.name as doctor_name,
    d.specialization,
    a.reason
FROM appointments a
         INNER JOIN patients p ON a.patient_id = p.id
         INNER JOIN users pu ON p.user_id = pu.id
         INNER JOIN doctors d ON a.doctor_id = d.id
         INNER JOIN users du ON d.user_id = du.id
WHERE a.appointment_date = CURDATE();

-- View: Pending Bills
CREATE OR REPLACE VIEW view_pending_bills AS
SELECT
    b.id,
    b.bill_number,
    b.bill_date,
    b.final_amount,
    b.status,
    p.patient_number,
    u.name as patient_name,
    u.phone as patient_phone,
    DATEDIFF(CURDATE(), b.bill_date) as days_pending
FROM bills b
         INNER JOIN patients p ON b.patient_id = p.id
         INNER JOIN users u ON p.user_id = u.id
WHERE b.status IN ('UNPAID', 'PARTIALLY_PAID')
ORDER BY b.bill_date ASC;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure: Get Patient Medical History
DELIMITER //
CREATE PROCEDURE sp_get_patient_medical_history(IN p_patient_id BIGINT)
BEGIN
SELECT
    mr.id,
    mr.visit_date,
    u.name as doctor_name,
    d.specialization,
    mr.chief_complaint,
    mr.diagnosis,
    mr.treatment_plan,
    mr.follow_up_date
FROM medical_records mr
         INNER JOIN doctors d ON mr.doctor_id = d.id
         INNER JOIN users u ON d.user_id = u.id
WHERE mr.patient_id = p_patient_id
ORDER BY mr.visit_date DESC;
END //
DELIMITER ;

-- Procedure: Get Doctor Today Schedule
DELIMITER //
CREATE PROCEDURE sp_get_doctor_today_schedule(IN p_doctor_id BIGINT)
BEGIN
SELECT
    a.id,
    a.appointment_time,
    a.token_number,
    a.status,
    p.patient_number,
    u.name as patient_name,
    u.phone as patient_phone,
    a.reason
FROM appointments a
         INNER JOIN patients p ON a.patient_id = p.id
         INNER JOIN users u ON p.user_id = u.id
WHERE a.doctor_id = p_doctor_id
  AND a.appointment_date = CURDATE()
ORDER BY a.appointment_time ASC;
END //
DELIMITER ;

-- Procedure: Calculate Patient Outstanding
DELIMITER //
CREATE PROCEDURE sp_calculate_patient_outstanding(
    IN p_patient_id BIGINT,
    OUT total_outstanding DECIMAL(10,2)
)
BEGIN
SELECT COALESCE(SUM(final_amount), 0)
INTO total_outstanding
FROM bills
WHERE patient_id = p_patient_id
  AND status = 'UNPAID';
END //
DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update appointment status when medical record created
DELIMITER //
CREATE TRIGGER trg_update_appointment_on_medical_record
    AFTER INSERT ON medical_records
    FOR EACH ROW
BEGIN
    UPDATE appointments
    SET status = 'COMPLETED'
    WHERE id = NEW.appointment_id
      AND status != 'COMPLETED';
END //
DELIMITER ;

-- Trigger: Validate appointment date is not in the past
DELIMITER //
CREATE TRIGGER trg_validate_appointment_date
    BEFORE INSERT ON appointments
    FOR EACH ROW
BEGIN
    IF NEW.appointment_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Appointment date cannot be in the past';
END IF;
END //
DELIMITER ;