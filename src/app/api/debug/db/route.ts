import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.TURSO_DATABASE_URL || '';
  const token = process.env.TURSO_AUTH_TOKEN || '';
  try {
    // Manually use hrana-client HTTP transport
    const resp = await fetch(`${dbUrl}/v2/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          { type: 'execute', stmt: { sql: 'SELECT 1 as test' } },
          { type: 'close' }
        ]
      }),
    });
    const data = await resp.json();
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
