import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryOne } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req); await initDb(); const c = p.companyId;
    const m = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const t = Number((await queryOne('SELECT COUNT(*) as v FROM bookings WHERE company_id = ?', [c]))?.v || 0);
    const mb = Number((await queryOne('SELECT COUNT(*) as v FROM bookings WHERE company_id = ? AND created_at >= ?', [c, m]))?.v || 0);
    const cf = Number((await queryOne("SELECT COUNT(*) as v FROM bookings WHERE company_id = ? AND status = 'confirmed' AND created_at >= ?", [c, m]))?.v || 0);
    const rv = Number((await queryOne("SELECT COALESCE(SUM(estimated_price),0) as v FROM bookings WHERE company_id = ? AND status = 'confirmed' AND created_at >= ?", [c, m]))?.v || 0);
    return NextResponse.json({ totalBookings: t, monthBookings: mb, confirmedMonth: cf, revenue: rv, depositsCollected: 0, conversionRate: mb > 0 ? Math.round((cf/mb)*100) : 0 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
