import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req); initDb();
    return NextResponse.json({ bookings: getDb().prepare('SELECT * FROM bookings WHERE company_id = ? ORDER BY created_at DESC LIMIT 100').all(p.companyId) });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
