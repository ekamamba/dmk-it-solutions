import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { type RowDataPacket } from "mysql2/promise";
import { getDbPool } from "@/lib/db";

export type UserRole = "admin" | "manager" | "sales";

export type UserSession = {
  username: string;
  role: UserRole;
};

const SESSION_COOKIE_NAME = "dmk-crm-session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? "dmk-local-dev-secret-change-me";

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function secureCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a || "", "utf8");
  const bBuffer = Buffer.from(b || "", "utf8");

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "dmkcrm2026",
  };
}

export async function authenticateUser(username: string, password: string): Promise<UserSession | null> {
  const normalizedUsername = String(username ?? "").trim();
  const normalizedPassword = String(password ?? "");
  const { username: envUsername, password: envPassword } = getAdminCredentials();

  if (secureCompare(normalizedUsername, envUsername) && secureCompare(normalizedPassword, envPassword)) {
    return { username: envUsername, role: "admin" };
  }

  const pool = getDbPool();
  if (!pool) {
    return null;
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT username, password_hash, role FROM crm_users WHERE username = ? LIMIT 1",
      [normalizedUsername]
    );

    const user = rows[0];
    if (!user) {
      return null;
    }

    const passwordHash = createHash("sha256").update(normalizedPassword).digest("hex");
    if (passwordHash !== String(user.password_hash)) {
      return null;
    }

    const role = String(user.role) as UserRole;
    return {
      username: String(user.username),
      role: ["admin", "manager", "sales"].includes(role) ? role : "sales",
    };
  } catch {
    return null;
  }
}

export function verifyAdminCredentials(username: string, password: string) {
  const { username: expectedUsername, password: expectedPassword } = getAdminCredentials();

  return secureCompare(String(username ?? ""), expectedUsername) &&
    secureCompare(String(password ?? ""), expectedPassword);
}

export function signSession(session: UserSession) {
  const payload = toBase64Url(JSON.stringify(session));
  const signature = createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifySession(token?: string): UserSession | null {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");

  if (!secureCompare(signature, expectedSignature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as UserSession;

    if (!parsed.username || !parsed.role || !["admin", "manager", "sales"].includes(parsed.role)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}
