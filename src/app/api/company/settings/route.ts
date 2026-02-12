import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryOne, run } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';
import { encrypt, decrypt, maskKey } from '@/lib/encryption';

export async function GET(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    const company = await queryOne('SELECT * FROM companies WHERE id = ?', [p.companyId]);
    const settings = await queryOne('SELECT * FROM company_settings WHERE company_id = ?', [p.companyId]);
    // Mask sensitive keys
    if (settings) {
      const s = settings as any;
      if (s.google_maps_key) { try { s.google_maps_key_masked = maskKey(decrypt(String(s.google_maps_key))); } catch { s.google_maps_key_masked = maskKey(String(s.google_maps_key)); } s.google_maps_key_set = true; }
      if (s.smartmoving_api_key) { try { s.smartmoving_api_key_masked = maskKey(decrypt(String(s.smartmoving_api_key))); } catch { s.smartmoving_api_key_masked = maskKey(String(s.smartmoving_api_key)); } s.smartmoving_api_key_set = true; }
    }
    return NextResponse.json({ company, settings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();
    const body = await req.json();
    if (body.company) {
      const c = body.company;
      await run('UPDATE companies SET name=?, primary_color=?, accent_color=?, logo_url=? WHERE id=?',
        [c.name, c.primary_color, c.accent_color, c.logo_url || null, p.companyId]);
    }
    if (body.settings) {
      const s = body.settings;
      // Encrypt sensitive keys before storage
      let gmKey = s.google_maps_key;
      if (gmKey && !gmKey.startsWith('****')) { try { gmKey = encrypt(gmKey); } catch {} }
      else if (gmKey?.startsWith('****')) gmKey = undefined; // don't overwrite with masked value

      let smKey = s.smartmoving_api_key;
      if (smKey && !smKey.startsWith('****')) { try { smKey = encrypt(smKey); } catch {} }
      else if (smKey?.startsWith('****')) smKey = undefined;

      const sets: string[] = [];
      const args: any[] = [];
      const add = (col: string, val: any) => { if (val !== undefined) { sets.push(`${col} = ?`); args.push(val); } };
      add('base_rate_per_hour', s.base_rate_per_hour);
      add('min_hours', s.min_hours);
      add('deposit_type', s.deposit_type);
      add('deposit_amount', s.deposit_amount);
      add('mileage_rate', s.mileage_rate);
      add('service_areas', s.service_areas);
      add('smartmoving_client_id', s.smartmoving_client_id);
      add('stripe_connect_account_id', s.stripe_connect_account_id);
      if (gmKey !== undefined) add('google_maps_key', gmKey);
      if (smKey !== undefined) add('smartmoving_api_key', smKey);

      if (sets.length > 0) {
        args.push(p.companyId);
        await run(`UPDATE company_settings SET ${sets.join(', ')} WHERE company_id = ?`, args);
      }
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
