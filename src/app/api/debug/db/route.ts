import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = process.env.TURSO_DATABASE_URL || '';
    const token = process.env.TURSO_AUTH_TOKEN || '';
    
    // Skip libsql entirely, test raw fetch to Turso HTTP API
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        statements: ['SELECT 1 as test']
      }),
    });
    const data = await resp.text();
    
    return NextResponse.json({ 
      inputUrl: url.substring(0, 50),
      nodeVersion: process.version,
      fetchStatus: resp.status,
      fetchBody: data.substring(0, 200),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
