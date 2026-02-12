import { NextRequest } from 'next/server';
import { initDb, queryOne, queryAll } from '@/lib/db';
import { corsResponse, corsOptions } from '@/lib/cors';
import { seedDb } from '@/lib/seed';

export async function OPTIONS() { return corsOptions(); }

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await seedDb();
    const co = await queryOne(
      'SELECT c.*, cs.base_rate_per_hour, cs.min_hours, cs.deposit_type, cs.deposit_amount, cs.mileage_rate, cs.form_config, cs.payment_enabled, cs.payment_mode, cs.payment_timing, cs.custom_css, cs.authorize_net_login_id FROM companies c LEFT JOIN company_settings cs ON cs.company_id = c.id WHERE c.slug = ?',
      [params.slug]
    );
    if (!co) return corsResponse({ error: 'Not found' }, 404);
    const pr = await queryAll('SELECT move_size, bedrooms, base_price, hourly_rate, min_hours, crew_size FROM pricing_rules WHERE company_id = ?', [co.id]);
    let formConfig = {};
    try { formConfig = JSON.parse(String(co.form_config || '{}')); } catch {}
    return corsResponse({
      company: {
        name: co.name, slug: co.slug, logoUrl: co.logo_url,
        primaryColor: co.primary_color, accentColor: co.accent_color,
      },
      settings: {
        baseRatePerHour: co.base_rate_per_hour, minHours: co.min_hours,
        depositType: co.deposit_type, depositAmount: co.deposit_amount,
        mileageRate: co.mileage_rate,
      },
      formConfig,
      pricingRules: pr,
      payment: co.payment_enabled ? {
        enabled: true,
        mode: co.payment_mode || 'deposit',
        timing: co.payment_timing || 'at_booking',
        // Send client key (API Login ID) for Accept.js — NOT the transaction key
        clientKey: co.authorize_net_login_id ? (() => { try { const { decrypt } = require('@/lib/encryption'); return decrypt(String(co.authorize_net_login_id)); } catch { return null; } })() : null,
      } : { enabled: false },
      customCss: co.custom_css || null,
    });
  } catch (e: any) {
    return corsResponse({ error: e.message }, 500);
  }
}
