import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../../types';
import { Badge, Spinner } from '../../components/UI';
import { formatCurrency, formatDate, CGST_RATE, SGST_RATE } from '../../utils/helpers';
import api from '../../utils/api';

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = () => api.get(`/sales/orders/${id}`).then(r => setOrder(r.data)).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, [id]);

  const updateStatus = async (status: OrderStatus) => { await api.put(`/sales/orders/${id}`, { status }); fetch(); };
  const createInvoice = async () => {
    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 30);
    await api.post('/sales/invoices', { orderId: id, dueDate }); fetch();
  };

  if (loading) return <Spinner />;
  if (!order) return <div>Order not found</div>;

  const subtotal = order.items.reduce((s, i) => s + i.total, 0);
  const taxableAmt = subtotal - order.discount;
  // Detect GST type: if tax ≈ 18% of taxable → split CGST/SGST, else show as IGST
  const expectedGST = +(taxableAmt * (CGST_RATE + SGST_RATE)).toFixed(2);
  const isGSTApplied = order.tax > 0;
  const cgst = isGSTApplied ? +(taxableAmt * CGST_RATE).toFixed(2) : 0;
  const sgst = isGSTApplied ? +(taxableAmt * SGST_RATE).toFixed(2) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/sales/orders')} className="text-sm text-gray-500 hover:text-gray-700 mb-1">← Back to Orders</button>
          <h1 className="page-title">{order.orderNo}</h1>
        </div>
        <div className="flex gap-2">
          {!order.invoice && <button onClick={createInvoice} className="btn-success">🧾 Create Invoice</button>}
          <select className="input w-44" value={order.status} onChange={e => updateStatus(e.target.value as OrderStatus)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-semibold mb-4">Order Items</h2>
            <div className="table-container">
              <table>
                <thead><tr><th>Item</th><th>HSN/SAC</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id}>
                      <td><p className="font-medium">{item.item.name}</p><p className="text-xs text-gray-400">{item.item.code}</p></td>
                      <td className="text-xs text-gray-400">—</td>
                      <td>{item.quantity} {item.item.unit}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td className="font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* GST Summary Box */}
            <div className="mt-4 ml-auto max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-red-500">− {formatCurrency(order.discount)}</span></div>}
              <div className="flex justify-between border-t pt-1.5"><span className="text-gray-500">Taxable Amount</span><span>{formatCurrency(taxableAmt)}</span></div>
              {isGSTApplied ? (
                <>
                  <div className="flex justify-between text-orange-600"><span>CGST @ 9%</span><span>{formatCurrency(cgst)}</span></div>
                  <div className="flex justify-between text-orange-600"><span>SGST @ 9%</span><span>{formatCurrency(sgst)}</span></div>
                  <div className="flex justify-between text-orange-500 text-xs"><span>Total GST (18%)</span><span>{formatCurrency(order.tax)}</span></div>
                </>
              ) : (
                <div className="flex justify-between text-gray-400"><span>GST</span><span>Exempt / Nil</span></div>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Grand Total</span><span className="text-blue-600">{formatCurrency(order.totalAmount)}</span></div>
            </div>
          </div>

          {order.invoice && (
            <div className="card">
              <h2 className="font-semibold mb-3">Invoice</h2>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-gray-500">Invoice No</p><p className="font-medium">{order.invoice.invoiceNo}</p></div>
                <div><p className="text-gray-500">Amount</p><p className="font-medium">{formatCurrency(order.invoice.amount)}</p></div>
                <div><p className="text-gray-500">Status</p><Badge status={order.invoice.status} /></div>
              </div>
            </div>
          )}

          {order.dispatch && (
            <div className="card">
              <h2 className="font-semibold mb-3">Dispatch</h2>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-gray-500">Dispatch No</p><p className="font-medium">{order.dispatch.dispatchNo}</p></div>
                <div><p className="text-gray-500">Transporter</p><p className="font-medium">{order.dispatch.transporter?.name}</p></div>
                <div><p className="text-gray-500">Status</p><Badge status={order.dispatch.status} /></div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold mb-3">Order Info</h2>
            <div className="space-y-3 text-sm">
              <div><p className="text-gray-500">Status</p><Badge status={order.status} /></div>
              <div><p className="text-gray-500">Order Date</p><p className="font-medium">{formatDate(order.orderDate)}</p></div>
              {order.dueDate && <div><p className="text-gray-500">Due Date</p><p className="font-medium">{formatDate(order.dueDate)}</p></div>}
              {order.notes && <div><p className="text-gray-500">Notes</p><p>{order.notes}</p></div>}
            </div>
          </div>
          <div className="card">
            <h2 className="font-semibold mb-3">Customer</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{order.customer.name}</p>
              {order.customer.email && <p className="text-gray-500">{order.customer.email}</p>}
              {order.customer.phone && <p className="text-gray-500">{order.customer.phone}</p>}
              {order.customer.city && <p className="text-gray-500">{order.customer.city}, {order.customer.country}</p>}
            </div>
          </div>
          {/* GST Info Card */}
          <div className="card bg-orange-50 border border-orange-100">
            <h2 className="font-semibold mb-3 text-orange-700">GST Summary</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Taxable Value</span><span className="font-medium">{formatCurrency(taxableAmt)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">CGST (9%)</span><span>{formatCurrency(cgst)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">SGST (9%)</span><span>{formatCurrency(sgst)}</span></div>
              <div className="flex justify-between font-semibold border-t pt-1.5 text-orange-700"><span>Total GST</span><span>{formatCurrency(order.tax)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
