import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Supplier } from '../../types';
import { SearchInput, Spinner, EmptyState, ConfirmDialog, FormField, Modal } from '../../components/UI';
import api from '../../utils/api';

export function SuppliersList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ code: '', name: '', email: '', phone: '', address: '', city: '', country: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get(`/purchasing/suppliers${search ? `?search=${search}` : ''}`);
    setSuppliers(data); setLoading(false);
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const openNew = () => { setEditing(null); setForm({ code: '', name: '', email: '', phone: '', address: '', city: '', country: '' }); setShowModal(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm({ code: s.code, name: s.name, email: s.email || '', phone: s.phone || '', address: s.address || '', city: s.city || '', country: s.country || '' }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.put(`/purchasing/suppliers/${editing.id}`, form);
    else await api.post('/purchasing/suppliers', form);
    setShowModal(false); fetch();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/purchasing/suppliers/${deleteId}`);
    setDeleteId(null); fetch();
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Suppliers</h1>
        <button className="btn-primary" onClick={openNew}>➕ Add Supplier</button>
      </div>
      <div className="card">
        <div className="mb-4"><SearchInput value={search} onChange={setSearch} placeholder="Search suppliers..." /></div>
        {loading ? <Spinner /> : suppliers.length === 0 ? <EmptyState /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>POs</th><th>Actions</th></tr></thead>
              <tbody>
                {suppliers.map(s => (
                  <tr key={s.id}>
                    <td className="font-mono text-xs">{s.code}</td>
                    <td className="font-medium">{s.name}</td>
                    <td>{s.email || '-'}</td>
                    <td>{s.phone || '-'}</td>
                    <td>{s.city || '-'}</td>
                    <td>{s._count?.purchaseOrders || 0}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(s)} className="text-blue-600 hover:underline text-xs">Edit</button>
                        <button onClick={() => setDeleteId(s.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Supplier' : 'Add Supplier'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Code" required><input className="input" value={form.code} onChange={e => set('code', e.target.value)} required /></FormField>
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
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
      {deleteId && <ConfirmDialog message="Deactivate this supplier?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
