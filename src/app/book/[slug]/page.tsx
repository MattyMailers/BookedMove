import { Metadata } from 'next';
import { initDb } from '@/lib/seed';
import { queryOne } from '@/lib/db';
import BookingWidget from '@/components/widget/BookingWidget';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    await initDb();
    const co = await queryOne('SELECT name, slug FROM companies WHERE slug = ?', [params.slug]);
    return {
      title: co ? `Book Your Move - ${co.name}` : 'Book Your Move',
      description: co ? `Book your move online with ${co.name}. Get an instant estimate and secure your date.` : 'Book your move online.',
    };
  } catch {
    return { title: 'Book Your Move' };
  }
}

export default async function StandaloneBookingPage({ params }: Props) {
  let company: any = null;
  try {
    await initDb();
    company = await queryOne('SELECT name, slug, logo_url, primary_color, accent_color FROM companies WHERE slug = ?', [params.slug]);
  } catch {}

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h1>
          <p className="text-gray-500">This booking page doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const pc = company.primary_color || '#2563eb';
  const ac = company.accent_color || '#1e40af';

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${pc}08, ${ac}08, #f9fafb)` }}>
      {/* Branded Header */}
      <div className="w-full py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-3">
          {company.logo_url && (
            <img src={company.logo_url} alt={company.name} className="h-10 w-10 rounded-xl object-cover" />
          )}
          <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
        </div>
      </div>

      {/* Widget */}
      <div className="px-4 pb-12">
        <BookingWidget slug={params.slug} />
      </div>
    </div>
  );
}
