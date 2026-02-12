'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, ArrowRight, ArrowLeft, Check, Palette, DollarSign, Key, MapPin, Code2, Loader2, Upload, Plus, X, Copy } from 'lucide-react';

const STEPS = [
  { title: 'Company Branding', desc: 'Make the widget yours', icon: Palette },
  { title: 'Pricing Setup', desc: 'Set your rates', icon: DollarSign },
  { title: 'Google Maps API', desc: 'Enable address autocomplete', icon: Key },
  { title: 'Service Areas', desc: 'Where you operate', icon: MapPin },
  { title: 'Embed Your Widget', desc: 'Add to your website', icon: Code2 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [token, setToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [company, setCompany] = useState<any>({});
  const [settings, setSettings] = useState<any>({});
  const [slug, setSlug] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/signup'); return; }
    setToken(t);
    fetch('/api/company/settings', { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json()).then(d => {
        setCompany(d.company || {});
        setSettings(d.settings || {});
        setSlug(d.company?.slug || '');
      });
  }, [router]);

  const save = async () => {
    setSaving(true);
    await fetch('/api/company/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ company, settings }),
    });
    setSaving(false);
  };

  const finish = async () => {
    await save();
    await fetch('/api/company/onboarding-complete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    router.push('/dashboard');
  };

  const next = async () => {
    if (step < 4) { await save(); setStep(s => s + 1); }
    else await finish();
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bookedmove.com';
  const embedIframe = `<iframe src="${appUrl}/widget/${slug}" style="width:100%;min-height:700px;border:none;" allow="payment"></iframe>`;
  const embedScript = `<script src="${appUrl}/embed/${slug}.js" async></script>\n<div id="bookedmove-widget"></div>`;

  const Icon = STEPS[step].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">BookedMove Setup</span>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">
            Skip for now
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <div className="flex gap-2 mb-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>
        <p className="text-sm text-gray-500 mb-8">Step {step + 1} of {STEPS.length}</p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{STEPS[step].title}</h2>
              <p className="text-sm text-gray-500">{STEPS[step].desc}</p>
            </div>
          </div>

          {/* Step 0: Branding */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name</label>
                <input type="text" value={company.name || ''} onChange={e => setCompany({ ...company, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Logo URL</label>
                <input type="url" value={company.logo_url || ''} onChange={e => setCompany({ ...company, logo_url: e.target.value })}
                  placeholder="https://yoursite.com/logo.png"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900" />
                <p className="text-xs text-gray-400 mt-1">Square image recommended (200x200px or larger)</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Primary Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={company.primary_color || '#2563eb'} onChange={e => setCompany({ ...company, primary_color: e.target.value })}
                      className="h-11 w-11 rounded-lg cursor-pointer border-2 border-gray-200" />
                    <input type="text" value={company.primary_color || '#2563eb'} onChange={e => setCompany({ ...company, primary_color: e.target.value })}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Accent Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={company.accent_color || '#1e40af'} onChange={e => setCompany({ ...company, accent_color: e.target.value })}
                      className="h-11 w-11 rounded-lg cursor-pointer border-2 border-gray-200" />
                    <input type="text" value={company.accent_color || '#1e40af'} onChange={e => setCompany({ ...company, accent_color: e.target.value })}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>
              {/* Preview swatch */}
              <div className="p-4 rounded-xl text-white text-center font-semibold"
                style={{ background: `linear-gradient(135deg, ${company.primary_color || '#2563eb'}, ${company.accent_color || '#1e40af'})` }}>
                Widget header preview
              </div>
            </div>
          )}

          {/* Step 1: Pricing */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hourly Rate ($)</label>
                  <input type="number" value={settings.base_rate_per_hour || ''} onChange={e => setSettings({ ...settings, base_rate_per_hour: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min Hours</label>
                  <input type="number" value={settings.min_hours || ''} onChange={e => setSettings({ ...settings, min_hours: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deposit Type</label>
                  <select value={settings.deposit_type || 'flat'} onChange={e => setSettings({ ...settings, deposit_type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900">
                    <option value="flat">Flat Amount ($)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Deposit {settings.deposit_type === 'percent' ? '(%)' : '($)'}
                  </label>
                  <input type="number" value={settings.deposit_amount || ''} onChange={e => setSettings({ ...settings, deposit_amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mileage Rate ($/mile)</label>
                <input type="number" step="0.1" value={settings.mileage_rate || ''} onChange={e => setSettings({ ...settings, mileage_rate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900" />
              </div>
              <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
                <p className="font-medium">You can fine-tune pricing per home size in your dashboard later.</p>
              </div>
            </div>
          )}

          {/* Step 2: Google Maps */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <p className="font-semibold mb-2">How to get a Google Maps API key:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Go to <a href="https://console.cloud.google.com/apis" target="_blank" className="underline font-medium">Google Cloud Console</a></li>
                  <li>Create a new project (or select existing)</li>
                  <li>Enable &quot;Places API&quot; and &quot;Maps JavaScript API&quot;</li>
                  <li>Go to Credentials &rarr; Create API Key</li>
                  <li>Restrict key to your domain for security</li>
                </ol>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Google Maps API Key</label>
                <input type="password" value={settings.google_maps_key || ''} onChange={e => setSettings({ ...settings, google_maps_key: e.target.value })}
                  placeholder="AIza..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900" />
                <p className="text-xs text-gray-400 mt-1">Your key is encrypted and never exposed to end users. Optional - address fields work without it.</p>
              </div>
            </div>
          )}

          {/* Step 3: Service Areas */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Area Zip Codes</label>
                <textarea
                  value={(() => { try { return JSON.parse(settings.service_areas || '[]').join(', '); } catch { return ''; } })()}
                  onChange={e => setSettings({ ...settings, service_areas: JSON.stringify(e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)) })}
                  placeholder="80901, 80902, 80903, 80904..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 h-32 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">Comma-separated zip codes where you provide service. Leave blank to accept all areas.</p>
              </div>
            </div>
          )}

          {/* Step 4: Embed */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Option 1: Script Tag (Recommended)</h3>
                <div className="relative">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm overflow-x-auto whitespace-pre-wrap">{embedScript}</pre>
                  <button onClick={() => { navigator.clipboard.writeText(embedScript); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 hover:bg-gray-600">
                    {copied ? <><Check className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy</>}
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Option 2: iFrame</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm overflow-x-auto whitespace-pre-wrap">{embedIframe}</pre>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                <p className="font-semibold">You&apos;re all set!</p>
                <p className="mt-1">Paste either snippet into your website. Your booking widget will appear instantly. You can always find these codes in your dashboard.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            <button onClick={next} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>{step === 4 ? 'Go to Dashboard' : 'Continue'} <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
