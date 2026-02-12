import { NextRequest } from 'next/server';
import { initDb, queryOne, run } from '@/lib/db';
import { corsResponse, corsOptions } from '@/lib/cors';
export async function OPTIONS() { return corsOptions(); }
export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { bookingRef } = await req.json();
    const b = await queryOne('SELECT 1 FROM bookings WHERE booking_ref = ?', [bookingRef]);
    if (!b) return corsResponse({ error: 'Not found' }, 404);
    await run("UPDATE bookings SET status = 'confirmed', deposit_paid = 1 WHERE booking_ref = ?", [bookingRef]);
    return corsResponse({ success: true, bookingRef });
  } catch (e: any) { return corsResponse({ error: e.message }, 500); }
}
