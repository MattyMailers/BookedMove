import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryAll } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    const bookings = await queryAll('SELECT * FROM bookings WHERE company_id = ? ORDER BY created_at DESC', [p.companyId]);
    const headers = ['booking_ref', 'status', 'customer_name', 'customer_email', 'customer_phone', 'origin_address', 'destination_address', 'move_date', 'time_slot', 'home_size', 'estimated_price', 'deposit_amount', 'notes', 'created_at'];
    const csv = [headers.join(','), ...bookings.map(b => headers.map(h => `"${String((b as any)[h] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=bookings.csv' },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
