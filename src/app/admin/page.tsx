'use client';

import { useEffect, useState } from 'react';
import { Truck, Shield, Users, DollarSign, BarChart3, LogOut, Calendar, TrendingUp, ExternalLink } from 'lucide-react';

interface Company {
  id: number; name: string; slug: string; subscription_status: string; subscription_plan: string;
  created_at: string; booking_count: number; confirmed_count: number;
}

interface Stats {
  totalCompanies: number; activeCompanies: number; totalBookings: number; totalRevenue: number; mrr: number;
}

export default function AdminPortal() {
  const [token, setToken] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    fetch('/api/admin/companies', { headers }).then(r => r.json()).then(d => setCompanies(d.companies || []));
    fetch('/api/admin/stats', { headers }).then(r => r.json()).then(d => setStats(d));
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPass }),
    });
    const data = await res.json();
    if (data.token) { localStorage.setItem('admin_token', data.token); setToken(data.token); }
    else setLoginError(data.error || 'Login failed');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BookedMove Admin</h1>
              <p className="text-sm text-gray-400">Internal Portal</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && <div className="p-3 bg-red-900/30 text-red-400 rounded-lg text-sm">{loginError}</div>}
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none" required />
            <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Password"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none" required />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-400" />
            <span className="font-bold">BookedMove Admin</span>
          </div>
          <button onClick={() => { localStorage.removeItem('admin_token'); setToken(''); }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Companies', value: stats.totalCompanies, icon: Users },
              { label: 'Active', value: stats.activeCompanies, icon: TrendingUp },
              { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar },
              { label: 'Deposits Collected', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign },
              { label: 'MRR', value: `$${stats.mrr.toLocaleString()}`, icon: BarChart3 },
            ].map(s => (
              <div key={s.label} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-400">{s.label}</span>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Companies Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-bold">All Companies</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-750">
                <tr className="border-b border-gray-700">
                  {['Company', 'Slug', 'Status', 'Bookings', 'Confirmed', 'Created', 'Widget'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {companies.map(c => (
                  <tr key={c.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-sm text-blue-400">{c.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        c.subscription_status === 'active' ? 'bg-green-900/50 text-green-400' :
                        c.subscription_status === 'trial' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-gray-700 text-gray-400'
                      }`}>{c.subscription_status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{c.booking_count}</td>
                    <td className="px-4 py-3 text-gray-300">{c.confirmed_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <a href={`/widget/${c.slug}`} target="_blank" className="text-blue-400 hover:text-blue-300">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
