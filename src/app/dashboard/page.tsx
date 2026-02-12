'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Home, Settings, DollarSign, BarChart3, Code2, LogOut, Calendar, Users, TrendingUp, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react';

interface Booking {
  id: number; booking_ref: string; status: string; customer_name: string; customer_email: string;
  customer_phone: string; origin_address: string; destination_address: string; move_date: string;
  time_slot: string; home_size: string; estimated_price: number; deposit_amount: number;
  deposit_paid: number; created_at: string;
}

interface Analytics {
  totalBookings: number; monthBookings: number; confirmedMonth: number; revenue: number;
  depositsCollected: number; conversionRate: number;
}

interface PricingRule {
  id?: number; move_size: string; bedrooms: number; base_price: number; hourly_rate: number; min_hours: number; crew_size: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [tab, setTab] = useState('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [pricing, setPricing] = useState<PricingRule[]>([]);
  const [embedCode, setEmbedCode] = useState<any>(null);
  const [copied, setCopied] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) { setToken(t); } 
  }, []);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    fetch('/api/company/bookings', { headers }).then(r => r.json()).then(d => setBookings(d.bookings || []));
    fetch('/api/company/analytics', { headers }).then(r => r.json()).then(d => setAnalytics(d));
    fetch('/api/company/settings', { headers }).then(r => r.json()).then(d => { setCompany(d.company); setSettings(d.settings); });
    fetch('/api/company/pricing', { headers }).then(r => r.json()).then(d => setPricing(d.rules || []));
    fetch('/api/company/embed', { headers }).then(r => r.json()).then(d => setEmbedCode(d));
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/company/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPass }),
    });
    const data = await res.json();
    if (data.token) { localStorage.setItem('token', data.token); setToken(data.token); }
    else setLoginError(data.error || 'Login failed');
  };

  const savePricing = async () => {
    setSaving(true);
    await fetch('/api/company/pricing', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rules: pricing }),
    });
    setSaving(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    await fetch('/api/company/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ company, settings }),
    });
    setSaving(false);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BookedMove</h1>
              <p className="text-sm text-gray-500">Company Dashboard</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{loginError}</div>}
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900" required />
            <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900" required />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'embed', label: 'Embed Code', icon: Code2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900">{company?.name || 'Dashboard'}</span>
              <span className="text-xs text-gray-400 ml-2">BookedMove</span>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem('token'); setToken(''); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 border border-gray-200 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && analytics && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Bookings This Month', value: analytics.monthBookings, icon: Calendar, color: 'blue' },
                { label: 'Confirmed', value: analytics.confirmedMonth, icon: Check, color: 'green' },
                { label: 'Revenue', value: `$${analytics.revenue.toLocaleString()}`, icon: DollarSign, color: 'emerald' },
                { label: 'Conversion Rate', value: `${analytics.conversionRate}%`, icon: TrendingUp, color: 'purple' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <stat.icon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-500">{stat.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Bookings</h3>
              {bookings.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">No bookings yet. Share your widget to start getting bookings!</p>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{b.customer_name}</p>
                        <p className="text-sm text-gray-500">{b.move_date} • {b.origin_address?.slice(0, 30)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${b.estimated_price}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings */}
        {tab === 'bookings' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">All Bookings</h2>
            </div>
            {bookings.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No bookings yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Ref', 'Customer', 'Date', 'From / To', 'Price', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm text-blue-600">{b.booking_ref}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 text-sm">{b.customer_name}</p>
                          <p className="text-xs text-gray-500">{b.customer_email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{b.move_date}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate">{b.origin_address} → {b.destination_address}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">${b.estimated_price}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                            b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                          }`}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pricing */}
        {tab === 'pricing' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Pricing Rules</h2>
              <button onClick={savePricing} disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Move Size', 'Bedrooms', 'Base Price', 'Hourly Rate', 'Min Hours', 'Crew'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pricing.map((rule, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-3 py-2 font-medium text-gray-900 text-sm">{rule.move_size}</td>
                      <td className="px-3 py-2 text-gray-700 text-sm">{rule.bedrooms}</td>
                      {(['base_price', 'hourly_rate', 'min_hours', 'crew_size'] as const).map(field => (
                        <td key={field} className="px-3 py-2">
                          <input type="number" value={rule[field]} 
                            onChange={e => {
                              const updated = [...pricing];
                              (updated[i] as any)[field] = parseFloat(e.target.value) || 0;
                              setPricing(updated);
                            }}
                            className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm text-gray-900" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings */}
        {tab === 'settings' && company && settings && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Branding</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Company Name</label>
                  <input type="text" value={company.name || ''} onChange={e => setCompany({ ...company, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Logo URL</label>
                  <input type="text" value={company.logo_url || ''} onChange={e => setCompany({ ...company, logo_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Primary Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={company.primary_color || '#2563eb'} onChange={e => setCompany({ ...company, primary_color: e.target.value })}
                      className="h-10 w-10 rounded cursor-pointer" />
                    <input type="text" value={company.primary_color || ''} onChange={e => setCompany({ ...company, primary_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Accent Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={company.accent_color || '#1e40af'} onChange={e => setCompany({ ...company, accent_color: e.target.value })}
                      className="h-10 w-10 rounded cursor-pointer" />
                    <input type="text" value={company.accent_color || ''} onChange={e => setCompany({ ...company, accent_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900" />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pricing Settings</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Base Rate ($/hr)</label>
                  <input type="number" value={settings.base_rate_per_hour || ''} onChange={e => setSettings({ ...settings, base_rate_per_hour: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Min Hours</label>
                  <input type="number" value={settings.min_hours || ''} onChange={e => setSettings({ ...settings, min_hours: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Deposit Type</label>
                  <select value={settings.deposit_type || 'flat'} onChange={e => setSettings({ ...settings, deposit_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900">
                    <option value="flat">Flat Amount</option>
                    <option value="percent">Percentage</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Deposit Amount {settings.deposit_type === 'percent' ? '(%)' : '($)'}</label>
                  <input type="number" value={settings.deposit_amount || ''} onChange={e => setSettings({ ...settings, deposit_amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Mileage Rate ($/mile)</label>
                  <input type="number" step="0.1" value={settings.mileage_rate || ''} onChange={e => setSettings({ ...settings, mileage_rate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Integrations</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">SmartMoving API Key</label>
                  <input type="password" value={settings.smartmoving_api_key || ''} onChange={e => setSettings({ ...settings, smartmoving_api_key: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" placeholder="Enter API key" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">SmartMoving Client ID</label>
                  <input type="text" value={settings.smartmoving_client_id || ''} onChange={e => setSettings({ ...settings, smartmoving_client_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" placeholder="Enter Client ID" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Stripe Connect Account</label>
                  <input type="text" value={settings.stripe_connect_account_id || ''} onChange={e => setSettings({ ...settings, stripe_connect_account_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" placeholder="acct_..." />
                </div>
              </div>
            </div>
            <button onClick={saveSettings} disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        )}

        {/* Embed */}
        {tab === 'embed' && embedCode && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Embed Your Booking Widget</h2>
              <p className="text-gray-500 text-sm mb-6">Copy one of these code snippets and paste it into your website.</p>
              
              {[
                { label: 'Option 1: Script Tag (Recommended)', code: embedCode.script, key: 'script' },
                { label: 'Option 2: iFrame', code: embedCode.iframe, key: 'iframe' },
                { label: 'Option 3: Direct Link', code: embedCode.directUrl, key: 'direct' },
              ].map(opt => (
                <div key={opt.key} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{opt.label}</h3>
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm overflow-x-auto">{opt.code}</pre>
                    <button onClick={() => copyToClipboard(opt.code, opt.key)}
                      className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1 hover:bg-gray-600">
                      {copied === opt.key ? <><Check className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Preview</h3>
              <a href={embedCode.directUrl} target="_blank" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                <ExternalLink className="h-4 w-4" /> Open widget in new tab
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
