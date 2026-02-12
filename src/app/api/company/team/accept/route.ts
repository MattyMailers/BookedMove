import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryOne, run } from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { token, name, password } = await req.json();
    const invite = await queryOne('SELECT * FROM invitations WHERE token = ? AND accepted = 0', [token]);
    if (!invite) return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
    const existing = await queryOne('SELECT id FROM company_users WHERE company_id = ? AND email = ?', [invite.company_id, invite.email]);
    if (existing) return NextResponse.json({ error: 'Already on team' }, { status: 409 });
    const r = await run('INSERT INTO company_users (company_id, email, password_hash, role, name) VALUES (?,?,?,?,?)',
      [invite.company_id, invite.email, bcrypt.hashSync(password, 10), invite.role, name || invite.email]);
    await run('UPDATE invitations SET accepted = 1 WHERE id = ?', [invite.id]);
    const jwt = signToken({ userId: Number(r.lastInsertRowid), email: String(invite.email), type: 'company', companyId: Number(invite.company_id) });
    return NextResponse.json({ token: jwt });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
