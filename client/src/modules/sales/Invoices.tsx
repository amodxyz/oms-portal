import React, { useEffect, useState } from 'react';
import { Invoice } from '../../types';
import { Badge, Spinner, EmptyState } from '../../components/UI';
import { formatCurrency, formatDate } from '../../utils/helpers';
import api from '../../utils/api';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const fetch = () => {
    setLoading(true);
    api.get(`/sales/invoices${status ? `?status=${status}` : ''}`).then(r => setInvoices(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [status]);

  const markPaid = async (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    await api.put(`/sales/invoices/${id}`, { paid: inv.amount, status: 'PAID' });
    fetch();
  };

  return (
    <div>
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
                    <td>{inv.status !== 'PAID' && <button onClick={() => markPaid(inv.id)} className="text-green-600 hover:underline text-xs">Mark Paid</button>}</td>
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
