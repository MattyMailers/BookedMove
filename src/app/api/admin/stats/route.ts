import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  try {
    requireAdminAuth(req); initDb(); const db = getDb();
    const tc = (db.prepare('SELECT COUNT(*) as v FROM companies').get() as any).v;
    const ac = (db.prepare("SELECT COUNT(*) as v FROM companies WHERE subscription_status = 'active'").get() as any).v;
    const tb = (db.prepare('SELECT COUNT(*) as v FROM bookings').get() as any).v;
    const tr = (db.prepare("SELECT COALESCE(SUM(deposit_amount),0) as v FROM bookings WHERE deposit_paid = 1").get() as any).v;
    return NextResponse.json({ totalCompanies: tc, activeCompanies: ac, totalBookings: tb, totalRevenue: tr, mrr: ac * 49 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
