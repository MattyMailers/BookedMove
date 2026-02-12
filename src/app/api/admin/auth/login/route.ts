import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { seedDb } from '@/lib/seed';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
export async function POST(req: NextRequest) {
  try {
    await seedDb();
    const { email, password } = await req.json();
    const u = await queryOne('SELECT * FROM admin_users WHERE email = ?', [email]);
    if (!u || !bcrypt.compareSync(password, String(u.password_hash))) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const token = signToken({ userId: Number(u.id), email: String(u.email), type: 'admin' });
    const r = NextResponse.json({ token, user: { id: u.id, email: u.email, name: u.name } });
    r.cookies.set('admin_token', token, { httpOnly: true, maxAge: 604800, path: '/' });
    return r;
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
