import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryOne, run } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';

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
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
