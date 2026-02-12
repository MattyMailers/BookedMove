import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryAll, run } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    const coupons = await queryAll('SELECT * FROM coupons WHERE company_id = ? ORDER BY created_at DESC', [p.companyId]);
    return NextResponse.json({ coupons });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    const b = await req.json();
    if (!b.code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

    await run(
      'INSERT INTO coupons (company_id, code, discount_type, discount_value, min_bedrooms, expiration_date, max_uses) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [p.companyId, b.code.trim().toUpperCase(), b.discount_type || 'percent', b.discount_value || 0, b.min_bedrooms ?? null, b.expiration_date || null, b.max_uses ?? null]
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
