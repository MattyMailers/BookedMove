import { initDb, getDb } from './db';
import bcrypt from 'bcryptjs';
export function seedDb() {
  const db = initDb();
  const existing = db.prepare('SELECT COUNT(*) as count FROM companies').get() as any;
  if (existing.count > 0) return;
  db.prepare('INSERT INTO admin_users (email, password_hash, name) VALUES (?,?,?)').run('admin@bookedmove.com', bcrypt.hashSync('admin123', 10), 'BookedMove Admin');
  const r = db.prepare('INSERT INTO companies (name, slug, primary_color, accent_color, subscription_status) VALUES (?,?,?,?,?)').run('iHaul iMove', 'ihaul', '#2563eb', '#1e40af', 'active');
  const c = r.lastInsertRowid;
  db.prepare('INSERT INTO company_settings (company_id, base_rate_per_hour, min_hours, deposit_type, deposit_amount, mileage_rate) VALUES (?,?,?,?,?,?)').run(c, 165, 3, 'flat', 150, 2.5);
  const i = db.prepare('INSERT INTO pricing_rules (company_id, move_size, bedrooms, base_price, hourly_rate, min_hours, crew_size) VALUES (?,?,?,?,?,?,?)');
  i.run(c,'studio',0,350,125,2,2);i.run(c,'1-bedroom',1,450,145,3,2);i.run(c,'2-bedroom',2,650,165,4,3);i.run(c,'3-bedroom',3,850,185,5,3);i.run(c,'4-bedroom',4,1100,205,6,4);i.run(c,'5-bedroom',5,1400,225,7,4);
  db.prepare('INSERT INTO company_users (company_id, email, password_hash, role, name) VALUES (?,?,?,?,?)').run(c, 'demo@ihaul.com', bcrypt.hashSync('demo123', 10), 'admin', 'Demo User');
}
