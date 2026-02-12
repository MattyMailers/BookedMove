import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryAll } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req); await initDb();
    return NextResponse.json({ bookings: await queryAll('SELECT * FROM bookings WHERE company_id = ? ORDER BY created_at DESC LIMIT 100', [p.companyId]) });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
