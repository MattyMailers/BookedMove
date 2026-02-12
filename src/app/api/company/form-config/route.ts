import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryOne, run } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    const s = await queryOne('SELECT form_config FROM company_settings WHERE company_id = ?', [p.companyId]);
    return NextResponse.json({ formConfig: JSON.parse(String(s?.form_config || '{}')) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    const { formConfig } = await req.json();
    await run('UPDATE company_settings SET form_config = ? WHERE company_id = ?', [JSON.stringify(formConfig), p.companyId]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
