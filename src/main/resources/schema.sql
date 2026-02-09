-- ============================================
-- CLINIC MANAGEMENT SYSTEM - DATABASE SCHEMA
-- FINAL VERSION WITH ALL OPTIMIZED INDEXES
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS clinic_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE clinic_db;

-- ============================================
-- CORE TABLES
-- ============================================

-- Users Table (Base table for all roles)
CREATE TABLE IF NOT EXISTS users (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    phone VARCHAR(15),
    address VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_role_status (role, status),

    -- Constraints
    CONSTRAINT chk_role CHECK (role IN ('ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST')),
    CONSTRAINT chk_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ROLE-SPECIFIC TABLES
-- ============================================

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
                                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                       user_id BIGINT NOT NULL UNIQUE,
                                       specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(50) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    years_of_experience INT,
    consultation_fee DECIMAL(10, 2),
    available_from TIME,
    available_to TIME,
    available_days VARCHAR(100),
    biography VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_specialization (specialization),
    INDEX idx_license_number (license_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Receptionists Table
CREATE TABLE IF NOT EXISTS receptionists (
                                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                             user_id BIGINT NOT NULL UNIQUE,
                                             employee_id VARCHAR(50) UNIQUE,
    shift_start TIME,
    shift_end TIME,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_receptionist_user_id (user_id),
    INDEX idx_employee_id (employee_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        user_id BIGINT NOT NULL UNIQUE,
                                        patient_number VARCHAR(20) NOT NULL UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(15),
    emergency_contact_name VARCHAR(100),
    medical_history VARCHAR(2000),
    allergies VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_patient_user_id (user_id),
    INDEX idx_patient_number (patient_number),
    INDEX idx_date_of_birth (date_of_birth),

    -- Constraints
    CONSTRAINT chk_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- OPERATIONAL TABLES
-- ============================================

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
                                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                            patient_id BIGINT NOT NULL,
                                            doctor_id BIGINT NOT NULL,
                                            appointment_date DATE NOT NULL,
                                            appointment_time TIME NOT NULL,
                                            status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    reason VARCHAR(500),
    notes VARCHAR(1000),
    token_number INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,

    -- Indexes (Optimized for common queries)
    INDEX idx_appointment_patient (patient_id),
    INDEX idx_appointment_doctor (doctor_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_appointment_status (status),
    INDEX idx_doctor_date (doctor_id, appointment_date),
    INDEX idx_doctor_date_status (doctor_id, appointment_date, status),
    INDEX idx_patient_date (patient_id, appointment_date),
    INDEX idx_date_status (appointment_date, status),

    -- Constraints
    CONSTRAINT chk_appointment_status CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
                                               id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                               patient_id BIGINT NOT NULL,
                                               doctor_id BIGINT NOT NULL,
                                               appointment_id BIGINT,
                                               visit_date DATE NOT NULL,
                                               chief_complaint VARCHAR(500) NOT NULL,
    symptoms VARCHAR(2000),
    diagnosis VARCHAR(2000),
    treatment_plan VARCHAR(2000),
    lab_tests VARCHAR(1000),
    vital_signs VARCHAR(1000),
    notes VARCHAR(2000),
    follow_up_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,

    -- Indexes (Optimized for medical history queries)
    INDEX idx_medical_patient (patient_id),
    INDEX idx_medical_doctor (doctor_id),
    INDEX idx_medical_appointment (appointment_id),
    INDEX idx_visit_date (visit_date),
    INDEX idx_patient_doctor_date (patient_id, doctor_id, visit_date),
    INDEX idx_doctor_date (doctor_id, visit_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
                                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                             patient_id BIGINT NOT NULL,
                                             doctor_id BIGINT NOT NULL,
                                             medical_record_id BIGINT,
                                             prescription_date DATE NOT NULL,
                                             medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(200) NOT NULL,
    duration INT NOT NULL,
    route VARCHAR(100),
    instructions VARCHAR(1000),
    precautions VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE SET NULL,

    -- Indexes (Optimized for prescription queries)
    INDEX idx_prescription_patient (patient_id),
    INDEX idx_prescription_doctor (doctor_id),
    INDEX idx_prescription_medical_record (medical_record_id),
    INDEX idx_prescription_date (prescription_date),
    INDEX idx_is_active (is_active),
    INDEX idx_patient_active (patient_id, is_active),
    INDEX idx_doctor_date (doctor_id, prescription_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Doctor Availability Table
CREATE TABLE IF NOT EXISTS doctor_availability (
                                                   id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                   doctor_id BIGINT NOT NULL,
                                                   date DATE NOT NULL,
                                                   day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_availability_doctor (doctor_id),
    INDEX idx_availability_date (date),
    INDEX idx_doctor_date (doctor_id, date),
    INDEX idx_date_available (date, is_available),

    -- Unique Constraints
    UNIQUE KEY unique_doctor_date (doctor_id, date),

    -- Constraints
    CONSTRAINT chk_day_of_week CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bills Table
CREATE TABLE IF NOT EXISTS bills (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     bill_number VARCHAR(50) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    appointment_id BIGINT,
    bill_date DATE NOT NULL,
    consultation_fee DECIMAL(10, 2),
    medication_cost DECIMAL(10, 2),
    lab_charges DECIMAL(10, 2),
    other_charges DECIMAL(10, 2),
    total_amount DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2),
    tax DECIMAL(10, 2),
    final_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    payment_method VARCHAR(20),
    payment_date DATE,
    transaction_id VARCHAR(100),
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,

    -- Indexes (Optimized for billing queries)
    INDEX idx_bill_patient (patient_id),
    INDEX idx_bill_appointment (appointment_id),
    INDEX idx_bill_status (status),
    INDEX idx_bill_number (bill_number),
    INDEX idx_bill_date (bill_date),
    INDEX idx_patient_status (patient_id, status),
    INDEX idx_date_status (bill_date, status),

    -- Constraints
    CONSTRAINT chk_bill_status CHECK (status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED')),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('CASH', 'CARD', 'UPI', 'NET_BANKING', 'INSURANCE'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- View: Today's Appointments
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
    a.reason,
    a.notes
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

-- View: Active Prescriptions
CREATE OR REPLACE VIEW view_active_prescriptions AS
SELECT
    pr.id,
    pr.prescription_date,
    pr.medication_name,
    pr.dosage,
    pr.frequency,
    pr.duration,
    p.patient_number,
    pu.name as patient_name,
    du.name as doctor_name,
    d.specialization
FROM prescriptions pr
         INNER JOIN patients p ON pr.patient_id = p.id
         INNER JOIN users pu ON p.user_id = pu.id
         INNER JOIN doctors d ON pr.doctor_id = d.id
         INNER JOIN users du ON d.user_id = du.id
WHERE pr.is_active = TRUE
ORDER BY pr.prescription_date DESC;

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

-- Procedure: Get Doctor Today's Schedule
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

-- Procedure: Calculate Patient Outstanding Amount
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

-- Procedure: Get Today's Appointment Summary
DELIMITER //
CREATE PROCEDURE sp_get_today_appointment_summary()
BEGIN
SELECT
    COUNT(*) as total_appointments,
    SUM(CASE WHEN status = 'SCHEDULED' THEN 1 ELSE 0 END) as scheduled,
    SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed,
    SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
    SUM(CASE WHEN status = 'NO_SHOW' THEN 1 ELSE 0 END) as no_show
FROM appointments
WHERE appointment_date = CURDATE();
END //
DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update appointment status when medical record is created
DELIMITER //
CREATE TRIGGER trg_update_appointment_on_medical_record
    AFTER INSERT ON medical_records
    FOR EACH ROW
BEGIN
    IF NEW.appointment_id IS NOT NULL THEN
    UPDATE appointments
    SET status = 'COMPLETED'
    WHERE id = NEW.appointment_id
      AND status != 'COMPLETED';
END IF;
END //
DELIMITER ;

-- Trigger: Validate appointment date is not in the past
DELIMITER //
CREATE TRIGGER trg_validate_appointment_date_insert
    BEFORE INSERT ON appointments
    FOR EACH ROW
BEGIN
    IF NEW.appointment_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Appointment date cannot be in the past';
END IF;
END //
DELIMITER ;

-- Trigger: Validate appointment date on update
DELIMITER //
CREATE TRIGGER trg_validate_appointment_date_update
    BEFORE UPDATE ON appointments
    FOR EACH ROW
BEGIN
    IF NEW.appointment_date < CURDATE() AND OLD.appointment_date != NEW.appointment_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Appointment date cannot be in the past';
END IF;
END //
DELIMITER ;

-- ============================================
-- INITIAL DATA (Optional - for testing)
-- ============================================

-- Insert Admin User (Password: admin123)
-- Note: Replace with actual BCrypt hash in production
INSERT INTO users (name, email, password, role, status, phone, address) VALUES
    ('System Administrator', 'admin@clinic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'ACTIVE', '1234567890', 'Clinic Main Office')
    ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- ANALYSIS AND OPTIMIZATION
-- ============================================

-- Analyze all tables
ANALYZE TABLE users, doctors, receptionists, patients, appointments,
             medical_records, prescriptions, doctor_availability, bills;

-- ============================================
-- SCHEMA CREATION COMPLETE
-- ============================================

SELECT 'Clinic Management System Database Schema Created Successfully!' as Message;