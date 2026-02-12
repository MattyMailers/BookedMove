'use client';
import BookingWidget from '@/components/widget/BookingWidget';
import { useParams } from 'next/navigation';

export default function WidgetPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 pt-8">
      <BookingWidget slug={slug} />
    </div>
  );
}
