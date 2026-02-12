import { NextRequest } from 'next/server';
import { initDb, queryOne, queryAll } from '@/lib/db';
import { corsResponse, corsOptions } from '@/lib/cors';

export async function OPTIONS() { return corsOptions(); }

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await initDb();
    const co = await queryOne('SELECT id FROM companies WHERE slug = ?', [params.slug]);
    if (!co) return corsResponse({ error: 'Not found' }, 404);

    const month = req.nextUrl.searchParams.get('month');
    const date = req.nextUrl.searchParams.get('date');

    const st = await queryOne('SELECT max_moves_per_day, availability_mode, max_moves_am, max_moves_pm, default_time_window, secondary_time_window, secondary_window_enabled, smartmoving_api_key, smartmoving_client_id FROM company_settings WHERE company_id = ?', [co.id]);
    const maxPerDay = Number(st?.max_moves_per_day) || 3;
    const maxAm = Number(st?.max_moves_am) || 3;
    const maxPm = Number(st?.max_moves_pm) || 2;

    // If single date query
    if (date) {
      const override = await queryOne('SELECT available, max_moves FROM availability_overrides WHERE company_id = ? AND date = ?', [co.id, date]);
      if (override && Number(override.available) === 0) {
        return corsResponse({ date, available: false, status: 'closed', slots: [] });
      }
      const dayMax = override?.max_moves != null ? Number(override.max_moves) : maxPerDay;

      // Count BookedMove bookings for that date
      const bmCount = await queryOne('SELECT COUNT(*) as c FROM bookings WHERE company_id = ? AND move_date = ? AND status != ?', [co.id, date, 'cancelled']);
      const booked = Number(bmCount?.c) || 0;

      // Count by time window
      const amCount = await queryOne("SELECT COUNT(*) as c FROM bookings WHERE company_id = ? AND move_date = ? AND status != ? AND (time_window = 'am' OR time_window IS NULL OR time_window = '')", [co.id, date, 'cancelled']);
      const pmCount = await queryOne("SELECT COUNT(*) as c FROM bookings WHERE company_id = ? AND move_date = ? AND status != ? AND time_window = 'pm'", [co.id, date, 'cancelled']);

      const slots: any[] = [];
      if (st?.default_time_window) {
        slots.push({
          id: 'am',
          label: String(st.default_time_window),
          available: (Number(amCount?.c) || 0) < maxAm,
          booked: Number(amCount?.c) || 0,
          capacity: maxAm,
        });
      }
      if (st?.secondary_window_enabled && st?.secondary_time_window) {
        slots.push({
          id: 'pm',
          label: String(st.secondary_time_window),
          available: (Number(pmCount?.c) || 0) < maxPm,
          booked: Number(pmCount?.c) || 0,
          capacity: maxPm,
        });
      }

      const remaining = dayMax - booked;
      let status: string;
      if (remaining <= 0) status = 'full';
      else if (remaining <= 1) status = 'limited';
      else status = 'available';

      return corsResponse({ date, available: remaining > 0, status, remaining, capacity: dayMax, booked, slots });
    }

    // Month query: return 30+ days of availability
    let startDate: string;
    if (month) {
      startDate = `${month}-01`;
    } else {
      const now = new Date();
      startDate = now.toISOString().split('T')[0];
    }

    // Get all overrides for the range
    const sd = new Date(startDate);
    const ed = new Date(sd);
    ed.setDate(ed.getDate() + 42); // 6 weeks to cover any month view
    const overrides = await queryAll('SELECT date, available, max_moves FROM availability_overrides WHERE company_id = ? AND date >= ? AND date <= ?', [co.id, sd.toISOString().split('T')[0], ed.toISOString().split('T')[0]]);
    const overrideMap: Record<string, any> = {};
    for (const o of overrides) overrideMap[String(o.date)] = o;

    // Get booking counts per day
    const bookingCounts = await queryAll("SELECT move_date, COUNT(*) as c FROM bookings WHERE company_id = ? AND move_date >= ? AND move_date <= ? AND status != 'cancelled' GROUP BY move_date", [co.id, sd.toISOString().split('T')[0], ed.toISOString().split('T')[0]]);
    const countMap: Record<string, number> = {};
    for (const bc of bookingCounts) countMap[String(bc.move_date)] = Number(bc.c);

    const days: any[] = [];
    for (let d = new Date(sd); d <= ed; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().split('T')[0];
      const ov = overrideMap[ds];
      const booked = countMap[ds] || 0;
      const dayMax = ov?.max_moves != null ? Number(ov.max_moves) : maxPerDay;

      if (ov && Number(ov.available) === 0) {
        days.push({ date: ds, status: 'closed', booked, capacity: dayMax });
      } else {
        const remaining = dayMax - booked;
        let status: string;
        if (remaining <= 0) status = 'full';
        else if (remaining <= 1) status = 'limited';
        else status = 'available';
        days.push({ date: ds, status, booked, capacity: dayMax });
      }
    }

    return corsResponse({ days });
  } catch (e: any) {
    return corsResponse({ error: e.message }, 500);
  }
}
