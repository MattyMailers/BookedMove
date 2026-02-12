'use client';
import { useState, useEffect, useCallback } from 'react';
import { Truck, ArrowLeft, ArrowRight, MapPin, Calendar, Home, DollarSign, User, CheckCircle2, Loader2, Ruler, Package, Tag } from 'lucide-react';

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
  const [timeWindow, setTimeWindow] = useState('');
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
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentComplete, setPaymentComplete] = useState(false);
  // Availability
  const [availDays, setAvailDays] = useState<any[]>([]);
  const [availSlots, setAvailSlots] = useState<any[]>([]);
  // Coupon
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponValid, setCouponValid] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const base = typeof window !== 'undefined' ? window.location.origin : '';

  const trackEvent = useCallback((eventType: string, stepNum?: string) => {
    try { fetch(`${base}/api/widget/${slug}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventType, step: stepNum, sessionId }) }); } catch {}
  }, [base, slug, sessionId]);

  useEffect(() => {
    fetch(`${base}/api/widget/${slug}/config`).then(r => r.json()).then(d => {
      setConfig(d);
      setLoading(false);
      trackEvent('widget_loaded');
      if (d?.payment?.enabled && !(window as any).Accept) {
        const isSandbox = typeof window !== 'undefined' && window.location.hostname !== 'bookedmove.com';
        const script = document.createElement('script');
        script.src = isSandbox ? 'https://jstest.authorize.net/v1/Accept.js' : 'https://js.authorize.net/v1/Accept.js';
        script.charset = 'utf-8';
        document.head.appendChild(script);
      }
      if (d?.customCss) {
        const style = document.createElement('style');
        style.textContent = d.customCss;
        document.head.appendChild(style);
      }
    }).catch(() => { setError('Failed to load'); setLoading(false); });
  }, [slug, base, trackEvent]);

  // Fetch availability when date step is active
  useEffect(() => {
    if (!config || !moveDate) return;
    // Fetch month availability
    const month = moveDate.substring(0, 7);
    fetch(`${base}/api/widget/${slug}/availability?month=${month}`).then(r => r.json()).then(d => {
      setAvailDays(d.days || []);
    }).catch(() => {});
  }, [config, moveDate, base, slug]);

  // Fetch availability on initial load for current month
  useEffect(() => {
    if (!config) return;
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    fetch(`${base}/api/widget/${slug}/availability?month=${month}`).then(r => r.json()).then(d => {
      setAvailDays(d.days || []);
    }).catch(() => {});
  }, [config, base, slug]);

  // Fetch time slots when date changes
  useEffect(() => {
    if (!moveDate || !config) return;
    fetch(`${base}/api/widget/${slug}/availability?date=${moveDate}`).then(r => r.json()).then(d => {
      setAvailSlots(d.slots || []);
    }).catch(() => {});
  }, [moveDate, config, base, slug]);

  const pc = config?.company?.primaryColor || '#2563eb';
  const ac = config?.company?.accentColor || '#1e40af';

  const formSteps = config?.formConfig?.steps || {};
  const activeSteps: string[] = ['addresses'];
  if (formSteps.dateTime !== false) activeSteps.push('dateTime');
  if (formSteps.homeSize !== false) activeSteps.push('homeSize');
  if (formSteps.squareFootage === true) activeSteps.push('squareFootage');
  if (formSteps.fullness === true) activeSteps.push('fullness');
  activeSteps.push('estimate', 'contactInfo');
  const paymentConfig = config?.payment;
  if (paymentConfig?.enabled && paymentConfig?.timing === 'at_booking') {
    activeSteps.push('payment');
  }
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
      body: JSON.stringify({ bedrooms, moveSize: homeSize, distanceMiles: 15, sqft, fullness: fullnessMult, couponCode: couponValid?.code || null }),
    });
    setEstimate(await r.json());
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const r = await fetch(`${base}/api/widget/${slug}/coupon`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, bedrooms }),
      });
      const d = await r.json();
      if (d.valid) {
        setCouponValid(d);
        setCouponError('');
        // Re-fetch estimate with coupon
        const fullnessMult = fullness / 100;
        const r2 = await fetch(`${base}/api/widget/${slug}/estimate`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bedrooms, moveSize: homeSize, distanceMiles: 15, sqft, fullness: fullnessMult, couponCode: d.code }),
        });
        setEstimate(await r2.json());
      } else {
        setCouponValid(null);
        setCouponError(d.error || 'Invalid code');
      }
    } catch {
      setCouponError('Failed to validate');
    }
    setCouponLoading(false);
  };

  const removeCoupon = async () => {
    setCouponValid(null);
    setCouponCode('');
    setCouponError('');
    // Re-fetch estimate without coupon
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
        body: JSON.stringify({ customerName: name, customerEmail: email, customerPhone: phone, originAddress: origin, destinationAddress: destination, moveDate, timeSlot, homeSize, bedrooms, estimatedHours: estimate?.estimatedHours, estimatedPrice: estimate?.estimatedPrice, depositAmount: estimate?.depositAmount || 0, notes, squareFootage: sqft, fullness, couponCode: couponValid?.code || null, discountAmount: estimate?.discountAmount || null, timeWindow }),
      });
      const d = await r.json();
      if (d.bookingRef) {
        setBookingRef(d.bookingRef);
        if (paymentConfig?.enabled && paymentConfig?.timing === 'at_booking') {
          setStep(s => s + 1);
        } else {
          await fetch(`${base}/api/widget/${slug}/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingRef: d.bookingRef }) });
          setStep(CONFIRMED_STEP);
        }
      } else { setError(d.error || 'Failed'); trackEvent('booking_failed'); }
    } catch { setError('Failed'); trackEvent('booking_failed'); }
    setSubmitting(false);
  };

  const handlePayment = async () => {
    setPaymentProcessing(true); setPaymentError('');
    try {
      const acceptResponse: any = await new Promise((resolve, reject) => {
        (window as any).acceptResponseHandler = (response: any) => {
          if (response.messages.resultCode === 'Error') reject(new Error(response.messages.message[0].text));
          else resolve(response);
        };
        const secureData: any = {};
        const cardNumber = (document.getElementById('bm-card-number') as HTMLInputElement)?.value?.replace(/\s/g, '');
        const expMonth = (document.getElementById('bm-exp-month') as HTMLInputElement)?.value;
        const expYear = (document.getElementById('bm-exp-year') as HTMLInputElement)?.value;
        const cvv = (document.getElementById('bm-cvv') as HTMLInputElement)?.value;
        if (!cardNumber || !expMonth || !expYear || !cvv) { reject(new Error('Please fill in all card fields')); return; }
        secureData.cardData = { cardNumber, month: expMonth, year: expYear, cardCode: cvv };
        secureData.authData = { clientKey: paymentConfig.clientKey, apiLoginID: paymentConfig.clientKey };
        (window as any).Accept.dispatchData(secureData, (window as any).acceptResponseHandler);
      });
      const r = await fetch(`${base}/api/widget/${slug}/payment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingRef, opaqueDataDescriptor: acceptResponse.opaqueData.dataDescriptor, opaqueDataValue: acceptResponse.opaqueData.dataValue }),
      });
      const d = await r.json();
      if (d.success) {
        setPaymentComplete(true); trackEvent('payment_completed');
        await fetch(`${base}/api/widget/${slug}/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingRef }) });
        setStep(CONFIRMED_STEP);
      } else { setPaymentError(d.error || 'Payment failed'); trackEvent('payment_failed'); }
    } catch (e: any) { setPaymentError(e.message || 'Payment failed'); trackEvent('payment_failed'); }
    setPaymentProcessing(false);
  };

  const currentStepId = activeSteps[step] || '';

  const canProceed = () => {
    switch (currentStepId) {
      case 'addresses': return origin.length > 3 && destination.length > 3;
      case 'dateTime': {
        if (!moveDate) return false;
        // Check if date is available
        const day = availDays.find((d: any) => d.date === moveDate);
        if (day && (day.status === 'full' || day.status === 'closed')) return false;
        // Need a time window or time slot
        if (availSlots.length > 0) return !!timeWindow;
        return !!timeSlot;
      }
      case 'homeSize': return homeSize;
      case 'squareFootage': return true;
      case 'fullness': return true;
      case 'estimate': return estimate;
      case 'contactInfo': return name && email;
      case 'payment': return true;
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

  // Get availability status for a date
  const getDateStatus = (dateStr: string) => {
    const day = availDays.find((d: any) => d.date === dateStr);
    if (!day) return null;
    return day.status; // 'available', 'limited', 'full', 'closed'
  };

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
                <input type="date" value={moveDate} onChange={e => { setMoveDate(e.target.value); setTimeWindow(''); setTimeSlot(''); }}
                  min={minD.toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none text-gray-900" />
                {/* Date availability indicator */}
                {moveDate && (() => {
                  const status = getDateStatus(moveDate);
                  if (status === 'full' || status === 'closed') return (
                    <p className="text-sm text-red-600 mt-2">⛔ This date is {status === 'closed' ? 'closed' : 'fully booked'}. Please choose another date.</p>
                  );
                  if (status === 'limited') return (
                    <p className="text-sm text-yellow-600 mt-2">⚠️ Limited availability on this date. Book soon!</p>
                  );
                  if (status === 'available') return (
                    <p className="text-sm text-green-600 mt-2">✅ Available</p>
                  );
                  return null;
                })()}
              </div>

              {/* Time Windows - use config time windows if available, fallback to old grid */}
              {moveDate && (availSlots.length > 0 ? (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Arrival Window</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availSlots.map((slot: any) => (
                      <button key={slot.id} onClick={() => { setTimeWindow(slot.id); setTimeSlot(slot.label); }}
                        disabled={!slot.available}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          !slot.available ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' :
                          timeWindow === slot.id ? 'shadow-md' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={timeWindow === slot.id ? { borderColor: pc, backgroundColor: pc + '10' } : {}}>
                        <span className="text-lg">{slot.id === 'am' ? '🌅' : '🌇'}</span>
                        <p className="text-sm font-medium mt-1" style={timeWindow === slot.id ? { color: pc } : { color: '#374151' }}>{slot.label}</p>
                        {!slot.available && <p className="text-xs text-red-500 mt-1">Fully booked</p>}
                        {slot.available && <p className="text-xs text-gray-400 mt-1">{slot.capacity - slot.booked} spot{slot.capacity - slot.booked !== 1 ? 's' : ''} left</p>}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Time</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'morning', label: '8-10 AM', icon: '🌅' },
                      { id: 'late-morning', label: '10-12 PM', icon: '☀️' },
                      { id: 'afternoon', label: '1-3 PM', icon: '🌤️' },
                      { id: 'late-afternoon', label: '3-5 PM', icon: '🌇' },
                    ].map(s => (
                      <button key={s.id} onClick={() => setTimeSlot(s.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${timeSlot === s.id ? 'shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                        style={timeSlot === s.id ? { borderColor: pc, backgroundColor: pc + '10' } : {}}>
                        <span className="text-lg">{s.icon}</span>
                        <p className="text-sm font-medium mt-1" style={timeSlot === s.id ? { color: pc } : { color: '#374151' }}>{s.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
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
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
                  ['Rate', estimate.couponApplied
                    ? <span><span className="line-through text-gray-400">${estimate.originalHourlyRate}/hr</span> <span className="text-green-600 font-bold">${estimate.hourlyRate}/hr</span> <span className="text-green-600 text-xs">({estimate.couponDescription})</span></span>
                    : `$${estimate.hourlyRate}/hr`
                  ],
                ].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between text-sm items-center">
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

              {/* Coupon Code */}
              <div className="border-t border-gray-100 pt-3">
                {!showCoupon && !couponValid ? (
                  <button onClick={() => setShowCoupon(true)} className="text-sm flex items-center gap-1.5 text-gray-500 hover:text-gray-700">
                    <Tag className="h-3.5 w-3.5" /> Have a promo code?
                  </button>
                ) : couponValid ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{couponValid.code} — {couponValid.description}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code" className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none uppercase" />
                      <button onClick={validateCoupon} disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                        style={{ backgroundColor: pc }}>
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                  </div>
                )}
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

          {/* Payment */}
          {currentStepId === 'payment' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <DollarSign className="h-10 w-10 mx-auto mb-2" style={{ color: pc }} />
                <p className="text-lg font-bold text-gray-900">
                  {paymentConfig?.mode === 'full' ? 'Pay Estimated Total' : 'Pay Deposit to Book'}
                </p>
                <p className="text-3xl font-bold mt-1" style={{ color: pc }}>
                  ${paymentConfig?.mode === 'full' ? estimate?.estimatedPrice?.toLocaleString() : estimate?.depositAmount?.toLocaleString()}
                </p>
              </div>
              {paymentError && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{paymentError}</div>}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Card Number</label>
                <input id="bm-card-number" type="text" placeholder="4111 1111 1111 1111" maxLength={19}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none text-gray-900"
                  onChange={e => { let v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim(); e.target.value = v; }} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Month</label>
                  <input id="bm-exp-month" type="text" placeholder="MM" maxLength={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none text-gray-900" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Year</label>
                  <input id="bm-exp-year" type="text" placeholder="YYYY" maxLength={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none text-gray-900" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">CVV</label>
                  <input id="bm-cvv" type="text" placeholder="123" maxLength={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none text-gray-900" />
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">🔒 Your card info is securely processed and never stored on our servers.</p>
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
                {couponValid && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Promo</span>
                    <span className="font-medium text-green-600">{couponValid.code} ({couponValid.description})</span>
                  </div>
                )}
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
            <button onClick={currentStepId === 'payment' ? handlePayment : next} disabled={!canProceed() || submitting || paymentProcessing}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
              style={{ backgroundColor: pc }}>
              {(submitting || paymentProcessing) ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>{currentStepId === 'payment' ? `Pay $${paymentConfig?.mode === 'full' ? estimate?.estimatedPrice : estimate?.depositAmount}` : currentStepId === 'contactInfo' ? 'Book My Move' : 'Continue'}{currentStepId !== 'contactInfo' && currentStepId !== 'payment' && <ArrowRight className="h-4 w-4" />}</>
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
