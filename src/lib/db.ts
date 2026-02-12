import { createClient, type Client } from '@libsql/client';

let client: Client;

function getClient(): Client {
  if (!client) {
    client = createClient({
      url: (process.env.TURSO_DATABASE_URL || 'file:local.db').replace(/^libsql:\/\//, 'https://'),
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

// Wrapper to provide better-sqlite3-like API over libsql
class DbWrapper {
  private client: Client;
  constructor(client: Client) { this.client = client; }

  prepare(sql: string) {
    const c = this.client;
    return {
      get: (...args: any[]) => {
        // Synchronous won't work - use async methods
        throw new Error('Use async db methods');
      },
      all: (...args: any[]) => {
        throw new Error('Use async db methods');
      },
      run: (...args: any[]) => {
        throw new Error('Use async db methods');
      },
    };
  }
}

// Async query helpers
export async function query(sql: string, args: any[] = []) {
  const c = getClient();
  return c.execute({ sql, args });
}

export async function queryOne(sql: string, args: any[] = []) {
  const result = await query(sql, args);
  return result.rows[0] || null;
}

export async function queryAll(sql: string, args: any[] = []) {
  const result = await query(sql, args);
  return result.rows;
}

export async function run(sql: string, args: any[] = []) {
  const result = await query(sql, args);
  return { lastInsertRowid: result.lastInsertRowid };
}

export async function initDb() {
  const c = getClient();
  const stmts = [
    "CREATE TABLE IF NOT EXISTS companies (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, logo_url TEXT, primary_color TEXT DEFAULT '#2563eb', accent_color TEXT DEFAULT '#1e40af', stripe_customer_id TEXT, subscription_status TEXT DEFAULT 'trial', subscription_plan TEXT DEFAULT 'starter', created_at TEXT DEFAULT (datetime('now')))",
    "CREATE TABLE IF NOT EXISTS company_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER NOT NULL UNIQUE, base_rate_per_hour REAL DEFAULT 150, min_hours REAL DEFAULT 2, deposit_type TEXT DEFAULT 'flat', deposit_amount REAL DEFAULT 100, crew_sizes TEXT DEFAULT '[]', truck_types TEXT DEFAULT '[]', service_areas TEXT DEFAULT '[]', smartmoving_api_key TEXT, smartmoving_client_id TEXT, stripe_connect_account_id TEXT, google_maps_key TEXT, mileage_rate REAL DEFAULT 2.5)",
    "CREATE TABLE IF NOT EXISTS pricing_rules (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER NOT NULL, move_size TEXT NOT NULL, bedrooms INTEGER, base_price REAL NOT NULL, hourly_rate REAL NOT NULL, min_hours REAL DEFAULT 2, crew_size INTEGER DEFAULT 2)",
    "CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER NOT NULL, booking_ref TEXT NOT NULL UNIQUE, status TEXT DEFAULT 'pending', customer_name TEXT NOT NULL, customer_email TEXT NOT NULL, customer_phone TEXT, origin_address TEXT NOT NULL, destination_address TEXT NOT NULL, move_date TEXT NOT NULL, time_slot TEXT, home_size TEXT, bedrooms INTEGER, estimated_hours REAL, estimated_price REAL, deposit_amount REAL DEFAULT 0, deposit_paid INTEGER DEFAULT 0, stripe_payment_intent_id TEXT, smartmoving_opportunity_id TEXT, notes TEXT, created_at TEXT DEFAULT (datetime('now')))",
    "CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, name TEXT, created_at TEXT DEFAULT (datetime('now')))",
    "CREATE TABLE IF NOT EXISTS company_users (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER NOT NULL, email TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT DEFAULT 'admin', name TEXT, created_at TEXT DEFAULT (datetime('now')), UNIQUE(company_id, email))",
    "CREATE TABLE IF NOT EXISTS subscription_events (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER NOT NULL, event_type TEXT NOT NULL, stripe_event_id TEXT, amount REAL, details TEXT, created_at TEXT DEFAULT (datetime('now')))",
    "CREATE TABLE IF NOT EXISTS widget_events (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER NOT NULL, event_type TEXT NOT NULL, step TEXT, session_id TEXT, metadata TEXT, created_at TEXT DEFAULT (datetime('now')))",
    "CREATE TABLE IF NOT EXISTS invitations (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER NOT NULL, email TEXT NOT NULL, role TEXT DEFAULT 'viewer', token TEXT NOT NULL UNIQUE, accepted INTEGER DEFAULT 0, invited_by INTEGER, created_at TEXT DEFAULT (datetime('now')))",
  ];
  for (const sql of stmts) {
    await c.execute(sql);
  }
  // Add columns if missing (safe ALTER TABLE)
  const safeAlter = async (table: string, col: string, def: string) => {
    try { await c.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`); } catch {}
  };
  await safeAlter('company_settings', 'form_config', "TEXT DEFAULT '{}'");
  await safeAlter('company_settings', 'onboarding_completed', 'INTEGER DEFAULT 0');
  await safeAlter('company_settings', 'google_maps_key', 'TEXT');
  await safeAlter('company_settings', 'service_areas', "TEXT DEFAULT '[]'");
  await safeAlter('bookings', 'notes', 'TEXT');
  await safeAlter('bookings', 'square_footage', 'INTEGER');
  await safeAlter('bookings', 'fullness', 'TEXT');
  await safeAlter('company_users', 'role', "TEXT DEFAULT 'admin'");

  // Phase 2: Payment gateway columns
  await safeAlter('company_settings', 'authorize_net_login_id', 'TEXT');
  await safeAlter('company_settings', 'authorize_net_transaction_key', 'TEXT');
  await safeAlter('company_settings', 'payment_enabled', 'INTEGER DEFAULT 0');
  await safeAlter('company_settings', 'payment_mode', "TEXT DEFAULT 'deposit'");
  await safeAlter('company_settings', 'payment_timing', "TEXT DEFAULT 'at_booking'");
  await safeAlter('company_settings', 'email_notifications', 'TEXT');
  await safeAlter('company_settings', 'custom_css', 'TEXT');

  // Phase 2: Payment tracking on bookings
  await safeAlter('bookings', 'payment_status', "TEXT DEFAULT 'none'");
  await safeAlter('bookings', 'payment_amount', 'REAL');
  await safeAlter('bookings', 'transaction_id', 'TEXT');

  // Phase 2: Email log table
  await c.execute(`CREATE TABLE IF NOT EXISTS email_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    booking_id INTEGER,
    email_type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    sent_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'sent'
  )`);
}
