'use client';
import { useState, useEffect } from 'react';
import { Truck, ArrowLeft, ArrowRight, MapPin, Calendar, Home, DollarSign, User, CheckCircle2, Loader2 } from 'lucide-react';

const STEPS = ['Addresses', 'Date & Time', 'Home Size', 'Estimate', 'Contact Info', 'Confirmed'];
const TIME_SLOTS = [
  { id: 'morning', label: '8-10 AM', icon: '🌅' }, { id: 'late-morning', label: '10-12 PM', icon: '☀️' },
  { id: 'afternoon', label: '1-3 PM', icon: '🌤️' }, { id: 'late-afternoon', label: '3-5 PM', icon: '🌇' },
];
const SIZES = [
  { id: 'studio', label: 'Studio', br: 0, icon: '🏠' }, { id: '1-bedroom', label: '1 Bed', br: 1, icon: '🏡' },
  { id: '2-bedroom', label: '2 Bed', br: 2, icon: '🏘️' }, { id: '3-bedroom', label: '3 Bed', br: 3, icon: '🏢' },
  { id: '4-bedroom', label: '4 Bed', br: 4, icon: '🏰' }, { id: '5-bedroom', label: '5+ Bed', br: 5, icon: '🏛️' },
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
  const [estimate, setEstimate] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const base = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    fetch(`${base}/api/widget/${slug}/config`).then(r => r.json()).then(d => { setConfig(d); setLoading(false); }).catch(() => { setError('Failed to load'); setLoading(false); });
  }, [slug, base]);

  const pc = config?.company?.primaryColor || '#2563eb';
  const ac = config?.company?.accentColor || '#1e40af';

  const getEstimate = async () => {
    const r = await fetch(`${base}/api/widget/${slug}/estimate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bedrooms, moveSize: homeSize, distanceMiles: 15 }) });
    setEstimate(await r.json());
  };

  const handleBook = async () => {
    setSubmitting(true); setError('');
    try {
      const r = await fetch(`${base}/api/widget/${slug}/book`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName: name, customerEmail: email, customerPhone: phone, originAddress: origin, destinationAddress: destination, moveDate, timeSlot, homeSize, bedrooms, estimatedHours: estimate?.estimatedHours, estimatedPrice: estimate?.estimatedPrice, depositAmount: estimate?.depositAmount || 0, notes }) });
      const d = await r.json();
      if (d.bookingRef) {
        setBookingRef(d.bookingRef);
        await fetch(`${base}/api/widget/${slug}/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingRef: d.bookingRef }) });
        setStep(5);
      } else setError(d.error || 'Failed');
    } catch { setError('Failed'); }
    setSubmitting(false);
  };

  const ok = () => { switch(step) { case 0: return origin.length>3&&destination.length>3; case 1: return moveDate&&timeSlot; case 2: return homeSize; case 3: return estimate; case 4: return name&&email; default: return true; } };
  const next = async () => { if(step===2) await getEstimate(); if(step===4){await handleBook();return;} setStep(s=>s+1); };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (error && !config) return <div className="p-8 text-center text-red-600">{error}</div>;
  const minD = new Date(); minD.setDate(minD.getDate()+2);

  return (
    <div className="max-w-2xl mx-auto font-sans">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="px-6 py-5 text-white" style={{background:`linear-gradient(135deg,${pc},${ac})`}}>
          <div className="flex items-center gap-3">
            <Truck className="h-8 w-8" />
            <div><h1 className="text-xl font-bold">{step<5?'Book Your Move':'Booking Confirmed!'}</h1><p className="text-sm opacity-90">{config?.company?.name}</p></div>
          </div>
        </div>
        {step<5&&<div className="px-6 pt-4"><div className="flex gap-1">{STEPS.slice(0,5).map((_,i)=><div key={i} className="flex-1 h-1.5 rounded-full transition-all" style={{backgroundColor:i<=step?pc:'#e5e7eb'}}/>)}</div><p className="text-xs text-gray-500 mt-2">Step {step+1}/5 — {STEPS[step]}</p></div>}
        <div className="p-6">
          {error&&step<5&&<div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          {step===0&&<div className="space-y-4">{[{l:'Moving From',v:origin,s:setOrigin,p:'Pickup address'},{l:'Moving To',v:destination,s:setDestination,p:'Delivery address'}].map(f=><div key={f.l}><label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><MapPin className="h-4 w-4" style={{color:pc}}/>{f.l}</label><input type="text" value={f.v} onChange={e=>f.s(e.target.value)} placeholder={f.p} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none text-gray-900" onFocus={e=>e.target.style.borderColor=pc} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/></div>)}</div>}
          {step===1&&<div className="space-y-6"><div><label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Calendar className="h-4 w-4" style={{color:pc}}/>Move Date</label><input type="date" value={moveDate} onChange={e=>setMoveDate(e.target.value)} min={minD.toISOString().split('T')[0]} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none text-gray-900" onFocus={e=>e.target.style.borderColor=pc} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/></div><div><label className="text-sm font-semibold text-gray-700 mb-3 block">Time</label><div className="grid grid-cols-2 gap-3">{TIME_SLOTS.map(s=><button key={s.id} onClick={()=>setTimeSlot(s.id)} className={`p-3 rounded-xl border-2 text-left transition-all ${timeSlot===s.id?'shadow-md':'border-gray-200 hover:border-gray-300'}`} style={timeSlot===s.id?{borderColor:pc,backgroundColor:pc+'10'}:{}}><span className="text-lg">{s.icon}</span><p className="text-sm font-medium mt-1" style={timeSlot===s.id?{color:pc}:{color:'#374151'}}>{s.label}</p></button>)}</div></div></div>}
          {step===2&&<div><label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3"><Home className="h-4 w-4" style={{color:pc}}/>Home Size</label><div className="grid grid-cols-2 gap-3">{SIZES.map(s=><button key={s.id} onClick={()=>{setHomeSize(s.id);setBedrooms(s.br);}} className={`p-4 rounded-xl border-2 text-left transition-all ${homeSize===s.id?'shadow-md':'border-gray-200 hover:border-gray-300'}`} style={homeSize===s.id?{borderColor:pc,backgroundColor:pc+'10'}:{}}><span className="text-2xl">{s.icon}</span><p className="text-sm font-semibold mt-2" style={homeSize===s.id?{color:pc}:{color:'#374151'}}>{s.label}</p></button>)}</div></div>}
          {step===3&&estimate&&<div className="space-y-4"><div className="text-center py-4"><DollarSign className="h-12 w-12 mx-auto mb-2" style={{color:pc}}/><p className="text-sm text-gray-500 mb-1">Estimated Price</p><p className="text-5xl font-bold" style={{color:pc}}>${estimate.estimatedPrice?.toLocaleString()}</p></div><div className="bg-gray-50 rounded-xl p-4 space-y-3">{[['Hours',`${estimate.estimatedHours} hrs`],['Crew',`${estimate.crewSize} movers`],['Rate',`$${estimate.hourlyRate}/hr`]].map(([l,v])=><div key={l as string} className="flex justify-between text-sm"><span className="text-gray-600">{l}</span><span className="font-semibold text-gray-900">{v}</span></div>)}<hr className="border-gray-200"/><div className="flex justify-between text-sm"><span className="text-gray-600">Deposit</span><span className="font-bold text-lg" style={{color:pc}}>${estimate.depositAmount}</span></div></div><p className="text-xs text-gray-400 text-center">Final price may vary. Deposit secures your date.</p></div>}
          {step===4&&<div className="space-y-4">{[{l:'Full Name',v:name,s:setName,t:'text',p:'John Smith'},{l:'Email',v:email,s:setEmail,t:'email',p:'john@example.com'},{l:'Phone',v:phone,s:setPhone,t:'tel',p:'(555) 123-4567'}].map(f=><div key={f.l}><label className="text-sm font-semibold text-gray-700 mb-2 block">{f.l}</label><input type={f.t} value={f.v} onChange={e=>f.s(e.target.value)} placeholder={f.p} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none text-gray-900" onFocus={e=>e.target.style.borderColor=pc} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/></div>)}<div><label className="text-sm font-semibold text-gray-700 mb-2 block">Notes (optional)</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Anything we should know?" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none text-gray-900 h-20 resize-none" onFocus={e=>e.target.style.borderColor=pc} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/></div></div>}
          {step===5&&<div className="text-center py-6 space-y-4"><CheckCircle2 className="h-16 w-16 mx-auto text-green-500"/><h2 className="text-2xl font-bold text-gray-900">You&apos;re All Set!</h2><div className="bg-gray-50 rounded-xl p-4 inline-block"><p className="text-sm text-gray-500">Booking Reference</p><p className="text-2xl font-mono font-bold" style={{color:pc}}>{bookingRef}</p></div><div className="text-left bg-gray-50 rounded-xl p-4 space-y-2 text-sm">{[['From',origin],['To',destination],['Date',moveDate],['Estimate',`$${estimate?.estimatedPrice?.toLocaleString()}`]].map(([l,v])=><div key={l as string} className="flex justify-between"><span className="text-gray-500">{l}</span><span className="font-medium text-gray-900">{v}</span></div>)}</div><p className="text-sm text-gray-500">Confirmation sent to <strong>{email}</strong></p></div>}
        </div>
        {step<5&&<div className="px-6 pb-6 flex gap-3">{step>0&&<button onClick={()=>setStep(s=>s-1)} className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"><ArrowLeft className="h-4 w-4"/>Back</button>}<button onClick={next} disabled={!ok()||submitting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50" style={{backgroundColor:pc}}>{submitting?<Loader2 className="h-5 w-5 animate-spin"/>:<>{step===4?'Book My Move':'Continue'}{step!==4&&<ArrowRight className="h-4 w-4"/>}</>}</button></div>}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center"><p className="text-xs text-gray-400">Powered by <a href="https://bookedmove.com" className="font-semibold hover:underline" style={{color:pc}}>BookedMove</a></p></div>
      </div>
    </div>
  );
}
