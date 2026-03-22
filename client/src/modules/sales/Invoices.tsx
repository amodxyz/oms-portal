import React, { useEffect, useState } from 'react';
import { Invoice } from '../../types';
import { Badge, Spinner, EmptyState } from '../../components/UI';
import { formatCurrency, formatDate } from '../../utils/helpers';
import api from '../../utils/api';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const fetch = () => {
    setLoading(true);
    api.get(`/sales/invoices${status ? `?status=${status}` : ''}`).then(r => setInvoices(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [status]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

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
      if (channel === 'whatsapp' && data.url) {
        window.open(data.url, '_blank');
      } else {
        showToast(data.message || 'Invoice sent!');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send';
      showToast(msg);
    } finally { setSending(null); }
  };

  return (
    <div>
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">{toast}</div>}
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        <select className="input w-36" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
        </select>
      </div>
      <div className="card">
        {loading ? <Spinner /> : invoices.length === 0 ? <EmptyState /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Invoice No</th><th>Order</th><th>Customer</th><th>Issue Date</th><th>Due Date</th><th>Amount</th><th>Paid</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="font-medium">{inv.invoiceNo}</td>
                    <td>{inv.order?.orderNo}</td>
                    <td>{inv.order?.customer?.name}</td>
                    <td>{formatDate(inv.issueDate)}</td>
                    <td>{formatDate(inv.dueDate)}</td>
                    <td>{formatCurrency(inv.amount)}</td>
                    <td>{formatCurrency(inv.paid)}</td>
                    <td><Badge status={inv.status} /></td>
                    <td>
                      <div className="flex items-center gap-1 flex-wrap">
                        {inv.status !== 'PAID' && <button onClick={() => markPaid(inv.id)} className="text-green-600 hover:underline text-xs whitespace-nowrap">✓ Paid</button>}
                        <button onClick={() => download(inv.id)} className="text-blue-600 hover:underline text-xs whitespace-nowrap">⬇ PDF</button>
                        <button onClick={() => sendVia(inv.id, 'email')} disabled={sending === `${inv.id}-email`} className="text-purple-600 hover:underline text-xs whitespace-nowrap disabled:opacity-50">
                          {sending === `${inv.id}-email` ? '...' : '✉ Email'}
                        </button>
                        <button onClick={() => sendVia(inv.id, 'whatsapp')} disabled={sending === `${inv.id}-whatsapp`} className="text-green-700 hover:underline text-xs whitespace-nowrap disabled:opacity-50">
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
    </div>
  );
}
