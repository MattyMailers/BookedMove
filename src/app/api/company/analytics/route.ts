import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryOne, queryAll } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    const c = p.companyId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
    const todayStart = now.toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];

    const total = Number((await queryOne('SELECT COUNT(*) as v FROM bookings WHERE company_id = ?', [c]))?.v || 0);
    const month = Number((await queryOne('SELECT COUNT(*) as v FROM bookings WHERE company_id = ? AND created_at >= ?', [c, monthStart]))?.v || 0);
    const week = Number((await queryOne('SELECT COUNT(*) as v FROM bookings WHERE company_id = ? AND created_at >= ?', [c, weekStart]))?.v || 0);
    const today = Number((await queryOne('SELECT COUNT(*) as v FROM bookings WHERE company_id = ? AND created_at >= ?', [c, todayStart]))?.v || 0);
    const confirmed = Number((await queryOne("SELECT COUNT(*) as v FROM bookings WHERE company_id = ? AND status = 'confirmed' AND created_at >= ?", [c, monthStart]))?.v || 0);
    const revenue = Number((await queryOne("SELECT COALESCE(SUM(estimated_price),0) as v FROM bookings WHERE company_id = ? AND status IN ('confirmed','completed') AND created_at >= ?", [c, monthStart]))?.v || 0);

    // Widget analytics
    const widgetLoads = Number((await queryOne("SELECT COUNT(*) as v FROM widget_events WHERE company_id = ? AND event_type = 'widget_loaded' AND created_at >= ?", [c, monthStart]))?.v || 0);
    const submissions = Number((await queryOne("SELECT COUNT(*) as v FROM widget_events WHERE company_id = ? AND event_type = 'booking_submitted' AND created_at >= ?", [c, monthStart]))?.v || 0);
    const conversionRate = widgetLoads > 0 ? Math.round((submissions / widgetLoads) * 100) : (month > 0 ? 100 : 0);

    // Drop-off by step
    const dropoffs = await queryAll("SELECT step, COUNT(*) as count FROM widget_events WHERE company_id = ? AND event_type = 'step_completed' AND created_at >= ? GROUP BY step ORDER BY step", [c, monthStart]);

    // Last 30 days chart data
    const dailyBookings = await queryAll("SELECT DATE(created_at) as day, COUNT(*) as count FROM bookings WHERE company_id = ? AND created_at >= ? GROUP BY DATE(created_at) ORDER BY day", [c, thirtyDaysAgo]);

    // Recent bookings
    const recent = await queryAll('SELECT id, booking_ref, status, customer_name, move_date, estimated_price, created_at FROM bookings WHERE company_id = ? ORDER BY created_at DESC LIMIT 10', [c]);

    return NextResponse.json({
      totalBookings: total,
      monthBookings: month,
      weekBookings: week,
      todayBookings: today,
      confirmedMonth: confirmed,
      revenue,
      widgetLoads,
      submissions,
      conversionRate,
      dropoffs,
      dailyBookings,
      recentBookings: recent,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
