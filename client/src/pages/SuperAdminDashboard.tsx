import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

interface Stats { totalTenants: number; activeTenants: number; suspendedTenants: number; totalUsers: number; totalOrders: number; }
interface Tenant {
  id: string; name: string; email: string; slug: string; isActive: boolean; createdAt: string;
  _count: { users: number; orders: number };
  subscriptions: { plan: { name: string } }[];
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('sa_token');
  const admin = JSON.parse(localStorage.getItem('sa_admin') || '{}');

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, tenantsRes] = await Promise.all([
        api.get('/superadmin/stats', authHeaders),
        api.get('/superadmin/tenants', authHeaders),
      ]);
      setStats(statsRes.data);
      setTenants(tenantsRes.data);
    } catch {
      navigate('/superadmin/login');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) { navigate('/superadmin/login'); return; }
    fetchData();
  }, []);

  const toggleStatus = async (tenant: Tenant) => {
    setActionLoading(tenant.id);
    try {
      await api.patch(`/superadmin/tenants/${tenant.id}/status`, { isActive: !tenant.isActive }, authHeaders);
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, isActive: !t.isActive } : t));
      if (stats) setStats({ ...stats, activeTenants: stats.activeTenants + (tenant.isActive ? -1 : 1), suspendedTenants: stats.suspendedTenants + (tenant.isActive ? 1 : -1) });
    } finally {
      setActionLoading(null);
    }
  };

  const logout = () => { localStorage.removeItem('sa_token'); localStorage.removeItem('sa_admin'); navigate('/superadmin/login'); };

  const filtered = tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center font-bold text-sm">S</div>
          <div>
            <h1 className="font-bold text-lg">Super Admin Panel</h1>
            <p className="text-gray-400 text-xs">OMS Portal Control</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{admin.email}</span>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-red-400 transition-colors">Logout</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Tenants', value: stats.totalTenants, color: 'text-blue-400' },
              { label: 'Active', value: stats.activeTenants, color: 'text-green-400' },
              { label: 'Suspended', value: stats.suspendedTenants, color: 'text-red-400' },
              { label: 'Total Users', value: stats.totalUsers, color: 'text-purple-400' },
              { label: 'Total Orders', value: stats.totalOrders, color: 'text-yellow-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tenants */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between gap-4">
            <h2 className="font-semibold text-lg">Organisations</h2>
            <input
              className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:border-red-500"
              placeholder="Search by name or email..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                  <th className="text-left px-4 py-3">Organisation</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Plan</th>
                  <th className="text-left px-4 py-3">Users</th>
                  <th className="text-left px-4 py-3">Orders</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{t.name}</p>
                      <p className="text-gray-500 text-xs">{t.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{t.email}</td>
                    <td className="px-4 py-3 text-gray-300">{t.subscriptions[0]?.plan?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{t._count.users}</td>
                    <td className="px-4 py-3 text-gray-300">{t._count.orders}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${t.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                        {t.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(t)}
                        disabled={actionLoading === t.id}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${t.isActive ? 'bg-red-900/40 text-red-400 hover:bg-red-900/70' : 'bg-green-900/40 text-green-400 hover:bg-green-900/70'}`}
                      >
                        {actionLoading === t.id ? '...' : t.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No organisations found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
