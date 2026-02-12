import { initDb, run, queryOne } from './db';
import bcrypt from 'bcryptjs';
export { initDb };
export async function seedDb() {
  await initDb();
  const existing = await queryOne('SELECT COUNT(*) as count FROM companies');
  if (existing && Number(existing.count) > 0) return;
  await run('INSERT INTO admin_users (email, password_hash, name) VALUES (?,?,?)', ['admin@bookedmove.com', bcrypt.hashSync('admin123', 10), 'BookedMove Admin']);
  const r = await run('INSERT INTO companies (name, slug, primary_color, accent_color, subscription_status) VALUES (?,?,?,?,?)', ['iHaul iMove', 'ihaul', '#2563eb', '#1e40af', 'active']);
  const c = r.lastInsertRowid;
  await run('INSERT INTO company_settings (company_id, base_rate_per_hour, min_hours, deposit_type, deposit_amount, mileage_rate) VALUES (?,?,?,?,?,?)', [c, 165, 3, 'flat', 150, 2.5]);
  const sizes = [['studio',0,350,125,2,2],['1-bedroom',1,450,145,3,2],['2-bedroom',2,650,165,4,3],['3-bedroom',3,850,185,5,3],['4-bedroom',4,1100,205,6,4],['5-bedroom',5,1400,225,7,4]];
  for (const s of sizes) await run('INSERT INTO pricing_rules (company_id, move_size, bedrooms, base_price, hourly_rate, min_hours, crew_size) VALUES (?,?,?,?,?,?,?)', [c, ...s]);
  await run('INSERT INTO company_users (company_id, email, password_hash, role, name) VALUES (?,?,?,?,?)', [c, 'demo@ihaul.com', bcrypt.hashSync('demo123', 10), 'admin', 'Demo User']);
}
