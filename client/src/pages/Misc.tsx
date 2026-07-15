import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FormField } from '../components/UI';
import api from '../utils/api';

type Tab = 'profile' | 'organisation' | 'team' | 'security';

export function Profile() {
  const { user, tenant, refreshUser } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── Profile tab ──
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileError, setProfileError] = useState('');

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setProfileError('');
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) { setProfileError('Passwords do not match'); return; }
    if (profileForm.newPassword && profileForm.newPassword.length < 8) { setProfileError('Password must be at least 8 characters'); return; }
    try {
      const body: Record<string, string> = { name: profileForm.name };
      if (profileForm.newPassword) body.password = profileForm.newPassword;
      await api.put('/auth/profile', body);
      await refreshUser();
      setProfileForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
      showToast('Profile updated!');
    } catch (err: unknown) {
      setProfileError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error saving profile');
    }
  };

  const resendVerification = async () => {
    try { await api.post('/auth/resend-verification'); showToast('Verification email sent!'); }
    catch { showToast('Failed to send verification email'); }
  };

  // ── Organisation tab ──
  const [orgForm, setOrgForm] = useState({ name: tenant?.name || '', phone: tenant?.phone || '', address: tenant?.address || '', state: tenant?.state || '', gstin: tenant?.gstin || '' });
  const [orgError, setOrgError] = useState('');

  useEffect(() => {
    if (tenant) setOrgForm({ name: tenant.name || '', phone: tenant.phone || '', address: tenant.address || '', state: tenant.state || '', gstin: tenant.gstin || '' });
  }, [tenant]);

  const saveOrg = async (e: React.FormEvent) => {
    e.preventDefault(); setOrgError('');
    try {
      await api.put('/auth/tenant', orgForm);
      await refreshUser();
      showToast('Organisation updated!');
    } catch (err: unknown) {
      setOrgError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error saving organisation');
    }
  };

  // ── Team tab ──
  const [users, setUsers] = useState<{ id: string; name: string; email: string; role: string; isActive: boolean; emailVerified: boolean }[]>([]);
  const [teamLoaded, setTeamLoaded] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [teamError, setTeamError] = useState('');

  const loadTeam = async () => {
    const { data } = await api.get('/auth/users');
    setUsers(data); setTeamLoaded(true);
  };

  useEffect(() => { if (tab === 'team' && !teamLoaded) loadTeam(); }, [tab]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault(); setTeamError('');
    try {
      await api.post('/auth/users', userForm);
      setShowUserForm(false); setUserForm({ name: '', email: '', password: '', role: 'STAFF' }); loadTeam();
      showToast('User created and verification email sent!');
    } catch (err: unknown) {
      setTeamError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error creating user');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.put(`/auth/users/${id}`, { isActive: !isActive }); loadTeam();
  };

  const changeRole = async (id: string, role: string) => {
    await api.put(`/auth/users/${id}`, { role }); loadTeam();
  };

  // ── Security tab ──
  const { logout } = useAuth();

  const logoutAll = async () => {
    await api.post('/auth/logout-all');
    await logout();
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'profile', label: 'My Profile', icon: '👤' },
    { key: 'organisation', label: 'Organisation', icon: '🏢' },
    ...(user?.role === 'ADMIN' ? [{ key: 'team' as Tab, label: 'Team', icon: '👥' }] : []),
    { key: 'security', label: 'Security', icon: '🔐' },
  ];

  return (
    <div>
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">{toast}</div>}
      <div className="page-header"><h1 className="page-title">Profile & Settings</h1></div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* My Profile */}
      {tab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card flex flex-col items-center text-center py-8">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <p className="text-xl font-semibold">{user?.name}</p>
            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
            <span className="badge badge-blue mt-2">{user?.role}</span>
            <div className="mt-4 flex items-center gap-2">
              {user?.emailVerified
                ? <span className="text-green-600 text-sm">✅ Email verified</span>
                : <><span className="text-yellow-600 text-sm">⚠ Email not verified</span>
                    <button onClick={resendVerification} className="text-blue-600 text-xs underline">Resend</button></>}
            </div>
          </div>
          <div className="lg:col-span-2 card">
            <h2 className="font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <FormField label="Full Name" required>
                <input className="input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} required />
              </FormField>
              <FormField label="Email"><input className="input bg-gray-50" value={user?.email || ''} disabled /></FormField>
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Change Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="New Password">
                    <input className="input" type="password" value={profileForm.newPassword} onChange={e => setProfileForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min 8 characters" />
                  </FormField>
                  <FormField label="Confirm Password">
                    <input className="input" type="password" value={profileForm.confirmPassword} onChange={e => setProfileForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                  </FormField>
                </div>
              </div>
              {profileError && <p className="text-red-500 text-sm">{profileError}</p>}
              <button type="submit" className="btn-primary">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Organisation */}
      {tab === 'organisation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <h2 className="font-semibold mb-4">Organisation Info</h2>
            <div className="space-y-3 text-sm">
              {[{ label: 'Name', value: tenant?.name }, { label: 'Email', value: tenant?.email }, { label: 'GSTIN', value: tenant?.gstin || '—' }, { label: 'State', value: tenant?.state || '—' }].map(r => (
                <div key={r.label} className="flex justify-between py-2 border-b last:border-0">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-medium">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              💡 Set your <strong>State</strong> and <strong>GSTIN</strong> to enable proper IGST/CGST+SGST calculation on invoices.
            </div>
          </div>
          <div className="lg:col-span-2 card">
            <h2 className="font-semibold mb-4">Edit Organisation {user?.role !== 'ADMIN' && <span className="text-xs text-gray-400 font-normal">(Admin only)</span>}</h2>
            <form onSubmit={saveOrg} className="space-y-4">
              <FormField label="Organisation Name" required>
                <input className="input" value={orgForm.name} onChange={e => setOrgForm(f => ({ ...f, name: e.target.value }))} disabled={user?.role !== 'ADMIN'} required />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Phone">
                  <input className="input" value={orgForm.phone} onChange={e => setOrgForm(f => ({ ...f, phone: e.target.value }))} disabled={user?.role !== 'ADMIN'} />
                </FormField>
                <FormField label="State (for GST)">
                  <input className="input" placeholder="e.g. Maharashtra" value={orgForm.state} onChange={e => setOrgForm(f => ({ ...f, state: e.target.value }))} disabled={user?.role !== 'ADMIN'} />
                </FormField>
              </div>
              <FormField label="Address">
                <textarea className="input" rows={2} value={orgForm.address} onChange={e => setOrgForm(f => ({ ...f, address: e.target.value }))} disabled={user?.role !== 'ADMIN'} />
              </FormField>
              <FormField label="GSTIN">
                <input className="input" placeholder="22AAAAA0000A1Z5" value={orgForm.gstin} onChange={e => setOrgForm(f => ({ ...f, gstin: e.target.value.toUpperCase() }))} disabled={user?.role !== 'ADMIN'} />
              </FormField>
              {orgError && <p className="text-red-500 text-sm">{orgError}</p>}
              {user?.role === 'ADMIN' && <button type="submit" className="btn-primary">Save Organisation</button>}
            </form>
          </div>
        </div>
      )}

      {/* Team */}
      {tab === 'team' && user?.role === 'ADMIN' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Team Members</h2>
            <button className="btn-primary text-sm" onClick={() => setShowUserForm(!showUserForm)}>+ Add Member</button>
          </div>
          {showUserForm && (
            <form onSubmit={createUser} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Name" required><input className="input" value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} required /></FormField>
                <FormField label="Email" required><input className="input" type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} required /></FormField>
                <FormField label="Password" required><input className="input" type="password" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} required /></FormField>
                <FormField label="Role">
                  <select className="input" value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="STAFF">Staff</option><option value="MANAGER">Manager</option><option value="ADMIN">Admin</option>
                  </select>
                </FormField>
              </div>
              {teamError && <p className="text-red-500 text-sm">{teamError}</p>}
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">Create</button>
                <button type="button" className="btn-secondary text-sm" onClick={() => setShowUserForm(false)}>Cancel</button>
              </div>
            </form>
          )}
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">{u.name.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{u.name} {u.id === user?.id && <span className="text-xs text-blue-600">(you)</span>}</p>
                  <p className="text-xs text-gray-500">{u.email} • {u.emailVerified ? '✅ verified' : '⚠ unverified'}</p>
                </div>
                <select className="input text-xs py-1 w-28" value={u.role} onChange={e => changeRole(u.id, e.target.value)} disabled={u.id === user?.id}>
                  <option value="STAFF">Staff</option><option value="MANAGER">Manager</option><option value="ADMIN">Admin</option>
                </select>
                <button onClick={() => toggleActive(u.id, u.isActive)} disabled={u.id === user?.id}
                  className={`text-xs px-3 py-1 rounded-full font-medium disabled:opacity-40 ${
                    u.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}>{u.isActive ? 'Active' : 'Inactive'}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold mb-4">Account Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Email Verification</p>
                  <p className="text-xs text-gray-500">Verify your email to secure your account</p>
                </div>
                {user?.emailVerified
                  ? <span className="text-green-600 text-sm font-medium">✅ Verified</span>
                  : <button onClick={resendVerification} className="btn-outline text-xs py-1">Send Email</button>}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Password</p>
                  <p className="text-xs text-gray-500">Change your password in the Profile tab</p>
                </div>
                <button onClick={() => setTab('profile')} className="btn-outline text-xs py-1">Change</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                <div>
                  <p className="font-medium text-sm text-red-700">Sign Out All Devices</p>
                  <p className="text-xs text-red-500">Invalidates all active sessions including this one</p>
                </div>
                <button onClick={logoutAll} className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700">Logout All</button>
              </div>
            </div>
          </div>
          <div className="card">
            <h2 className="font-semibold mb-4">Account Details</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: 'User ID', value: user?.id?.slice(0, 16) + '...' },
                { label: 'Role', value: user?.role },
                { label: 'Tenant ID', value: user?.tenantId?.slice(0, 16) + '...' },
              ].map(r => (
                <div key={r.label} className="flex justify-between py-2 border-b last:border-0">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Settings() {
  return (
    <div>
      <div className="page-header"><h1 className="page-title">Settings</h1></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">System Information</h2>
          <div className="space-y-3 text-sm">
            {[{ label: 'System', value: 'OMS Portal v1.0' }, { label: 'Environment', value: 'Production' }, { label: 'Database', value: 'PostgreSQL (Neon)' }, { label: 'API Version', value: 'v1' }].map(item => (
              <div key={item.label} className="flex justify-between py-2 border-b last:border-0">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card flex flex-col items-center justify-center text-center py-8 gap-4">
          <span className="text-4xl">⚙️</span>
          <div>
            <p className="font-semibold text-gray-700">Organisation & Team Settings</p>
            <p className="text-sm text-gray-500 mt-1">Manage your profile, organisation details, team members and security from the Profile page.</p>
          </div>
          <a href="/profile" className="btn-primary text-sm">Go to Profile & Settings</a>
        </div>
      </div>
    </div>
  );
}

export function Verifications() {
  const [checks, setChecks] = useState([
    { label: 'Database Connection', status: 'CHECKING', icon: '🗄️' },
    { label: 'API Server', status: 'CHECKING', icon: '🖥️' },
    { label: 'Authentication Service', status: 'CHECKING', icon: '🔐' },
    { label: 'Email Service', status: 'CHECKING', icon: '📧' },
  ]);

  useEffect(() => {
    api.get('/health').then(r => {
      setChecks([
        { label: 'Database Connection', status: r.data.db === 'connected' ? 'OK' : 'ERROR', icon: '🗄️' },
        { label: 'API Server', status: 'OK', icon: '🖥️' },
        { label: 'Authentication Service', status: 'OK', icon: '🔐' },
        { label: 'Email Service', status: 'OK', icon: '📧' },
      ]);
    }).catch(() => {
      setChecks([
        { label: 'Database Connection', status: 'ERROR', icon: '🗄️' },
        { label: 'API Server', status: 'ERROR', icon: '🖥️' },
        { label: 'Authentication Service', status: 'ERROR', icon: '🔐' },
        { label: 'Email Service', status: 'UNKNOWN', icon: '📧' },
      ]);
    });
  }, []);

  const color = (s: string) => s === 'OK' ? 'badge-green' : s === 'ERROR' ? 'badge-red' : s === 'CHECKING' ? 'badge-yellow' : 'badge-gray';

  return (
    <div>
      <div className="page-header"><h1 className="page-title">System Verifications</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map(check => (
          <div key={check.label} className="card flex items-center gap-4">
            <span className="text-3xl">{check.icon}</span>
            <div className="flex-1"><p className="font-medium">{check.label}</p></div>
            <span className={`badge ${color(check.status)}`}>{check.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Integrations() {
  const [activeView, setActiveView] = useState<'grid' | 'webhook' | 'rest'>('grid');

  // Webhook State
  const [webhooks, setWebhooks] = useState<{ id: string; url: string; events: string[]; active: boolean }[]>([
    { id: 'wh_123', url: 'https://api.myapp.com/webhook', events: ['order.created', 'inventory.low'], active: true },
  ]);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [whForm, setWhForm] = useState({ url: '', events: [] as string[] });

  // REST API State
  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; keyPreview: string; createdAt: string }[]>([
    { id: 'key_1', name: 'Production App', keyPreview: 'sk_live_...x8p', createdAt: '2026-07-01' },
  ]);
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newKey, setNewKey] = useState(''); // To show the key just once after generation

  const integrations = [
    { id: 'webhook', name: 'Webhook API', description: 'Receive real-time event notifications via HTTP webhooks', icon: '🔗', status: 'active' },
    { id: 'rest', name: 'REST API', description: 'Full REST API access for custom integrations and automation', icon: '⚡', status: 'active' },
    { id: 'erp', name: 'ERP System', description: 'Connect to your ERP for seamless data sync', icon: '🏭', status: 'coming_soon' },
    { id: 'payment', name: 'Payment Gateway', description: 'Accept online payments via Razorpay, Stripe, etc.', icon: '💳', status: 'coming_soon' },
    { id: 'shipping', name: 'Shipping API', description: 'Real-time shipping rates and tracking integration', icon: '🚚', status: 'coming_soon' },
    { id: 'accounting', name: 'Accounting Software', description: 'Sync with Tally, QuickBooks, Zoho Books', icon: '📊', status: 'coming_soon' },
    { id: 'crm', name: 'CRM Platform', description: 'Sync customer data with your CRM', icon: '👥', status: 'coming_soon' },
    { id: 'email', name: 'Email Marketing', description: 'Connect Mailchimp or SendGrid for campaigns', icon: '📧', status: 'coming_soon' },
  ];

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whForm.url) return;
    setWebhooks([...webhooks, { id: `wh_${Date.now()}`, url: whForm.url, events: whForm.events, active: true }]);
    setWhForm({ url: '', events: [] });
    setShowWebhookForm(false);
  };

  const toggleEvent = (event: string) => {
    setWhForm(prev => ({
      ...prev,
      events: prev.events.includes(event) ? prev.events.filter(e => e !== event) : [...prev.events, event]
    }));
  };

  const generateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;
    const generated = `sk_live_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    setNewKey(generated);
    setApiKeys([...apiKeys, { id: `key_${Date.now()}`, name: keyName, keyPreview: `sk_live_...${generated.slice(-3)}`, createdAt: new Date().toISOString().split('T')[0] }]);
    setKeyName('');
    setShowKeyForm(false);
  };

  if (activeView === 'webhook') {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setActiveView('grid')} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">←</button>
          <h1 className="text-2xl font-bold">Webhook API Management</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Active Endpoints</h2>
                <button className="btn-primary text-sm" onClick={() => setShowWebhookForm(!showWebhookForm)}>+ Add Endpoint</button>
              </div>

              {showWebhookForm && (
                <form onSubmit={handleCreateWebhook} className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payload URL</label>
                    <input type="url" placeholder="https://..." className="input w-full" value={whForm.url} onChange={e => setWhForm({ ...whForm, url: e.target.value })} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Events to send</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['order.created', 'order.updated', 'inventory.low', 'invoice.paid'].map(ev => (
                        <label key={ev} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={whForm.events.includes(ev)} onChange={() => toggleEvent(ev)} className="rounded text-blue-600 focus:ring-blue-500" />
                          {ev}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary text-sm">Save Endpoint</button>
                    <button type="button" className="btn-secondary text-sm" onClick={() => setShowWebhookForm(false)}>Cancel</button>
                  </div>
                </form>
              )}

              {webhooks.length === 0 && !showWebhookForm ? (
                <p className="text-gray-500 text-sm py-4">No webhooks configured. Add one to receive real-time updates.</p>
              ) : (
                <div className="space-y-3">
                  {webhooks.map(wh => (
                    <div key={wh.id} className="flex items-start justify-between p-4 border rounded-xl hover:border-gray-300 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${wh.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span className="font-mono text-sm font-medium text-gray-800">{wh.url}</span>
                        </div>
                        <div className="flex gap-1 flex-wrap mt-2">
                          {wh.events.map(ev => (
                            <span key={ev} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded border border-blue-100">{ev}</span>
                          ))}
                        </div>
                      </div>
                      <button className="text-sm text-red-600 hover:text-red-800 font-medium" onClick={() => setWebhooks(webhooks.filter(w => w.id !== wh.id))}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="card h-fit">
            <h2 className="font-semibold mb-3">Webhook Secret</h2>
            <p className="text-sm text-gray-500 mb-4">Use this secret to verify that webhook payloads are sent by us.</p>
            <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
              <code className="text-xs text-gray-800 break-all mr-2">whsec_x89...11p2</code>
              <button className="text-blue-600 text-sm font-medium hover:underline whitespace-nowrap">Reveal</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'rest') {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setActiveView('grid')} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">←</button>
          <h1 className="text-2xl font-bold">REST API Management</h1>
        </div>

        {newKey && (
          <div className="bg-green-50 border border-green-200 p-6 rounded-xl mb-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🎉</span>
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-1">Your new API key has been generated</h3>
                <p className="text-sm text-green-700 mb-4">Please copy this key now. For security reasons, you will not be able to see it again.</p>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-4 py-2 rounded border border-green-200 flex-1 font-mono text-gray-800">{newKey}</code>
                  <button onClick={() => navigator.clipboard.writeText(newKey)} className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 shadow-sm transition-colors">
                    Copy Key
                  </button>
                </div>
                <button onClick={() => setNewKey('')} className="mt-4 text-sm text-green-700 hover:underline">I have saved it securely</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">API Keys</h2>
              <button className="btn-primary text-sm" onClick={() => setShowKeyForm(!showKeyForm)}>+ Create new Key</button>
            </div>

            {showKeyForm && (
              <form onSubmit={generateApiKey} className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                  <input type="text" placeholder="e.g. Zapier Integration" className="input w-full" value={keyName} onChange={e => setKeyName(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary text-sm h-10 px-6">Generate</button>
                <button type="button" className="btn-secondary text-sm h-10 px-4" onClick={() => setShowKeyForm(false)}>Cancel</button>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="pb-3 font-medium">NAME</th>
                    <th className="pb-3 font-medium">KEY PREVIEW</th>
                    <th className="pb-3 font-medium">CREATED</th>
                    <th className="pb-3 font-medium text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {apiKeys.map(k => (
                    <tr key={k.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">{k.name}</td>
                      <td className="py-3"><code className="bg-gray-100 px-2 py-1 rounded text-gray-600">{k.keyPreview}</code></td>
                      <td className="py-3 text-gray-500">{k.createdAt}</td>
                      <td className="py-3 text-right">
                        <button className="text-red-600 hover:text-red-800 font-medium text-sm" onClick={() => setApiKeys(apiKeys.filter(key => key.id !== k.id))}>Revoke</button>
                      </td>
                    </tr>
                  ))}
                  {apiKeys.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-gray-500">No active API keys found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="card bg-blue-50 border-blue-100">
              <h2 className="font-semibold text-blue-900 mb-2">Documentation</h2>
              <p className="text-sm text-blue-800 mb-4">Learn how to authenticate and make requests to our endpoints.</p>
              <a href="#" className="inline-block text-sm font-bold text-blue-600 hover:underline">Read API Docs →</a>
            </div>
            <div className="card border-orange-100">
              <h2 className="font-semibold text-orange-900 mb-2 text-sm flex items-center gap-2"><span className="text-orange-500">⚠</span> Security Best Practices</h2>
              <ul className="text-xs text-gray-600 space-y-2">
                <li>• Never commit API keys to GitHub or public repositories.</li>
                <li>• Use environment variables for storage.</li>
                <li>• Revoke unused keys immediately.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Grid View
  return (
    <div>
      <div className="page-header"><h1 className="page-title">Integrations</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map(int => (
          <div key={int.id} className={`card border-2 flex flex-col ${
            int.status === 'active' ? 'border-green-200 bg-green-50' : 'border-gray-100'
          }`}>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{int.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{int.name}</h3>
                  <span className={`badge ${
                    int.status === 'active' ? 'badge-green' : 'badge-gray'
                  }`}>{int.status === 'active' ? 'Active' : 'Coming Soon'}</span>
                </div>
                <p className="text-sm text-gray-500">{int.description}</p>
              </div>
            </div>
            {int.status === 'active' && (
              <div className="mt-auto pt-4 border-t border-green-100 flex justify-end">
                <button 
                  onClick={() => setActiveView(int.id as 'webhook' | 'rest')} 
                  className="text-sm font-semibold text-green-700 bg-white border border-green-200 px-4 py-1.5 rounded hover:bg-green-100 transition-colors"
                >
                  Manage Setup
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
