import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductionOrder } from '../../types';
import { Badge, Spinner, EmptyState, FormField, Modal } from '../../components/UI';
import { formatDate } from '../../utils/helpers';
import api from '../../utils/api';

export function ProductionList() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get(`/production${status ? `?status=${status}` : ''}`);
    setOrders(data); setLoading(false);
  }, [status]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id: string, newStatus: string) => {
    await api.put(`/production/${id}`, { status: newStatus });
    fetch();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Production Orders</h1>
        <div className="flex gap-2">
          <select className="input w-40" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Status</option>
            {['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-primary" onClick={() => navigate('/production/new')}>➕ New Order</button>
        </div>
      </div>
      <div className="card">
        {loading ? <Spinner /> : orders.length === 0 ? <EmptyState /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Order No</th><th>Product</th><th>Quantity</th><th>Start Date</th><th>End Date</th><th>Priority</th><th>Assigned To</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="font-medium">{o.orderNo}</td>
                    <td>{o.productName}</td>
                    <td>{o.quantity} {o.unit}</td>
                    <td>{formatDate(o.startDate)}</td>
                    <td>{o.endDate ? formatDate(o.endDate) : '-'}</td>
                    <td><span className={`badge ${o.priority === 'HIGH' ? 'badge-red' : o.priority === 'NORMAL' ? 'badge-blue' : 'badge-gray'}`}>{o.priority}</span></td>
                    <td>{o.assignedTo || '-'}</td>
                    <td><Badge status={o.status} /></td>
                    <td>
                      <select className="input text-xs py-1 w-32" value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                        {['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function NewProductionOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ productName: '', quantity: 1, unit: 'pcs', startDate: '', endDate: '', priority: 'NORMAL', assignedTo: '', notes: '' });
  const [resources, setResources] = useState([{ resourceName: '', resourceType: 'MACHINE', quantity: 1, unit: 'hrs' }]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const addResource = () => setResources(r => [...r, { resourceName: '', resourceType: 'MACHINE', quantity: 1, unit: 'hrs' }]);
  const removeResource = (i: number) => setResources(r => r.filter((_, idx) => idx !== i));
  const updateResource = (i: number, k: string, v: unknown) => setResources(r => r.map((res, idx) => idx === i ? { ...res, [k]: v } : res));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/production', { ...form, resources: resources.filter(r => r.resourceName) });
      navigate('/production');
    } catch { alert('Error creating production order'); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header"><h1 className="page-title">New Production Order</h1></div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="font-semibold mb-4">Production Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Product Name" required><input className="input" value={form.productName} onChange={e => set('productName', e.target.value)} required /></FormField>
                <div className="grid grid-cols-2 gap-2">
                  <FormField label="Quantity"><input className="input" type="number" value={form.quantity} onChange={e => set('quantity', parseFloat(e.target.value))} /></FormField>
                  <FormField label="Unit"><input className="input" value={form.unit} onChange={e => set('unit', e.target.value)} /></FormField>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <FormField label="Start Date" required><input className="input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required /></FormField>
                <FormField label="End Date"><input className="input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></FormField>
                <FormField label="Priority">
                  <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                    <option value="LOW">Low</option><option value="NORMAL">Normal</option><option value="HIGH">High</option>
                  </select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField label="Assigned To"><input className="input" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} /></FormField>
                <FormField label="Notes"><input className="input" value={form.notes} onChange={e => set('notes', e.target.value)} /></FormField>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Resources</h2>
                <button type="button" className="btn-outline text-xs py-1" onClick={addResource}>+ Add Resource</button>
              </div>
              {resources.map((res, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 mb-2">
                  <input className="input col-span-2" placeholder="Resource name" value={res.resourceName} onChange={e => updateResource(i, 'resourceName', e.target.value)} />
                  <select className="input" value={res.resourceType} onChange={e => updateResource(i, 'resourceType', e.target.value)}>
                    <option value="MACHINE">Machine</option><option value="LABOR">Labor</option><option value="MATERIAL">Material</option>
                  </select>
                  <input className="input" type="number" placeholder="Qty" value={res.quantity} onChange={e => updateResource(i, 'quantity', parseFloat(e.target.value))} />
                  <div className="flex gap-1">
                    <input className="input" placeholder="Unit" value={res.unit} onChange={e => updateResource(i, 'unit', e.target.value)} />
                    {resources.length > 1 && <button type="button" onClick={() => removeResource(i)} className="text-red-500 px-2">×</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>{loading ? 'Creating...' : 'Create Order'}</button>
            <button type="button" className="btn-secondary w-full justify-center" onClick={() => navigate('/production')}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function ProductionSchedule() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/production').then(r => setOrders(r.data)).finally(() => setLoading(false)); }, []);

  const grouped = orders.reduce((acc, o) => {
    const date = new Date(o.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(o);
    return acc;
  }, {} as Record<string, ProductionOrder[]>);

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Production Schedule</h1></div>
      {loading ? <Spinner /> : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, dayOrders]) => (
            <div key={date} className="card">
              <h2 className="font-semibold mb-3 text-blue-600">{date}</h2>
              <div className="space-y-2">
                {dayOrders.map(o => (
                  <div key={o.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${o.priority === 'HIGH' ? 'bg-red-500' : o.priority === 'NORMAL' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                    <div className="flex-1"><p className="font-medium text-sm">{o.productName}</p><p className="text-xs text-gray-500">{o.quantity} {o.unit} • {o.assignedTo || 'Unassigned'}</p></div>
                    <Badge status={o.status} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && <EmptyState message="No production orders scheduled" />}
        </div>
      )}
    </div>
  );
}
