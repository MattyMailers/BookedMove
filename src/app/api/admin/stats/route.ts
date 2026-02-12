import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryOne } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  try {
    requireAdminAuth(req); await initDb();
    const tc = Number((await queryOne('SELECT COUNT(*) as v FROM companies'))?.v||0);
    const ac = Number((await queryOne("SELECT COUNT(*) as v FROM companies WHERE subscription_status = 'active'"))?.v||0);
    const tb = Number((await queryOne('SELECT COUNT(*) as v FROM bookings'))?.v||0);
    const tr = Number((await queryOne("SELECT COALESCE(SUM(deposit_amount),0) as v FROM bookings WHERE deposit_paid = 1"))?.v||0);
    return NextResponse.json({ totalCompanies: tc, activeCompanies: ac, totalBookings: tb, totalRevenue: tr, mrr: ac * 49 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
