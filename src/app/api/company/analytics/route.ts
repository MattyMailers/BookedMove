import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req); initDb(); const db = getDb(); const c = p.companyId;
    const m = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const t = (db.prepare('SELECT COUNT(*) as v FROM bookings WHERE company_id = ?').get(c) as any).v;
    const mb = (db.prepare('SELECT COUNT(*) as v FROM bookings WHERE company_id = ? AND created_at >= ?').get(c, m) as any).v;
    const cf = (db.prepare("SELECT COUNT(*) as v FROM bookings WHERE company_id = ? AND status = 'confirmed' AND created_at >= ?").get(c, m) as any).v;
    const rv = (db.prepare("SELECT COALESCE(SUM(estimated_price),0) as v FROM bookings WHERE company_id = ? AND status = 'confirmed' AND created_at >= ?").get(c, m) as any).v;
    return NextResponse.json({ totalBookings: t, monthBookings: mb, confirmedMonth: cf, revenue: rv, depositsCollected: 0, conversionRate: mb > 0 ? Math.round((cf/mb)*100) : 0 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
