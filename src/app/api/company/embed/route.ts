import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryOne } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req); await initDb();
    const co = await queryOne('SELECT slug FROM companies WHERE id = ?', [p.companyId]);
    const u = process.env.NEXT_PUBLIC_APP_URL || 'https://bookedmove.com';
    const s = co?.slug;
    return NextResponse.json({ iframe: '<iframe src="'+u+'/widget/'+s+'" style="width:100%;min-height:700px;border:none;" allow="payment"></iframe>', script: '<script src="'+u+'/embed/'+s+'.js" async></script><div id="bookedmove-widget"></div>', directUrl: u+'/widget/'+s });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}
