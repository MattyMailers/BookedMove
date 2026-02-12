'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type Step = 'addresses' | 'date' | 'size' | 'estimate' | 'contact' | 'confirm';

interface Config {
  company: { name: string; slug: string; logo_url: string | null; primary_color: string; accent_color: string };
  settings: { deposit_type: string; deposit_amount: number };
  pricing_rules: any[];
}

interface Estimate {
  estimated_hours: number;
  hourly_rate: number;
  crew_size: number;
  estimated_price: number;
  deposit_amount: number;
}

export default function BookingWidget() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [step, setStep] = useState<Step>('addresses');
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  
  // Form state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [moveDate, setMoveDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('morning');
  const [homeSize, setHomeSize] = useState('');
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetch(`/api/widget/${slug}/config`)
      .then(r => r.json())
      .then(data => { setConfig(data); setLoading(false); })
      .catch(() => { setError('Failed to load'); setLoading(false); });
  }, [slug]);

  const getEstimate = async () => {
    const res = await fetch(`/api/widget/${slug}/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ home_size: homeSize }),
    });
    const data = await res.json();
    setEstimate(data);
    setStep('estimate');
  };

  const submitBooking = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/widget/${slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name, customer_email: email, customer_phone: phone,
          origin_address: origin, destination_address: destination,
          move_date: moveDate, time_slot: timeSlot, home_size: homeSize,
          estimated_hours: estimate?.estimated_hours, estimated_price: estimate?.estimated_price,
          deposit_amount: estimate?.deposit_amount, notes,
        }),
      });
      const data = await res.json();
      setBookingRef(data.booking_ref);
      setStep('confirm');
    } catch {
      setError('Failed to submit booking');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  if (error && !config) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  if (!config) return null;

  const pc = config.company.primary_color || '#2563eb';
  const steps: Step[] = ['addresses', 'date', 'size', 'estimate', 'contact', 'confirm'];
  const stepIndex = steps.indexOf(step);
  const stepLabels = ['Location', 'Date', 'Home Size', 'Estimate', 'Details', 'Confirmed'];

  const sizes = config.pricing_rules.map((r: any) => ({ value: r.move_size, label: r.move_size.replace('-', ' '), bedrooms: r.bedrooms }));

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 pt-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${pc}, ${config.company.accent_color || pc})` }}>
          <div className="flex items-center gap-3 mb-4">
            {config.company.logo_url && <img src={config.company.logo_url} className="h-10 w-10 rounded-lg bg-white/20 object-contain" alt="" />}
            <div>
              <h1 className="text-xl font-bold">{config.company.name}</h1>
              <p className="text-sm opacity-80">Book Your Move Online</p>
            </div>
          </div>
          {/* Progress */}
          <div className="flex gap-1">
            {steps.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1 rounded-full ${i <= stepIndex ? 'bg-white' : 'bg-white/30'}`} />
                <div className={`text-[10px] mt-1 ${i <= stepIndex ? 'text-white' : 'text-white/50'}`}>{stepLabels[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Step: Addresses */}
          {step === 'addresses' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Where are you moving?</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moving From</label>
                <input type="text" value={origin} onChange={e => setOrigin(e.target.value)}
                  placeholder="Enter pickup address" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moving To</label>
                <input type="text" value={destination} onChange={e => setDestination(e.target.value)}
                  placeholder="Enter delivery address" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <button onClick={() => setStep('date')} disabled={!origin || !destination}
                className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: pc }}>
                Continue →
              </button>
            </div>
          )}

          {/* Step: Date */}
          {step === 'date' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">When do you want to move?</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Move Date</label>
                <input type="date" value={moveDate} onChange={e => setMoveDate(e.target.value)} min={minDate}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {[['morning', '🌅 Morning', '8am-12pm'], ['afternoon', '☀️ Afternoon', '12pm-4pm'], ['evening', '🌇 Evening', '4pm-7pm']].map(([val, label, desc]) => (
                    <button key={val} onClick={() => setTimeSlot(val)}
                      className={`p-3 rounded-xl border-2 text-center transition ${timeSlot === val ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-gray-500">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep('addresses')} className="px-4 py-3 border rounded-xl text-gray-600 hover:bg-gray-50">← Back</button>
                <button onClick={() => setStep('size')} disabled={!moveDate}
                  className="flex-1 py-3 rounded-xl text-white font-semibold disabled:opacity-50" style={{ backgroundColor: pc }}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step: Home Size */}
          {step === 'size' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">How big is your home?</h2>
              <div className="grid grid-cols-2 gap-2">
                {sizes.map((s: any) => (
                  <button key={s.value} onClick={() => setHomeSize(s.value)}
                    className={`p-4 rounded-xl border-2 text-left transition ${homeSize === s.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="text-2xl mb-1">{['🏠','🏡','🏘️','🏰','🏯','🏛️'][s.bedrooms] || '🏠'}</div>
                    <div className="font-medium capitalize">{s.label}</div>
                    <div className="text-xs text-gray-500">{s.bedrooms === 0 ? 'Studio' : `${s.bedrooms} bed`}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep('date')} className="px-4 py-3 border rounded-xl text-gray-600 hover:bg-gray-50">← Back</button>
                <button onClick={getEstimate} disabled={!homeSize}
                  className="flex-1 py-3 rounded-xl text-white font-semibold disabled:opacity-50" style={{ backgroundColor: pc }}>
                  Get Estimate →
                </button>
              </div>
            </div>
          )}

          {/* Step: Estimate */}
          {step === 'estimate' && estimate && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Your Estimate</h2>
              <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                <div className="flex justify-between"><span className="text-gray-600">Home Size</span><span className="font-medium capitalize">{homeSize.replace('-', ' ')}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Crew Size</span><span className="font-medium">{estimate.crew_size} movers</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Est. Hours</span><span className="font-medium">{estimate.estimated_hours} hrs</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Hourly Rate</span><span className="font-medium">${estimate.hourly_rate}/hr</span></div>
                <hr />
                <div className="flex justify-between text-lg"><span className="font-semibold">Estimated Total</span><span className="font-bold" style={{ color: pc }}>${estimate.estimated_price.toLocaleString()}</span></div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="text-sm text-blue-800">
                  💳 <strong>Deposit to book: ${estimate.deposit_amount}</strong>
                  <br /><span className="text-blue-600">Secures your date. Applied to your final bill.</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep('size')} className="px-4 py-3 border rounded-xl text-gray-600 hover:bg-gray-50">← Back</button>
                <button onClick={() => setStep('contact')}
                  className="flex-1 py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: pc }}>
                  Book This Move →
                </button>
              </div>
            </div>
          )}

          {/* Step: Contact */}
          {step === 'contact' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Your Contact Info</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="John Smith" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="john@example.com" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="(555) 123-4567" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  placeholder="Stairs, large items, access notes..." className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep('estimate')} className="px-4 py-3 border rounded-xl text-gray-600 hover:bg-gray-50">← Back</button>
                <button onClick={submitBooking} disabled={!name || !email || submitting}
                  className="flex-1 py-3 rounded-xl text-white font-semibold disabled:opacity-50" style={{ backgroundColor: pc }}>
                  {submitting ? 'Booking...' : `Confirm & Pay $${estimate?.deposit_amount || 0} Deposit`}
                </button>
              </div>
            </div>
          )}

          {/* Step: Confirmation */}
          {step === 'confirm' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
              <h2 className="text-2xl font-bold text-gray-900">Move Booked!</h2>
              <p className="text-gray-600">Your booking reference is:</p>
              <div className="bg-gray-50 rounded-xl p-4 font-mono text-xl font-bold" style={{ color: pc }}>{bookingRef}</div>
              <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2">
                <div><span className="text-gray-500">From:</span> {origin}</div>
                <div><span className="text-gray-500">To:</span> {destination}</div>
                <div><span className="text-gray-500">Date:</span> {moveDate} ({timeSlot})</div>
                <div><span className="text-gray-500">Size:</span> {homeSize.replace('-', ' ')}</div>
                <div><span className="text-gray-500">Estimate:</span> ${estimate?.estimated_price.toLocaleString()}</div>
              </div>
              <p className="text-sm text-gray-500">A confirmation email will be sent to {email}.<br />{config.company.name} will contact you to finalize details.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 text-center">
          <a href="https://bookedmove.com" target="_blank" className="text-xs text-gray-400 hover:text-gray-600">
            Powered by BookedMove
          </a>
        </div>
      </div>
    </div>
  );
}
