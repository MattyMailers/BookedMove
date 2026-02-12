import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req); initDb(); const db = getDb();
    return NextResponse.json({ company: db.prepare('SELECT * FROM companies WHERE id = ?').get(p.companyId), settings: db.prepare('SELECT * FROM company_settings WHERE company_id = ?').get(p.companyId) });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
export async function PUT(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req); initDb(); const db = getDb(); const body = await req.json();
    if (body.company) { const c = body.company; db.prepare('UPDATE companies SET name=?, primary_color=?, accent_color=?, logo_url=? WHERE id=?').run(c.name, c.primary_color, c.accent_color, c.logo_url||null, p.companyId); }
    if (body.settings) { const s = body.settings; db.prepare('UPDATE company_settings SET base_rate_per_hour=?, min_hours=?, deposit_type=?, deposit_amount=?, mileage_rate=? WHERE company_id=?').run(s.base_rate_per_hour, s.min_hours, s.deposit_type, s.deposit_amount, s.mileage_rate, p.companyId); }
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
