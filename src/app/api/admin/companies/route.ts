import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryAll } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  try {
    requireAdminAuth(req); await initDb();
    return NextResponse.json({ companies: await queryAll("SELECT c.*, (SELECT COUNT(*) FROM bookings b WHERE b.company_id = c.id) as booking_count FROM companies c ORDER BY c.created_at DESC") });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
