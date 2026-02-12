import { NextRequest } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { corsResponse, corsOptions } from '@/lib/cors';
export async function OPTIONS() { return corsOptions(); }
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    initDb(); const db = getDb();
    const co = db.prepare('SELECT id FROM companies WHERE slug = ?').get(params.slug) as any;
    if (!co) return corsResponse({ error: 'Not found' }, 404);
    const body = await req.json();
    const st = db.prepare('SELECT * FROM company_settings WHERE company_id = ?').get(co.id) as any;
    const ru = db.prepare('SELECT * FROM pricing_rules WHERE company_id = ? AND bedrooms = ? LIMIT 1').get(co.id, body.bedrooms || 2) as any;
    let eh: number, ep: number, cs: number;
    if (ru) { eh = ru.min_hours; ep = ru.base_price + (body.distanceMiles||0)*(st?.mileage_rate||2.5); cs = ru.crew_size; }
    else { eh = Math.max(st?.min_hours||2,(body.bedrooms||2)+1); ep = (st?.base_rate_per_hour||150)*eh; cs = body.bedrooms>=3?3:2; }
    const da = st?.deposit_type==='percent' ? ep*(st.deposit_amount/100) : (st?.deposit_amount||100);
    return corsResponse({ estimatedHours: eh, estimatedPrice: Math.round(ep), crewSize: cs, depositAmount: Math.round(da), hourlyRate: ru?.hourly_rate||st?.base_rate_per_hour||150 });
  } catch (e: any) { return corsResponse({ error: e.message }, 500); }
}
