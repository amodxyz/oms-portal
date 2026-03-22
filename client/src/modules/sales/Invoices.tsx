import React, { useEffect, useState, useCallback } from 'react';
import { Invoice, Order } from '../../types';
import { Badge, Spinner, EmptyState, FormField, Modal } from '../../components/UI';
import { formatCurrency, formatDate } from '../../utils/helpers';
import api from '../../utils/api';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState({ orderId: '', dueDate: '', customerGstin: '', placeOfSupply: '', notes: '' });
  const [formError, setFormError] = useState('');
  const [preview, setPreview] = useState<{ taxable: number; cgst: number; sgst: number; igst: number; total: number; gstType: string } | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    api.get(`/sales/invoices${status ? `?status=${status}` : ''}`).then(r => setInvoices(r.data)).finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { fetch(); }, [fetch]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const openModal = async () => {
    const { data } = await api.get('/sales/orders?limit=100');
    const uninvoiced = (data.orders as Order[]).filter(o => !o.invoice);
    setOrders(uninvoiced);
    setForm({ orderId: '', dueDate: '', customerGstin: '', placeOfSupply: '', notes: '' });
    setPreview(null); setFormError('');
    setShowModal(true);
  };

  // Live GST preview when order is selected
  const onOrderChange = async (orderId: string) => {
    setForm(f => ({ ...f, orderId }));
    if (!orderId) { setPreview(null); return; }
    try {
      const { data } = await api.get(`/sales/orders/${orderId}`);
      const o = data as Order & { items: { total: number; item: { gstRate?: number } }[] };
      const subtotal = o.items.reduce((s, i) => s + i.total, 0);
      const taxable = Math.max(0, subtotal - (o.discount || 0));
      const totalGst = o.items.reduce((s, i) => s + i.total * ((i.item.gstRate ?? 18) / 100), 0);
      // default intra-state
      setPreview({ taxable, cgst: totalGst / 2, sgst: totalGst / 2, igst: 0, total: taxable + totalGst, gstType: 'CGST_SGST' });
    } catch { setPreview(null); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    try {
      await api.post('/sales/invoices', form);
      setShowModal(false); fetch();
    } catch (err: unknown) {
      setFormError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error creating invoice');
    }
  };

  const markPaid = async (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    await api.put(`/sales/invoices/${id}`, { paid: inv.amount, status: 'PAID' });
    fetch();
  };

  const download = async (id: string) => {
    try {
      const { data } = await api.get(`/sales/invoices/${id}/download`, { responseType: 'text' });
      const blob = new Blob([data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) win.onload = () => URL.revokeObjectURL(url);
    } catch { showToast('Failed to generate invoice'); }
  };

  const sendVia = async (id: string, channel: 'email' | 'whatsapp') => {
    setSending(`${id}-${channel}`);
    try {
      const { data } = await api.post(`/sales/invoices/${id}/send`, { channel });
      if (channel === 'whatsapp' && data.url) window.open(data.url, '_blank');
      else showToast(data.message || 'Invoice sent!');
    } catch (err: unknown) {
      showToast((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send');
    } finally { setSending(null); }
  };

  return (
    <div>
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">{toast}</div>}
      <div className="page-header">
        <h1 className="page-title">GST Invoices</h1>
        <div className="flex gap-2">
          <select className="input w-36" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
          </select>
          <button className="btn-primary" onClick={openModal}>➕ New Invoice</button>
        </div>
      </div>

      <div className="card">
        {loading ? <Spinner /> : invoices.length === 0 ? <EmptyState /> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice No</th><th>Order</th><th>Customer</th><th>Date</th><th>Due</th>
                  <th>Taxable</th><th>GST</th><th>Total</th><th>Paid</th><th>Type</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="font-medium">{inv.invoiceNo}</td>
                    <td>{inv.order?.orderNo}</td>
                    <td>{inv.order?.customer?.name}</td>
                    <td>{formatDate(inv.issueDate)}</td>
                    <td>{formatDate(inv.dueDate)}</td>
                    <td>{formatCurrency(inv.taxableAmount ?? inv.amount)}</td>
                    <td className="text-xs">
                      {inv.gstType === 'IGST'
                        ? <span>IGST: {formatCurrency(inv.igst ?? 0)}</span>
                        : <span>C+S: {formatCurrency((inv.cgst ?? 0) + (inv.sgst ?? 0))}</span>}
                    </td>
                    <td className="font-medium">{formatCurrency(inv.amount)}</td>
                    <td>{formatCurrency(inv.paid)}</td>
                    <td><span className="text-xs text-gray-500">{inv.gstType === 'IGST' ? 'Inter' : 'Intra'}</span></td>
                    <td><Badge status={inv.status} /></td>
                    <td>
                      <div className="flex items-center gap-1 flex-wrap">
                        {inv.status !== 'PAID' && <button onClick={() => markPaid(inv.id)} className="text-green-600 hover:underline text-xs">✓ Paid</button>}
                        <button onClick={() => download(inv.id)} className="text-blue-600 hover:underline text-xs">⬇ PDF</button>
                        <button onClick={() => sendVia(inv.id, 'email')} disabled={sending === `${inv.id}-email`} className="text-purple-600 hover:underline text-xs disabled:opacity-50">
                          {sending === `${inv.id}-email` ? '...' : '✉ Email'}
                        </button>
                        <button onClick={() => sendVia(inv.id, 'whatsapp')} disabled={sending === `${inv.id}-whatsapp`} className="text-green-700 hover:underline text-xs disabled:opacity-50">
                          {sending === `${inv.id}-whatsapp` ? '...' : '💬 WA'}
                        </button>
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
        <Modal title="New GST Invoice" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate}>
            <div className="modal-body space-y-4">
              <FormField label="Order" required>
                <select className="input" value={form.orderId} onChange={e => onOrderChange(e.target.value)} required>
                  <option value="">Select order...</option>
                  {orders.map(o => <option key={o.id} value={o.id}>{o.orderNo} — {o.customer?.name} — {formatCurrency(o.totalAmount)}</option>)}
                </select>
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Due Date" required>
                  <input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
                </FormField>
                <FormField label="Place of Supply (State)">
                  <input className="input" placeholder="e.g. Maharashtra" value={form.placeOfSupply} onChange={e => setForm(f => ({ ...f, placeOfSupply: e.target.value }))} />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Customer GSTIN">
                  <input className="input" placeholder="22AAAAA0000A1Z5" value={form.customerGstin} onChange={e => setForm(f => ({ ...f, customerGstin: e.target.value.toUpperCase() }))} />
                </FormField>
                <FormField label="Notes">
                  <input className="input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </FormField>
              </div>

              {preview && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="font-semibold text-blue-800 mb-2">GST Preview ({preview.gstType === 'IGST' ? 'Inter-state → IGST' : 'Intra-state → CGST + SGST'})</p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-gray-700">
                    <span>Taxable Amount</span><span className="text-right font-medium">{formatCurrency(preview.taxable)}</span>
                    {preview.gstType === 'CGST_SGST' ? <>
                      <span>CGST</span><span className="text-right">{formatCurrency(preview.cgst)}</span>
                      <span>SGST</span><span className="text-right">{formatCurrency(preview.sgst)}</span>
                    </> : <>
                      <span>IGST</span><span className="text-right">{formatCurrency(preview.igst || (preview.cgst + preview.sgst))}</span>
                    </>}
                    <span className="font-semibold border-t pt-1">Grand Total</span>
                    <span className="text-right font-semibold border-t pt-1">{formatCurrency(preview.total)}</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">* IGST applies if Place of Supply differs from your registered state</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {formError && <p className="text-red-500 text-sm mr-auto">{formError}</p>}
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create Invoice</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
