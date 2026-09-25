import mysql, { type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
export type UserRole = "admin" | "manager" | "sales";

export type LeadRecord = {
  id: number;
  name: string;
  business: string;
  website: string;
  email: string;
  phone: string | null;
  businessType: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};

export type LeadNote = {
  id: number;
  leadId: number;
  note: string;
  createdBy: string;
  createdAt: string;
};

export type ReminderRecord = {
  id: number;
  leadId: number;
  scheduledFor: string;
  message: string;
  status: "pending" | "completed" | "cancelled";
  createdBy: string;
  createdAt: string;
};

export type EmailRecord = {
  id: number;
  leadId: number;
  subject: string;
  body: string;
  sentAt: string;
  status: "draft" | "sent" | "failed";
  createdBy: string;
};

export type LeadQueryOptions = {
  limit?: number;
  status?: LeadStatus | "all";
  search?: string;
};

export const getDbPool = () => {
  const host = process.env.MYSQL_HOST ?? "localhost";
  const user = process.env.MYSQL_USER ?? "root";
  const password = process.env.MYSQL_PASSWORD ?? "";
  const database = process.env.MYSQL_DATABASE ?? "dmk_crm";

  if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_DATABASE) {
    console.warn(
      "Using local XAMPP defaults for MySQL (localhost/root/dmk_crm). Add MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE in production or a custom environment."
    );
  }

  return mysql.createPool({
    host,
    port: Number(process.env.MYSQL_PORT ?? "3306"),
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
};

async function ensureCrmSchema(pool: mysql.Pool) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS crm_leads (
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
    )`,
    `CREATE TABLE IF NOT EXISTS crm_lead_notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lead_id INT NOT NULL,
      note TEXT NOT NULL,
      created_by VARCHAR(255) NOT NULL DEFAULT 'Admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_crm_lead_notes_lead
        FOREIGN KEY (lead_id) REFERENCES crm_leads(id)
        ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS crm_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password_hash CHAR(64) NOT NULL,
      role ENUM('admin', 'manager', 'sales') NOT NULL DEFAULT 'sales',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_crm_users_role (role)
    )`,
    `CREATE TABLE IF NOT EXISTS crm_reminders (
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
    )`,
    `CREATE TABLE IF NOT EXISTS crm_email_activity (
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
    )`,
    `INSERT INTO crm_users (username, password_hash, role)
      VALUES
        ('admin', SHA2('dmkcrm2026', 256), 'admin'),
        ('manager', SHA2('dmkcrm2026', 256), 'manager'),
        ('sales', SHA2('dmkcrm2026', 256), 'sales')
      ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        role = VALUES(role),
        updated_at = CURRENT_TIMESTAMP`,
  ];

  for (const statement of statements) {
    await pool.execute(statement);
  }
}

export async function saveLead(lead: {
  name: string;
  business: string;
  website: string;
  email: string;
  phone: string;
  businessType: string;
}) {
  const pool = getDbPool();

  if (!pool) {
    return {
      success: false,
      error:
        "Database is not configured. Add MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE to enable CRM storage.",
    } as const;
  }

  try {
    await ensureCrmSchema(pool);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO crm_leads (name, business, website, email, phone, businessType, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'new', NOW(), NOW())`,
      [lead.name, lead.business, lead.website, lead.email, lead.phone || null, lead.businessType || null]
    );

    return { success: true, id: result.insertId } as const;
  } catch (error) {
    console.error("Failed to save lead to MySQL:", error);
    return {
      success: false,
      error: "Could not save lead to the database.",
    } as const;
  }
}

