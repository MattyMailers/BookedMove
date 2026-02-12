import { NextResponse } from 'next/server';
import { initDb, queryAll } from '@/lib/db';
import { seedDb } from '@/lib/seed';

export async function GET() {
  try {
    await seedDb();
    const tables = await queryAll("SELECT name FROM sqlite_master WHERE type='table'");
    const companies = await queryAll("SELECT id, name, slug FROM companies");
    return NextResponse.json({ tables: tables.map((t: any) => t.name), companies });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.substring(0, 500) }, { status: 500 });
  }
}
