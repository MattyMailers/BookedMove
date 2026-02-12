import { NextRequest } from 'next/server';
import { initDb, queryOne, run } from '@/lib/db';
import { corsResponse, corsOptions } from '@/lib/cors';

export async function OPTIONS() { return corsOptions(); }

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await initDb();
    const co = await queryOne('SELECT id FROM companies WHERE slug = ?', [params.slug]);
    if (!co) return corsResponse({ error: 'Not found' }, 404);
    const { eventType, step, sessionId, metadata } = await req.json();
    await run('INSERT INTO widget_events (company_id, event_type, step, session_id, metadata) VALUES (?,?,?,?,?)',
      [co.id, eventType, step || null, sessionId || null, metadata ? JSON.stringify(metadata) : null]);
    return corsResponse({ success: true });
  } catch (e: any) {
    return corsResponse({ error: e.message }, 500);
  }
}
