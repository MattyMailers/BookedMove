import { NextRequest } from 'next/server';
import { initDb, queryOne } from '@/lib/db';
import { corsResponse, corsOptions } from '@/lib/cors';

export async function OPTIONS() { return corsOptions(); }

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await initDb();
    const co = await queryOne('SELECT id FROM companies WHERE slug = ?', [params.slug]);
    if (!co) return corsResponse({ error: 'Not found' }, 404);

    const { code, bedrooms } = await req.json();
    if (!code) return corsResponse({ error: 'Code required' }, 400);

    const coupon = await queryOne(
      'SELECT * FROM coupons WHERE company_id = ? AND code = ? COLLATE NOCASE AND active = 1',
      [co.id, code.trim().toUpperCase()]
    );

    if (!coupon) return corsResponse({ error: 'Invalid promo code' }, 400);

    // Check expiration
    if (coupon.expiration_date) {
      const exp = new Date(String(coupon.expiration_date));
      if (exp < new Date()) return corsResponse({ error: 'This promo code has expired' }, 400);
    }

    // Check max uses
    if (coupon.max_uses != null && Number(coupon.times_used) >= Number(coupon.max_uses)) {
      return corsResponse({ error: 'This promo code has reached its usage limit' }, 400);
    }

    // Check min bedrooms
    if (coupon.min_bedrooms != null && bedrooms != null && Number(bedrooms) < Number(coupon.min_bedrooms)) {
      return corsResponse({ error: `This promo code requires at least ${coupon.min_bedrooms} bedrooms` }, 400);
    }

    return corsResponse({
      valid: true,
      code: String(coupon.code),
      discountType: String(coupon.discount_type),
      discountValue: Number(coupon.discount_value),
      description: coupon.discount_type === 'percent'
        ? `${coupon.discount_value}% off hourly rate`
        : `$${coupon.discount_value} off per hour`,
    });
  } catch (e: any) {
    return corsResponse({ error: e.message }, 500);
  }
}
