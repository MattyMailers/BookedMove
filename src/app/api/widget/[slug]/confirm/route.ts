import { NextRequest } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { corsResponse, corsOptions } from '@/lib/cors';
export async function OPTIONS() { return corsOptions(); }
export async function POST(req: NextRequest) {
  try {
    initDb(); const db = getDb();
    const { bookingRef } = await req.json();
    if (!db.prepare('SELECT 1 FROM bookings WHERE booking_ref = ?').get(bookingRef)) return corsResponse({ error: 'Not found' }, 404);
    db.prepare("UPDATE bookings SET status = 'confirmed', deposit_paid = 1 WHERE booking_ref = ?").run(bookingRef);
    return corsResponse({ success: true, bookingRef });
  } catch (e: any) { return corsResponse({ error: e.message }, 500); }
}
