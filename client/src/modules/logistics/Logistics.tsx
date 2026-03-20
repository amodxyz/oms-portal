import React, { useEffect, useState, useCallback } from 'react';
import { Dispatch, Transporter, Order } from '../../types';
import { Badge, Spinner, EmptyState, FormField, Modal } from '../../components/UI';
import { formatDate } from '../../utils/helpers';
import api from '../../utils/api';

export function TransportersList() {
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transporter | null>(null);
  const [form, setForm] = useState({ code: '', name: '', phone: '', email: '', vehicle: '' });

  const fetch = () => api.get('/logistics/transporters').then(r => setTransporters(r.data)).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const openNew = () => { setEditing(null); setForm({ code: '', name: '', phone: '', email: '', vehicle: '' }); setShowModal(true); };
  const openEdit = (t: Transporter) => { setEditing(t); setForm({ code: t.code, name: t.name, phone: t.phone || '', email: t.email || '', vehicle: t.vehicle || '' }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.put(`/logistics/transporters/${editing.id}`, form);
    else await api.post('/logistics/transporters', form);
    setShowModal(false); fetch();
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Transporters</h1>
        <button className="btn-primary" onClick={openNew}>➕ Add Transporter</button>
      </div>
      <div className="card">
        {loading ? <Spinner /> : transporters.length === 0 ? <EmptyState /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>Phone</th><th>Email</th><th>Vehicle</th><th>Dispatches</th><th>Actions</th></tr></thead>
              <tbody>
                {transporters.map(t => (
                  <tr key={t.id}>
                    <td className="font-mono text-xs">{t.code}</td>
                    <td className="font-medium">{t.name}</td>
                    <td>{t.phone || '-'}</td>
                    <td>{t.email || '-'}</td>
                    <td>{t.vehicle || '-'}</td>
                    <td>{t._count?.dispatches || 0}</td>
                    <td><button onClick={() => openEdit(t)} className="text-blue-600 hover:underline text-xs">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Transporter' : 'Add Transporter'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Code" required><input className="input" value={form.code} onChange={e => set('code', e.target.value)} required /></FormField>
                <FormField label="Name" required><input className="input" value={form.name} onChange={e => set('name', e.target.value)} required /></FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Phone"><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} /></FormField>
                <FormField label="Email"><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></FormField>
              </div>
              <FormField label="Vehicle"><input className="input" value={form.vehicle} onChange={e => set('vehicle', e.target.value)} /></FormField>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export function DispatchesList() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ orderId: '', transporterId: '', trackingNo: '', notes: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get(`/logistics/dispatches${status ? `?status=${status}` : ''}`);
    setDispatches(data); setLoading(false);
  }, [status]);

  useEffect(() => {
    fetch();
    api.get('/sales/orders?status=CONFIRMED&limit=100').then(r => setOrders(r.data.orders));
    api.get('/logistics/transporters').then(r => setTransporters(r.data));
  }, [fetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/logistics/dispatches', form);
    setShowModal(false); fetch();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const data: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'DELIVERED') data.deliveryDate = new Date();
    await api.put(`/logistics/dispatches/${id}`, data);
    fetch();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dispatches</h1>
        <div className="flex gap-2">
          <select className="input w-36" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Status</option>
            {['PENDING', 'IN_TRANSIT', 'DELIVERED', 'RETURNED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setShowModal(true)}>➕ New Dispatch</button>
        </div>
      </div>
      <div className="card">
        {loading ? <Spinner /> : dispatches.length === 0 ? <EmptyState /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Dispatch No</th><th>Order</th><th>Customer</th><th>Transporter</th><th>Dispatch Date</th><th>Tracking</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {dispatches.map(d => (
                  <tr key={d.id}>
                    <td className="font-medium">{d.dispatchNo}</td>
                    <td>{d.order?.orderNo}</td>
                    <td>{d.order?.customer?.name}</td>
                    <td>{d.transporter?.name}</td>
                    <td>{formatDate(d.dispatchDate)}</td>
                    <td>{d.trackingNo || '-'}</td>
                    <td><Badge status={d.status} /></td>
                    <td>
                      <select className="input text-xs py-1 w-32" value={d.status} onChange={e => updateStatus(d.id, e.target.value)}>
                        {['PENDING', 'IN_TRANSIT', 'DELIVERED', 'RETURNED'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="New Dispatch" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="modal-body space-y-4">
              <FormField label="Order" required>
                <select className="input" value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))} required>
                  <option value="">Select order</option>
                  {orders.map(o => <option key={o.id} value={o.id}>{o.orderNo} - {o.customer.name}</option>)}
                </select>
              </FormField>
              <FormField label="Transporter" required>
                <select className="input" value={form.transporterId} onChange={e => setForm(f => ({ ...f, transporterId: e.target.value }))} required>
                  <option value="">Select transporter</option>
                  {transporters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </FormField>
              <FormField label="Tracking No"><input className="input" value={form.trackingNo} onChange={e => setForm(f => ({ ...f, trackingNo: e.target.value }))} /></FormField>
              <FormField label="Notes"><textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></FormField>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create Dispatch</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export function TrackingPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingNo, setTrackingNo] = useState('');

  useEffect(() => { api.get('/logistics/dispatches').then(r => setDispatches(r.data)).finally(() => setLoading(false)); }, []);

  const filtered = trackingNo ? dispatches.filter(d => d.trackingNo?.toLowerCase().includes(trackingNo.toLowerCase()) || d.dispatchNo.toLowerCase().includes(trackingNo.toLowerCase())) : dispatches;

  const statusSteps = ['PENDING', 'IN_TRANSIT', 'DELIVERED'];

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Shipment Tracking</h1></div>
      <div className="card mb-6">
        <div className="flex gap-3">
          <input className="input flex-1" placeholder="Enter tracking number or dispatch number..." value={trackingNo} onChange={e => setTrackingNo(e.target.value)} />
          <button className="btn-primary">🔍 Track</button>
        </div>
      </div>
      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState message="No shipments found" /> : (
        <div className="space-y-4">
          {filtered.map(d => (
            <div key={d.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{d.dispatchNo}</h3>
                  <p className="text-sm text-gray-500">{d.order?.orderNo} • {d.order?.customer?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Transporter</p>
                  <p className="font-medium">{d.transporter?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                {statusSteps.map((step, i) => {
                  const stepIdx = statusSteps.indexOf(d.status);
                  const isActive = i <= stepIdx;
                  return (
                    <React.Fragment key={step}>
                      <div className={`flex items-center gap-2 ${isActive ? 'text-blue-600' : 'text-gray-300'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{i + 1}</div>
                        <span className="text-xs font-medium">{step.replace('_', ' ')}</span>
                      </div>
                      {i < statusSteps.length - 1 && <div className={`flex-1 h-0.5 ${isActive && i < stepIdx ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-gray-500">Dispatch Date</p><p className="font-medium">{formatDate(d.dispatchDate)}</p></div>
                {d.deliveryDate && <div><p className="text-gray-500">Delivery Date</p><p className="font-medium">{formatDate(d.deliveryDate)}</p></div>}
                {d.trackingNo && <div><p className="text-gray-500">Tracking No</p><p className="font-medium font-mono">{d.trackingNo}</p></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
