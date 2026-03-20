import React, { useEffect, useState } from 'react';
import { Category } from '../../types';
import { Modal, FormField, Spinner, EmptyState, ConfirmDialog } from '../../components/UI';
import api from '../../utils/api';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetch = () => api.get('/items/categories/all').then(r => setCategories(r.data)).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const openEdit = (cat: Category) => { setEditing(cat); setForm({ name: cat.name, description: cat.description || '' }); setShowModal(true); };
  const openNew = () => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.put(`/items/categories/${editing.id}`, form);
    else await api.post('/items/categories', form);
    setShowModal(false); fetch();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/items/categories/${deleteId}`);
    setDeleteId(null); fetch();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Categories</h1>
        <button className="btn-primary" onClick={openNew}>➕ Add Category</button>
      </div>
      <div className="card">
        {loading ? <Spinner /> : categories.length === 0 ? <EmptyState /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Name</th><th>Description</th><th>Items</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td className="font-medium">{cat.name}</td>
                    <td>{cat.description || '-'}</td>
                    <td>{cat._count?.items || 0}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(cat)} className="text-blue-600 hover:underline text-xs">Edit</button>
                        <button onClick={() => setDeleteId(cat.id)} className="text-red-600 hover:underline text-xs">Delete</button>
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
        <Modal title={editing ? 'Edit Category' : 'Add Category'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="modal-body space-y-4">
              <FormField label="Name" required><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></FormField>
              <FormField label="Description"><textarea className="input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></FormField>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
      {deleteId && <ConfirmDialog message="Delete this category?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
