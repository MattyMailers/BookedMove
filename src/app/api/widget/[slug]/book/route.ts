import { NextRequest } from 'next/server';
import { initDb, queryOne, run } from '@/lib/db';
import { corsResponse, corsOptions } from '@/lib/cors';
import { nanoid } from 'nanoid';
export async function OPTIONS() { return corsOptions(); }
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await initDb();
    const co = await queryOne('SELECT id FROM companies WHERE slug = ?', [params.slug]);
    if (!co) return corsResponse({ error: 'Not found' }, 404);
    const b = await req.json();
    const ref = 'BM-' + nanoid(8).toUpperCase();
    await run('INSERT INTO bookings (company_id, booking_ref, status, customer_name, customer_email, customer_phone, origin_address, destination_address, move_date, time_slot, home_size, bedrooms, estimated_hours, estimated_price, deposit_amount, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [co.id, ref, 'pending', b.customerName, b.customerEmail, b.customerPhone||'', b.originAddress, b.destinationAddress, b.moveDate, b.timeSlot||'', b.homeSize||'', b.bedrooms||0, b.estimatedHours||0, b.estimatedPrice||0, b.depositAmount||0, b.notes||'']);
    return corsResponse({ bookingRef: ref, clientSecret: null });
  } catch (e: any) { return corsResponse({ error: e.message }, 500); }
}
