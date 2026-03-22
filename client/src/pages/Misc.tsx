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
  const [sessions, setSessions] = useState<number | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    if (tab === 'security') api.get('/auth/profile').then(() => setSessions(null));
  }, [tab]);

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
