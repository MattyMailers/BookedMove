'use client';
import { useState, useEffect, useCallback } from 'react';
import { Truck, ArrowLeft, ArrowRight, MapPin, Calendar, Home, DollarSign, User, CheckCircle2, Loader2, Ruler, Package } from 'lucide-react';

const TIME_SLOTS = [
  { id: 'morning', label: '8-10 AM', icon: '🌅' },
  { id: 'late-morning', label: '10-12 PM', icon: '☀️' },
  { id: 'afternoon', label: '1-3 PM', icon: '🌤️' },
  { id: 'late-afternoon', label: '3-5 PM', icon: '🌇' },
];
const SIZES = [
  { id: 'studio', label: 'Studio', br: 0, icon: '🏠' },
  { id: '1-bedroom', label: '1 Bed', br: 1, icon: '🏡' },
  { id: '2-bedroom', label: '2 Bed', br: 2, icon: '🏘️' },
  { id: '3-bedroom', label: '3 Bed', br: 3, icon: '🏢' },
  { id: '4-bedroom', label: '4 Bed', br: 4, icon: '🏰' },
  { id: '5-bedroom', label: '5+ Bed', br: 5, icon: '🏛️' },
];
const FULLNESS_LEVELS = [
  { value: 25, label: 'Light', desc: 'Minimal furniture' },
  { value: 50, label: 'Half', desc: 'Some rooms furnished' },
  { value: 75, label: 'Average', desc: 'Most rooms furnished' },
  { value: 100, label: 'Full', desc: 'Fully furnished' },
  { value: 125, label: 'Packed', desc: 'Overflowing, storage included' },
];