export async function getLeadById(id: number) {
  const pool = getDbPool();

  if (!pool) {
    return { success: false, lead: null, error: "Database is not configured." } as const;
  }

  try {
    await ensureCrmSchema(pool);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, business, website, email, phone, businessType, status, created_at AS createdAt, updated_at AS updatedAt
       FROM crm_leads
       WHERE id = ?`,
      [id]
    );

    const row = rows[0];
    if (!row) {
      return { success: false, lead: null, error: "Lead not found." } as const;
    }

    return {
      success: true,
      lead: {
        id: Number(row.id),
        name: String(row.name),
        business: String(row.business),
        website: String(row.website),
        email: String(row.email),
        phone: row.phone ? String(row.phone) : null,
        businessType: row.businessType ? String(row.businessType) : null,
        status: String(row.status) as LeadStatus,
        createdAt: String(row.createdAt),
        updatedAt: String(row.updatedAt),
      } as LeadRecord,
    } as const;
  } catch (error) {
    console.error("Failed to read one lead from MySQL:", error);
    return { success: false, lead: null, error: "Could not read lead details." } as const;
  }
}

export async function getLeads({ limit = 100, status = "all", search = "" }: LeadQueryOptions = {}) {
  const pool = getDbPool();

  if (!pool) {
    return { success: false, leads: [], error: "Database is not configured." } as const;
  }

  try {
    await ensureCrmSchema(pool);

    const params: Array<string | number> = [];
    let query = `
      SELECT id, name, business, website, email, phone, businessType, status, created_at AS createdAt, updated_at AS updatedAt
      FROM crm_leads
      WHERE 1 = 1
    `;

    if (status && status !== "all") {
      query += " AND status = ?";
      params.push(status as LeadStatus);
    }

    const normalizedSearch = search.trim();
    if (normalizedSearch) {
      const likeTerm = `%${normalizedSearch}%`;
      query += " AND (name LIKE ? OR business LIKE ? OR email LIKE ? OR website LIKE ? OR businessType LIKE ?)";
      params.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
    }

    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(Number(limit));

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    return {
      success: true,
      leads: rows.map((row) => ({
        id: Number(row.id),
        name: String(row.name),
        business: String(row.business),
        website: String(row.website),
        email: String(row.email),
        phone: row.phone ? String(row.phone) : null,
        businessType: row.businessType ? String(row.businessType) : null,
        status: String(row.status) as LeadStatus,
        createdAt: String(row.createdAt),
        updatedAt: String(row.updatedAt),
      })) as LeadRecord[],
    } as const;
  } catch (error) {
    console.error("Failed to query leads from MySQL:", error);
    return { success: false, leads: [], error: "Could not read CRM leads." } as const;
  }
}

export async function updateLeadStatus(id: number, status: LeadStatus) {
  const pool = getDbPool();

  if (!pool) {
    return { success: false, error: "Database is not configured." } as const;
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE crm_leads SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    return { success: true, affectedRows: result.affectedRows } as const;
  } catch (error) {
    console.error("Failed to update lead status in MySQL:", error);
    return { success: false, error: "Could not update the lead status." } as const;
  }
}

export async function getLeadNotes(leadId: number) {
  const pool = getDbPool();

  if (!pool) {
    return { success: false, notes: [], error: "Database is not configured." } as const;
  }

  try {
    await ensureCrmSchema(pool);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, lead_id AS leadId, note, created_by AS createdBy, created_at AS createdAt
       FROM crm_lead_notes
       WHERE lead_id = ?
       ORDER BY created_at DESC`,
      [leadId]
    );

    return {
      success: true,
      notes: rows.map((row) => ({
        id: Number(row.id),
        leadId: Number(row.leadId),
        note: String(row.note),
        createdBy: String(row.createdBy),
        createdAt: String(row.createdAt),
      })) as LeadNote[],
    } as const;
  } catch (error) {
    console.error("Failed to query lead notes from MySQL:", error);
    return { success: false, notes: [], error: "Could not read lead notes." } as const;
  }
}

