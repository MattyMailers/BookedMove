import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
    const token = process.env.TURSO_AUTH_TOKEN;
    
    // Try raw URL parse first
    try { new URL(url); } catch(e: any) { return NextResponse.json({ step: 'url_parse', url: url.substring(0, 40), error: e.message }); }
    
    // Try creating client
    const { createClient } = await import('@libsql/client');
    const client = createClient({ url, authToken: token });
    const result = await client.execute('SELECT 1 as test');
    return NextResponse.json({ success: true, result: result.rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.substring(0, 800) }, { status: 500 });
  }
}
