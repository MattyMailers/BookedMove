import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryOne, run } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req); await initDb();
    return NextResponse.json({ company: await queryOne('SELECT * FROM companies WHERE id = ?', [p.companyId]), settings: await queryOne('SELECT * FROM company_settings WHERE company_id = ?', [p.companyId]) });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
export async function PUT(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req); await initDb(); const body = await req.json();
    if (body.company) { const c = body.company; await run('UPDATE companies SET name=?, primary_color=?, accent_color=?, logo_url=? WHERE id=?', [c.name, c.primary_color, c.accent_color, c.logo_url||null, p.companyId]); }
    if (body.settings) { const s = body.settings; await run('UPDATE company_settings SET base_rate_per_hour=?, min_hours=?, deposit_type=?, deposit_amount=?, mileage_rate=? WHERE company_id=?', [s.base_rate_per_hour, s.min_hours, s.deposit_type, s.deposit_amount, s.mileage_rate, p.companyId]); }
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
