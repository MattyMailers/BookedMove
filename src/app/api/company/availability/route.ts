import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryAll, queryOne, run } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();

    const st = await queryOne('SELECT max_moves_per_day, availability_mode, max_moves_am, max_moves_pm FROM company_settings WHERE company_id = ?', [p.companyId]);
    const maxPerDay = Number(st?.max_moves_per_day) || 3;

    // Next 60 days
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 60);

    const overrides = await queryAll('SELECT date, available, max_moves FROM availability_overrides WHERE company_id = ? AND date >= ? AND date <= ?', [p.companyId, now.toISOString().split('T')[0], end.toISOString().split('T')[0]]);
    const overrideMap: Record<string, any> = {};
    for (const o of overrides) overrideMap[String(o.date)] = o;

    const bookingCounts = await queryAll("SELECT move_date, COUNT(*) as c FROM bookings WHERE company_id = ? AND move_date >= ? AND move_date <= ? AND status != 'cancelled' GROUP BY move_date", [p.companyId, now.toISOString().split('T')[0], end.toISOString().split('T')[0]]);
    const countMap: Record<string, number> = {};
    for (const bc of bookingCounts) countMap[String(bc.move_date)] = Number(bc.c);

    const days: any[] = [];
    for (let d = new Date(now); d <= end; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().split('T')[0];
      const ov = overrideMap[ds];
      const booked = countMap[ds] || 0;
      const dayMax = ov?.max_moves != null ? Number(ov.max_moves) : maxPerDay;
      const closed = ov && Number(ov.available) === 0;
      days.push({ date: ds, booked, capacity: dayMax, closed });
    }

    return NextResponse.json({ days, settings: { maxPerDay, mode: st?.availability_mode || 'manual' } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    const body = await req.json();

    // body.overrides = [{ date, available, max_moves }]
    if (body.overrides && Array.isArray(body.overrides)) {
      for (const o of body.overrides) {
        // Upsert
        const existing = await queryOne('SELECT id FROM availability_overrides WHERE company_id = ? AND date = ?', [p.companyId, o.date]);
        if (existing) {
          await run('UPDATE availability_overrides SET available = ?, max_moves = ? WHERE id = ?', [o.available ? 1 : 0, o.max_moves ?? null, existing.id]);
        } else {
          await run('INSERT INTO availability_overrides (company_id, date, available, max_moves) VALUES (?, ?, ?, ?)', [p.companyId, o.date, o.available ? 1 : 0, o.max_moves ?? null]);
        }
      }
    }

    // Delete override (revert to default)
    if (body.deleteDate) {
      await run('DELETE FROM availability_overrides WHERE company_id = ? AND date = ?', [p.companyId, body.deleteDate]);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
