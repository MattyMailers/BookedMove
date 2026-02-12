import { NextRequest } from 'next/server';
import { initDb, queryOne } from '@/lib/db';
import { corsResponse, corsOptions } from '@/lib/cors';
export async function OPTIONS() { return corsOptions(); }
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await initDb();
    const co = await queryOne('SELECT id FROM companies WHERE slug = ?', [params.slug]);
    if (!co) return corsResponse({ error: 'Not found' }, 404);
    const body = await req.json();
    const st = await queryOne('SELECT * FROM company_settings WHERE company_id = ?', [co.id]);
    const ru = await queryOne('SELECT * FROM pricing_rules WHERE company_id = ? AND bedrooms = ? LIMIT 1', [co.id, body.bedrooms || 2]);
    let eh: number, ep: number, cs: number;
    if (ru) { eh = Number(ru.min_hours); ep = Number(ru.base_price) + (body.distanceMiles||0)*(Number(st?.mileage_rate)||2.5); cs = Number(ru.crew_size); }
    else { eh = Math.max(Number(st?.min_hours)||2,(body.bedrooms||2)+1); ep = (Number(st?.base_rate_per_hour)||150)*eh; cs = body.bedrooms>=3?3:2; }
    const da = st?.deposit_type==='percent' ? ep*(Number(st.deposit_amount)/100) : (Number(st?.deposit_amount)||100);
    return corsResponse({ estimatedHours: eh, estimatedPrice: Math.round(ep), crewSize: cs, depositAmount: Math.round(da), hourlyRate: Number(ru?.hourly_rate||st?.base_rate_per_hour||150) });
  } catch (e: any) { return corsResponse({ error: e.message }, 500); }
}
