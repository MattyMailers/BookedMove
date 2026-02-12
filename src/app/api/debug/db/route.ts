import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export async function GET() {
  try {
    const url = process.env.TURSO_DATABASE_URL || '';
    const token = process.env.TURSO_AUTH_TOKEN || '';
    
    const client = createClient({ url, authToken: token });
    const result = await client.execute('SELECT 1 as test');
    
    return NextResponse.json({ 
      success: true,
      nodeVersion: process.version,
      rows: result.rows,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, nodeVersion: process.version, url: (process.env.TURSO_DATABASE_URL||'').substring(0,50) }, { status: 500 });
  }
}
