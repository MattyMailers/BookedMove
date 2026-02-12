'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Truck, Home, Settings, DollarSign, BarChart3, Code2, LogOut, Calendar,
  Users, TrendingUp, ChevronRight, Copy, Check, ExternalLink, Search,
  Download, Eye, Edit3, Plus, X, ArrowUpDown, Loader2, Filter,
  Sliders, UserPlus, Trash2, Mail, ChevronDown, Menu, Tag, CalendarCheck,
  ChevronLeft, Globe
} from 'lucide-react';

interface Booking {
  id: number; booking_ref: string; status: string; customer_name: string; customer_email: string;
  customer_phone: string; origin_address: string; destination_address: string; move_date: string;
  time_slot: string; home_size: string; estimated_price: number; deposit_amount: number;
  deposit_paid: number; notes: string; created_at: string; coupon_code?: string; discount_amount?: number; time_window?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [tab, setTab] = useState('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [pricing, setPricing] = useState<any[]>([]);
  const [embedCode, setEmbedCode] = useState<any>(null);
  const [team, setTeam] = useState<any>({ members: [], invitations: [] });
  const [formConfig, setFormConfig] = useState<any>({ steps: {}, customQuestions: [] });
  const [copied, setCopied] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Coupons
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discount_type: 'percent', discount_value: 10, min_bedrooms: '', expiration_date: '', max_uses: '' });
  // Availability
  const [availDays, setAvailDays] = useState<any[]>([]);
  const [availMonth, setAvailMonth] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`; });

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) setToken(t);
  }, []);

  const headers = { Authorization: `Bearer ${token}` };

  const loadData = () => {
    if (!token) return;
    fetch('/api/company/bookings', { headers }).then(r => r.json()).then(d => setBookings(d.bookings || []));
    fetch('/api/company/analytics', { headers }).then(r => r.json()).then(d => setAnalytics(d));
    fetch('/api/company/settings', { headers }).then(r => r.json()).then(d => { setCompany(d.company); setSettings(d.settings); });
    fetch('/api/company/pricing', { headers }).then(r => r.json()).then(d => setPricing(d.rules || []));
    fetch('/api/company/embed', { headers }).then(r => r.json()).then(d => setEmbedCode(d));
    fetch('/api/company/team', { headers }).then(r => r.json()).then(d => setTeam(d)).catch(() => {});
    fetch('/api/company/form-config', { headers }).then(r => r.json()).then(d => setFormConfig(d.formConfig || { steps: {}, customQuestions: [] })).catch(() => {});
    fetch('/api/company/coupons', { headers }).then(r => r.json()).then(d => setCoupons(d.coupons || [])).catch(() => {});
    fetch('/api/company/availability', { headers }).then(r => r.json()).then(d => setAvailDays(d.days || [])).catch(() => {});
  };

  useEffect(() => { loadData(); }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginError('');
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
      method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules: pricing }),
    });
    setSaving(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    await fetch('/api/company/settings', {
      method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, settings }),
    });
    setSaving(false);
  };

  const saveFormConfig = async () => {
    setSaving(true);
    await fetch('/api/company/form-config', {
      method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ formConfig }),
    });
    setSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/company/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await r.json();
      if (d.url) { setCompany({ ...company, logo_url: d.url }); }
      else { alert(d.error || 'Upload failed'); }
    } catch { alert('Upload failed'); }
    setUploading(false);
  };

  const updateBookingStatus = async (id: number, status: string) => {
    await fetch(`/api/company/bookings/${id}`, {
      method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status } : b));
    if (selectedBooking?.id === id) setSelectedBooking({ ...selectedBooking, status });
  };

  const updateBookingNotes = async (id: number, notes: string) => {
    await fetch(`/api/company/bookings/${id}`, {
      method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
  };

  const inviteTeamMember = async () => {
    if (!inviteEmail) return;
    await fetch('/api/company/team', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    setInviteEmail('');
    loadData();
  };

  const removeTeamMember = async (memberId: number) => {
    await fetch('/api/company/team', {
      method: 'DELETE', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId }),
    });
    loadData();
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const createCoupon = async () => {
    setSaving(true);
    await fetch('/api/company/coupons', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: couponForm.code,
        discount_type: couponForm.discount_type,
        discount_value: couponForm.discount_value,
        min_bedrooms: couponForm.min_bedrooms ? parseInt(couponForm.min_bedrooms) : null,
        expiration_date: couponForm.expiration_date || null,
        max_uses: couponForm.max_uses ? parseInt(couponForm.max_uses) : null,
      }),
    });
    setCouponForm({ code: '', discount_type: 'percent', discount_value: 10, min_bedrooms: '', expiration_date: '', max_uses: '' });
    setShowCouponForm(false);
    setSaving(false);
    loadData();
  };

  const toggleCoupon = async (id: number, active: boolean) => {
    await fetch(`/api/company/coupons/${id}`, {
      method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    loadData();
  };

  const toggleAvailability = async (date: string, currentlyClosed: boolean) => {
    await fetch('/api/company/availability', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ overrides: [{ date, available: currentlyClosed, max_moves: null }] }),
    });
    loadData();
  };

  const filteredBookings = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.customer_name?.toLowerCase().includes(q) || b.booking_ref?.toLowerCase().includes(q) || b.customer_email?.toLowerCase().includes(q);
    }
    return true;
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 w-full max-w-md">
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
            {loginError && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{loginError}</div>}
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900" required />
            <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900" required />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">Sign In</button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            New here? <Link href="/signup" className="text-blue-600 font-medium hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'availability', label: 'Availability', icon: CalendarCheck },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'customize', label: 'Widget', icon: Sliders },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'embed', label: 'Embed Code', icon: Code2 },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const standaloneUrl = company?.slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${company.slug}` : '';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {company?.logo_url ? (
              <img src={company.logo_url} alt="" className="h-9 w-9 rounded-xl object-cover" />
            ) : (
              <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{company?.name || 'Dashboard'}</p>
              <p className="text-xs text-gray-400">BookedMove</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <t.icon className="h-4.5 w-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button onClick={() => { localStorage.removeItem('token'); setToken(''); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut className="h-4.5 w-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
          <span className="font-bold text-gray-900 text-sm">{company?.name || 'Dashboard'}</span>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ===== OVERVIEW ===== */}
        {tab === 'overview' && analytics && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Today', value: analytics.todayBookings, sub: `${analytics.weekBookings} this week`, icon: Calendar, color: 'blue' },
                { label: 'This Month', value: analytics.monthBookings, sub: `${analytics.confirmedMonth} confirmed`, icon: TrendingUp, color: 'green' },
                { label: 'Revenue', value: `$${analytics.revenue?.toLocaleString()}`, sub: 'confirmed bookings', icon: DollarSign, color: 'emerald' },
                { label: 'Conversion', value: `${analytics.conversionRate}%`, sub: `${analytics.widgetLoads || 0} widget loads`, icon: BarChart3, color: 'purple' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-500">{stat.label}</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                </div>
              ))}
            </div>

            {analytics.dailyBookings?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Bookings — Last 30 Days</h3>
                <div className="flex items-end gap-1 h-32">
                  {(() => {
                    const days: Record<string, number> = {};
                    analytics.dailyBookings.forEach((d: any) => { days[d.day] = Number(d.count); });
                    const maxVal = Math.max(...Object.values(days), 1);
                    const allDays = [];
                    for (let i = 29; i >= 0; i--) {
                      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
                      allDays.push({ day: d, count: days[d] || 0 });
                    }
                    return allDays.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.day}: ${d.count}`}>
                        <div className="w-full rounded-t-sm bg-blue-500 transition-all hover:bg-blue-600"
                          style={{ height: `${Math.max((d.count / maxVal) * 100, d.count > 0 ? 8 : 2)}%`, minHeight: d.count > 0 ? '4px' : '1px' }} />
                      </div>
                    ));
                  })()}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>30 days ago</span><span>Today</span>
                </div>
              </div>
            )}

            {analytics.dropoffs?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Widget Funnel</h3>
                <div className="space-y-2">
                  {analytics.dropoffs.map((d: any, i: number) => {
                    const max = Number(analytics.dropoffs[0]?.count || 1);
                    const pct = Math.round((Number(d.count) / max) * 100);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 w-20">Step {d.step}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${pct}%` }}>
                            <span className="text-xs text-white font-medium">{d.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
                <button onClick={() => setTab('bookings')} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  View all <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              {(analytics.recentBookings || []).length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">No bookings yet. Share your widget to start!</p>
              ) : (
                <div className="space-y-3">
                  {(analytics.recentBookings || []).slice(0, 5).map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{b.customer_name}</p>
                        <p className="text-sm text-gray-500">{b.move_date} • {b.booking_ref}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${b.estimated_price}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>
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

        {/* ===== BOOKINGS ===== */}
        {tab === 'bookings' && !selectedBooking && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or ref..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 focus:border-blue-500 focus:outline-none">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <a href="/api/company/bookings/export" className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
                onClick={e => { e.preventDefault(); window.open(`/api/company/bookings/export`, '_blank'); }}>
                <Download className="h-4 w-4" /> CSV
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {filteredBookings.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No bookings found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Ref', 'Customer', 'Date', 'Size', 'Price', 'Status', ''].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredBookings.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setSelectedBooking(b)}>
                          <td className="px-4 py-3 font-mono text-sm text-blue-600">{b.booking_ref}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900 text-sm">{b.customer_name}</p>
                            <p className="text-xs text-gray-500">{b.customer_email}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{b.move_date}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{b.home_size || '-'}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">${b.estimated_price}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-4 py-3"><ChevronRight className="h-4 w-4 text-gray-400" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking Detail */}
        {tab === 'bookings' && selectedBooking && (
          <div className="space-y-4">
            <button onClick={() => setSelectedBooking(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
              ← Back to bookings
            </button>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedBooking.customer_name}</h2>
                      <p className="text-sm text-gray-500 font-mono">{selectedBooking.booking_ref}</p>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[selectedBooking.status] || 'bg-gray-100 text-gray-700'}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {[
                      ['Email', selectedBooking.customer_email],
                      ['Phone', selectedBooking.customer_phone || '-'],
                      ['Move Date', selectedBooking.move_date],
                      ['Time', selectedBooking.time_slot || selectedBooking.time_window || '-'],
                      ['Home Size', selectedBooking.home_size || '-'],
                      ['Estimate', `$${selectedBooking.estimated_price}`],
                      ['From', selectedBooking.origin_address],
                      ['To', selectedBooking.destination_address],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <p className="text-gray-500 mb-1">{l}</p>
                        <p className="font-medium text-gray-900">{v}</p>
                      </div>
                    ))}
                    {selectedBooking.coupon_code && (
                      <div>
                        <p className="text-gray-500 mb-1">Coupon</p>
                        <p className="font-medium text-gray-900">{selectedBooking.coupon_code} (-${selectedBooking.discount_amount})</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                  <textarea
                    defaultValue={selectedBooking.notes || ''}
                    onBlur={e => updateBookingNotes(selectedBooking.id, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 h-28 resize-none"
                    placeholder="Add internal notes..."
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>
                  <div className="space-y-2">
                    {['pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                      <button key={s} onClick={() => updateBookingStatus(selectedBooking.id, s)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          selectedBooking.status === s
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== AVAILABILITY ===== */}
        {tab === 'availability' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Availability Calendar</h2>
                  <p className="text-sm text-gray-500">Click a date to toggle it open/closed. Capacity: {settings?.max_moves_per_day || 3} moves/day</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    const [y, m] = availMonth.split('-').map(Number);
                    const d = new Date(y, m - 2, 1);
                    setAvailMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                  }} className="p-2 rounded-lg hover:bg-gray-100"><ChevronLeft className="h-4 w-4" /></button>
                  <span className="text-sm font-medium text-gray-700 w-28 text-center">
                    {new Date(availMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={() => {
                    const [y, m] = availMonth.split('-').map(Number);
                    const d = new Date(y, m, 1);
                    setAvailMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                  }} className="p-2 rounded-lg hover:bg-gray-100"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const [y, m] = availMonth.split('-').map(Number);
                  const firstDay = new Date(y, m - 1, 1).getDay();
                  const daysInMonth = new Date(y, m, 0).getDate();
                  const cells = [];

                  // Empty cells for days before month starts
                  for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />);

                  for (let d = 1; d <= daysInMonth; d++) {
                    const ds = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const day = availDays.find((ad: any) => ad.date === ds);
                    const booked = day?.booked || 0;
                    const capacity = day?.capacity || (settings?.max_moves_per_day || 3);
                    const closed = day?.closed;
                    const isPast = new Date(ds) < new Date(new Date().toISOString().split('T')[0]);

                    let bg = 'bg-green-50 hover:bg-green-100 border-green-200';
                    let dot = '🟢';
                    if (closed) { bg = 'bg-gray-100 border-gray-300'; dot = '⛔'; }
                    else if (booked >= capacity) { bg = 'bg-red-50 border-red-200'; dot = '🔴'; }
                    else if (booked >= capacity - 1) { bg = 'bg-yellow-50 border-yellow-200'; dot = '🟡'; }

                    if (isPast) { bg = 'bg-gray-50 border-gray-100'; dot = ''; }

                    cells.push(
                      <button key={ds} disabled={isPast}
                        onClick={() => !isPast && toggleAvailability(ds, !!closed)}
                        className={`p-2 rounded-xl border text-center transition-all ${bg} ${isPast ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}>
                        <div className="text-sm font-medium text-gray-700">{d}</div>
                        <div className="text-xs text-gray-500">{booked}/{capacity}</div>
                        {dot && <div className="text-[10px] leading-none">{dot}</div>}
                      </button>
                    );
                  }
                  return cells;
                })()}
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <span>🟢 Available</span>
                <span>🟡 Limited</span>
                <span>🔴 Full</span>
                <span>⛔ Closed</span>
              </div>
            </div>

            {/* Availability Settings */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Capacity Settings</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Max Moves/Day</label>
                  <input type="number" value={settings?.max_moves_per_day || 3}
                    onChange={e => setSettings({ ...settings, max_moves_per_day: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">AM Window Capacity</label>
                  <input type="number" value={settings?.max_moves_am || 3}
                    onChange={e => setSettings({ ...settings, max_moves_am: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">PM Window Capacity</label>
                  <input type="number" value={settings?.max_moves_pm || 2}
                    onChange={e => setSettings({ ...settings, max_moves_pm: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <button onClick={saveSettings} disabled={saving}
                className="mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}

        {/* ===== COUPONS ===== */}
        {tab === 'coupons' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Promo Codes</h2>
                  <p className="text-sm text-gray-500">Create discount codes for your customers</p>
                </div>
                <button onClick={() => setShowCouponForm(!showCouponForm)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" /> New Coupon
                </button>
              </div>

              {showCouponForm && (
                <div className="border-2 border-blue-100 bg-blue-50/30 rounded-xl p-5 mb-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Code</label>
                      <input type="text" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        placeholder="SUMMER10" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none uppercase" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                      <select value={couponForm.discount_type} onChange={e => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none">
                        <option value="percent">Percentage Off</option>
                        <option value="flat">Flat $ Off/Hour</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        {couponForm.discount_type === 'percent' ? 'Discount %' : 'Discount $/hr'}
                      </label>
                      <input type="number" value={couponForm.discount_value} onChange={e => setCouponForm({ ...couponForm, discount_value: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Min Bedrooms (optional)</label>
                      <input type="number" value={couponForm.min_bedrooms} onChange={e => setCouponForm({ ...couponForm, min_bedrooms: e.target.value })}
                        placeholder="Any" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Expiration (optional)</label>
                      <input type="date" value={couponForm.expiration_date} onChange={e => setCouponForm({ ...couponForm, expiration_date: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Max Uses (optional)</label>
                      <input type="number" value={couponForm.max_uses} onChange={e => setCouponForm({ ...couponForm, max_uses: e.target.value })}
                        placeholder="Unlimited" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={createCoupon} disabled={!couponForm.code || saving}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                      {saving ? 'Creating...' : 'Create Coupon'}
                    </button>
                    <button onClick={() => setShowCouponForm(false)} className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {coupons.length === 0 ? (
                <p className="text-gray-400 text-sm py-8 text-center">No coupons yet. Create one to get started!</p>
              ) : (
                <div className="space-y-3">
                  {coupons.map((c: any) => (
                    <div key={c.id} className={`flex items-center justify-between p-4 rounded-xl border ${c.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-mono font-bold text-sm">{c.code}</div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {c.discount_type === 'percent' ? `${c.discount_value}% off` : `$${c.discount_value} off/hr`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Used {c.times_used}x
                            {c.max_uses && ` / ${c.max_uses} max`}
                            {c.expiration_date && ` • Expires ${c.expiration_date}`}
                            {c.min_bedrooms && ` • Min ${c.min_bedrooms} bed`}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => toggleCoupon(c.id, !c.active)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium ${c.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {c.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== PRICING ===== */}
        {tab === 'pricing' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Pricing Rules</h2>
              <button onClick={savePricing} disabled={saving}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Move Size', 'Bedrooms', 'Base Price', 'Hourly Rate', 'Min Hours', 'Crew'].map(h => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pricing.map((rule, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-3 py-3 font-medium text-gray-900 text-sm">{rule.move_size}</td>
                      <td className="px-3 py-3 text-gray-700 text-sm">{rule.bedrooms}</td>
                      {(['base_price', 'hourly_rate', 'min_hours', 'crew_size'] as const).map(field => (
                        <td key={field} className="px-3 py-3">
                          <input type="number" value={rule[field]}
                            onChange={e => { const u = [...pricing]; (u[i] as any)[field] = parseFloat(e.target.value) || 0; setPricing(u); }}
                            className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== WIDGET CUSTOMIZATION ===== */}
        {tab === 'customize' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Widget Steps</h2>
                  <p className="text-sm text-gray-500">Toggle steps on or off in your booking widget</p>
                </div>
                <button onClick={saveFormConfig} disabled={saving}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'addresses', label: 'Addresses', desc: 'Origin & destination', required: true },
                  { id: 'dateTime', label: 'Date & Time', desc: 'Move date and time slot' },
                  { id: 'homeSize', label: 'Home Size', desc: 'Bedrooms / size selection' },
                  { id: 'squareFootage', label: 'Square Footage', desc: 'Sqft slider (500-5000+)' },
                  { id: 'fullness', label: 'Home Fullness', desc: 'How full is your home (25%-125%)' },
                  { id: 'estimate', label: 'Price Estimate', desc: 'Show estimated price', required: true },
                  { id: 'contactInfo', label: 'Contact Info', desc: 'Name, email, phone', required: true },
                ].map(s => (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{s.label}</p>
                      <p className="text-sm text-gray-500">{s.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox"
                        checked={s.required || formConfig.steps?.[s.id] !== false}
                        disabled={s.required}
                        onChange={e => setFormConfig({ ...formConfig, steps: { ...formConfig.steps, [s.id]: e.target.checked } })}
                        className="sr-only peer" />
                      <div className={`w-11 h-6 rounded-full peer-checked:bg-blue-600 ${s.required ? 'bg-blue-400 opacity-60' : 'bg-gray-300'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`} />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Custom Questions</h2>
                  <p className="text-sm text-gray-500">Add your own questions to the booking form</p>
                </div>
                <button onClick={() => setFormConfig({
                  ...formConfig,
                  customQuestions: [...(formConfig.customQuestions || []), { id: Date.now().toString(), label: '', type: 'text', options: [] }]
                })} className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Plus className="h-4 w-4" /> Add Question
                </button>
              </div>
              {(formConfig.customQuestions || []).length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">No custom questions yet</p>
              ) : (
                <div className="space-y-4">
                  {(formConfig.customQuestions || []).map((q: any, i: number) => (
                    <div key={q.id} className="p-4 border-2 border-gray-200 rounded-xl space-y-3">
                      <div className="flex gap-3">
                        <input type="text" value={q.label} placeholder="Question label"
                          onChange={e => {
                            const qs = [...formConfig.customQuestions];
                            qs[i] = { ...qs[i], label: e.target.value };
                            setFormConfig({ ...formConfig, customQuestions: qs });
                          }}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
                        <select value={q.type}
                          onChange={e => {
                            const qs = [...formConfig.customQuestions];
                            qs[i] = { ...qs[i], type: e.target.value };
                            setFormConfig({ ...formConfig, customQuestions: qs });
                          }}
                          className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-700 focus:border-blue-500 focus:outline-none">
                          <option value="text">Text</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="checkbox">Checkbox</option>
                        </select>
                        <button onClick={() => setFormConfig({
                          ...formConfig,
                          customQuestions: formConfig.customQuestions.filter((_: any, j: number) => j !== i)
                        })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {q.type === 'dropdown' && (
                        <input type="text" placeholder="Options (comma separated)"
                          value={(q.options || []).join(', ')}
                          onChange={e => {
                            const qs = [...formConfig.customQuestions];
                            qs[i] = { ...qs[i], options: e.target.value.split(',').map((s: string) => s.trim()) };
                            setFormConfig({ ...formConfig, customQuestions: qs });
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== TEAM ===== */}
        {tab === 'team' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Invite Team Member</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  placeholder="team@company.com"
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900" />
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 focus:border-blue-500 focus:outline-none">
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={inviteTeamMember}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  <UserPlus className="h-4 w-4" /> Invite
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Team Members</h2>
              <div className="space-y-3">
                {(team.members || []).map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {(m.name || m.email)?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{m.name || m.email}</p>
                        <p className="text-sm text-gray-500">{m.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        m.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                        m.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>{m.role}</span>
                      {m.role !== 'owner' && (
                        <button onClick={() => removeTeamMember(m.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(team.invitations || []).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Invitations</h2>
                <div className="space-y-3">
                  {team.invitations.filter((i: any) => !i.accepted).map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-gray-900">{inv.email}</p>
                          <p className="text-sm text-gray-500">Invited as {inv.role}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== SETTINGS ===== */}
        {tab === 'settings' && company && settings && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Branding</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Company Name</label>
                  <input type="text" value={company.name || ''} onChange={e => setCompany({ ...company, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Company Logo</label>
                  <div className="flex items-center gap-4">
                    {company.logo_url && (
                      <img src={company.logo_url} alt="Logo" className="h-12 w-12 rounded-xl object-cover border-2 border-gray-200" />
                    )}
                    <label className={`flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-50 ${uploading ? 'opacity-50' : ''}`}>
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      {company.logo_url ? 'Change' : 'Upload'}
                      <input type="file" accept="image/jpeg,image/png,image/svg+xml,image/webp" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Primary Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={company.primary_color || '#2563eb'} onChange={e => setCompany({ ...company, primary_color: e.target.value })}
                      className="h-11 w-11 rounded-lg cursor-pointer border-2 border-gray-200" />
                    <input type="text" value={company.primary_color || ''} onChange={e => setCompany({ ...company, primary_color: e.target.value })}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Accent Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={company.accent_color || '#1e40af'} onChange={e => setCompany({ ...company, accent_color: e.target.value })}
                      className="h-11 w-11 rounded-lg cursor-pointer border-2 border-gray-200" />
                    <input type="text" value={company.accent_color || ''} onChange={e => setCompany({ ...company, accent_color: e.target.value })}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pricing & Deposit</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Base Rate ($/hr)</label>
                  <input type="number" value={settings.base_rate_per_hour || ''} onChange={e => setSettings({ ...settings, base_rate_per_hour: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Min Hours</label>
                  <input type="number" value={settings.min_hours || ''} onChange={e => setSettings({ ...settings, min_hours: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Deposit Type</label>
                  <select value={settings.deposit_type || 'flat'} onChange={e => setSettings({ ...settings, deposit_type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none">
                    <option value="flat">Flat Amount ($)</option>
                    <option value="percent">Percentage (%)</option>
                    <option value="hourly">Hours-Based</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {settings.deposit_type === 'percent' ? 'Deposit %' : settings.deposit_type === 'hourly' ? 'Number of Hours' : 'Deposit Amount ($)'}
                  </label>
                  <input type="number" value={settings.deposit_amount || ''} onChange={e => setSettings({ ...settings, deposit_amount: parseFloat(e.target.value) })}
                    placeholder={settings.deposit_type === 'percent' ? '25' : settings.deposit_type === 'hourly' ? '1' : '100'}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                  <p className="text-xs text-gray-400 mt-1">
                    {settings.deposit_type === 'percent' ? 'Percentage of estimated total' : settings.deposit_type === 'hourly' ? 'Deposit = hours × hourly rate' : 'Fixed dollar amount'}
                  </p>
                </div>
              </div>
            </div>

            {/* Time Windows */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Time Windows</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Primary Window (AM)</label>
                  <input type="text" value={settings.default_time_window || '8:30 AM - 12:00 PM'}
                    onChange={e => setSettings({ ...settings, default_time_window: e.target.value })}
                    placeholder="8:30 AM - 12:00 PM"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Enable Secondary Window (PM)</p>
                    <p className="text-sm text-gray-500">Offer an afternoon time window</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={!!settings.secondary_window_enabled}
                      onChange={e => setSettings({ ...settings, secondary_window_enabled: e.target.checked })}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>
                {settings.secondary_window_enabled && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Secondary Window (PM)</label>
                    <input type="text" value={settings.secondary_time_window || '1:00 PM - 5:00 PM'}
                      onChange={e => setSettings({ ...settings, secondary_time_window: e.target.value })}
                      placeholder="1:00 PM - 5:00 PM"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Integrations</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Google Maps API Key</label>
                  <input type="password" value={settings.google_maps_key || ''} onChange={e => setSettings({ ...settings, google_maps_key: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" placeholder={settings.google_maps_key_set ? '****' : 'Enter API key'} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">SmartMoving API Key</label>
                  <input type="password" value={settings.smartmoving_api_key || ''} onChange={e => setSettings({ ...settings, smartmoving_api_key: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" placeholder={settings.smartmoving_api_key_set ? '****' : 'Enter API key'} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">SmartMoving Client ID</label>
                  <input type="text" value={settings.smartmoving_client_id || ''} onChange={e => setSettings({ ...settings, smartmoving_client_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Stripe Connect Account</label>
                  <input type="text" value={settings.stripe_connect_account_id || ''} onChange={e => setSettings({ ...settings, stripe_connect_account_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" placeholder="acct_..." />
                </div>
              </div>
            </div>

            {/* Payment Gateway */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Gateway (Authorize.net)</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Enable Payments</p>
                    <p className="text-sm text-gray-500">Collect deposits or full payment through your widget</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={!!settings.payment_enabled}
                      onChange={e => setSettings({ ...settings, payment_enabled: e.target.checked })}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>
                {settings.payment_enabled && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">API Login ID</label>
                        <input type="password" value={settings.authorize_net_login_id || ''} onChange={e => setSettings({ ...settings, authorize_net_login_id: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none"
                          placeholder={settings.authorize_net_login_id_set ? '****' : 'Enter Login ID'} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Transaction Key</label>
                        <input type="password" value={settings.authorize_net_transaction_key || ''} onChange={e => setSettings({ ...settings, authorize_net_transaction_key: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none"
                          placeholder={settings.authorize_net_transaction_key_set ? '****' : 'Enter Transaction Key'} />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Payment Mode</label>
                        <select value={settings.payment_mode || 'deposit'} onChange={e => setSettings({ ...settings, payment_mode: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none">
                          <option value="deposit">Deposit Only</option>
                          <option value="full">Full Estimated Amount</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Payment Timing</label>
                        <select value={settings.payment_timing || 'at_booking'} onChange={e => setSettings({ ...settings, payment_timing: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none">
                          <option value="at_booking">At Booking (in widget)</option>
                          <option value="later">Later (manual)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Custom Domain */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Custom Booking Domain</h2>
              <p className="text-sm text-gray-500 mb-4">Use your own domain for the standalone booking page</p>
              <div className="space-y-3">
                <input type="text" value={settings.custom_domain || ''} onChange={e => setSettings({ ...settings, custom_domain: e.target.value })}
                  placeholder="book.yourcompany.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none" />
                {settings.custom_domain && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-sm font-medium text-blue-800 mb-2">DNS Setup Instructions:</p>
                    <p className="text-sm text-blue-700">Add a <strong>CNAME</strong> record for <code className="bg-blue-100 px-1.5 py-0.5 rounded">{settings.custom_domain}</code> pointing to:</p>
                    <code className="block mt-2 bg-blue-100 px-3 py-2 rounded-lg text-sm text-blue-900 font-mono">cname.vercel-dns.com</code>
                  </div>
                )}
              </div>
            </div>

            {/* Custom CSS */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Custom Widget CSS</h2>
              <p className="text-sm text-gray-500 mb-4">Add custom CSS to further style your booking widget</p>
              <textarea value={settings.custom_css || ''} onChange={e => setSettings({ ...settings, custom_css: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none font-mono text-sm h-28 resize-none"
                placeholder=".bm-widget { /* your styles */ }" />
            </div>

            <button onClick={saveSettings} disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        )}

        {/* ===== EMBED ===== */}
        {tab === 'embed' && embedCode && (
          <div className="space-y-6">
            {/* Standalone URL */}
            {standaloneUrl && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Standalone Booking Page</h2>
                <p className="text-sm text-gray-500 mb-4">Share this link in texts, ads, and social media — no website needed.</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-50 px-4 py-3 rounded-xl text-sm font-mono text-gray-700 truncate border border-gray-200">
                    {standaloneUrl}
                  </div>
                  <button onClick={() => copyToClipboard(standaloneUrl, 'standalone')}
                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
                    {copied === 'standalone' ? <><Check className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy Link</>}
                  </button>
                  <a href={standaloneUrl} target="_blank"
                    className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <ExternalLink className="h-4 w-4" /> Preview
                  </a>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Embed Your Booking Widget</h2>
              <p className="text-gray-500 text-sm mb-6">Copy one of these code snippets and paste it into your website.</p>
              {[
                { label: 'Script Tag (Recommended)', code: embedCode.script, key: 'script' },
                { label: 'iFrame', code: embedCode.iframe, key: 'iframe' },
                { label: 'Direct Link', code: embedCode.directUrl, key: 'direct' },
              ].map(opt => (
                <div key={opt.key} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{opt.label}</h3>
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm overflow-x-auto">{opt.code}</pre>
                    <button onClick={() => copyToClipboard(opt.code, opt.key)}
                      className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 hover:bg-gray-600">
                      {copied === opt.key ? <><Check className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Preview & Share</h3>
              <div className="space-y-3">
                <a href={standaloneUrl} target="_blank" className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium">
                  <ExternalLink className="h-4 w-4" /> Open standalone booking page
                </a>
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                  <input readOnly value={standaloneUrl} className="flex-1 bg-transparent text-sm text-gray-700 outline-none truncate" />
                  <button onClick={() => { navigator.clipboard.writeText(standaloneUrl); }} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
                    Copy Link
                  </button>
                </div>
                <p className="text-xs text-gray-400">Share this link in ads, texts, social media, or anywhere your customers can click.</p>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
