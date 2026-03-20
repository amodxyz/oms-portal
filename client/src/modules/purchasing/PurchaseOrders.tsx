import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PurchaseOrder, Supplier, Item } from '../../types';
import { Badge, Spinner, EmptyState, FormField } from '../../components/UI';
import { formatCurrency, formatDate, CGST_RATE, SGST_RATE } from '../../utils/helpers';
import api from '../../utils/api';

export function PurchaseOrdersList() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get(`/purchasing/orders${status ? `?status=${status}` : ''}`);
    setOrders(data); setLoading(false);
  }, [status]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id: string, newStatus: string) => {
    await api.put(`/purchasing/orders/${id}`, { status: newStatus }); fetch();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Purchase Orders</h1>
        <div className="flex gap-2">
          <select className="input w-36" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Status</option>
            {['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-primary" onClick={() => navigate('/purchasing/orders/new')}>➕ New PO</button>
        </div>
      </div>
      <div className="card">
        {loading ? <Spinner /> : orders.length === 0 ? <EmptyState /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>PO No</th><th>Supplier</th><th>Date</th><th>Expected</th><th>Taxable Amt</th><th>GST (18%)</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map(po => {
                  const gst = +(po.totalAmount * (CGST_RATE + SGST_RATE)).toFixed(2);
                  return (
                    <tr key={po.id}>
                      <td className="font-medium">{po.poNo}</td>
                      <td>{po.supplier.name}</td>
                      <td>{formatDate(po.orderDate)}</td>
                      <td>{po.expectedDate ? formatDate(po.expectedDate) : '—'}</td>
                      <td>{formatCurrency(po.totalAmount)}</td>
                      <td className="text-orange-600">{formatCurrency(gst)}</td>
                      <td className="font-bold">{formatCurrency(po.totalAmount + gst)}</td>
                      <td><Badge status={po.status} /></td>
                      <td>
                        <select className="input text-xs py-1 w-28" value={po.status} onChange={e => updateStatus(po.id, e.target.value)}>
                          {['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function NewPurchaseOrder() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ supplierId: '', expectedDate: '', notes: '', gstType: 'CGST_SGST' });
  const [lineItems, setLineItems] = useState([{ itemId: '', quantity: 1, unitPrice: 0 }]);

  useEffect(() => {
    api.get('/purchasing/suppliers').then(r => setSuppliers(r.data));
    api.get('/items?limit=100').then(r => setItems(r.data.items));
  }, []);

  const addLine = () => setLineItems(l => [...l, { itemId: '', quantity: 1, unitPrice: 0 }]);
  const removeLine = (i: number) => setLineItems(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i: number, k: string, v: unknown) => setLineItems(l => l.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const onItemSelect = (i: number, itemId: string) => {
    const item = items.find(it => it.id === itemId);
    updateLine(i, 'itemId', itemId);
    if (item) updateLine(i, 'unitPrice', item.costPrice);
  };

  const subtotal = lineItems.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const cgst = form.gstType === 'CGST_SGST' ? +(subtotal * CGST_RATE).toFixed(2) : 0;
  const sgst = form.gstType === 'CGST_SGST' ? +(subtotal * SGST_RATE).toFixed(2) : 0;
  const igst = form.gstType === 'IGST' ? +(subtotal * (CGST_RATE + SGST_RATE)).toFixed(2) : 0;
  const gstAmount = cgst + sgst + igst;
  const total = subtotal + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/purchasing/orders', { supplierId: form.supplierId, expectedDate: form.expectedDate, notes: form.notes, items: lineItems });
      navigate('/purchasing/orders');
    } catch { alert('Error creating purchase order'); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header"><h1 className="page-title">New Purchase Order</h1></div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="font-semibold mb-4">PO Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Supplier" required>
                  <select className="input" value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} required>
                    <option value="">Select supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Expected Date"><input className="input" type="date" value={form.expectedDate} onChange={e => setForm(f => ({ ...f, expectedDate: e.target.value }))} /></FormField>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField label="GST Type">
                  <select className="input" value={form.gstType} onChange={e => setForm(f => ({ ...f, gstType: e.target.value }))}>
                    <option value="CGST_SGST">CGST + SGST (Intra-state)</option>
                    <option value="IGST">IGST (Inter-state)</option>
                    <option value="NONE">No GST / Exempt</option>
                  </select>
                </FormField>
                <FormField label="Notes"><input className="input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></FormField>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Items</h2>
                <button type="button" className="btn-outline text-xs py-1" onClick={addLine}>+ Add Item</button>
              </div>
              <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase px-1">
                <div className="col-span-5">Item</div><div className="col-span-2">Qty</div><div className="col-span-3">Unit Price (₹)</div><div className="col-span-2">Amount</div>
              </div>
              {lineItems.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center mb-2">
                  <div className="col-span-5"><select className="input" value={line.itemId} onChange={e => onItemSelect(i, e.target.value)} required><option value="">Select item</option>{items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}</select></div>
                  <div className="col-span-2"><input className="input" type="number" step="0.01" min="0" value={line.quantity} onChange={e => updateLine(i, 'quantity', parseFloat(e.target.value))} required /></div>
                  <div className="col-span-3"><input className="input" type="number" step="0.01" min="0" value={line.unitPrice} onChange={e => updateLine(i, 'unitPrice', parseFloat(e.target.value))} required /></div>
                  <div className="col-span-1 text-sm font-medium text-right">{formatCurrency(line.quantity * line.unitPrice)}</div>
                  <div className="col-span-1 text-center">{lineItems.length > 1 && <button type="button" onClick={() => removeLine(i)} className="text-red-500 text-lg">×</button>}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="card">
              <h2 className="font-semibold mb-4">GST Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Taxable Amount</span><span>{formatCurrency(subtotal)}</span></div>
                {form.gstType === 'CGST_SGST' && <>
                  <div className="flex justify-between text-orange-600"><span>CGST @ 9%</span><span>{formatCurrency(cgst)}</span></div>
                  <div className="flex justify-between text-orange-600"><span>SGST @ 9%</span><span>{formatCurrency(sgst)}</span></div>
                </>}
                {form.gstType === 'IGST' && <div className="flex justify-between text-orange-600"><span>IGST @ 18%</span><span>{formatCurrency(igst)}</span></div>}
                {form.gstType === 'NONE' && <div className="flex justify-between text-gray-400"><span>GST</span><span>Exempt</span></div>}
                <div className="flex justify-between font-bold border-t pt-2 text-base"><span>Total</span><span className="text-blue-600">{formatCurrency(total)}</span></div>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>{loading ? 'Creating...' : 'Create PO'}</button>
            <button type="button" className="btn-secondary w-full justify-center" onClick={() => navigate('/purchasing/orders')}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
