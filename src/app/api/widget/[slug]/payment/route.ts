import { NextRequest } from 'next/server';
import { initDb, queryOne, run } from '@/lib/db';
import { corsResponse, corsOptions } from '@/lib/cors';
import { chargePayment } from '@/lib/authorize-net';
import { sendEmail } from '@/lib/email';
import { paymentReceiptEmail } from '@/lib/email-templates';

export async function OPTIONS() { return corsOptions(); }

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await initDb();
    const company = await queryOne('SELECT c.*, cs.authorize_net_login_id, cs.authorize_net_transaction_key, cs.payment_enabled, cs.payment_mode FROM companies c JOIN company_settings cs ON cs.company_id = c.id WHERE c.slug = ?', [params.slug]);
    if (!company) return corsResponse({ error: 'Not found' }, 404);
    if (!company.payment_enabled) return corsResponse({ error: 'Payments not enabled' }, 400);

    const { bookingRef, opaqueDataDescriptor, opaqueDataValue } = await req.json();
    if (!bookingRef || !opaqueDataDescriptor || !opaqueDataValue) {
      return corsResponse({ error: 'Missing payment data' }, 400);
    }

    const booking = await queryOne('SELECT * FROM bookings WHERE booking_ref = ? AND company_id = ?', [bookingRef, company.id]);
    if (!booking) return corsResponse({ error: 'Booking not found' }, 404);

    const amount = company.payment_mode === 'full'
      ? Number(booking.estimated_price || 0)
      : Number(booking.deposit_amount || 0);

    if (amount <= 0) return corsResponse({ error: 'Invalid payment amount' }, 400);

    const result = await chargePayment({
      loginId: String(company.authorize_net_login_id),
      transactionKey: String(company.authorize_net_transaction_key),
      opaqueDataDescriptor,
      opaqueDataValue,
      amount,
      bookingRef,
      customerEmail: String(booking.customer_email),
    });

    if (!result.success) {
      return corsResponse({ error: result.error || 'Payment failed' }, 400);
    }

    await run('UPDATE bookings SET payment_status = ?, payment_amount = ?, transaction_id = ?, deposit_paid = 1 WHERE booking_ref = ?',
      ['paid', amount, result.transactionId, bookingRef]);

    // Send receipt email
    const brand = { name: String(company.name), logoUrl: company.logo_url as string | undefined, primaryColor: company.primary_color as string | undefined, accentColor: company.accent_color as string | undefined };
    const receipt = paymentReceiptEmail(brand, booking, amount, result.transactionId || '');
    await sendEmail({ to: String(booking.customer_email), ...receipt, companyId: Number(company.id), bookingId: Number(booking.id), emailType: 'payment_receipt' });

    return corsResponse({ success: true, transactionId: result.transactionId, amount });
  } catch (e: any) {
    return corsResponse({ error: e.message }, 500);
  }
}
