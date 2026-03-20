import React, { useEffect, useState } from 'react';
import { BOM, Item } from '../../types';
import { Modal, FormField, Spinner, EmptyState, ConfirmDialog } from '../../components/UI';
import api from '../../utils/api';

export default function BOMManagement() {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', items: [{ parentId: '', componentId: '', quantity: 1, unit: 'pcs' }] });

  const fetch = () => { api.get('/items/bom/all').then(r => setBoms(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); api.get('/items?limit=100').then(r => setItems(r.data.items)); }, []);

  const addBOMItem = () => setForm(f => ({ ...f, items: [...f.items, { parentId: '', componentId: '', quantity: 1, unit: 'pcs' }] }));
  const removeBOMItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateBOMItem = (i: number, k: string, v: unknown) => setForm(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [k]: v } : item) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/items/bom', form);
    setShowModal(false); fetch();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/items/bom/${deleteId}`);
    setDeleteId(null); fetch();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">BOM Management</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>➕ Create BOM</button>
      </div>
      <div className="card">
        {loading ? <Spinner /> : boms.length === 0 ? <EmptyState message="No BOMs created yet" /> : (
          <div className="space-y-4">
            {boms.map(bom => (
              <div key={bom.id} className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div><h3 className="font-semibold">{bom.name}</h3>{bom.description && <p className="text-sm text-gray-500">{bom.description}</p>}</div>
                  <button onClick={() => setDeleteId(bom.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                </div>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Parent Item</th><th>Component</th><th>Quantity</th><th>Unit</th></tr></thead>
                    <tbody>
                      {bom.items.map(item => (
                        <tr key={item.id}><td>{item.parent.name}</td><td>{item.component.name}</td><td>{item.quantity}</td><td>{item.unit}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Create BOM" onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="BOM Name" required><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></FormField>
                <FormField label="Description"><input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></FormField>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="label mb-0">BOM Items</label><button type="button" className="btn-outline text-xs py-1" onClick={addBOMItem}>+ Add Row</button></div>
                {form.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2 mb-2">
                    <select className="input col-span-2" value={item.parentId} onChange={e => updateBOMItem(i, 'parentId', e.target.value)} required>
                      <option value="">Parent Item</option>
                      {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                    </select>
                    <select className="input col-span-2" value={item.componentId} onChange={e => updateBOMItem(i, 'componentId', e.target.value)} required>
                      <option value="">Component</option>
                      {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                    </select>
                    <div className="flex gap-1">
                      <input className="input" type="number" step="0.01" value={item.quantity} onChange={e => updateBOMItem(i, 'quantity', parseFloat(e.target.value))} />
                      {form.items.length > 1 && <button type="button" onClick={() => removeBOMItem(i)} className="text-red-500 px-2">×</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create BOM</button>
            </div>
          </form>
        </Modal>
      )}
      {deleteId && <ConfirmDialog message="Delete this BOM?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
