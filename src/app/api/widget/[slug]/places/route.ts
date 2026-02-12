import { NextRequest } from 'next/server';
import { initDb, queryOne } from '@/lib/db';
import { corsResponse, corsOptions } from '@/lib/cors';
import { decrypt } from '@/lib/encryption';

export async function OPTIONS() { return corsOptions(); }

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await initDb();
    const co = await queryOne('SELECT id FROM companies WHERE slug = ?', [params.slug]);
    if (!co) return corsResponse({ error: 'Not found' }, 404);
    const cs = await queryOne('SELECT google_maps_key FROM company_settings WHERE company_id = ?', [co.id]);
    let apiKey = cs?.google_maps_key ? String(cs.google_maps_key) : process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return corsResponse({ error: 'Places not configured' }, 400);
    // Try decrypting (may be stored encrypted)
    try { apiKey = decrypt(apiKey); } catch {}
    const input = req.nextUrl.searchParams.get('input');
    if (!input) return corsResponse({ error: 'input required' }, 400);
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&key=${apiKey}`);
    const data = await res.json();
    return corsResponse({ predictions: data.predictions?.map((p: any) => ({ description: p.description, place_id: p.place_id })) || [] });
  } catch (e: any) {
    return corsResponse({ error: e.message }, 500);
  }
}
