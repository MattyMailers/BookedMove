import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryAll, run } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  try { const p = requireCompanyAuth(req); await initDb(); return NextResponse.json({ rules: await queryAll('SELECT * FROM pricing_rules WHERE company_id = ? ORDER BY bedrooms', [p.companyId]) }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
export async function PUT(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req); await initDb(); const { rules } = await req.json();
    await run('DELETE FROM pricing_rules WHERE company_id = ?', [p.companyId]);
    for (const r of rules) await run('INSERT INTO pricing_rules (company_id, move_size, bedrooms, base_price, hourly_rate, min_hours, crew_size) VALUES (?,?,?,?,?,?,?)', [p.companyId, r.move_size, r.bedrooms, r.base_price, r.hourly_rate, r.min_hours, r.crew_size]);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
