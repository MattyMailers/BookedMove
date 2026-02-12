import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { seedDb } from '@/lib/seed';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
export async function POST(req: NextRequest) {
  try {
    initDb(); seedDb(); const db = getDb();
    const { companyName, email, password } = await req.json();
    if (!companyName || !email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (db.prepare('SELECT id FROM companies WHERE slug = ?').get(slug)) return NextResponse.json({ error: 'Already taken' }, { status: 409 });
    const r = db.prepare('INSERT INTO companies (name, slug, subscription_status) VALUES (?,?,?)').run(companyName, slug, 'trial');
    const cid = r.lastInsertRowid;
    db.prepare('INSERT INTO company_settings (company_id) VALUES (?)').run(cid);
    const ins = db.prepare('INSERT INTO pricing_rules (company_id, move_size, bedrooms, base_price, hourly_rate, min_hours, crew_size) VALUES (?,?,?,?,?,?,?)');
    ins.run(cid,'studio',0,350,125,2,2);ins.run(cid,'1-bedroom',1,450,145,3,2);ins.run(cid,'2-bedroom',2,650,165,4,3);ins.run(cid,'3-bedroom',3,850,185,5,3);ins.run(cid,'4-bedroom',4,1100,205,6,4);
    db.prepare('INSERT INTO company_users (company_id, email, password_hash, role, name) VALUES (?,?,?,?,?)').run(cid, email, bcrypt.hashSync(password,10), 'admin', companyName);
    const token = signToken({ userId: Number(cid), email, type: 'company', companyId: Number(cid) });
    const resp = NextResponse.json({ token, slug, companyId: Number(cid) });
    resp.cookies.set('token', token, { httpOnly: true, maxAge: 604800, path: '/' });
    return resp;
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
