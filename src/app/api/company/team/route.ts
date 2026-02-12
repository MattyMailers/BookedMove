import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryAll, queryOne, run } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    const members = await queryAll('SELECT id, email, role, name, created_at FROM company_users WHERE company_id = ?', [p.companyId]);
    const invites = await queryAll('SELECT id, email, role, accepted, created_at FROM invitations WHERE company_id = ? ORDER BY created_at DESC', [p.companyId]);
    return NextResponse.json({ members, invitations: invites });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    // Check role - only owner/admin can invite
    const user = await queryOne('SELECT role FROM company_users WHERE id = ? AND company_id = ?', [p.userId, p.companyId]);
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Only owners and admins can invite team members' }, { status: 403 });
    }
    const { email, role } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
    const existing = await queryOne('SELECT id FROM company_users WHERE company_id = ? AND email = ?', [p.companyId, email]);
    if (existing) return NextResponse.json({ error: 'User already on team' }, { status: 409 });
    const token = nanoid(32);
    await run('INSERT INTO invitations (company_id, email, role, token, invited_by) VALUES (?,?,?,?,?)',
      [p.companyId, email, role || 'viewer', token, p.userId]);
    return NextResponse.json({ success: true, inviteToken: token });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    const { memberId } = await req.json();
    // Can't remove yourself
    if (Number(memberId) === p.userId) return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
    await run('DELETE FROM company_users WHERE id = ? AND company_id = ?', [memberId, p.companyId]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
