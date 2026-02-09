USE clinic_db;

-- ============================================
-- REGULAR MAINTENANCE QUERIES
-- ============================================

-- Check table sizes
SELECT
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'clinic_db'
ORDER BY (data_length + index_length) DESC;

-- Check index usage
SELECT
    TABLE_NAME,
    INDEX_NAME,
    SEQ_IN_INDEX,
    COLUMN_NAME,
    CARDINALITY
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'clinic_db'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Find duplicate emails (data integrity check)
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING count > 1;

-- Find appointments without medical records (after 7 days)
SELECT
    a.id,
    a.appointment_date,
    p.patient_number,
    u.name as patient_name
FROM appointments a
         INNER JOIN patients p ON a.patient_id = p.id
         INNER JOIN users u ON p.user_id = u.id
         LEFT JOIN medical_records mr ON a.id = mr.appointment_id
WHERE a.status = 'COMPLETED'
  AND a.appointment_date < DATE_SUB(CURDATE(), INTERVAL 7 DAY)
  AND mr.id IS NULL;

-- Archive old appointments (example - create archive table first)
-- CREATE TABLE appointments_archive LIKE appointments;
-- INSERT INTO appointments_archive
-- SELECT * FROM appointments
-- WHERE appointment_date < DATE_SUB(CURDATE(), INTERVAL 1 YEAR);