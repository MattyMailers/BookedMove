import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  try { const p = requireCompanyAuth(req); initDb(); return NextResponse.json({ rules: getDb().prepare('SELECT * FROM pricing_rules WHERE company_id = ? ORDER BY bedrooms').all(p.companyId) }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
export async function PUT(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req); initDb(); const db = getDb(); const { rules } = await req.json();
    db.prepare('DELETE FROM pricing_rules WHERE company_id = ?').run(p.companyId);
    const i = db.prepare('INSERT INTO pricing_rules (company_id, move_size, bedrooms, base_price, hourly_rate, min_hours, crew_size) VALUES (?,?,?,?,?,?,?)');
    for (const r of rules) i.run(p.companyId, r.move_size, r.bedrooms, r.base_price, r.hourly_rate, r.min_hours, r.crew_size);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
