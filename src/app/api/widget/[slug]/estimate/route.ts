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
    if (ru) {
      eh = Number(ru.min_hours);
      ep = Number(ru.base_price) + (body.distanceMiles || 0) * (Number(st?.mileage_rate) || 2.5);
      cs = Number(ru.crew_size);
    } else {
      eh = Math.max(Number(st?.min_hours) || 2, (body.bedrooms || 2) + 1);
      ep = (Number(st?.base_rate_per_hour) || 150) * eh;
      cs = body.bedrooms >= 3 ? 3 : 2;
    }

    // Factor in square footage and fullness
    if (body.sqft) {
      const sqftFactor = body.sqft / 1500;
      eh = Math.max(eh, Math.round(eh * sqftFactor * 10) / 10);
    }
    if (body.fullness) {
      const fullnessFactor = body.fullness;
      eh = Math.round(eh * fullnessFactor * 10) / 10;
      ep = Math.round(ep * fullnessFactor);
    }

    let hourlyRate = Number(ru?.hourly_rate || st?.base_rate_per_hour || 150);
    let originalHourlyRate = hourlyRate;
    let discountAmount = 0;
    let couponApplied = false;
    let couponDescription = '';

    // Apply coupon if provided
    if (body.couponCode) {
      const coupon = await queryOne(
        'SELECT * FROM coupons WHERE company_id = ? AND code = ? COLLATE NOCASE AND active = 1',
        [co.id, body.couponCode.trim().toUpperCase()]
      );
      if (coupon) {
        // Validate
        let valid = true;
        if (coupon.expiration_date && new Date(String(coupon.expiration_date)) < new Date()) valid = false;
        if (coupon.max_uses != null && Number(coupon.times_used) >= Number(coupon.max_uses)) valid = false;
        if (coupon.min_bedrooms != null && body.bedrooms != null && Number(body.bedrooms) < Number(coupon.min_bedrooms)) valid = false;

        if (valid) {
          if (coupon.discount_type === 'percent') {
            discountAmount = hourlyRate * (Number(coupon.discount_value) / 100);
            hourlyRate = hourlyRate - discountAmount;
            couponDescription = `${coupon.discount_value}% off`;
          } else {
            discountAmount = Number(coupon.discount_value);
            hourlyRate = Math.max(0, hourlyRate - discountAmount);
            couponDescription = `$${coupon.discount_value} off/hr`;
          }
          couponApplied = true;
        }
      }
    }

    ep = Math.max(ep, Math.round(hourlyRate * eh));

    // Deposit calculation - supports flat, percent, and hourly
    let da: number;
    const depositType = st?.deposit_type || 'flat';
    const depositAmount = Number(st?.deposit_amount) || 100;

    if (depositType === 'percent') {
      da = ep * (depositAmount / 100);
    } else if (depositType === 'hourly') {
      da = depositAmount * hourlyRate;
    } else {
      // flat
      da = depositAmount;
    }

    const result: any = {
      estimatedHours: eh,
      estimatedPrice: Math.round(ep),
      crewSize: cs,
      depositAmount: Math.round(da),
      hourlyRate: Math.round(hourlyRate),
    };

    if (couponApplied) {
      result.couponApplied = true;
      result.originalHourlyRate = Math.round(originalHourlyRate);
      result.discountAmount = Math.round(discountAmount);
      result.couponDescription = couponDescription;
    }

    return corsResponse(result);
  } catch (e: any) {
    return corsResponse({ error: e.message }, 500);
  }
}
