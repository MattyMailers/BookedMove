import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client/http';

export async function GET() {
  const dbUrl = process.env.TURSO_DATABASE_URL || '';
  const token = process.env.TURSO_AUTH_TOKEN || '';
  try {
    const client = createClient({ url: dbUrl, authToken: token });
    const result = await client.execute('SELECT 1 as test');
    return NextResponse.json({ success: true, rows: result.rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, dbUrl: dbUrl.substring(0,50) }, { status: 500 });
  }
}
