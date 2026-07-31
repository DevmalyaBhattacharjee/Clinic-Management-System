USE clinic_db;

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert Admin User
INSERT INTO users (name, email, password, role, status, phone, address) VALUES
    ('System Admin', 'admin@clinic.com', '$2a$10$ZKjKjZ8Z8Z8Z8Z8Z8Z8Z8O', 'ADMIN', 'ACTIVE', '9876543210', '123 Admin Street');

-- Insert Doctors
INSERT INTO users (name, email, password, role, status, phone, address) VALUES
                                                                            ('Dr. John Smith', 'john.smith@clinic.com', '$2a$10$ZKjKjZ8Z8Z8Z8Z8Z8Z8Z8O', 'DOCTOR', 'ACTIVE', '9876543211', '456 Medical Ave'),
                                                                            ('Dr. Sarah Johnson', 'sarah.johnson@clinic.com', '$2a$10$ZKjKjZ8Z8Z8Z8Z8Z8Z8Z8O', 'DOCTOR', 'ACTIVE', '9876543212', '789 Doctor Lane'),
                                                                            ('Dr. Michael Chen', 'michael.chen@clinic.com', '$2a$10$ZKjKjZ8Z8Z8Z8Z8Z8Z8Z8O', 'DOCTOR', 'ACTIVE', '9876543213', '321 Clinic Road');

INSERT INTO doctors (user_id, specialization, qualification, license_number, years_of_experience, consultation_fee, available_from, available_to, available_days, biography) VALUES
                                                                                                                                                                                 (2, 'Cardiology', 'MD, DM Cardiology', 'MED-CARD-001', 15, 1500.00, '09:00:00', '17:00:00', 'MON,TUE,WED,THU,FRI', 'Experienced cardiologist with 15 years of practice'),
                                                                                                                                                                                 (3, 'Dermatology', 'MBBS, MD Dermatology', 'MED-DERM-002', 10, 1200.00, '10:00:00', '18:00:00', 'MON,WED,FRI,SAT', 'Specialist in skin and cosmetic treatments'),
                                                                                                                                                                                 (4, 'General Medicine', 'MBBS, MD', 'MED-GEN-003', 20, 800.00, '08:00:00', '16:00:00', 'MON,TUE,WED,THU,FRI,SAT', 'General physician with extensive experience');

-- Insert Receptionists
INSERT INTO users (name, email, password, role, status, phone, address) VALUES
                                                                            ('Mary Williams', 'mary.williams@clinic.com', '$2a$10$ZKjKjZ8Z8Z8Z8Z8Z8Z8Z8O', 'RECEPTIONIST', 'ACTIVE', '9876543214', '555 Front Desk St'),
                                                                            ('James Brown', 'james.brown@clinic.com', '$2a$10$ZKjKjZ8Z8Z8Z8Z8Z8Z8Z8O', 'RECEPTIONIST', 'ACTIVE', '9876543215', '666 Reception Blvd');

INSERT INTO receptionists (user_id, employee_id, shift_start, shift_end) VALUES
                                                                             (5, 'EMP-REC-001', '08:00:00', '16:00:00'),
                                                                             (6, 'EMP-REC-002', '16:00:00', '23:00:00');

-- Insert Sample Patients
INSERT INTO users (name, email, password, role, status, phone, address) VALUES
                                                                            ('Alice Anderson', 'alice.anderson@email.com', '$2a$10$ZKjKjZ8Z8Z8Z8Z8Z8Z8Z8O', 'PATIENT', 'ACTIVE', '9876543216', '111 Patient St'),
                                                                            ('Bob Martin', 'bob.martin@email.com', '$2a$10$ZKjKjZ8Z8Z8Z8Z8Z8Z8Z8O', 'PATIENT', 'ACTIVE', '9876543217', '222 Patient Ave'),
                                                                            ('Carol Davis', 'carol.davis@email.com', '$2a$10$ZKjKjZ8Z8Z8Z8Z8Z8Z8Z8O', 'PATIENT', 'ACTIVE', '9876543218', '333 Patient Rd');

INSERT INTO patients (user_id, patient_number, date_of_birth, gender, blood_group, emergency_contact, emergency_contact_name, medical_history, allergies) VALUES
                                                                                                                                                              (7, 'PT2025001ABC', '1985-05-15', 'FEMALE', 'O+', '9999999991', 'John Anderson', 'Hypertension', 'Penicillin'),
                                                                                                                                                              (8, 'PT2025002DEF', '1990-08-22', 'MALE', 'B+', '9999999992', 'Lisa Martin', 'Diabetes Type 2', 'None'),
                                                                                                                                                              (9, 'PT2025003GHI', '1978-12-10', 'FEMALE', 'A-', '9999999993', 'Tom Davis', 'Asthma', 'Dust, Pollen');

-- Insert Sample Appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason, token_number) VALUES
                                                                                                                       (1, 1, CURDATE(), '10:00:00', 'SCHEDULED', 'Regular checkup for hypertension', 1),
                                                                                                                       (2, 3, CURDATE(), '11:00:00', 'CONFIRMED', 'Diabetes follow-up', 2),
                                                                                                                       (3, 2, CURDATE() + INTERVAL 1 DAY, '14:00:00', 'SCHEDULED', 'Skin allergy consultation', 1);

-- Note: Password hash shown is placeholder.
-- Actual password: "password123"
-- Generate real hash: BCryptPasswordEncoder