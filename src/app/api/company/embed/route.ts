import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req); initDb();
    const co = getDb().prepare('SELECT slug FROM companies WHERE id = ?').get(p.companyId) as any;
    const u = process.env.NEXT_PUBLIC_APP_URL || 'https://bookedmove.com';
    return NextResponse.json({ iframe: '<iframe src="'+u+'/widget/'+co.slug+'" style="width:100%;min-height:700px;border:none;" allow="payment"></iframe>', script: '<script src="'+u+'/embed/'+co.slug+'.js" async></script><div id="bookedmove-widget"></div>', directUrl: u+'/widget/'+co.slug });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
