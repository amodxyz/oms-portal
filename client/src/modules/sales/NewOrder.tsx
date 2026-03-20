import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer, Item } from '../../types';
import { FormField } from '../../components/UI';
import { formatCurrency, CGST_RATE, SGST_RATE } from '../../utils/helpers';
import api from '../../utils/api';

interface LineItem { itemId: string; quantity: number; unitPrice: number; }

export default function NewOrder() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ customerId: '', dueDate: '', discount: 0, notes: '', gstType: 'CGST_SGST' });
  const [lineItems, setLineItems] = useState<LineItem[]>([{ itemId: '', quantity: 1, unitPrice: 0 }]);

  useEffect(() => {
    api.get('/sales/customers').then(r => setCustomers(r.data));
    api.get('/items?limit=100').then(r => setItems(r.data.items));
  }, []);

  const addLine = () => setLineItems(l => [...l, { itemId: '', quantity: 1, unitPrice: 0 }]);
  const removeLine = (i: number) => setLineItems(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i: number, k: string, v: unknown) => setLineItems(l => l.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const onItemSelect = (i: number, itemId: string) => {
    const item = items.find(it => it.id === itemId);
    updateLine(i, 'itemId', itemId);
    if (item) updateLine(i, 'unitPrice', item.sellingPrice);
  };

  const subtotal = lineItems.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const discounted = subtotal - (form.discount || 0);
  const cgst = form.gstType === 'CGST_SGST' ? +(discounted * CGST_RATE).toFixed(2) : 0;
  const sgst = form.gstType === 'CGST_SGST' ? +(discounted * SGST_RATE).toFixed(2) : 0;
  const igst = form.gstType === 'IGST' ? +(discounted * (CGST_RATE + SGST_RATE)).toFixed(2) : 0;
  const gstAmount = cgst + sgst + igst;
  const total = discounted + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/sales/orders', { ...form, tax: gstAmount, items: lineItems });
      navigate('/sales/orders');
    } catch { alert('Error creating order'); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header"><h1 className="page-title">New Sales Order</h1></div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="font-semibold mb-4">Order Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Customer" required>
                  <select className="input" value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} required>
                    <option value="">Select customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Due Date"><input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></FormField>
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
                <h2 className="font-semibold">Line Items</h2>
                <button type="button" className="btn-outline text-xs py-1" onClick={addLine}>+ Add Item</button>
              </div>
              <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase px-1">
                <div className="col-span-5">Item</div><div className="col-span-2">Qty</div><div className="col-span-3">Unit Price (₹)</div><div className="col-span-2">Amount</div>
              </div>
              {lineItems.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center mb-2">
                  <div className="col-span-5">
                    <select className="input" value={line.itemId} onChange={e => onItemSelect(i, e.target.value)} required>
                      <option value="">Select item</option>
                      {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2"><input className="input" type="number" step="0.01" min="0" value={line.quantity} onChange={e => updateLine(i, 'quantity', parseFloat(e.target.value))} required /></div>
                  <div className="col-span-3"><input className="input" type="number" step="0.01" min="0" value={line.unitPrice} onChange={e => updateLine(i, 'unitPrice', parseFloat(e.target.value))} required /></div>
                  <div className="col-span-1 text-sm font-medium text-right">{formatCurrency(line.quantity * line.unitPrice)}</div>
                  <div className="col-span-1 text-center">{lineItems.length > 1 && <button type="button" onClick={() => removeLine(i)} className="text-red-500 hover:text-red-700 text-lg">×</button>}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card">
              <h2 className="font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Discount (₹)</span>
                  <input className="input w-28 text-right" type="number" step="0.01" min="0" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="flex justify-between border-t pt-2"><span className="text-gray-500">Taxable Amount</span><span>{formatCurrency(discounted)}</span></div>

                {form.gstType === 'CGST_SGST' && <>
                  <div className="flex justify-between text-orange-600"><span>CGST @ 9%</span><span>{formatCurrency(cgst)}</span></div>
                  <div className="flex justify-between text-orange-600"><span>SGST @ 9%</span><span>{formatCurrency(sgst)}</span></div>
                </>}
                {form.gstType === 'IGST' && <div className="flex justify-between text-orange-600"><span>IGST @ 18%</span><span>{formatCurrency(igst)}</span></div>}
                {form.gstType === 'NONE' && <div className="flex justify-between text-gray-400"><span>GST</span><span>Exempt</span></div>}

                <div className="flex justify-between border-t pt-2 font-bold text-base"><span>Total</span><span className="text-blue-600">{formatCurrency(total)}</span></div>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>{loading ? 'Creating...' : 'Create Order'}</button>
            <button type="button" className="btn-secondary w-full justify-center" onClick={() => navigate('/sales/orders')}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
