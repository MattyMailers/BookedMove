import { NextRequest, NextResponse } from 'next/server';
import { initDb, run } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    await run('UPDATE company_settings SET onboarding_completed = 1 WHERE company_id = ?', [p.companyId]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
