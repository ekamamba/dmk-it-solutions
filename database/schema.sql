CREATE TABLE IF NOT EXISTS crm_leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  business VARCHAR(255) NOT NULL,
  website VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  businessType VARCHAR(100) NULL,
  status ENUM('new', 'contacted', 'qualified', 'proposal', 'won', 'lost') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_crm_leads_status (status),
  INDEX idx_crm_leads_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS crm_lead_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  note TEXT NOT NULL,
  created_by VARCHAR(255) NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_crm_lead_notes_lead
    FOREIGN KEY (lead_id) REFERENCES crm_leads(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS crm_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash CHAR(64) NOT NULL,
  role ENUM('admin', 'manager', 'sales') NOT NULL DEFAULT 'sales',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_crm_users_role (role)
);

CREATE TABLE IF NOT EXISTS crm_reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  scheduled_for DATETIME NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  created_by VARCHAR(255) NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_crm_reminders_lead
    FOREIGN KEY (lead_id) REFERENCES crm_leads(id)
    ON DELETE CASCADE,
  INDEX idx_crm_reminders_lead_id (lead_id),
  INDEX idx_crm_reminders_scheduled_for (scheduled_for)
);

CREATE TABLE IF NOT EXISTS crm_email_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status ENUM('draft', 'sent', 'failed') NOT NULL DEFAULT 'sent',
  created_by VARCHAR(255) NOT NULL DEFAULT 'Admin',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_crm_email_activity_lead
    FOREIGN KEY (lead_id) REFERENCES crm_leads(id)
    ON DELETE CASCADE,
  INDEX idx_crm_email_activity_lead_id (lead_id),
  INDEX idx_crm_email_activity_sent_at (sent_at)
);

INSERT INTO crm_users (username, password_hash, role)
VALUES
  ('admin', SHA2('dmkcrm2026', 256), 'admin'),
  ('manager', SHA2('dmkcrm2026', 256), 'manager'),
  ('sales', SHA2('dmkcrm2026', 256), 'sales')
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  updated_at = CURRENT_TIMESTAMP;

-- Example usage:
-- INSERT INTO crm_leads (name, business, website, email, phone, businessType, status)
-- VALUES ('Jane Doe', 'Acme Co', 'https://acme.com', 'jane@acme.com', '555-1234', 'Professional Services', 'new');
-- INSERT INTO crm_lead_notes (lead_id, note, created_by) VALUES (1, 'Followed up via email.', 'Admin');
-- INSERT INTO crm_reminders (lead_id, scheduled_for, message, created_by) VALUES (1, NOW() + INTERVAL 2 DAY, 'Follow up with the prospect', 'Admin');
-- INSERT INTO crm_email_activity (lead_id, subject, body, status, created_by) VALUES (1, 'Follow up', 'Hi Jane, just checking in.', 'sent', 'Admin');
