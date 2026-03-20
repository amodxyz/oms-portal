import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FormField } from '../components/UI';
import api from '../utils/api';

export function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', password: '', confirmPassword: '' });
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) { alert('Passwords do not match'); return; }
    const data: Record<string, string> = { name: form.name };
    if (form.password) data.password = form.password;
    await api.put('/auth/profile', data);
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Profile</h1></div>
      <div className="card max-w-lg">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">{user?.name?.charAt(0).toUpperCase()}</div>
          <div><p className="text-xl font-semibold">{user?.name}</p><p className="text-gray-500">{user?.email}</p><span className="badge badge-blue mt-1">{user?.role}</span></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Full Name"><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FormField>
          <FormField label="New Password"><input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Leave blank to keep current" /></FormField>
          <FormField label="Confirm Password"><input className="input" type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} /></FormField>
          <button type="submit" className="btn-primary">{saved ? '✅ Saved!' : 'Update Profile'}</button>
        </form>
      </div>
    </div>
  );
}

export function Settings() {
  const { user } = useAuth();
  const [users, setUsers] = useState<{ id: string; name: string; email: string; role: string; isActive: boolean }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF' });

  const loadUsers = () => { api.get('/auth/users').then(r => setUsers(r.data)); setLoaded(true); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/auth/users', form);
    setShowForm(false); loadUsers();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.put(`/auth/users/${id}`, { isActive: !isActive });
    loadUsers();
  };

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Settings</h1></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">System Information</h2>
          <div className="space-y-3 text-sm">
            {[{ label: 'System', value: 'OMS Portal v1.0' }, { label: 'Environment', value: 'Production' }, { label: 'Database', value: 'PostgreSQL' }, { label: 'API Version', value: 'v1' }].map(item => (
              <div key={item.label} className="flex justify-between py-2 border-b last:border-0">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {user?.role === 'ADMIN' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">User Management</h2>
              <div className="flex gap-2">
                {!loaded && <button className="btn-outline text-xs py-1" onClick={loadUsers}>Load Users</button>}
                <button className="btn-primary text-xs py-1" onClick={() => setShowForm(!showForm)}>+ Add User</button>
              </div>
            </div>
            {showForm && (
              <form onSubmit={handleCreate} className="space-y-3 mb-4 p-4 bg-gray-50 rounded-xl">
                <div className="grid grid-cols-2 gap-3">
                  <input className="input text-sm" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  <input className="input text-sm" placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  <input className="input text-sm" placeholder="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                  <select className="input text-sm" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="STAFF">Staff</option><option value="MANAGER">Manager</option><option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2"><button type="submit" className="btn-primary text-xs py-1">Create</button><button type="button" className="btn-secondary text-xs py-1" onClick={() => setShowForm(false)}>Cancel</button></div>
              </form>
            )}
            {loaded && (
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-gray-500">{u.email} • {u.role}</p></div>
                    <button onClick={() => toggleActive(u.id, u.isActive)} className={`text-xs px-2 py-1 rounded ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Active' : 'Inactive'}</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Verifications() {
  const checks = [
    { label: 'Database Connection', status: 'OK', icon: '🗄️' },
    { label: 'API Server', status: 'OK', icon: '🖥️' },
    { label: 'Authentication Service', status: 'OK', icon: '🔐' },
    { label: 'File Storage', status: 'OK', icon: '📁' },
    { label: 'Email Service', status: 'PENDING', icon: '📧' },
    { label: 'Payment Gateway', status: 'NOT_CONFIGURED', icon: '💳' },
  ];

  return (
    <div>
      <div className="page-header"><h1 className="page-title">System Verifications</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map(check => (
          <div key={check.label} className="card flex items-center gap-4">
            <span className="text-3xl">{check.icon}</span>
            <div className="flex-1"><p className="font-medium">{check.label}</p></div>
            <span className={`badge ${check.status === 'OK' ? 'badge-green' : check.status === 'PENDING' ? 'badge-yellow' : 'badge-gray'}`}>{check.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Integrations() {
  const integrations = [
    { name: 'ERP System', description: 'Connect to your ERP for seamless data sync', icon: '🏭', status: 'Available', color: 'bg-blue-50 border-blue-200' },
    { name: 'CRM Platform', description: 'Sync customer data with your CRM', icon: '👥', status: 'Available', color: 'bg-green-50 border-green-200' },
    { name: 'Payment Gateway', description: 'Accept payments via Stripe, PayPal, etc.', icon: '💳', status: 'Available', color: 'bg-purple-50 border-purple-200' },
    { name: 'Shipping API', description: 'Real-time shipping rates and tracking', icon: '🚚', status: 'Available', color: 'bg-orange-50 border-orange-200' },
    { name: 'Accounting Software', description: 'Sync with QuickBooks, Xero, etc.', icon: '📊', status: 'Available', color: 'bg-yellow-50 border-yellow-200' },
    { name: 'Email Marketing', description: 'Connect Mailchimp, SendGrid for campaigns', icon: '📧', status: 'Available', color: 'bg-pink-50 border-pink-200' },
    { name: 'Webhook API', description: 'Custom webhooks for real-time events', icon: '🔗', status: 'Active', color: 'bg-indigo-50 border-indigo-200' },
    { name: 'REST API', description: 'Full REST API access for custom integrations', icon: '⚡', status: 'Active', color: 'bg-teal-50 border-teal-200' },
  ];

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Integrations</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map(int => (
          <div key={int.name} className={`card border-2 ${int.color}`}>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{int.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{int.name}</h3>
                  <span className={`badge ${int.status === 'Active' ? 'badge-green' : 'badge-blue'}`}>{int.status}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{int.description}</p>
                <button className="btn-outline text-xs py-1">{int.status === 'Active' ? 'Configure' : 'Connect'}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
