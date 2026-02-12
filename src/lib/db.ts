import Database from 'better-sqlite3';
import path from 'path';
let db: Database.Database;
export function getDb(): Database.Database {
  if (!db) {
    const dbPath = (process.env.DATABASE_URL || 'file:local.db').replace('file:', '');
    db = new Database(path.resolve(process.cwd(), dbPath));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}
export function initDb() {
  const d = getDb();
  d.exec(`
    CREATE TABLE IF NOT EXISTS companies (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, logo_url TEXT, primary_color TEXT DEFAULT '#2563eb', accent_color TEXT DEFAULT '#1e40af', stripe_customer_id TEXT, subscription_status TEXT DEFAULT 'trial', subscription_plan TEXT DEFAULT 'starter', created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS company_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER NOT NULL UNIQUE, base_rate_per_hour REAL DEFAULT 150, min_hours REAL DEFAULT 2, deposit_type TEXT DEFAULT 'flat', deposit_amount REAL DEFAULT 100, crew_sizes TEXT DEFAULT '[]', truck_types TEXT DEFAULT '[]', service_areas TEXT DEFAULT '[]', smartmoving_api_key TEXT, smartmoving_client_id TEXT, stripe_connect_account_id TEXT, google_maps_key TEXT, mileage_rate REAL DEFAULT 2.5);
    CREATE TABLE IF NOT EXISTS pricing_rules (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER NOT NULL, move_size TEXT NOT NULL, bedrooms INTEGER, base_price REAL NOT NULL, hourly_rate REAL NOT NULL, min_hours REAL DEFAULT 2, crew_size INTEGER DEFAULT 2);
    CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER NOT NULL, booking_ref TEXT NOT NULL UNIQUE, status TEXT DEFAULT 'pending', customer_name TEXT NOT NULL, customer_email TEXT NOT NULL, customer_phone TEXT, origin_address TEXT NOT NULL, destination_address TEXT NOT NULL, move_date TEXT NOT NULL, time_slot TEXT, home_size TEXT, bedrooms INTEGER, estimated_hours REAL, estimated_price REAL, deposit_amount REAL DEFAULT 0, deposit_paid INTEGER DEFAULT 0, stripe_payment_intent_id TEXT, smartmoving_opportunity_id TEXT, notes TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, name TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS company_users (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER NOT NULL, email TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT DEFAULT 'admin', name TEXT, created_at TEXT DEFAULT (datetime('now')), UNIQUE(company_id, email));
    CREATE TABLE IF NOT EXISTS subscription_events (id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER NOT NULL, event_type TEXT NOT NULL, stripe_event_id TEXT, amount REAL, details TEXT, created_at TEXT DEFAULT (datetime('now')));
  `);
  return d;
}
