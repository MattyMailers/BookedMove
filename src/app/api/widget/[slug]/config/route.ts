import { NextRequest } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { corsResponse, corsOptions } from '@/lib/cors';
import { seedDb } from '@/lib/seed';
export async function OPTIONS() { return corsOptions(); }
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    initDb(); seedDb(); const db = getDb();
    const co = db.prepare('SELECT c.*, cs.base_rate_per_hour, cs.min_hours, cs.deposit_type, cs.deposit_amount, cs.mileage_rate, cs.google_maps_key FROM companies c LEFT JOIN company_settings cs ON cs.company_id = c.id WHERE c.slug = ?').get(params.slug) as any;
    if (!co) return corsResponse({ error: 'Not found' }, 404);
    const pr = db.prepare('SELECT move_size, bedrooms, base_price, hourly_rate, min_hours, crew_size FROM pricing_rules WHERE company_id = ?').all(co.id);
    return corsResponse({ company: { name: co.name, slug: co.slug, logoUrl: co.logo_url, primaryColor: co.primary_color, accentColor: co.accent_color }, settings: { baseRatePerHour: co.base_rate_per_hour, minHours: co.min_hours, depositType: co.deposit_type, depositAmount: co.deposit_amount, mileageRate: co.mileage_rate, googleMapsKey: co.google_maps_key || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY }, pricingRules: pr });
  } catch (e: any) { return corsResponse({ error: e.message }, 500); }
}
