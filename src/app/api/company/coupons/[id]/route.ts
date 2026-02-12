import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryOne, run } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    const b = await req.json();

    // Verify ownership
    const coupon = await queryOne('SELECT id FROM coupons WHERE id = ? AND company_id = ?', [params.id, p.companyId]);
    if (!coupon) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const sets: string[] = [];
    const args: any[] = [];
    const add = (col: string, val: any) => { if (val !== undefined) { sets.push(`${col} = ?`); args.push(val); } };

    add('code', b.code ? b.code.trim().toUpperCase() : undefined);
    add('discount_type', b.discount_type);
    add('discount_value', b.discount_value);
    add('min_bedrooms', b.min_bedrooms);
    add('expiration_date', b.expiration_date);
    add('max_uses', b.max_uses);
    add('active', b.active !== undefined ? (b.active ? 1 : 0) : undefined);

    if (sets.length > 0) {
      args.push(params.id);
      await run(`UPDATE coupons SET ${sets.join(', ')} WHERE id = ?`, args);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    await run('UPDATE coupons SET active = 0 WHERE id = ? AND company_id = ?', [params.id, p.companyId]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
