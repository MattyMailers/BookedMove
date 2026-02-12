import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    tursoUrlPrefix: (process.env.TURSO_DATABASE_URL || '').substring(0, 20),
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    hasEncKey: !!process.env.ENCRYPTION_KEY,
    nodeEnv: process.env.NODE_ENV,
  });
}
