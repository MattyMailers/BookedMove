import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = process.env.TURSO_DATABASE_URL || '';
    
    // Test what encodeBaseUrl produces
    const { expandConfig } = await import('@libsql/core/config');
    const config = expandConfig({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    
    return NextResponse.json({ 
      inputUrl: url.substring(0, 50),
      scheme: config.scheme,
      authority: config.authority,
      path: config.path,
      tls: config.tls,
      nodeVersion: process.version,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.substring(0, 500) }, { status: 500 });
  }
}
