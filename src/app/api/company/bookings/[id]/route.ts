import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryOne, run } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { bookingStatusEmail } from '@/lib/email-templates';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    const booking = await queryOne('SELECT * FROM bookings WHERE id = ? AND company_id = ?', [params.id, p.companyId]);
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ booking });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    const { status, notes } = await req.json();
    const sets: string[] = [];
    const args: any[] = [];
    if (status) { sets.push('status = ?'); args.push(status); }
    if (notes !== undefined) { sets.push('notes = ?'); args.push(notes); }
    if (sets.length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    args.push(params.id, p.companyId);
    await run(`UPDATE bookings SET ${sets.join(', ')} WHERE id = ? AND company_id = ?`, args);

    // Send status update email if status changed
    if (status && ['confirmed', 'cancelled', 'completed'].includes(status)) {
      const booking = await queryOne('SELECT * FROM bookings WHERE id = ? AND company_id = ?', [params.id, p.companyId]);
      const company = await queryOne('SELECT * FROM companies WHERE id = ?', [p.companyId]);
      if (booking && company && booking.customer_email) {
        const brand = { name: String(company.name), logoUrl: company.logo_url as string | undefined, primaryColor: company.primary_color as string | undefined, accentColor: company.accent_color as string | undefined };
        const tmpl = bookingStatusEmail(brand, booking, status);
        sendEmail({ to: String(booking.customer_email), ...tmpl, companyId: Number(p.companyId), bookingId: Number(params.id), emailType: 'booking_status_update' }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
