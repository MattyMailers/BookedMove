import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  try {
    requireAdminAuth(req); initDb();
    return NextResponse.json({ companies: getDb().prepare('SELECT c.*, (SELECT COUNT(*) FROM bookings b WHERE b.company_id = c.id) as booking_count FROM companies c ORDER BY c.created_at DESC').all() });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
