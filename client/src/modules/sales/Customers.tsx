import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Customer } from '../../types';
import { SearchInput, Spinner, EmptyState, ConfirmDialog, FormField } from '../../components/UI';
import api from '../../utils/api';

export function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get(`/sales/customers${search ? `?search=${search}` : ''}`);
    setCustomers(data); setLoading(false);
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/sales/customers/${deleteId}`);
    setDeleteId(null); fetch();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <Link to="/sales/customers/new" className="btn-primary">➕ Add Customer</Link>
      </div>
      <div className="card">
        <div className="mb-4"><SearchInput value={search} onChange={setSearch} placeholder="Search customers..." /></div>
        {loading ? <Spinner /> : customers.length === 0 ? <EmptyState /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Orders</th><th>Actions</th></tr></thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td className="font-mono text-xs">{c.code}</td>
                    <td><Link to={`/sales/customers/${c.id}`} className="text-blue-600 hover:underline font-medium">{c.name}</Link></td>
                    <td>{c.email || '-'}</td>
                    <td>{c.phone || '-'}</td>
                    <td>{c.city || '-'}</td>
                    <td>{c._count?.orders || 0}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link to={`/sales/customers/${c.id}/edit`} className="text-blue-600 hover:underline text-xs">Edit</Link>
                        <button onClick={() => setDeleteId(c.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {deleteId && <ConfirmDialog message="Deactivate this customer?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

export function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', email: '', phone: '', address: '', city: '', country: '' });
  const isNew = !id || id === 'new';

  useEffect(() => {
    if (!isNew) {
      setLoading(true);
      api.get(`/sales/customers/${id}`).then(r => {
        const { orders, _count, createdAt, updatedAt, isActive, ...rest } = r.data;
        setForm(rest);
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (isNew) await api.post('/sales/customers', form);
      else await api.put(`/sales/customers/${id}`, form);
      navigate('/sales/customers');
    } catch { alert('Error saving customer'); } finally { setLoading(false); }
  };

  if (loading && !isNew) return <Spinner />;

  return (
    <div>
      <div className="page-header"><h1 className="page-title">{isNew ? 'Add Customer' : 'Edit Customer'}</h1></div>
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Customer Code" required><input className="input" value={form.code} onChange={e => set('code', e.target.value)} required /></FormField>
            <FormField label="Name" required><input className="input" value={form.name} onChange={e => set('name', e.target.value)} required /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email"><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></FormField>
            <FormField label="Phone"><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} /></FormField>
          </div>
          <FormField label="Address"><input className="input" value={form.address} onChange={e => set('address', e.target.value)} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="City"><input className="input" value={form.city} onChange={e => set('city', e.target.value)} /></FormField>
            <FormField label="Country"><input className="input" value={form.country} onChange={e => set('country', e.target.value)} /></FormField>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Customer'}</button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/sales/customers')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
