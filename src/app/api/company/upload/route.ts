import { NextRequest, NextResponse } from 'next/server';
import { initDb, run } from '@/lib/db';
import { requireCompanyAuth } from '@/lib/auth';

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const p = requireCompanyAuth(req);
    await initDb();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, SVG, or WebP.' }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large. Max 2MB.' }, { status: 400 });

    let url: string;

    // Try Vercel Blob first
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob');
        const blob = await put(`logos/${p.companyId}-${Date.now()}.${file.type.split('/')[1]}`, file, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        url = blob.url;
      } catch (e: any) {
        console.error('[Upload] Vercel Blob failed, falling back to base64:', e.message);
        url = await fileToDataUrl(file);
      }
    } else {
      // Dev fallback: base64 data URL
      url = await fileToDataUrl(file);
    }

    await run('UPDATE companies SET logo_url = ? WHERE id = ?', [url, p.companyId]);
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}
