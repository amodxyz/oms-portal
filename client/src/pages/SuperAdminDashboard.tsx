import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Modal, FormField, ConfirmDialog } from '../components/UI';
import { formatCurrency } from '../utils/helpers';

interface Stats { totalTenants: number; activeTenants: number; suspendedTenants: number; totalUsers: number; totalOrders: number; }
interface Tenant {
  id: string; name: string; email: string; slug: string; isActive: boolean; createdAt: string;
  _count: { users: number; orders: number };
  subscriptions: { plan: { name: string } }[];
}
interface Plan {
  id: string; name: string; description?: string; price: number;
  billingCycle: string; features: string[]; isActive: boolean;
  _count?: { subscriptions: number };
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tenants' | 'plans'>('tenants');
  const navigate = useNavigate();

  // Plan Form State
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: 0, billingCycle: 'MONTHLY', features: [''] });

  const token = localStorage.getItem('sa_token');
  const admin = JSON.parse(localStorage.getItem('sa_admin') || '{}');

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, tenantsRes, plansRes] = await Promise.all([
        api.get('/superadmin/stats', authHeaders),
        api.get('/superadmin/tenants', authHeaders),
        api.get('/superadmin/plans', authHeaders),
      ]);
      setStats(statsRes.data);
      setTenants(tenantsRes.data);
      setPlans(plansRes.data);
    } catch {
      navigate('/superadmin/login');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) { navigate('/superadmin/login'); return; }
    fetchData();
  }, [fetchData]);

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

  // Plan Management
  const openNewPlan = () => { setEditingPlan(null); setForm({ name: '', description: '', price: 0, billingCycle: 'MONTHLY', features: [''] }); setShowModal(true); };
  const openEditPlan = (p: Plan) => { setEditingPlan(p); setForm({ name: p.name, description: p.description || '', price: p.price, billingCycle: p.billingCycle, features: p.features }); setShowModal(true); };
  const addFeature = () => setForm(f => ({ ...f, features: [...f.features, ''] }));
  const removeFeature = (i: number) => setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));
  const updateFeature = (i: number, v: string) => setForm(f => ({ ...f, features: f.features.map((feat, idx) => idx === i ? v : feat) }));

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, features: form.features.filter(Boolean) };
    if (editingPlan) await api.put(`/superadmin/plans/${editingPlan.id}`, payload, authHeaders);
    else await api.post('/superadmin/plans', payload, authHeaders);
    setShowModal(false); fetchData();
  };

  const handleDeletePlan = async () => {
    if (!deleteId) return;
    await api.delete(`/superadmin/plans/${deleteId}`, authHeaders);
    setDeleteId(null); fetchData();
  };

  const cycleLabel = (c: string) => c === 'YEARLY' ? '/yr' : '/mo';

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

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            className={`px-4 py-2 font-semibold ${activeTab === 'tenants' ? 'text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('tenants')}
          >
            Organisations
          </button>
          <button
            className={`px-4 py-2 font-semibold ${activeTab === 'plans' ? 'text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('plans')}
          >
            SaaS Plans
          </button>
        </div>

        {activeTab === 'tenants' && (
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
        )}

        {activeTab === 'plans' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">SaaS Plans</h2>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors" onClick={openNewPlan}>
                ➕ SaaS Plan
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map(plan => (
                <div key={plan.id} className={`bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col ${!plan.isActive ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      {plan.description && <p className="text-sm text-gray-400 mt-0.5">{plan.description}</p>}
                    </div>
                    {!plan.isActive && <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-lg">Inactive</span>}
                  </div>
                  <div className="my-4">
                    <span className="text-3xl font-bold text-red-400">{formatCurrency(plan.price)}</span>
                    <span className="text-gray-400 text-sm">{cycleLabel(plan.billingCycle)}</span>
                    <span className="ml-2 px-2 py-1 bg-red-900/50 text-red-400 text-xs rounded-lg">{plan.billingCycle}</span>
                  </div>
                  <ul className="space-y-2 flex-1 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-green-500 font-bold">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <span className="text-xs text-gray-500">{plan._count?.subscriptions || 0} subscriptions</span>
                    <div className="flex gap-3">
                      <button onClick={() => openEditPlan(plan)} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                      <button onClick={() => setDeleteId(plan.id)} className="text-red-500 hover:text-red-400 text-sm">Deactivate</button>
                    </div>
                  </div>
                </div>
              ))}
              {plans.length === 0 && <div className="col-span-3 text-center py-10 text-gray-500">No plans created yet</div>}
            </div>
          </div>
        )}

      </div>

      {showModal && (
        <Modal title={editingPlan ? 'Edit Plan' : 'SaaS Plan'} onClose={() => setShowModal(false)}>
          <form onSubmit={handlePlanSubmit}>
            <div className="modal-body space-y-4 text-gray-900">
              <FormField label="Plan Name" required><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></FormField>
              <FormField label="Description"><input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Price" required><input className="input" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} required /></FormField>
                <FormField label="Billing Cycle">
                  <select className="input" value={form.billingCycle} onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value }))}>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="ONE_TIME">One Time</option>
                  </select>
                </FormField>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0 text-white">Features</label>
                  <button type="button" className="text-blue-400 hover:text-blue-300 text-xs py-1" onClick={addFeature}>+ Add</button>
                </div>
                {form.features.map((feat, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className="input flex-1" placeholder="e.g. Up to 10 users" value={feat} onChange={e => updateFeature(i, e.target.value)} />
                    {form.features.length > 1 && <button type="button" onClick={() => removeFeature(i)} className="text-red-500 px-2 font-bold text-lg hover:bg-gray-100 rounded">×</button>}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer border-t mt-4 pt-4 flex justify-end gap-2 bg-gray-800">
              <button type="button" className="px-4 py-2 text-sm text-gray-300 hover:text-white" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Save Plan</button>
            </div>
          </form>
        </Modal>
      )}
      {deleteId && <ConfirmDialog message="Deactivate this plan?" onConfirm={handleDeletePlan} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
