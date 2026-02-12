import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.TURSO_DATABASE_URL || '';
  
  // Simulate what encodeBaseUrl does
  const scheme = 'https';
  const host = 'bookedmove-mattymailers.aws-us-east-1.turso.io';
  const constructed = `${scheme}://${encodeURI(host)}`;
  
  try {
    const u = new URL(constructed);
    return NextResponse.json({ success: true, constructed, parsed: u.href });
  } catch (e: any) {
    // Try the env var directly
    try {
      const u2 = new URL(dbUrl);
      return NextResponse.json({ directWorks: true, constructed, constructedFails: e.message, direct: u2.href });
    } catch (e2: any) {
      return NextResponse.json({ constructedFails: e.message, directFails: e2.message, constructed, dbUrl: dbUrl.substring(0,50) });
    }
  }
}
