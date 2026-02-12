import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { seedDb } from '@/lib/seed';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
export async function POST(req: NextRequest) {
  try {
    initDb(); seedDb(); const db = getDb();
    const { email, password } = await req.json();
    const u = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email) as any;
    if (!u || !bcrypt.compareSync(password, u.password_hash)) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const token = signToken({ userId: u.id, email: u.email, type: 'admin' });
    const r = NextResponse.json({ token, user: { id: u.id, email: u.email, name: u.name } });
    r.cookies.set('admin_token', token, { httpOnly: true, maxAge: 604800, path: '/' });
    return r;
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
