// Turso DB client - uses raw HTTP pipeline API to avoid @libsql/client URL parsing bugs on Vercel
// Falls back to @libsql/client for local file:// SQLite in development

const TURSO_URL = process.env.TURSO_DATABASE_URL || '';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || '';
const IS_TURSO = TURSO_URL.startsWith('http');

// --- Turso HTTP Pipeline Client ---
interface TursoResult {
  rows: Record<string, any>[];
  columns: string[];
  lastInsertRowid: bigint | undefined;
  rowsAffected: number;
}

function convertValue(v: any): any {
  if (v === null) return null;
  if (typeof v === 'object') {
    if (v.type === 'null') return null;
    if (v.type === 'integer') return Number(v.value);
    if (v.type === 'float') return Number(v.value);
    if (v.type === 'text') return v.value;
    if (v.type === 'blob') return v.value;
    return v.value ?? v;
  }
  return v;
}

function argToHrana(arg: any): any {
  if (arg === null || arg === undefined) return { type: 'null' };
  if (typeof arg === 'number') {
    return Number.isInteger(arg) ? { type: 'integer', value: String(arg) } : { type: 'float', value: arg };
  }
  if (typeof arg === 'bigint') return { type: 'integer', value: String(arg) };
  if (typeof arg === 'string') return { type: 'text', value: arg };
  if (arg instanceof ArrayBuffer || arg instanceof Uint8Array) return { type: 'blob', base64: Buffer.from(arg as any).toString('base64') };
  return { type: 'text', value: String(arg) };
}

async function tursoExecute(sql: string, args: any[] = []): Promise<TursoResult> {
  const resp = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql,
            args: args.map(argToHrana),
          },
        },
        { type: 'close' },
      ],
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Turso HTTP error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const result = data.results?.[0];

  if (result?.type === 'error') {
    throw new Error(`SQL error: ${result.error?.message || JSON.stringify(result.error)}`);
  }

  const execResult = result?.response?.result;
  if (!execResult) {
    return { rows: [], columns: [], lastInsertRowid: undefined, rowsAffected: 0 };
  }

  const columns = execResult.cols?.map((c: any) => c.name) || [];
  const rows = (execResult.rows || []).map((row: any[]) => {
    const obj: Record<string, any> = {};
    row.forEach((val: any, i: number) => {
      obj[columns[i]] = convertValue(val);
    });
    return obj;
  });

  return {
    rows,
    columns,
    lastInsertRowid: execResult.last_insert_rowid != null ? BigInt(execResult.last_insert_rowid) : undefined,
    rowsAffected: execResult.affected_row_count || 0,
  };
}

// --- Local SQLite fallback (dev only) ---
let localClient: any = null;
async function getLocalClient() {
  if (!localClient) {
    const { createClient } = await import('@libsql/client');
    localClient = createClient({ url: 'file:local.db' });
  }
  return localClient;
}

async function localExecute(sql: string, args: any[] = []): Promise<TursoResult> {
  const client = await getLocalClient();
  const result = await client.execute({ sql, args });
  return {
    rows: result.rows as any[],
    columns: result.columns,
    lastInsertRowid: result.lastInsertRowid,
    rowsAffected: result.rowsAffected,
  };
}

// --- Public API ---
export async function query(sql: string, args: any[] = []) {
  return IS_TURSO ? tursoExecute(sql, args) : localExecute(sql, args);
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
    await query(sql);
  }
  const safeAlter = async (table: string, col: string, def: string) => {
    try { await query(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`); } catch {}
  };
  await safeAlter('company_settings', 'form_config', "TEXT DEFAULT '{}'");
  await safeAlter('company_settings', 'onboarding_completed', 'INTEGER DEFAULT 0');
  await safeAlter('company_settings', 'google_maps_key', 'TEXT');
  await safeAlter('company_settings', 'service_areas', "TEXT DEFAULT '[]'");
  await safeAlter('bookings', 'notes', 'TEXT');
  await safeAlter('bookings', 'square_footage', 'INTEGER');
  await safeAlter('bookings', 'fullness', 'TEXT');
  await safeAlter('company_users', 'role', "TEXT DEFAULT 'admin'");
  await safeAlter('company_settings', 'authorize_net_login_id', 'TEXT');
  await safeAlter('company_settings', 'authorize_net_transaction_key', 'TEXT');
  await safeAlter('company_settings', 'payment_enabled', 'INTEGER DEFAULT 0');
  await safeAlter('company_settings', 'payment_mode', "TEXT DEFAULT 'deposit'");
  await safeAlter('company_settings', 'payment_timing', "TEXT DEFAULT 'at_booking'");
  await safeAlter('company_settings', 'email_notifications', 'TEXT');
  await safeAlter('company_settings', 'custom_css', 'TEXT');
  await safeAlter('bookings', 'payment_status', "TEXT DEFAULT 'none'");
  await safeAlter('bookings', 'payment_amount', 'REAL');
  await safeAlter('bookings', 'transaction_id', 'TEXT');
  await query(`CREATE TABLE IF NOT EXISTS email_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    booking_id INTEGER,
    email_type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    sent_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'sent'
  )`);
  // Phase 3: Availability
  await query(`CREATE TABLE IF NOT EXISTS availability_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    booked_count INTEGER DEFAULT 0,
    source TEXT DEFAULT 'manual',
    cached_at TEXT DEFAULT (datetime('now')),
    UNIQUE(company_id, date, source)
  )`);
  await query(`CREATE TABLE IF NOT EXISTS availability_overrides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    available INTEGER DEFAULT 1,
    max_moves INTEGER,
    UNIQUE(company_id, date)
  )`);
  // Phase 3: Coupons
  await query(`CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    discount_type TEXT DEFAULT 'percent',
    discount_value REAL DEFAULT 0,
    min_bedrooms INTEGER,
    expiration_date TEXT,
    max_uses INTEGER,
    times_used INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(company_id, code)
  )`);
  // Phase 3: new columns
  await safeAlter('company_settings', 'max_moves_per_day', 'INTEGER DEFAULT 3');
  await safeAlter('company_settings', 'availability_mode', "TEXT DEFAULT 'manual'");
  await safeAlter('company_settings', 'default_time_window', "TEXT DEFAULT '8:30 AM - 12:00 PM'");
  await safeAlter('company_settings', 'secondary_time_window', 'TEXT');
  await safeAlter('company_settings', 'secondary_window_enabled', 'INTEGER DEFAULT 0');
  await safeAlter('company_settings', 'max_moves_am', 'INTEGER DEFAULT 3');
  await safeAlter('company_settings', 'max_moves_pm', 'INTEGER DEFAULT 2');
  await safeAlter('company_settings', 'custom_domain', 'TEXT');
  await safeAlter('bookings', 'coupon_code', 'TEXT');
  await safeAlter('bookings', 'discount_amount', 'REAL');
  await safeAlter('bookings', 'time_window', 'TEXT');
}
