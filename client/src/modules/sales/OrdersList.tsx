import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Order, OrderStatus } from '../../types';
import { Badge, SearchInput, Spinner, EmptyState, Pagination } from '../../components/UI';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/helpers';
import api from '../../utils/api';

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    const { data } = await api.get(`/sales/orders?${params}`);
    setOrders(data.orders); setPages(data.pages);
    setLoading(false);
  }, [search, status, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleExport = () => exportToCSV(orders.map(o => ({ 'Order No': o.orderNo, Customer: o.customer.name, Date: formatDate(o.orderDate), Amount: o.totalAmount, Status: o.status })), 'orders');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sales Orders</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-outline">📥 Export</button>
          <Link to="/sales/orders/new" className="btn-primary">➕ New Order</Link>
        </div>
      </div>
      <div className="card">
        <div className="flex gap-3 mb-4 flex-wrap">
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search orders..." />
          <select className="input w-44" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {loading ? <Spinner /> : orders.length === 0 ? <EmptyState /> : (
          <>
            <div className="table-container">
              <table>
                <thead><tr><th>Order No</th><th>Customer</th><th>Date</th><th>Due Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td><Link to={`/sales/orders/${order.id}`} className="text-blue-600 hover:underline font-medium">{order.orderNo}</Link></td>
                      <td>{order.customer.name}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>{order.dueDate ? formatDate(order.dueDate) : '-'}</td>
                      <td className="font-medium">{formatCurrency(order.totalAmount)}</td>
                      <td><Badge status={order.status} /></td>
                      <td><Link to={`/sales/orders/${order.id}`} className="text-blue-600 hover:underline text-xs">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
