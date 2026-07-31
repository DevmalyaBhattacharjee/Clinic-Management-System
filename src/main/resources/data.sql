-- Run this ONCE manually in MySQL Workbench if the admin account doesn't exist,
-- OR enable sql.init.mode=always temporarily with the schema.sql containing
-- only this INSERT (no ALTER TABLE).
--
-- Password: admin123 (BCrypt)
INSERT INTO users (name, email, password, role, status, phone, address, email_verified, provider)
VALUES (
    'System Administrator',
    'admin@clinic.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN', 'ACTIVE', '1234567890', 'Clinic Main Office', TRUE, 'LOCAL'
) ON DUPLICATE KEY UPDATE id = id;