export default function BookingWidget({ slug }: { slug: string }) {
  const [config, setConfig] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [moveDate, setMoveDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [homeSize, setHomeSize] = useState('');
  const [bedrooms, setBedrooms] = useState(2);
  const [sqft, setSqft] = useState(1500);
  const [fullness, setFullness] = useState(75);
  const [estimate, setEstimate] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [showOriginSugg, setShowOriginSugg] = useState(false);
  const [showDestSugg, setShowDestSugg] = useState(false);

  const base = typeof window !== 'undefined' ? window.location.origin : '';

  const trackEvent = useCallback((eventType: string, stepNum?: string) => {
    try { fetch(`${base}/api/widget/${slug}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventType, step: stepNum, sessionId }) }); } catch {}
  }, [base, slug, sessionId]);

  useEffect(() => {
    fetch(`${base}/api/widget/${slug}/config`).then(r => r.json()).then(d => { setConfig(d); setLoading(false); trackEvent('widget_loaded'); }).catch(() => { setError('Failed to load'); setLoading(false); });
  }, [slug, base, trackEvent]);

  const pc = config?.company?.primaryColor || '#2563eb';
  const ac = config?.company?.accentColor || '#1e40af';

  // Build steps based on form config
  const formSteps = config?.formConfig?.steps || {};
  const activeSteps: string[] = ['addresses'];
  if (formSteps.dateTime !== false) activeSteps.push('dateTime');
  if (formSteps.homeSize !== false) activeSteps.push('homeSize');
  if (formSteps.squareFootage === true) activeSteps.push('squareFootage');
  if (formSteps.fullness === true) activeSteps.push('fullness');
  activeSteps.push('estimate', 'contactInfo');
  const CONFIRMED_STEP = activeSteps.length;

  const fetchPlaces = async (input: string, setter: (v: any[]) => void) => {
    if (input.length < 3) { setter([]); return; }
    try {
      const r = await fetch(`${base}/api/widget/${slug}/places?input=${encodeURIComponent(input)}`);
      const d = await r.json();
      setter(d.predictions || []);
    } catch { setter([]); }
  };

  const getEstimate = async () => {
    const fullnessMult = fullness / 100;
    const r = await fetch(`${base}/api/widget/${slug}/estimate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bedrooms, moveSize: homeSize, distanceMiles: 15, sqft, fullness: fullnessMult }),
    });
    setEstimate(await r.json());
  };

  const handleBook = async () => {
    setSubmitting(true); setError('');
    try {
      trackEvent('booking_submitted');
      const r = await fetch(`${base}/api/widget/${slug}/book`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name, customerEmail: email, customerPhone: phone, originAddress: origin, destinationAddress: destination, moveDate, timeSlot, homeSize, bedrooms, estimatedHours: estimate?.estimatedHours, estimatedPrice: estimate?.estimatedPrice, depositAmount: estimate?.depositAmount || 0, notes, squareFootage: sqft, fullness }),
      });
      const d = await r.json();
      if (d.bookingRef) {
        setBookingRef(d.bookingRef);
        await fetch(`${base}/api/widget/${slug}/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingRef: d.bookingRef }) });
        setStep(CONFIRMED_STEP);
      } else { setError(d.error || 'Failed'); trackEvent('booking_failed'); }
    } catch { setError('Failed'); trackEvent('booking_failed'); }
    setSubmitting(false);
  };

  const currentStepId = activeSteps[step] || '';

  const canProceed = () => {
    switch (currentStepId) {
      case 'addresses': return origin.length > 3 && destination.length > 3;
      case 'dateTime': return moveDate && timeSlot;
      case 'homeSize': return homeSize;
      case 'squareFootage': return true;
      case 'fullness': return true;
      case 'estimate': return estimate;
      case 'contactInfo': return name && email;
      default: return true;
    }
  };

  const next = async () => {
    trackEvent('step_completed', step.toString());
    const nextStepId = activeSteps[step + 1];
    if (nextStepId === 'estimate') await getEstimate();
    if (currentStepId === 'contactInfo') { await handleBook(); return; }
    setStep(s => s + 1);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (error && !config) return <div className="p-8 text-center text-red-600">{error}</div>;
  const minD = new Date(); minD.setDate(minD.getDate() + 2);

  return (
    <div className="max-w-2xl mx-auto font-sans">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-5 text-white" style={{ background: `linear-gradient(135deg, ${pc}, ${ac})` }}>
          <div className="flex items-center gap-3">
            {config?.company?.logoUrl ? (
              <img src={config.company.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <Truck className="h-8 w-8" />
            )}
            <div>
              <h1 className="text-xl font-bold">{step < CONFIRMED_STEP ? 'Book Your Move' : 'Booking Confirmed!'}</h1>
              <p className="text-sm opacity-90">{config?.company?.name}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        {step < CONFIRMED_STEP && (
          <div className="px-6 pt-4">
            <div className="flex gap-1">
              {activeSteps.map((_, i) => (
                <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                  style={{ backgroundColor: i <= step ? pc : '#e5e7eb' }} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Step {step + 1}/{activeSteps.length}</p>
          </div>
        )}

        <div className="p-6">
          {error && step < CONFIRMED_STEP && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

          {/* Addresses */}
          {currentStepId === 'addresses' && (
            <div className="space-y-4">
              {[
                { l: 'Moving From', v: origin, s: setOrigin, p: 'Pickup address', sugg: originSuggestions, setSugg: setOriginSuggestions, show: showOriginSugg, setShow: setShowOriginSugg },
                { l: 'Moving To', v: destination, s: setDestination, p: 'Delivery address', sugg: destSuggestions, setSugg: setDestSuggestions, show: showDestSugg, setShow: setShowDestSugg },
              ].map(f => (
                <div key={f.l} className="relative">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="h-4 w-4" style={{ color: pc }} />{f.l}
                  </label>
                  <input type="text" value={f.v}
                    onChange={e => { f.s(e.target.value); fetchPlaces(e.target.value, f.setSugg); f.setShow(true); }}
                    onFocus={() => f.setShow(true)}
                    onBlur={() => setTimeout(() => f.setShow(false), 200)}
                    placeholder={f.p}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none text-gray-900 transition-colors"
                    style={{ borderColor: undefined }}
                  />
                  {f.show && f.sugg.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {f.sugg.map((s: any, i: number) => (
                        <button key={i} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                          onMouseDown={() => { f.s(s.description); f.setShow(false); }}>
                          {s.description}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Date & Time */}
          {currentStepId === 'dateTime' && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="h-4 w-4" style={{ color: pc }} />Move Date
                </label>
                <input type="date" value={moveDate} onChange={e => setMoveDate(e.target.value)}
                  min={minD.toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none text-gray-900" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Time</label>
                <div className="grid grid-cols-2 gap-3">
                  {TIME_SLOTS.map(s => (
                    <button key={s.id} onClick={() => setTimeSlot(s.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${timeSlot === s.id ? 'shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                      style={timeSlot === s.id ? { borderColor: pc, backgroundColor: pc + '10' } : {}}>
                      <span className="text-lg">{s.icon}</span>
                      <p className="text-sm font-medium mt-1" style={timeSlot === s.id ? { color: pc } : { color: '#374151' }}>{s.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Home Size */}
          {currentStepId === 'homeSize' && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Home className="h-4 w-4" style={{ color: pc }} />Home Size
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SIZES.map(s => (
                  <button key={s.id} onClick={() => { setHomeSize(s.id); setBedrooms(s.br); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${homeSize === s.id ? 'shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                    style={homeSize === s.id ? { borderColor: pc, backgroundColor: pc + '10' } : {}}>
                    <span className="text-2xl">{s.icon}</span>
                    <p className="text-sm font-semibold mt-2" style={homeSize === s.id ? { color: pc } : { color: '#374151' }}>{s.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Square Footage */}
          {currentStepId === 'squareFootage' && (
            <div className="space-y-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Ruler className="h-4 w-4" style={{ color: pc }} />Square Footage
              </label>
              <div className="text-center">
                <p className="text-5xl font-bold" style={{ color: pc }}>{sqft >= 5000 ? '5,000+' : sqft.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">sq ft</p>
              </div>
              <input type="range" min="500" max="5000" step="100" value={sqft}
                onChange={e => setSqft(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                style={{ accentColor: pc }} />
              <div className="flex justify-between text-xs text-gray-400">
                <span>500 sqft</span><span>5,000+ sqft</span>
              </div>
            </div>
          )}

          {/* Fullness */}
          {currentStepId === 'fullness' && (
            <div className="space-y-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Package className="h-4 w-4" style={{ color: pc }} />How Full Is Your Home?
              </label>
              <div className="text-center">
                <p className="text-5xl font-bold" style={{ color: pc }}>{fullness}%</p>
                <p className="text-sm text-gray-500 mt-1">{FULLNESS_LEVELS.find(f => f.value === fullness)?.desc}</p>
              </div>
              <input type="range" min="25" max="125" step="25" value={fullness}
                onChange={e => setFullness(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: pc }} />
              <div className="flex justify-between">
                {FULLNESS_LEVELS.map(f => (
                  <button key={f.value} onClick={() => setFullness(f.value)}
                    className={`text-xs px-2 py-1 rounded-lg transition-all ${fullness === f.value ? 'font-bold' : 'text-gray-400'}`}
                    style={fullness === f.value ? { color: pc, backgroundColor: pc + '15' } : {}}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Estimate */}
          {currentStepId === 'estimate' && estimate && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <DollarSign className="h-12 w-12 mx-auto mb-2" style={{ color: pc }} />
                <p className="text-sm text-gray-500 mb-1">Estimated Price</p>
                <p className="text-5xl font-bold" style={{ color: pc }}>${estimate.estimatedPrice?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {[
                  ['Hours', `${estimate.estimatedHours} hrs`],
                  ['Crew', `${estimate.crewSize} movers`],
                  ['Rate', `$${estimate.hourlyRate}/hr`],
                ].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between text-sm">
                    <span className="text-gray-600">{l}</span>
                    <span className="font-semibold text-gray-900">{v}</span>
                  </div>
                ))}
                <hr className="border-gray-200" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Deposit to Book</span>
                  <span className="font-bold text-lg" style={{ color: pc }}>${estimate.depositAmount}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">Final price may vary based on actual items and time. Deposit secures your date.</p>
            </div>
          )}

          {/* Contact Info */}
          {currentStepId === 'contactInfo' && (
            <div className="space-y-4">
              {[
                { l: 'Full Name', v: name, s: setName, t: 'text', p: 'John Smith' },
                { l: 'Email', v: email, s: setEmail, t: 'email', p: 'john@example.com' },
                { l: 'Phone', v: phone, s: setPhone, t: 'tel', p: '(555) 123-4567' },
              ].map(f => (
                <div key={f.l}>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">{f.l}</label>
                  <input type={f.t} value={f.v} onChange={e => f.s(e.target.value)} placeholder={f.p}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none text-gray-900 transition-colors" />
                </div>
              ))}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything we should know?"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none text-gray-900 h-20 resize-none" />
              </div>
            </div>
          )}

          {/* Confirmed */}
          {step === CONFIRMED_STEP && (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">You&apos;re All Set!</h2>
              <div className="bg-gray-50 rounded-xl p-4 inline-block">
                <p className="text-sm text-gray-500">Booking Reference</p>
                <p className="text-2xl font-mono font-bold" style={{ color: pc }}>{bookingRef}</p>
              </div>
              <div className="text-left bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                {[['From', origin], ['To', destination], ['Date', moveDate], ['Estimate', `$${estimate?.estimatedPrice?.toLocaleString()}`]].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between">
                    <span className="text-gray-500">{l}</span>
                    <span className="font-medium text-gray-900">{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">Confirmation sent to <strong>{email}</strong></p>
            </div>
          )}
        </div>

        {/* Navigation */}
        {step < CONFIRMED_STEP && (
          <div className="px-6 pb-6 flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                <ArrowLeft className="h-4 w-4" />Back
              </button>
            )}
            <button onClick={next} disabled={!canProceed() || submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
              style={{ backgroundColor: pc }}>
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>{currentStepId === 'contactInfo' ? 'Book My Move' : 'Continue'}{currentStepId !== 'contactInfo' && <ArrowRight className="h-4 w-4" />}</>
              )}
            </button>
          </div>
        )}

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Powered by <a href="https://bookedmove.com" className="font-semibold hover:underline" style={{ color: pc }}>BookedMove</a></p>
        </div>
      </div>
    </div>
  );
}
