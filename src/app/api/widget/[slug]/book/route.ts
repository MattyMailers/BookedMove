import { NextRequest } from 'next/server';
import { initDb, queryOne, queryAll, run } from '@/lib/db';
import { corsResponse, corsOptions } from '@/lib/cors';
import { nanoid } from 'nanoid';
import { sendEmail } from '@/lib/email';
import { bookingConfirmationEmail, bookingAlertEmail } from '@/lib/email-templates';

export async function OPTIONS() { return corsOptions(); }
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await initDb();
    const co = await queryOne('SELECT * FROM companies WHERE slug = ?', [params.slug]);
    if (!co) return corsResponse({ error: 'Not found' }, 404);
    const b = await req.json();
    const ref = 'BM-' + nanoid(8).toUpperCase();
    const result = await run('INSERT INTO bookings (company_id, booking_ref, status, customer_name, customer_email, customer_phone, origin_address, destination_address, move_date, time_slot, home_size, bedrooms, estimated_hours, estimated_price, deposit_amount, notes, coupon_code, discount_amount, time_window) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [co.id, ref, 'pending', b.customerName, b.customerEmail, b.customerPhone||'', b.originAddress, b.destinationAddress, b.moveDate, b.timeSlot||'', b.homeSize||'', b.bedrooms||0, b.estimatedHours||0, b.estimatedPrice||0, b.depositAmount||0, b.notes||'', b.couponCode||null, b.discountAmount||null, b.timeWindow||null]);

    // Increment coupon usage if used
    if (b.couponCode) {
      try {
        await run('UPDATE coupons SET times_used = times_used + 1 WHERE company_id = ? AND code = ? COLLATE NOCASE', [co.id, b.couponCode.trim().toUpperCase()]);
      } catch {}
    }

    // Send notification emails (non-blocking)
    const brand = { name: String(co.name), logoUrl: co.logo_url as string | undefined, primaryColor: co.primary_color as string | undefined, accentColor: co.accent_color as string | undefined };
    const booking = { booking_ref: ref, customer_name: b.customerName, customer_email: b.customerEmail, customer_phone: b.customerPhone, origin_address: b.originAddress, destination_address: b.destinationAddress, move_date: b.moveDate, time_slot: b.timeSlot, estimated_price: b.estimatedPrice, deposit_amount: b.depositAmount, notes: b.notes };
    const bookingId = Number(result.lastInsertRowid);

    // Customer confirmation
    const conf = bookingConfirmationEmail(brand, booking);
    sendEmail({ to: b.customerEmail, ...conf, companyId: Number(co.id), bookingId, emailType: 'booking_confirmation' }).catch(() => {});

    // Alert company admins
    const admins = await queryAll('SELECT email FROM company_users WHERE company_id = ? AND role IN (?, ?)', [co.id, 'owner', 'admin']);
    const alert = bookingAlertEmail(brand, booking);
    for (const admin of admins) {
      sendEmail({ to: String(admin.email), ...alert, companyId: Number(co.id), bookingId, emailType: 'booking_alert' }).catch(() => {});
    }

    return corsResponse({ bookingRef: ref, clientSecret: null });
  } catch (e: any) { return corsResponse({ error: e.message }, 500); }
}
