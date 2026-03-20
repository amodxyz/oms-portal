import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '../types';
import { StatCard, Spinner, Badge } from '../components/UI';
import { formatCurrency, formatDate } from '../utils/helpers';
import api from '../utils/api';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  const chartData = data.recentOrders.map(o => ({ name: o.orderNo, amount: o.totalAmount }));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={data.totalOrders} icon="📋" color="bg-blue-100" />
        <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} icon="💰" color="bg-green-100" />
        <StatCard label="Customers" value={data.totalCustomers} icon="👥" color="bg-purple-100" />
        <StatCard label="Suppliers" value={data.totalSuppliers} icon="🏢" color="bg-orange-100" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`card-sm flex items-center gap-3 ${data.lowStockCount > 0 ? 'border-red-200 bg-red-50' : ''}`}>
          <span className="text-2xl">📦</span>
          <div>
            <p className="text-sm text-gray-500">Low Stock Items</p>
            <p className={`text-xl font-bold ${data.lowStockCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{data.lowStockCount}</p>
          </div>
          <Link to="/items/stock-summary" className="ml-auto text-xs text-blue-600 hover:underline">View →</Link>
        </div>
        <div className={`card-sm flex items-center gap-3 ${data.pendingInspections > 0 ? 'border-yellow-200 bg-yellow-50' : ''}`}>
          <span className="text-2xl">🔍</span>
          <div>
            <p className="text-sm text-gray-500">Pending Inspections</p>
            <p className={`text-xl font-bold ${data.pendingInspections > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>{data.pendingInspections}</p>
          </div>
          <Link to="/quality/inspections" className="ml-auto text-xs text-blue-600 hover:underline">View →</Link>
        </div>
        <div className="card-sm flex items-center gap-3">
          <span className="text-2xl">📦</span>
          <div>
            <p className="text-sm text-gray-500">Total Items</p>
            <p className="text-xl font-bold text-gray-900">{data.totalItems}</p>
          </div>
          <Link to="/items" className="ml-auto text-xs text-blue-600 hover:underline">View →</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Recent Order Revenue</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'New Sales Order', path: '/sales/orders/new', icon: '➕' },
              { label: 'Add Customer', path: '/sales/customers/new', icon: '👤' },
              { label: 'New Purchase Order', path: '/purchasing/orders/new', icon: '🛒' },
              { label: 'Stock Entry', path: '/items/stock', icon: '📦' },
              { label: 'New Inspection', path: '/quality/inspections', icon: '✅' },
              { label: 'View Reports', path: '/reports/inventory', icon: '📊' },
            ].map(a => (
              <Link key={a.path} to={a.path} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                <span>{a.icon}</span>{a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link to="/sales/orders" className="text-sm text-blue-600 hover:underline">View all →</Link>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Order No</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {data.recentOrders.map(order => (
                <tr key={order.id}>
                  <td><Link to={`/sales/orders/${order.id}`} className="text-blue-600 hover:underline font-medium">{order.orderNo}</Link></td>
                  <td>{order.customer.name}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td className="font-medium">{formatCurrency(order.totalAmount)}</td>
                  <td><Badge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
