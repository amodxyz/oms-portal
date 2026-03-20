import React, { useEffect, useState } from 'react';
import { Item, StockEntry } from '../../types';
import { FormField, Modal, Spinner, EmptyState } from '../../components/UI';
import { formatDate } from '../../utils/helpers';
import api from '../../utils/api';

export default function StockManagement() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [currentStock, setCurrentStock] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ itemId: '', quantity: 0, type: 'IN', location: '', reference: '', note: '' });

  useEffect(() => { api.get('/items?limit=100').then(r => setItems(r.data.items)); }, []);

  const loadStock = async (item: Item) => {
    setSelectedItem(item);
    const { data } = await api.get(`/items/${item.id}/stock`);
    setEntries(data.entries); setCurrentStock(data.currentStock);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/items/stock/entry', form);
    setShowModal(false);
    if (selectedItem) loadStock(selectedItem);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Stock Management</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>➕ Stock Entry</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-3">Select Item</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {items.map(item => (
              <button key={item.id} onClick={() => loadStock(item)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedItem?.id === item.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}>
                <span className="font-mono text-xs text-gray-400">{item.code}</span> {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold">{selectedItem.name}</h2>
                  <p className="text-sm text-gray-500">{selectedItem.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Current Stock</p>
                  <p className={`text-2xl font-bold ${currentStock <= selectedItem.minStock ? 'text-red-600' : 'text-green-600'}`}>{currentStock} {selectedItem.unit}</p>
                </div>
              </div>
              {entries.length === 0 ? <EmptyState message="No stock entries" /> : (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Date</th><th>Type</th><th>Quantity</th><th>Location</th><th>Reference</th><th>Note</th></tr></thead>
                    <tbody>
                      {entries.map(e => (
                        <tr key={e.id}>
                          <td>{formatDate(e.createdAt)}</td>
                          <td><span className={`badge ${e.type === 'IN' ? 'badge-green' : e.type === 'OUT' ? 'badge-red' : 'badge-yellow'}`}>{e.type}</span></td>
                          <td className="font-medium">{e.quantity}</td>
                          <td>{e.location || '-'}</td>
                          <td>{e.reference || '-'}</td>
                          <td>{e.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="card flex items-center justify-center h-64 text-gray-400">
              <div className="text-center"><div className="text-4xl mb-2">📦</div><p>Select an item to view stock</p></div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal title="Stock Entry" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="modal-body space-y-4">
              <FormField label="Item" required>
                <select className="input" value={form.itemId} onChange={e => setForm(f => ({ ...f, itemId: e.target.value }))} required>
                  <option value="">Select item</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.code} - {i.name}</option>)}
                </select>
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Type"><select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="IN">IN</option><option value="OUT">OUT</option><option value="ADJUSTMENT">ADJUSTMENT</option></select></FormField>
                <FormField label="Quantity"><input className="input" type="number" step="0.01" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseFloat(e.target.value) }))} required /></FormField>
              </div>
              <FormField label="Location"><input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></FormField>
              <FormField label="Reference"><input className="input" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} /></FormField>
              <FormField label="Note"><input className="input" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} /></FormField>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save Entry</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