export async function addLeadNote(leadId: number, note: string, createdBy = "Admin") {
  const pool = getDbPool();

  if (!pool) {
    return { success: false, error: "Database is not configured." } as const;
  }

  try {
    await ensureCrmSchema(pool);

    const trimmedNote = note.trim();

    if (!trimmedNote) {
      return { success: false, error: "Note cannot be empty." } as const;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO crm_lead_notes (lead_id, note, created_by, created_at)
       VALUES (?, ?, ?, NOW())`,
      [leadId, trimmedNote, createdBy]
    );

    return { success: true, id: result.insertId } as const;
  } catch (error) {
    console.error("Failed to add lead note to MySQL:", error);
    return { success: false, error: "Could not save the lead note." } as const;
  }
}

export async function getLeadReminders(leadId: number) {
  const pool = getDbPool();

  if (!pool) {
    return { success: false, reminders: [], error: "Database is not configured." } as const;
  }

  try {
    await ensureCrmSchema(pool);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, lead_id AS leadId, scheduled_for AS scheduledFor, message, status, created_by AS createdBy, created_at AS createdAt
       FROM crm_reminders
       WHERE lead_id = ?
       ORDER BY scheduled_for ASC`,
      [leadId]
    );

    return {
      success: true,
      reminders: rows.map((row) => ({
        id: Number(row.id),
        leadId: Number(row.leadId),
        scheduledFor: String(row.scheduledFor),
        message: String(row.message),
        status: String(row.status) as ReminderRecord["status"],
        createdBy: String(row.createdBy),
        createdAt: String(row.createdAt),
      })) as ReminderRecord[],
    } as const;
  } catch (error) {
    console.error("Failed to query lead reminders from MySQL:", error);
    return { success: false, reminders: [], error: "Could not read lead reminders." } as const;
  }
}

export async function addLeadReminder(
  leadId: number,
  message: string,
  scheduledFor: string,
  createdBy = "Admin"
) {
  const pool = getDbPool();

  if (!pool) {
    return { success: false, error: "Database is not configured." } as const;
  }

  try {
    await ensureCrmSchema(pool);

    const trimmedMessage = message.trim();
    if (!trimmedMessage || !scheduledFor) {
      return { success: false, error: "Reminder message and date are required." } as const;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO crm_reminders (lead_id, scheduled_for, message, status, created_by, created_at)
       VALUES (?, ?, ?, 'pending', ?, NOW())`,
      [leadId, scheduledFor, trimmedMessage, createdBy]
    );

    return { success: true, id: result.insertId } as const;
  } catch (error) {
    console.error("Failed to add lead reminder to MySQL:", error);
    return { success: false, error: "Could not save the reminder." } as const;
  }
}

export async function getLeadEmails(leadId: number) {
  const pool = getDbPool();

  if (!pool) {
    return { success: false, emails: [], error: "Database is not configured." } as const;
  }

  try {
    await ensureCrmSchema(pool);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, lead_id AS leadId, subject, body, sent_at AS sentAt, status, created_by AS createdBy
       FROM crm_email_activity
       WHERE lead_id = ?
       ORDER BY sent_at DESC`,
      [leadId]
    );

    return {
      success: true,
      emails: rows.map((row) => ({
        id: Number(row.id),
        leadId: Number(row.leadId),
        subject: String(row.subject),
        body: String(row.body),
        sentAt: String(row.sentAt),
        status: String(row.status) as EmailRecord["status"],
        createdBy: String(row.createdBy),
      })) as EmailRecord[],
    } as const;
  } catch (error) {
    console.error("Failed to query lead emails from MySQL:", error);
    return { success: false, emails: [], error: "Could not read follow-up emails." } as const;
  }
}

export async function logLeadEmail(
  leadId: number,
  subject: string,
  body: string,
  status: "draft" | "sent" | "failed" = "sent",
  createdBy = "Admin"
) {
  const pool = getDbPool();

  if (!pool) {
    return { success: false, error: "Database is not configured." } as const;
  }

  try {
    await ensureCrmSchema(pool);

    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();

    if (!trimmedSubject || !trimmedBody) {
      return { success: false, error: "Subject and message are required." } as const;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO crm_email_activity (lead_id, subject, body, status, created_by, sent_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [leadId, trimmedSubject, trimmedBody, status, createdBy]
    );

    return { success: true, id: result.insertId } as const;
  } catch (error) {
    console.error("Failed to log lead email to MySQL:", error);
    return { success: false, error: "Could not log the follow-up email." } as const;
  }
}

export async function getUserByUsername(username: string) {
  const pool = getDbPool();

  if (!pool) {
    return null;
  }

  try {
    await ensureCrmSchema(pool);

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT username, password_hash, role FROM crm_users WHERE username = ? LIMIT 1",
      [username]
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      username: String(row.username),
      passwordHash: String(row.password_hash),
      role: String(row.role) as UserRole,
    };
  } catch {
    return null;
  }
}
